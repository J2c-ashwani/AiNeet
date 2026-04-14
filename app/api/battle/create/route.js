import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { v4 as uuidv4 } from 'uuid';
import { getOpponentForElo } from '@/lib/game_engine';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeString } from '@/lib/validate';

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
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const body = await request.json().catch(() => ({}));
        const subjectId = body.subjectId ? sanitizeString(String(body.subjectId), 128) : null;

        // Rate Limiting (20 battles/hour per user)
        const limitResult = rateLimit(`user:${decoded.id}:battle`, 20, 3600000);
        if (!limitResult.success) {
            return NextResponse.json({ error: 'Battle limit reached. Take a break and come back in an hour!' }, { status: 429 });
        }

        // Get user's current ELO rating
        const { data: user } = await supabase.from('users').select('battle_elo').eq('id', decoded.id).single();
        const userElo = user?.battle_elo || 1000;

        // Select an AI opponent matched to the user's skill level
        const opponent = getOpponentForElo(userElo);

        // Fetch 5 random questions, optionally filtered by subject.
        // Supabase JS doesn't have a direct ORDER BY RANDOM() easily without an RPC.
        // Workaround: fetch a small pool of questions and shuffle in JS.
        let query = supabase.from('questions').select('*').limit(50);

        if (subjectId) {
            query = query.eq('subject_id', subjectId);
        }

        const { data: questionPool } = await query;
        let questions = questionPool || [];

        // Shuffle and pick 5
        questions.sort(() => 0.5 - Math.random());
        questions = questions.slice(0, 5);

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
        return NextResponse.json({ error: 'Failed to create battle. Please try again in a moment.' }, { status: 500 });
    }
}
