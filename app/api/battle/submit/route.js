import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { AI_OPPONENTS } from '@/lib/game_engine';
import { sanitizeString, validateEnum, validatePositiveInt } from '@/lib/validate';

/**
 * 1v1 AI Battle — Submit Results
 * 
 * Records match outcome, updates user's ELO rating using the
 * standard ELO formula (K-factor = 32), and logs the battle history.
 */
export async function POST(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        let _body;

        try { _body = await request.json(); } catch (parseErr) {

            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

        }

        const body = _body;
        const battleId = sanitizeString(body.battleId || '', 128);
        const opponentId = sanitizeString(body.opponentId || '', 128);
        const userScore = validatePositiveInt(body.userScore, 0, 1000) || 0;
        const opponentScore = validatePositiveInt(body.opponentScore, 0, 1000) || 0;
        const outcome = body.outcome;

        if (!battleId || !opponentId || outcome === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!validateEnum(outcome, ['win', 'loss', 'draw'])) {
            return NextResponse.json({ error: 'Invalid outcome' }, { status: 400 });
        }

        // ELO calculation
        const K_FACTOR = 32;
        const actualScore = outcome === 'win' ? 1 : (outcome === 'draw' ? 0.5 : 0);

        const { data: user } = await supabase.from('users').select('battle_elo').eq('id', decoded.id).single();
        const currentElo = user?.battle_elo || 1000;

        // Get opponent's ELO from the AI opponents config
        const opponent = AI_OPPONENTS.find(o => o.id === opponentId) || { elo: 1000 };
        const expectedScore = 1 / (1 + Math.pow(10, (opponent.elo - currentElo) / 400));
        const newElo = Math.round(currentElo + K_FACTOR * (actualScore - expectedScore));

        // Update user's ELO
        await supabase.from('users').update({ battle_elo: newElo }).eq('id', decoded.id);

        // Log battle to history
        await supabase.from('battles').insert({
            id: battleId,
            user_id: decoded.id,
            opponent_id: opponentId,
            opponent_name: opponent.name || 'AI Opponent',
            user_score: userScore || 0,
            opponent_score: opponentScore || 0,
            outcome: outcome,
            created_at: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            newElo,
            eloChange: newElo - currentElo,
            outcome
        });

    } catch (error) {
        console.error('Battle submit error:', error);
        return NextResponse.json({ error: 'Failed to submit battle results. Please try again in a moment.' }, { status: 500 });
    }
}
