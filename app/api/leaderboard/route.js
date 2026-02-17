import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import { getLevelFromXP } from '@/lib/scoring';

export async function GET(request) {
    try {
        initializeDatabase();
        const db = getDb();

        const topUsers = db.prepare(`
      SELECT id, name, xp, level, streak, avatar,
        (SELECT COUNT(*) FROM tests WHERE user_id = users.id AND completed_at IS NOT NULL) as test_count,
        (SELECT COALESCE(AVG(score), 0) FROM tests WHERE user_id = users.id AND completed_at IS NOT NULL) as avg_score
      FROM users ORDER BY xp DESC LIMIT 20
    `).all();

        const leaderboard = topUsers.map((u, idx) => ({
            rank: idx + 1, name: u.name, xp: u.xp,
            level: getLevelFromXP(u.xp), streak: u.streak,
            testCount: u.test_count, avgScore: Math.round(u.avg_score),
            initial: u.name.charAt(0).toUpperCase()
        }));

        return NextResponse.json({ leaderboard });
    } catch (error) {
        console.error('Leaderboard error:', error);
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}
