import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function requireAdmin(request) {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') return null;
    return user;
}

export async function GET(request) {
    const admin = requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const supabase = getSupabase();

        const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: questionsCount } = await supabase.from('questions').select('*', { count: 'exact', head: true });

        // Supabase schema might use boolean or integer 1 for is_pyq. Try both or check dynamically.
        // Assuming it is boolean 'true' based on earlier boolean comparisons.
        const { count: pyqsCount } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('is_pyq', true);

        let reportsCount = 0;
        try {
            const { count } = await supabase.from('question_reports').select('*', { count: 'exact', head: true }).eq('status', 'open');
            reportsCount = count || 0;
        } catch (e) { /* table may not exist */ }

        // Recent signups (last 10)
        let recentSignups = [];
        try {
            const { data } = await supabase
                .from('users')
                .select('id, name, email, created_at, subscription_tier')
                .order('id', { ascending: false })
                .limit(10);
            recentSignups = data || [];
        } catch (e) { /* */ }

        // Daily test activity (last 7 days)
        // Note: SQLite used test_attempts, but the rest of app has migrated to `tests`.
        let dailyActivity = [];
        try {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const { data: tests } = await supabase
                .from('tests')
                .select('completed_at, score, total_questions')
                .gte('completed_at', sevenDaysAgo)
                .not('completed_at', 'is', null);

            if (tests) {
                const activityMap = {};
                tests.forEach(t => {
                    if (!t.completed_at) return;
                    // Format as YYYY-MM-DD
                    const date = t.completed_at.split('T')[0];
                    if (!activityMap[date]) activityMap[date] = { count: 0, accuracySum: 0 };

                    activityMap[date].count++;
                    const acc = t.total_questions > 0 ? (t.score / (t.total_questions * 4)) * 100 : 0; // naive accuracy
                    activityMap[date].accuracySum += Math.max(0, acc);
                });

                dailyActivity = Object.keys(activityMap).sort().map(date => {
                    const st = activityMap[date];
                    return {
                        date,
                        tests: st.count,
                        avg_accuracy: st.count > 0 ? Math.round((st.accuracySum / st.count) * 10) / 10 : 0
                    };
                });
            }
        } catch (e) { /* */ }

        // Subscription breakdown
        let subscriptionBreakdown = { free: 0, pro: 0, premium: 0 };
        try {
            const { data: tiers } = await supabase.from('users').select('subscription_tier');
            if (tiers) {
                tiers.forEach(t => {
                    const tier = t.subscription_tier || 'free';
                    if (subscriptionBreakdown[tier] !== undefined) {
                        subscriptionBreakdown[tier]++;
                    } else {
                        subscriptionBreakdown[tier] = 1;
                    }
                });
            }
        } catch (e) { /* */ }

        return NextResponse.json({
            users: usersCount || 0,
            questions: questionsCount || 0,
            pyqs: pyqsCount || 0,
            reports: reportsCount,
            recentSignups,
            dailyActivity,
            subscriptionBreakdown
        });
    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
