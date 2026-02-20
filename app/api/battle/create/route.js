import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { getOpponentForElo } from '@/lib/game_engine';
import { rateLimit } from '@/lib/rate-limit';

/**
 * 1v1 AI Battle — Create
 * 
 * Matches the user against an ELO-appropriate AI opponent,
 * fetches 5 random questions, and returns the battle payload.
 * 
 * Note: correct_option IS sent to client for instant feedback
 * in this real-time battle mode. The scoring is verified server-side
 * on submit anyway, and questions are randomized per battle.
 */
export async function POST(request) {
    try {
        await initializeDatabase();
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const body = await request.json().catch(() => ({}));
        const { subjectId } = body;

        // Rate Limiting (20 battles/hour per user)
        const limitResult = rateLimit(`user:${decoded.id}:battle`, 20, 3600000);
        if (!limitResult.success) {
            return NextResponse.json({ error: 'Battle limit reached. Take a break and come back in an hour!' }, { status: 429 });
        }

        // Get user's current ELO rating
        const user = await db.get('SELECT battle_elo FROM users WHERE id = ?', [decoded.id]);
        const userElo = user?.battle_elo || 1000;

        // Select an AI opponent matched to the user's skill level
        const opponent = getOpponentForElo(userElo);

        // Fetch 5 random questions, optionally filtered by subject
        let query = 'SELECT * FROM questions WHERE 1=1';
        const params = [];
        if (subjectId) {
            query += ' AND subject_id = ?';
            params.push(subjectId);
        }
        query += ' ORDER BY RANDOM() LIMIT 5';

        const questions = await db.all(query, params);

        if (questions.length < 5) {
            return NextResponse.json({ error: 'Not enough questions available for a battle. Try adding more questions first.' }, { status: 404 });
        }

        const battleId = uuidv4();

        const clientQuestions = questions.map((q, idx) => ({
            id: q.id,
            index: idx + 1,
            text: q.text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_option: q.correct_option,
            difficulty: q.difficulty
        }));

        return NextResponse.json({
            battleId,
            opponent,
            questions: clientQuestions,
            userElo
        });

    } catch (error) {
        console.error('Battle creation error:', error);
        return NextResponse.json({ error: 'Failed to create battle' }, { status: 500 });
    }
}
