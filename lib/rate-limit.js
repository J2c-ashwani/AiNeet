/**
 * Production Rate Limiter — Upstash Redis Backed
 * 
 * Uses sliding window algorithm (MD mandate — prevents burst abuse at window boundaries).
 * Shared state across all Vercel serverless instances via Redis.
 * 
 * S7 — Redis Fail Behavior (MD mandate, non-negotiable):
 *   'open'   → Redis failure allows request (acquisition routes, battle)
 *   'closed' → Redis failure blocks request (auth, password reset)
 *   'soft'   → Redis failure allows request but logs the failure (doubt solver)
 * 
 * If Redis is degraded and the wrong behavior is applied, we prefer:
 *   - Losing cost protection temporarily (open)
 *   - Over killing the acquisition funnel (closed)
 * Auth routes are the ONLY exception — security > availability.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let redis;
function getRedis() {
    if (!redis) {
        redis = Redis.fromEnv();
    }
    return redis;
}

// Cache Ratelimit instances by config key — avoids recreating on every call
const limiterCache = new Map();

function getLimiter(limit, windowSec) {
    const cacheKey = `${limit}:${windowSec}`;
    if (!limiterCache.has(cacheKey)) {
        limiterCache.set(cacheKey, new Ratelimit({
            redis: getRedis(),
            limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
            prefix: 'neet:rl',
            analytics: false, // Disable Upstash analytics to save Redis ops
        }));
    }
    return limiterCache.get(cacheKey);
}

/**
 * Check rate limit for a key.
 * 
 * @param {string}  key        - Unique identifier (user ID, IP, device hash)
 * @param {number}  limit      - Max requests allowed
 * @param {number}  windowMs   - Time window in milliseconds
 * @param {string}  [failBehavior='open'] - 'open' | 'closed' | 'soft'
 * @returns {Promise<{success: boolean, remaining: number, reset: number}>}
 */
export async function rateLimit(key, limit, windowMs, failBehavior = 'open') {
    const windowSec = Math.ceil(windowMs / 1000);

    try {
        const limiter = getLimiter(limit, windowSec);
        const { success, remaining, reset } = await limiter.limit(key);
        return { success, remaining: remaining ?? 0, reset: reset ?? Date.now() + windowMs };
    } catch (redisErr) {
        console.error(`[RATELIMIT_REDIS_FAIL] key=${key} behavior=${failBehavior} err=${redisErr.message}`);

        if (failBehavior === 'closed') {
            // Auth routes: security > availability. Block on Redis failure.
            console.warn(`[RATELIMIT_FAILCLOSED] Blocking request on Redis failure for key=${key}`);
            return { success: false, remaining: 0, reset: Date.now() + windowMs, redisDown: true };
        }

        if (failBehavior === 'soft') {
            // Doubt solver: allow but mark as degraded so caller can log
            console.warn(`[RATELIMIT_FAILSOFT] Allowing request on Redis failure for key=${key}`);
            return { success: true, remaining: limit, reset: Date.now() + windowMs, redisDown: true };
        }

        // Default: 'open' — acquisition funnel, battle. Allow traffic, never block users on infra failure.
        return { success: true, remaining: limit, reset: Date.now() + windowMs, redisDown: true };
    }
}
