import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { validatePositiveInt } from '@/lib/validate';

export async function POST(request) {
    try {
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { questionCount: rawQC = 20, timeLimitMinutes: rawTL = 30 } = await request.json();

        const questionCount = validatePositiveInt(rawQC, 10, 50) || 20;
        const timeLimitMinutes = validatePositiveInt(rawTL, 5, 60) || 30;

        // Freemium check: free users get 1 battleground creation
        const user = await db.get('SELECT subscription_tier, battleground_creates_used FROM users WHERE id = ?', [decoded.id]);
        const isFree = !user?.subscription_tier || user.subscription_tier === 'free';

        if (isFree && (user?.battleground_creates_used || 0) >= 1) {
            return NextResponse.json({
                error: 'Free users can only create 1 Battleground. Upgrade to Premium for unlimited battles!',
                locked: true,
                feature: 'battleground_create'
            }, { status: 403 });
        }

        // Generate questions
        const questions = await db.all(
            'SELECT id, text, option_a, option_b, option_c, option_d, correct_option, subject_id, difficulty FROM questions ORDER BY RANDOM() LIMIT ?',
            [Math.min(questionCount, 50)]
        );

        if (questions.length < 10) {
            return NextResponse.json({ error: 'Not enough questions available' }, { status: 500 });
        }

        const battleId = uuidv4();
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        await db.run(
            `INSERT INTO battlegrounds (id, creator_id, invite_code, questions_json, question_count, time_limit_seconds, max_participants) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [battleId, decoded.id, inviteCode, JSON.stringify(questions), questions.length, timeLimitMinutes * 60, 200]
        );

        // Auto-join the creator as participant
        await db.run(
            `INSERT INTO battleground_participants (id, battleground_id, user_id) VALUES (?, ?, ?)`,
            [uuidv4(), battleId, decoded.id]
        );

        // Increment creates used
        await db.run('UPDATE users SET battleground_creates_used = battleground_creates_used + 1 WHERE id = ?', [decoded.id]);

        return NextResponse.json({
            success: true,
            battleId,
            inviteCode,
            questionCount: questions.length,
            timeLimitMinutes
        });

    } catch (error) {
        console.error('Battleground create error:', error);
        return NextResponse.json({ error: 'Failed to create battleground' }, { status: 500 });
    }
}
