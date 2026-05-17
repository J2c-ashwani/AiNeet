import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { safeRpc, safeSelect } from '@/lib/core/db-safe';
import { getUserFromRequest } from '@/lib/core/auth';
import crypto from 'crypto';
import { randomUUID } from 'crypto';

export async function POST(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);

        if (!decoded) {
            return NextResponse.json({ error: 'Authentication required to claim diagnostic data' }, { status: 401 });
        }

        const payload = await request.json();
        const { scoreData, signature } = payload;
        
        if (!scoreData || !signature) {
            return NextResponse.json({ error: 'Missing diagnostic cryptogram' }, { status: 400 });
        }

        // 1. Verify Cryptographic Signature
        // Ensures the user didn't modify localStorage to fake a 100% score before registering
        const secret = process.env.CASHFREE_SECRET_KEY || 'FATAL_SECRET_MISSING';
        const expectedSignature = crypto.createHmac('sha256', secret).update(JSON.stringify(scoreData)).digest('hex');

        if (signature !== expectedSignature) {
            console.error(`[DIAGNOSTIC CLAIM] Signature mismatch for user ${decoded.id}. Possible local forgery attempt.`);
            return NextResponse.json({ error: 'Diagnostic signature validation failed. Data corrupted.' }, { status: 403 });
        }

        console.log(`[DIAGNOSTIC CLAIM] Signature matches. Claiming diagnostic data for fresh user ${decoded.id}`);

        // 2. Generate Real DB Artifacts
        const testId = randomUUID();
        const attemptId = randomUUID();

        // Check if they already claimed one recently to prevent double-claiming spam (idempotency)
        const { data: existingClaims } = await safeSelect('tests', q => q
            .select('id')
            .eq('user_id', decoded.id)
            .eq('type', 'diagnostic_claim')
            .limit(1), { route: '/api/tests/diagnostic/claim/check', userId: decoded.id });
            
        if (existingClaims && existingClaims.length > 0) {
            return NextResponse.json({ success: true, message: 'Already claimed' });
        }

        const totalQuestions = scoreData.maxScore / 4;
        const answerInserts = [];
        if (scoreData.answersObject && typeof scoreData.answersObject === 'object') {
            for (const [qId, opt] of Object.entries(scoreData.answersObject)) {
                answerInserts.push({
                    question_id: qId,
                    user_answer_option: opt,
                    time_spent_seconds: 90
                });
            }
        }

        // 3. Execute Atomic Transaction via RPC
        await safeRpc('diagnostic_claim_transaction', {
            p_test_id: testId,
            p_attempt_id: attemptId,
            p_user_id: decoded.id,
            p_config_json: { source: 'acquisition_funnel', weakest_chapter: scoreData.weakestChapter },
            p_total_questions: totalQuestions,
            p_total_marks: scoreData.maxScore,
            p_score: scoreData.score,
            p_correct: scoreData.correct,
            p_incorrect: scoreData.incorrect,
            p_accuracy: scoreData.accuracy,
            p_answers: answerInserts.length > 0 ? answerInserts : null
        }, { route: '/api/tests/diagnostic/claim', userId: decoded.id });

        // 6. Grant Acquisition XP & Levels 
        // Force the DB to trigger rank progression for finishing the onboarding funnel
        let acquisitionXp = scoreData.score > 0 ? scoreData.score + 10 : 10; 
        await safeRpc('increment_user_xp_atomic', { target_user_id: decoded.id, amount: acquisitionXp }, { route: '/api/tests/diagnostic/claim/xp', userId: decoded.id });

        return NextResponse.json({
            success: true,
            message: 'Diagnostic perfectly merged',
            grantedXp: acquisitionXp
        });

    } catch (error) {
        console.error('Diagnostic Claim Error:', error);
        return NextResponse.json({ error: 'System failed to merge diagnostic file' }, { status: 500 });
    }
}
