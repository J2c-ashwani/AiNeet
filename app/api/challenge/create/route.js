import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { checkUsageLimit } from '@/lib/plan_gate';

export async function POST(request) {
    try {
        const db = getDb();
        const decoded = getUserFromRequest(request);

        if (!decoded) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Plan gate: limit challenges per day based on tier
        const today = new Date().toISOString().split('T')[0];
        const dailyCount = await db.get(
            `SELECT COUNT(*) as count FROM battles WHERE user_id = ? AND created_at >= ?`,
            [decoded.id, today]
        );
        const usage = await checkUsageLimit(decoded.id, 'challenges_per_day', dailyCount?.count || 0);

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
        const questions = await db.all(`
            SELECT id, text, option_a, option_b, option_c, option_d, correct_option, subject_id
            FROM questions 
            ORDER BY RANDOM() 
            LIMIT 10
        `);

        if (!questions || questions.length < 10) {
            return NextResponse.json({ error: 'Not enough questions available to generate a challenge' }, { status: 500 });
        }

        const challengeId = uuidv4();

        await db.run(
            `INSERT INTO battles (id, user_id, questions, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            [challengeId, decoded.id, JSON.stringify(questions)]
        );

        return NextResponse.json({
            success: true,
            challengeId,
            shareUrl: `https://aineetcoach.com/challenge/${challengeId}`,
            remaining: usage.remaining,
        });

    } catch (error) {
        console.error('Challenge Creation Error:', error);
        return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
    }
}
