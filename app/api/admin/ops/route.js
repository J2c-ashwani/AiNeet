import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { Redis } from '@upstash/redis';

export async function GET(request) {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const supabase = await getDb();
    const today = new Date().toISOString().split('T')[0];

    // ─── 1. Kill Switch Status ───
    const killSwitches = {
        ai: process.env.DISABLE_AI !== 'true',
        payments: process.env.DISABLE_PAYMENTS !== 'true',
        referrals: process.env.DISABLE_REFERRALS !== 'true'
    };

    // ─── 2. Circuit Breaker States (Module-level Map is in-memory only per instance) ───
    // We read from the imported module's live state
    let circuitStates = {};
    try {
        const { getCircuitStates } = await import('@/lib/circuit-breaker');
        circuitStates = getCircuitStates();
    } catch (e) {
        circuitStates = { gemini: 'UNKNOWN', groq: 'UNKNOWN', openrouter: 'UNKNOWN' };
    }

    // ─── 3. Redis Token Consumption (Platform-wide Today) ───
    let tokenStats = { totalDaily: 0, uniqueUsers: 0, topConsumers: [] };
    try {
        const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });

        // Scan for today's token keys
        const keys = [];
        let cursor = 0;
        do {
            const [nextCursor, batch] = await redis.scan(cursor, { match: `tokens:daily:*:${today}`, count: 100 });
            cursor = Number(nextCursor);
            keys.push(...batch);
        } while (cursor !== 0);

        const topConsumers = [];
        for (const key of keys) {
            const val = await redis.get(key);
            const userId = key.split(':')[2];
            tokenStats.totalDaily += Number(val) || 0;
            topConsumers.push({ userId, tokens: Number(val) || 0 });
        }
        tokenStats.uniqueUsers = keys.length;
        tokenStats.topConsumers = topConsumers.sort((a, b) => b.tokens - a.tokens).slice(0, 10);
    } catch (e) {
        console.error('Token scan failed:', e);
    }

    // ─── 4. Trust Score Distribution ───
    let trustDistribution = { healthy: 0, warning: 0, flagged: 0, banned: 0 };
    try {
        const { data: users } = await supabase.from('users').select('trust_score');
        if (users) {
            users.forEach(u => {
                const score = u.trust_score ?? 100;
                if (score >= 80) trustDistribution.healthy++;
                else if (score >= 50) trustDistribution.warning++;
                else if (score >= 20) trustDistribution.flagged++;
                else trustDistribution.banned++;
            });
        }
    } catch (e) {}

    // ─── 5. Error Rate (Last 24h from test submissions) ───
    let errorMetrics = { totalTests: 0, failedSubmissions: 0 };
    try {
        const yesterday = new Date(Date.now() - 86400000).toISOString();
        const { count: totalTests } = await supabase
            .from('tests')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', yesterday);
        
        const { count: completedTests } = await supabase
            .from('tests')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', yesterday)
            .not('completed_at', 'is', null);
        
        errorMetrics.totalTests = totalTests || 0;
        errorMetrics.failedSubmissions = (totalTests || 0) - (completedTests || 0);
    } catch (e) {}

    // ─── 6. Revenue Intelligence & Unit Economics ───
    let unitEconomics = { projectedMRR: 0, dailyCost: 0, margin: 100, costPerRequest: 0, costPerSession: 0, activeRequests: 0 };
    try {
        // Calculate Projected MRR from subscriptions
        const { data: subs } = await supabase.from('users').select('subscription_tier, plan_type').or('plan_type.eq.pro,subscription_tier.eq.premium');
        let proCount = 0; let premiumCount = 0;
        subs?.forEach(s => {
            if (s.plan_type === 'pro') proCount++;
            if (s.subscription_tier === 'premium') premiumCount++;
        });
        
        const mrr = (proCount * 299) + (premiumCount * 599);
        const dailyRevenueTarget = (mrr / 30) || Number(process.env.FALLBACK_DAILY_MRR || 50); // ₹50 fallback for brand new startups
        
        // Estimate Cost (Assuming blended $0.15 per 1M tokens across Gemini/Groq, roughly ₹12)
        const dailyCostINR = (tokenStats.totalDaily / 1000000) * 12;
        
        const safeMargin = ((dailyRevenueTarget - dailyCostINR) / dailyRevenueTarget) * 100;
        
        // Cost / Request & Cost / Session 
        // Estimate hits from tests (say 15 API hits per test on average + doubts)
        const estimatedRequests = errorMetrics.totalTests * 15;
        const activeUsers = tokenStats.uniqueUsers || 1;
        
        unitEconomics = {
            projectedMRR: mrr,
            dailyCost: dailyCostINR,
            margin: Number(safeMargin.toFixed(1)),
            costPerRequest: estimatedRequests > 0 ? Number((dailyCostINR / estimatedRequests).toFixed(4)) : 0,
            costPerSession: Number((dailyCostINR / activeUsers).toFixed(2)),
            activeRequests: estimatedRequests
        };

        // Sync to Redis for Edge Governance Margin Protection
        try {
            const redis = new Redis({
                url: process.env.UPSTASH_REDIS_REST_URL,
                token: process.env.UPSTASH_REDIS_REST_TOKEN,
            });
            await redis.set(`ops:projected_mrr_daily`, dailyRevenueTarget);
            await redis.set(`ops:daily_cost:${today}`, dailyCostINR);
            await redis.expire(`ops:daily_cost:${today}`, 86400); 
        } catch (re) { console.error('Redis margin sync failed', re); }
        
    } catch (e) {
        console.error('Unit Economics calculation failed:', e);
    }

    return NextResponse.json({
        killSwitches,
        circuitStates,
        tokenStats,
        trustDistribution,
        errorMetrics,
        unitEconomics,
        timestamp: new Date().toISOString()
    }, {
        headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' }
    });
}
