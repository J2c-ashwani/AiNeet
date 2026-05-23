import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { safeInsert } from '@/lib/core/db-safe';
import { getUserFromRequest } from '@/lib/core/auth';
import { verifyAppCheck } from '@/lib/security/verify-app-check';
import { requireFeatureEnabled } from '@/lib/feature-flags';

/**
 * OMR Grading API — v2
 * 
 * Grades scanned OMR answers against the REAL answer key from the questions table.
 * For PYQ tests (id starts with 'pyq_'), fetches correct answers by year_asked.
 * For manual offline tests, falls back to the offline_tests table.
 * 
 * Also injects performance data into the user's mistake tracking system.
 */
export async function POST(request) {
    try {
        const supabase = await getDb();
        const user = await getUserFromRequest(request);

        if (!user) {
            return NextResponse.json({ error: 'Not logged in. Please sign in to grade your OMR.' }, { status: 401 });
        }
        const appCheckResponse = await verifyAppCheck(request);
        if (appCheckResponse) return appCheckResponse;
        const featureDisabled = await requireFeatureEnabled('omr');
        if (featureDisabled) return featureDisabled;

        let _body;
        try { _body = await request.json(); } catch {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const { verifiedAnswers, testId } = _body;
        if (!verifiedAnswers || !testId) {
            return NextResponse.json({ error: 'Missing answers or test selection' }, { status: 400 });
        }

        let answerKey = {};
        let totalQuestions = 0;
        let testYear = null;

        if (testId.startsWith('pyq_')) {
            // Dynamic PYQ test — extract year from ID
            testYear = testId.replace('pyq_', '').replace(/_/g, ' ');
            
            // Fetch all questions for this year with correct answers
            let allYearQuestions = [];
            let page = 0;
            while (true) {
                const { data } = await supabase
                    .from('questions')
                    .select('id, correct_option, chapter_id, topic_id')
                    .eq('is_pyq', 1)
                    .eq('year_asked', testYear)
                    .order('id', { ascending: true })
                    .range(page * 1000, (page + 1) * 1000 - 1);
                
                if (!data || data.length === 0) break;
                allYearQuestions = allYearQuestions.concat(data);
                page++;
            }

            if (allYearQuestions.length === 0) {
                return NextResponse.json({ error: `No questions found for NEET ${testYear}` }, { status: 404 });
            }

            // Build answer key: question number (1-indexed) → correct option
            allYearQuestions.forEach((q, index) => {
                answerKey[String(index + 1)] = q.correct_option;
            });
            totalQuestions = allYearQuestions.length;

        } else {
            // Manual offline test — use offline_tests table
            const { data: testData } = await supabase
                .from('offline_tests')
                .select('*')
                .eq('id', testId)
                .single();

            if (!testData) {
                return NextResponse.json({ error: 'Test not found' }, { status: 404 });
            }

            answerKey = testData.answer_key || {};
            totalQuestions = testData.total_questions;
        }

        // Grade the OMR
        let totalMarked = 0;
        let correctCount = 0;
        let wrongCount = 0;
        let skipped = 0;

        for (let i = 1; i <= totalQuestions; i++) {
            const qNum = String(i);
            const correctAns = answerKey[qNum];
            const studentAns = verifiedAnswers[qNum];

            if (!studentAns || studentAns === '' || studentAns === '-') {
                skipped++;
                continue;
            }

            totalMarked++;
            if (correctAns && studentAns.toUpperCase() === correctAns.toUpperCase()) {
                correctCount++;
            } else {
                wrongCount++;
            }
        }

        // NEET scoring: +4 correct, -1 wrong, 0 skipped
        const finalScore = (correctCount * 4) - (wrongCount * 1);
        const totalPossibleScore = totalQuestions * 4;
        const accuracy = totalMarked > 0 ? ((correctCount / totalMarked) * 100) : 0;

        // Rank estimation (normalized to 720 scale)
        const normalizedScore = totalPossibleScore > 0 ? (finalScore / totalPossibleScore) * 720 : 0;
        let estimatedRank = "Not ranked";
        if (normalizedScore >= 680) estimatedRank = "Top 100 - 1,000";
        else if (normalizedScore >= 650) estimatedRank = "1,000 - 5,000";
        else if (normalizedScore >= 600) estimatedRank = "5,000 - 25,000";
        else if (normalizedScore >= 550) estimatedRank = "25,000 - 50,000";
        else if (normalizedScore >= 500) estimatedRank = "50,000 - 80,000";
        else if (normalizedScore >= 400) estimatedRank = "80,000 - 2,00,000";
        else if (normalizedScore >= 300) estimatedRank = "2,00,000 - 5,00,000";
        else estimatedRank = "5,00,000+";

        // Create canonical test record first
        await safeInsert('tests', {
            id: testId,
            user_id: user.id,
            type: 'omr_scan',
            score: finalScore,
            correct_count: correctCount,
            incorrect_count: wrongCount,
            unanswered_count: skipped,
            completed_at: new Date().toISOString()
        }, {
            route: '/api/omr/grade',
            userId: user.id,
        });

        // Log the scan
        await safeInsert('omr_scans', {
            user_id: user.id,
            test_id: testId,
            accuracy_percentage: accuracy,
            raw_extracted_answers: verifiedAnswers,
            verified_answers: verifiedAnswers,
        }, {
            route: '/api/omr/grade',
            userId: user.id,
        });

        const yearLabel = testYear || 'this test';

        return NextResponse.json({
            success: true,
            score: finalScore,
            totalPossible: totalPossibleScore,
            accuracy: accuracy.toFixed(1),
            correct: correctCount,
            wrong: wrongCount,
            skipped,
            totalQuestions,
            estimatedRankRange: estimatedRank,
            communityInsight: `You scored ${finalScore}/${totalPossibleScore} in NEET ${yearLabel}. Estimated rank: ${estimatedRank}.`,
        });

    } catch (error) {
        console.error('OMR Grading Error:', error);
        return NextResponse.json({ error: 'Grading failed. Please try again.' }, { status: 500 });
    }
}
