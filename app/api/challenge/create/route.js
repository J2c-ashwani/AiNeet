import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { safeInsert } from '@/lib/core/db-safe';
import { randomUUID } from 'crypto';
import { checkUsageLimit } from '@/lib/plan_gate';

export async function POST(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);

        if (!decoded) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Plan gate: limit challenges per day based on tier
        const today = new Date().toISOString().split('T')[0];

        const { count: dailyCount } = await supabase
            .from('battles')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', decoded.id)
            .gte('created_at', today);

        const usage = await checkUsageLimit(decoded.id, 'challenges_per_day', dailyCount || 0);

        if (!usage.allowed) {
            return NextResponse.json({
                error: `Daily challenge limit reached (${usage.limit}/day). Upgrade to Pro for unlimited challenges!`,
                locked: true,
                feature: 'challenges_per_day',
                used: usage.used,
                limit: usage.limit,
                tier: usage.tier,
            }, { status: 403 });
        }

        // Generate 10 random mixed questions for the challenge
        const { data: qPool } = await supabase
            .from('questions')
            .select('id, text, option_a, option_b, option_c, option_d, correct_option, subject_id')
            .limit(100);

        const questions = qPool ? qPool.sort(() => 0.5 - Math.random()).slice(0, 10) : [];

        if (!questions || questions.length < 10) {
            return NextResponse.json({ error: 'Not enough questions available to generate a challenge' }, { status: 500 });
        }

        const challengeId = randomUUID();

        await safeInsert('battles', {
            id: challengeId,
            user_id: decoded.id,
            questions: JSON.stringify(questions),
            created_at: new Date().toISOString()
        }, {
            route: '/api/challenge/create',
            userId: decoded.id,
        });

        return NextResponse.json({
            success: true,
            challengeId,
            shareUrl: `https://aineetcoach.com/challenge/${challengeId}`,
            remaining: usage.remaining,
        });

    } catch (error) {
        console.error('Challenge Creation Error:', error);
        return NextResponse.json({ error: 'Failed to create challenge. Please try again in a moment.' }, { status: 500 });
    }
}
