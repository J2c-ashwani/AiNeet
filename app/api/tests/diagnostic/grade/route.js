import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
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
        
        // Fetch ground truth securely from backend
        const { data: realQuestions, error: fetchErr } = await supabase.from('questions')
            .select('id, correct_option, chapter_id, topic_id')
            .in('id', questionIds);
            
        if (fetchErr) throw fetchErr;

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
        const accuracyRate = (correctCount / questionIds.length) * 100;
        let percentile = 15;
        if (accuracyRate > 80) percentile = 82;
        else if (accuracyRate > 60) percentile = 56;
        else if (accuracyRate > 40) percentile = 33;
        
        const peerImprovement = accuracyRate < 50 ? '+85 marks' : '+40 marks';

        const finalGradeData = {
            score: totalScore,
            maxScore: questionIds.length * 4,
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
            // The challenger beat the ghost. Log the defeat to Upstash Ephemerally!
            try {
                const originUrl = request.nextUrl ? request.nextUrl.origin : (request.headers.get('origin') || 'http://localhost:3000');
                fetch(`${originUrl}/api/challenge/defeat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ghost_id: c_ghost, new_score: Math.round(accuracyRate), subject: c_chap || 'Biology' })
                }).catch(()=>{});
            } catch (err) {
                // Fail silently, don't crash the grader
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
