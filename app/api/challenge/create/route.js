import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
    try {
        const db = getDb();
        const decoded = getUserFromRequest(request);

        if (!decoded) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Generate 10 random mixed questions for the challenge
        const questions = await db.all(`
            SELECT id, text, option_a, option_b, option_c, option_d, correct_option, subject
            FROM questions 
            ORDER BY RANDOM() 
            LIMIT 10
        `);

        if (!questions || questions.length < 10) {
            return NextResponse.json({ error: 'Not enough questions available to generate a challenge' }, { status: 500 });
        }

        const challengeId = uuidv4();

        await db.run(
            `INSERT INTO challenges (id, creator_id, questions_json) VALUES (?, ?, ?)`,
            [challengeId, decoded.id, JSON.stringify(questions)]
        );

        return NextResponse.json({
            success: true,
            challengeId,
            shareUrl: `https://aineetcoach.com/challenge/${challengeId}`
        });

    } catch (error) {
        console.error('Challenge Creation Error:', error);
        return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
    }
}
