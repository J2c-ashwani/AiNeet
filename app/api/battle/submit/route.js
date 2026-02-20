
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
    try {
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { battleId, opponentId, userScore, opponentScore, outcome } = await request.json();

        // Calculate Elo Change
        const kFactor = 32;
        const actualScore = outcome === 'win' ? 1 : (outcome === 'draw' ? 0.5 : 0);

        // Fetch current Elo
        const user = await db.get('SELECT battle_elo FROM users WHERE id = ?', [decoded.id]);
        const currentElo = user ? user.battle_elo : 1000;

        // Simple simplified opponent elo fetch (in real app, fetch from DB)
        // For now, assume a static opponent Elo passed or fetched from config
        // Let's grab opponent Elo from our hardcoded list for calculation
        // This is a bit hacky for MVP but works

        // Ideally we passed opponent object, but ID is enough if we import logic
        // Import inside to avoid top-level await issues if any
        const { AI_OPPONENTS } = await import('@/lib/game_engine');
        const opponent = AI_OPPONENTS.find(o => o.id === opponentId) || { elo: 1000 };

        const expectedScore = 1 / (1 + Math.pow(10, (opponent.elo - currentElo) / 400));
        const newElo = Math.round(currentElo + kFactor * (actualScore - expectedScore));

        // Update User
        await db.run('UPDATE users SET battle_elo = ? WHERE id = ?', [newElo, decoded.id]);

        // Log Battle
        await db.run(`
            INSERT INTO battles (id, user_id, opponent_id, user_score, opponent_score, outcome, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [battleId, decoded.id, opponentId, userScore, opponentScore, outcome, new Date().toISOString()]);

        return NextResponse.json({ success: true, newElo, eloChange: newElo - currentElo });

    } catch (error) {
        console.error('Battle submit error:', error);
        return NextResponse.json({ error: 'Failed to submit battle' }, { status: 500 });
    }
}
