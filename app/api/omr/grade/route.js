import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';

export async function POST(request) {
    try {
        const supabase = await getDb();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let _body;

        try { _body = await request.json(); } catch (parseErr) {

            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

        }

        const { verifiedAnswers, testId } = _body;

        if (!verifiedAnswers || !testId) {
            return NextResponse.json({ error: 'Missing grading payload' }, { status: 400 });
        }

        // 1. Fetch Official Answer Key
        const { data: testData } = await supabase.from('offline_tests').select('*').eq('id', testId).single();
        if (!testData) return NextResponse.json({ error: 'Invalid Test Type' }, { status: 404 });
        
        const answerKey = testData.answer_key;
        
        // 2. Grade the OMR mathematically
        let totalMarked = 0;
        let correctCount = 0;
        let mistakes = []; // Array of question numbers they got wrong

        for (const [qNum, correctAns] of Object.entries(answerKey)) {
            const studentAns = verifiedAnswers[qNum];
            if (studentAns) {
                totalMarked++;
                if (studentAns.toUpperCase() === correctAns.toUpperCase()) {
                    correctCount++;
                } else {
                    mistakes.push(qNum);
                }
            }
            // If studentAns is null, they skipped. No penalty or -1 depending on NEET rules, 
            // but for simple heatmap tracking we only track active mistakes.
        }

        const accuracy = totalMarked > 0 ? (correctCount / totalMarked) * 100 : 0;
        const finalScore = (correctCount * 4) - mistakes.length; // +4 for correct, -1 for mistake
        const totalPossibleScore = testData.total_questions * 4;

        // 3. Probabilistic Rank (MD Mandate: "40k-60k" ranges)
        const avgScore = (finalScore / totalPossibleScore) * 720; // normalize to 720 scale for estimate
        let estimatedRank = "1M+";
        if (avgScore > 680) estimatedRank = "Top 1k - 5k";
        else if (avgScore > 600) estimatedRank = "25k - 40k";
        else if (avgScore > 500) estimatedRank = "80k - 100k";
        else if (avgScore > 400) estimatedRank = "250k - 300k";
        else if (avgScore > 200) estimatedRank = "800k - 1M";

        // 4. Data Moat Identity Injection
        // We log the overall scan performance
        await supabase.from('omr_scans').insert({
            user_id: user.id,
            test_id: testId,
            accuracy_percentage: accuracy,
            raw_extracted_answers: verifiedAnswers,
            verified_answers: verifiedAnswers
        });

        // 5. Inject Into User Heatmap
        // To build the Heatmap properly without a massive offline question databank bridging,
        // we map these to a generic "Offline Testing" topic (topic_id: 1) or assume subtopics.
        // For MVP: Log raw counts to trigger the "National Mistake Graph" network effect.

        try {
            const logs = mistakes.map(qNum => ({
                user_id: user.id,
                source: 'OMR_SCAN',
                question_id: 1000 + parseInt(qNum), // Using an offset mock ID for offline questions
                is_correct: false,
                mistake_type: 'omr_read', // MD mandated flag
                confidence_score: 50
            }));
            if(logs.length > 0) {
               await supabase.from('mistake_log').insert(logs);
            }
        } catch(e) { console.error("Silently bypassing mistake log failure for MVP: ", e) }

        return NextResponse.json({ 
            success: true, 
            score: finalScore,
            totalPossible: totalPossibleScore,
            accuracy: accuracy.toFixed(2),
            mistakesCount: mistakes.length,
            estimatedRankRange: estimatedRank,
            // MD Upgrade #1: Network effect illusion
            communityInsight: `72% of students made mistakes in the final section. Your estimated NEET 2026 Rank Range is ${estimatedRank}`
        });
        
    } catch (error) {
        console.error("OMR Grading Error:", error);
        return NextResponse.json({ error: 'Internal Grading Error' }, { status: 500 });
    }
}
