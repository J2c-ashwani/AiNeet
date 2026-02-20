
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { getOpponentForElo, AI_OPPONENTS } from '@/lib/game_engine';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request) {
    try {
        await initializeDatabase();
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { subjectId } = await request.json(); // Optional subject filter

        // Rate Limiting (20 req/hour per User)
        const rateKey = `user:${decoded.id}:battle`;
        const limitPos = rateLimit(rateKey, 20, 3600000);
        if (!limitPos.success) {
            return NextResponse.json({ error: 'Battle limit reached. Take a break, warrior!' }, { status: 429 });
        }

        // Get User Elo
        const user = await db.get('SELECT battle_elo FROM users WHERE id = ?', [decoded.id]);
        const userElo = user ? user.battle_elo : 1000;

        // Select Opponent
        const opponent = getOpponentForElo(userElo);

        // Fetch 5 random questions
        let query = 'SELECT * FROM questions WHERE 1=1';
        const params = [];
        if (subjectId) {
            query += ' AND subject_id = ?';
            params.push(subjectId);
        }
        query += ' ORDER BY RANDOM() LIMIT 5';

        const questions = await db.all(query, params);

        if (questions.length < 5) {
            return NextResponse.json({ error: 'Not enough questions for a battle.' }, { status: 404 });
        }

        const battleId = uuidv4();

        // Return battle data (don't save to DB yet, save on submit to avoid stiffing)
        // Or save partially? Let's save on submit for simplicity in this MVP.
        // Actually, better to return the data and let frontend manage the "live" aspect.

        const clientQuestions = questions.map((q, idx) => ({
            id: q.id, index: idx + 1, text: q.text,
            option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d,
            correct_option: q.correct_option, // Need this for immediate feedback in battle? 
            // In a real secure app, we wouldn't send correct answers. 
            // But for this fast-paced MVP, sending them allows instant client-side validation for the "Arena" feel.
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
