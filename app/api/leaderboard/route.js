import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getLevelFromXP } from '@/lib/scoring';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    try {
        const supabase = await getDb();

        // 1. Fetch top 20 users by XP
        const { data: topUsers } = await supabase
            .from('users')
            .select('id, name, xp, level, streak, avatar')
            .order('xp', { ascending: false })
            .limit(20);

        if (!topUsers || topUsers.length === 0) {
            return NextResponse.json({ leaderboard: [] });
        }

        const userIds = topUsers.map(u => u.id);

        // 2. Fetch test stats for these users in one go
        const { data: tests } = await supabase
            .from('tests')
            .select('user_id, score')
            .in('user_id', userIds)
            .not('completed_at', 'is', null);

        const statsMap = {};
        userIds.forEach(id => {
            statsMap[id] = { count: 0, sum: 0 };
        });

        if (tests) {
            tests.forEach(t => {
                if (statsMap[t.user_id]) {
                    statsMap[t.user_id].count++;
                    statsMap[t.user_id].sum += (t.score || 0);
                }
            });
        }

        const leaderboard = topUsers.map((u, idx) => {
            const st = statsMap[u.id];
            const avgScore = st.count > 0 ? st.sum / st.count : 0;

            return {
                rank: idx + 1, name: u.name, xp: u.xp,
                level: getLevelFromXP(u.xp), streak: u.streak,
                testCount: st.count, avgScore: Math.round(avgScore),
                initial: u.name ? u.name.charAt(0).toUpperCase() : '?'
            };
        });

        return NextResponse.json({ leaderboard });
    } catch (error) {
        console.error('Leaderboard error:', error);
        return NextResponse.json({ error: 'Failed to fetch leaderboard. Please try again in a moment.' }, { status: 500 });
    }
}
