import { NextResponse } from 'next/server';
import { RATE_LIMITS, withApiRoute } from '@/lib/api-handler';
import { getDb } from '@/lib/core/db';
import { safeUpsert } from '@/lib/core/db-safe';
import { Redis } from '@upstash/redis';
import { FEATURE_FLAGS, isFeatureEnabled, clearFeatureFlagCache } from '@/lib/feature-flags';

export const GET = withApiRoute(async () => {
    const supabase = await getDb();
    const today = new Date().toISOString().split('T')[0];

    // ─── 1. Kill Switch Status ───
    const killSwitches = {};
    for (const name of Object.keys(FEATURE_FLAGS)) {
        killSwitches[name] = await isFeatureEnabled(name);
    }

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
    } catch (e) {
        console.error('Trust distribution calculation failed:', e);
    }

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
    } catch (e) {
        console.error('Error metrics calculation failed:', e);
    }

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
        const dailyRevenueTarget = mrr > 0 ? mrr / 30 : 0;
        
        // Estimate Cost (Assuming blended $0.15 per 1M tokens across Gemini/Groq, roughly ₹12)
        const dailyCostINR = (tokenStats.totalDaily / 1000000) * 12;
        
        const safeMargin = dailyRevenueTarget > 0
            ? ((dailyRevenueTarget - dailyCostINR) / dailyRevenueTarget) * 100
            : null;
        
        // Cost / Request & Cost / Session 
        // Estimate hits from tests (say 15 API hits per test on average + doubts)
        const estimatedRequests = errorMetrics.totalTests * 15;
        const activeUsers = tokenStats.uniqueUsers || 1;
        
        unitEconomics = {
            projectedMRR: mrr,
            dailyCost: dailyCostINR,
            margin: safeMargin === null ? null : Number(safeMargin.toFixed(1)),
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
}, {
    auth: 'admin',
    rateLimit: { ...RATE_LIMITS.STANDARD, failBehavior: 'closed', key: 'admin:ops' },
});

export const POST = withApiRoute(async (req, { body, user }) => {
    const { key, enabled, rollout_pct } = body || {};
    if (!key) {
        return NextResponse.json({ error: 'Feature flag key is required.' }, { status: 400 });
    }

    // Verify if it is a valid registered key or config key
    const validDbKeys = Object.values(FEATURE_FLAGS).map(f => f.key);
    const validConfigKeys = Object.keys(FEATURE_FLAGS);
    
    let dbKey = key;
    if (validConfigKeys.includes(key)) {
        dbKey = FEATURE_FLAGS[key].key;
    } else if (!validDbKeys.includes(key)) {
        return NextResponse.json({ 
            error: `Invalid feature flag: '${key}'. Must be one of: ${validConfigKeys.join(', ')}` 
        }, { status: 400 });
    }

    const updateData = {};
    if (enabled !== undefined) updateData.enabled = enabled;
    if (rollout_pct !== undefined) updateData.rollout_pct = Number(rollout_pct);
    updateData.updated_at = new Date().toISOString();

    const [flag] = await safeUpsert('feature_flags', { key: dbKey, ...updateData }, { onConflict: 'key' }, {
        route: '/api/admin/ops',
        userId: user?.id,
    });

    // Instantly reset process-level in-memory cache
    clearFeatureFlagCache();

    return NextResponse.json({ 
        success: true, 
        message: `Feature flag '${dbKey}' successfully updated.`,
        flag
    });
}, {
    auth: 'admin',
    rateLimit: { ...RATE_LIMITS.STANDARD, failBehavior: 'closed', key: 'admin:ops:post' },
});
