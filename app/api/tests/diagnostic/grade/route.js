import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { checkedFetch } from '@/lib/http';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const payload = await request.json();
        const { answers, c_score, c_ghost, c_chap } = payload; 
        
        if (!answers || Object.keys(answers).length === 0) {
            return NextResponse.json({ error: 'No answers provided' }, { status: 400 });
        }

        const supabase = await getDb();
        const questionIds = Object.keys(answers);

        // CRITICAL FIX: AI-generated questions have UUID string IDs.
        // The DB `questions` table uses integer IDs. Passing UUIDs to .in('id', ...)
        // causes Postgres error 22P02: invalid input syntax for type integer.
        // We must split: only query integer IDs; UUID (AI-gen) IDs are counted as
        // attempted but cannot be server-graded (correct_option was never sent to client).
        const isIntegerId = (id) => /^\d+$/.test(String(id));
        const dbQuestionIds = questionIds.filter(isIntegerId);
        const aiGenQuestionIds = questionIds.filter(id => !isIntegerId(id));

        // Count AI-gen answered questions as incorrect (safest conservative assumption)
        // since we cannot verify correct_option server-side without the original session.
        const aiGenAttempted = aiGenQuestionIds.filter(id => {
            const ans = answers[id];
            return ans !== null && ans !== undefined && ans !== '';
        }).length;

        // Fetch ground truth securely from backend (integer IDs only)
        let realQuestions = [];
        if (dbQuestionIds.length > 0) {
            const { data, error: fetchErr } = await supabase.from('questions')
                .select('id, correct_option, chapter_id, topic_id')
                .in('id', dbQuestionIds);
            if (fetchErr) throw fetchErr;
            realQuestions = data || [];
        }


        let totalScore = 0;
        let correctCount = 0;
        let incorrectCount = 0;
        
        const chapterPerformance = {}; // Track success rate per chapter

        realQuestions.forEach(q => {
            const userAnswer = answers[q.id];
            
            // Initialize chapter tracker
            if (!chapterPerformance[q.chapter_id]) {
                chapterPerformance[q.chapter_id] = { correct: 0, total: 0 };
            }
            chapterPerformance[q.chapter_id].total++;

            if (userAnswer === q.correct_option) {
                totalScore += 4;
                correctCount++;
                chapterPerformance[q.chapter_id].correct++;
            } else if (userAnswer !== null && userAnswer !== undefined && userAnswer !== '') {
                totalScore -= 1;
                incorrectCount++;
            }
        });

        // AI-gen questions that were attempted count as incorrect (cannot be verified server-side)
        incorrectCount += aiGenAttempted;
        totalScore -= aiGenAttempted; // -1 per wrong attempt

        // Identify the weakest chapter
        let weakestChapterId = null;
        let lowestAccuracy = 100;
        let lostMarksDueToWeakness = 0;

        for (const [chapId, stats] of Object.entries(chapterPerformance)) {
            const accuracy = (stats.correct / stats.total) * 100;
            if (accuracy < lowestAccuracy) {
                lowestAccuracy = accuracy;
                weakestChapterId = chapId;
                lostMarksDueToWeakness = (stats.total - stats.correct) * 5; // 4 missed + negative 1
            }
        }

        // Fetch Weakest Chapter Name
        let weakestChapterName = "General Biology";
        if (weakestChapterId && weakestChapterId !== 'null') {
            const { data: chapData } = await supabase.from('chapters').select('name').eq('id', Number(weakestChapterId)).single();
            if (chapData) weakestChapterName = chapData.name;
        }

        // Generate the Psychology Emotion triggers (MD Request)
        // Simulated percentiles to inject immediate FOMO/Urgency
        const totalQCount = questionIds.length;
        const accuracyRate = totalQCount > 0 ? (correctCount / totalQCount) * 100 : 0;
        let percentile = 15;
        if (accuracyRate > 80) percentile = 82;
        else if (accuracyRate > 60) percentile = 56;
        else if (accuracyRate > 40) percentile = 33;
        
        const peerImprovement = accuracyRate < 50 ? '+85 marks' : '+40 marks';

        const finalGradeData = {
            score: totalScore,
            maxScore: totalQCount * 4,
            correct: correctCount,
            incorrect: incorrectCount,
            accuracy: accuracyRate,
            weakestChapter: weakestChapterName,
            lostMarks: lostMarksDueToWeakness,
            percentile: percentile,
            peerImprovementText: peerImprovement,
            answersObject: answers
        };

        // Cryptographically sign the payload so the frontend cannot forge scores during the Signup Phase!
        const secret = process.env.CASHFREE_SECRET_KEY || 'FATAL_SECRET_MISSING';
        const signature = crypto.createHmac('sha256', secret).update(JSON.stringify(finalGradeData)).digest('hex');

        // ==== VIRAL FLYWHEEL: SILENT DEFEAT TRIGGER ====
        if (c_ghost && c_score && accuracyRate > Number(c_score)) {
            try {
                // The challenger beat the ghost. Log the defeat to Upstash ephemerally.
                const originUrl = request.nextUrl ? request.nextUrl.origin : (request.headers.get('origin') || 'http://localhost:3000');
                await checkedFetch(`${originUrl}/api/challenge/defeat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ghost_id: c_ghost, new_score: Math.round(accuracyRate), original_score: Number(c_score), subject: c_chap || 'Biology' })
                }, {
                    errorMessage: 'Failed to log challenge defeat',
                });
            } catch (err) {
                console.error('[DIAGNOSTIC_DEFEAT_LOG_FAILED]', err);
            }
        }

        return NextResponse.json({
            success: true,
            grade: finalGradeData,
            signature: signature
        });

    } catch (error) {
        console.error('Silent Grading Error:', error);
        return NextResponse.json({ error: 'Failed to grade test securely' }, { status: 500 });
    }
}
