import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { FEATURE_FLAGS, isFeatureEnabled } from '@/lib/feature-flags';

async function requireAdmin(request) {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') return null;
    return user;
}

export async function GET(request) {
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const supabase = await getDb();

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

        // AI Cost Telemetry
        let aiTelemetry = {
            totalTokensIn: 0,
            totalTokensOut: 0,
            estimatedCostUSD: 0,
            estimatedCostINR: 0
        };

        try {
            // Aggregate all tokens today
            const { data: usageData } = await supabase
                .from('users')
                .select('daily_ai_tokens_input, daily_ai_tokens_output');

            if (usageData) {
                usageData.forEach(u => {
                    aiTelemetry.totalTokensIn += (u.daily_ai_tokens_input || 0);
                    aiTelemetry.totalTokensOut += (u.daily_ai_tokens_output || 0);
                });

                // Pricing reference: Gemini 1.5 Flash (for scale testing)
                // Approx $0.075 / 1M input tokens, $0.30 / 1M output tokens
                const costIn = (aiTelemetry.totalTokensIn / 1000000) * 0.075;
                const costOut = (aiTelemetry.totalTokensOut / 1000000) * 0.30;

                aiTelemetry.estimatedCostUSD = Number((costIn + costOut).toFixed(4));
                aiTelemetry.estimatedCostINR = Number((aiTelemetry.estimatedCostUSD * 86).toFixed(2)); // Approx ₹86/$1
            }
        } catch (e) { console.error('Token fetch error:', e); }

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

        const killSwitches = {};
        for (const name of Object.keys(FEATURE_FLAGS)) {
            killSwitches[name] = await isFeatureEnabled(name);
        }

        return NextResponse.json({
            users: usersCount || 0,
            questions: questionsCount || 0,
            pyqs: pyqsCount || 0,
            reports: reportsCount,
            recentSignups,
            dailyActivity,
            subscriptionBreakdown,
            aiTelemetry,
            killSwitches,
            killSwitchesActive: Object.values(killSwitches).every(Boolean)
        });
    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats. Please try again in a moment.' }, { status: 500 });
    }
}
