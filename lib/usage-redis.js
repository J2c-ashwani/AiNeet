import { Redis } from '@upstash/redis';
import { getEffectiveTokenLimit } from './trust-engine';

// MD Tier Limits (Tokens / 24h)
const PLAN_LIMITS = {
    free: 3000,
    paid: 20000
};

// Burst Cap (Tokens / 60s)
const BURST_LIMIT = 1000;

export class EdgeGovernance {
    static getRedis() {
        if (!process.env.UPSTASH_REDIS_REST_URL) return null;
        return new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    }

    /**
     * Executes strict cost-enforcement on LLM boundaries
     * @returns {Object} { allowed: boolean, providerRoute: 'gemini' | 'groq', reason: string }
     */
    static async validateConsumptionProfile(userId, isPaid = false, projectedTokens = 300, trustScore = 100, planKey = 'free') {
        const redis = this.getRedis();
        
        // FAIL-OPEN PROTOCOL: If Redis drops offline, do not stall the business logic. Fallback to free allowances.
        if (!redis) return { allowed: true, providerRoute: 'gemini', reason: 'Fail-Open' };

        try {
            const today = new Date().toISOString().split('T')[0];
            const burstKey = `tokens:burst:${userId}`;
            const dailyKey = `tokens:daily:${userId}:${today}`;

            // Atomic pipelined increment to prevent race condition leaks
            const pipeline = redis.pipeline();
            pipeline.incrby(burstKey, projectedTokens);
            if (projectedTokens === 0) pipeline.expire(burstKey, 60); // Refresh burst window
            pipeline.incrby(dailyKey, projectedTokens);
            pipeline.expire(dailyKey, 86400); // 24hr decay

            const results = await pipeline.exec();
            const burstTokens = results[0];
            const dailyTokens = results[2];
            
            // 0. GLOBAL MARGIN PROTECTION (MD Lockout Loop)
            // Prevent high-trust free users from eroding paid margins
            const marginHealth = await this.checkGlobalMarginHealth();
            if (!marginHealth.safe) {
                // Violent downgrade to save the company
                return { allowed: true, providerRoute: 'groq', reason: 'NEGATIVE_MARGIN_EMERGENCY_DOWNGRADE' };
            }

            // 1. BURST CHECK (Stop abusive recursive scripts immediately)
            if (burstTokens > BURST_LIMIT) {
                return { allowed: false, providerRoute: null, reason: '429_BURST_CAP' };
            }

            // 2. TIERED DAILY CHECK (Trust-Adjusted)
            const basePlanLimit = isPaid ? PLAN_LIMITS.paid : PLAN_LIMITS.free;
            const limit = getEffectiveTokenLimit(basePlanLimit, trustScore, planKey);
            
            // Over 120%? Hard stop billing hemorrhage.
            if (dailyTokens > limit * 1.2) {
                return { allowed: false, providerRoute: null, reason: 'QUOTA_EXHAUSTED' };
            }
            
            // Over 100%? Degrade UX cleanly down to cheaper fallback model to preserve unit margins.
            if (dailyTokens > limit) {
                return { allowed: true, providerRoute: 'groq', reason: 'DEGRADED_QUALITY' };
            }

            // Over 80%? Throw warning header/telemetry but keep full quality.
            if (dailyTokens > limit * 0.8) {
                return { allowed: true, providerRoute: 'gemini', reason: 'WARNING_80_PERCENT' };
            }

            return { allowed: true, providerRoute: 'gemini', reason: 'OK' };

        } catch (error) {
            console.error('EdgeGovernance Redis Drop - Failing Open', error);
            // Fail open securely
            return { allowed: true, providerRoute: 'groq', reason: 'FAILSAFE_GROQ' };
        }
    }

    /**
     * MD Mandate: Revenue Intelligence Circuit Breaker
     * Checks if the entire platform's token burn is threatening today's gross margin.
     * @returns {Object} { safe: boolean, currentMargin: number }
     */
    static async checkGlobalMarginHealth() {
        const redis = this.getRedis();
        if (!redis) return { safe: true, currentMargin: 100 }; // Fail safe

        try {
            const today = new Date().toISOString().split('T')[0];
            const platformCostKey = `ops:daily_cost:${today}`;
            const platformMRRKey = `ops:projected_mrr_daily`; // Updated lazily by ops route

            const [cost, mrrDaily] = await Promise.all([
                redis.get(platformCostKey),
                redis.get(platformMRRKey)
            ]);

            const currentCost = Number(cost || 0);
            const rawMRR = Number(mrrDaily || 50); // Fallback: Assume $50/day buffer if no data
            
            // If we've burnt more than 70% of today's theoretical revenue on API costs, we are bleeding.
            const margin = ((rawMRR - currentCost) / rawMRR) * 100;
            
            return {
                safe: margin > 30, // Must keep at least 30% gross margin
                currentMargin: Number(margin.toFixed(1))
            };
        } catch (e) {
            return { safe: true, currentMargin: 100 };
        }
    }
}
