import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { safeInsert, safeUpdate } from '@/lib/core/db-safe';
import { randomUUID } from 'crypto';
import { validatePositiveInt } from '@/lib/validate';
import { checkFeatureAccess } from '@/lib/plan_gate';
import { verifyAppCheck } from '@/lib/security/verify-app-check';

export async function POST(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const appCheckResponse = await verifyAppCheck(request);
        if (appCheckResponse) return appCheckResponse;

        // Plan gate: Battleground requires Pro or Premium
        const blocked = await checkFeatureAccess(decoded.id, 'battleground_enabled', 'pro');
        if (blocked) return blocked;

        let _body;

        try { _body = await request.json(); } catch (parseErr) {

            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

        }

        const { questionCount: rawQC = 20, timeLimitMinutes: rawTL = 30 } = _body;

        // Generate questions
        // Limit query to pool, then shuffle in memory.
        const { data: qPool } = await supabase
            .from('questions')
            .select('id, text, option_a, option_b, option_c, option_d, correct_option, subject_id, difficulty')
            .limit(100);

        if (!qPool || qPool.length < 10) {
            return NextResponse.json({ error: 'Not enough questions available' }, { status: 500 });
        }

        let questions = qPool.sort(() => 0.5 - Math.random()).slice(0, Math.min(rawQC, 50));

        const battleId = randomUUID();
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        await safeInsert('battlegrounds', {
            id: battleId,
            creator_id: decoded.id,
            invite_code: inviteCode,
            questions_json: JSON.stringify(questions),
            question_count: questions.length,
            time_limit_seconds: rawTL * 60,
            max_participants: 200,
            status: 'waiting'
        }, {
            route: '/api/battleground/create',
            userId: decoded.id,
        });

        // Auto-join the creator as participant
        await safeInsert('battleground_participants', {
            id: randomUUID(),
            battleground_id: battleId,
            user_id: decoded.id
        }, {
            route: '/api/battleground/create',
            userId: decoded.id,
        });

        // Increment creates used
        const { data: user } = await supabase.from('users').select('battleground_creates_used').eq('id', decoded.id).single();
        const newCount = (user?.battleground_creates_used || 0) + 1;
        await safeUpdate('users', { id: decoded.id }, { battleground_creates_used: newCount }, {
            route: '/api/battleground/create',
            userId: decoded.id,
        });

        return NextResponse.json({
            success: true,
            battleId,
            inviteCode,
            questionCount: questions.length,
            timeLimitMinutes: rawTL
        });

    } catch (error) {
        console.error('Battleground create error:', error);
        return NextResponse.json({ error: 'Failed to create battleground. Please try again in a moment.' }, { status: 500 });
    }
}
