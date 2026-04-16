import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

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
        const testId = uuidv4();
        const attemptId = uuidv4();

        // Check if they already claimed one recently to prevent double-claiming spam (idempotency)
        const { data: existingClaims } = await supabase.from('tests')
            .select('id')
            .eq('user_id', decoded.id)
            .eq('type', 'diagnostic_claim')
            .limit(1);
            
        if (existingClaims && existingClaims.length > 0) {
            return NextResponse.json({ success: true, message: 'Already claimed' });
        }

        // 3. Mount Test Config
        const totalQuestions = scoreData.maxScore / 4;
        await supabase.from('tests').insert({
            id: testId,
            user_id: decoded.id,
            type: 'diagnostic_claim',
            config_json: JSON.stringify({ source: 'acquisition_funnel', weakest_chapter: scoreData.weakestChapter }),
            total_questions: totalQuestions,
            total_marks: scoreData.maxScore
        });

        // 4. Mount Attempt Record
        await supabase.from('test_attempts').insert({
            id: attemptId,
            test_id: testId,
            user_id: decoded.id,
            total_score: scoreData.score,
            correct_answers: scoreData.correct,
            incorrect_answers: scoreData.incorrect,
            accuracy_rate: scoreData.accuracy
        });

        // 5. Mount Question Granularity 
        // Iterate through scoreData.answersObject
        const answerInserts = [];
        if (scoreData.answersObject && typeof scoreData.answersObject === 'object') {
            for (const [qId, opt] of Object.entries(scoreData.answersObject)) {
                answerInserts.push({
                    test_attempt_id: attemptId,
                    question_id: qId,
                    user_answer_option: opt,
                    time_spent_seconds: 90 // Default constant for stateless
                });
            }
            if (answerInserts.length > 0) {
                await supabase.from('test_answers').insert(answerInserts);
            }
        }

        // 6. Grant Acquisition XP & Levels 
        // Force the DB to trigger rank progression for finishing the onboarding funnel
        let acquisitionXp = scoreData.score > 0 ? scoreData.score + 10 : 10; 
        await supabase.rpc('increment_user_xp_atomic', { target_user_id: decoded.id, amount: acquisitionXp });

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
