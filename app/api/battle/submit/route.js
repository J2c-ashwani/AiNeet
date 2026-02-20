import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { AI_OPPONENTS } from '@/lib/game_engine';

/**
 * 1v1 AI Battle — Submit Results
 * 
 * Records match outcome, updates user's ELO rating using the
 * standard ELO formula (K-factor = 32), and logs the battle history.
 */
export async function POST(request) {
    try {
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { battleId, opponentId, userScore, opponentScore, outcome } = await request.json();

        if (!battleId || !opponentId || outcome === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!['win', 'loss', 'draw'].includes(outcome)) {
            return NextResponse.json({ error: 'Invalid outcome' }, { status: 400 });
        }

        // ELO calculation
        const K_FACTOR = 32;
        const actualScore = outcome === 'win' ? 1 : (outcome === 'draw' ? 0.5 : 0);

        const user = await db.get('SELECT battle_elo FROM users WHERE id = ?', [decoded.id]);
        const currentElo = user?.battle_elo || 1000;

        // Get opponent's ELO from the AI opponents config
        const opponent = AI_OPPONENTS.find(o => o.id === opponentId) || { elo: 1000 };
        const expectedScore = 1 / (1 + Math.pow(10, (opponent.elo - currentElo) / 400));
        const newElo = Math.round(currentElo + K_FACTOR * (actualScore - expectedScore));

        // Update user's ELO
        await db.run('UPDATE users SET battle_elo = ? WHERE id = ?', [newElo, decoded.id]);

        // Log battle to history
        await db.run(`
            INSERT INTO battles (id, user_id, opponent_id, opponent_name, user_score, opponent_score, outcome, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `, [battleId, decoded.id, opponentId, opponent.name || 'AI Opponent', userScore || 0, opponentScore || 0, outcome]);

        return NextResponse.json({
            success: true,
            newElo,
            eloChange: newElo - currentElo,
            outcome
        });

    } catch (error) {
        console.error('Battle submit error:', error);
        return NextResponse.json({ error: 'Failed to submit battle results' }, { status: 500 });
    }
}
