import { Redis } from '@upstash/redis';
import crypto from 'crypto';

// Initialize the Upstash Redis client (REST API)
export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

/**
 * CTO Constraints enforced:
 * 1. Versioned keys (hash covers prompt + model + prompt version)
 * 2. Strict TTLs to prevent infinite stale caching
 */

// Cache lifetimes in seconds
export const CACHE_TTL = {
    DOUBTS: 7 * 24 * 60 * 60,      // 7 days
    NCERT: 30 * 24 * 60 * 60,      // 30 days
    TESTS: 3 * 24 * 60 * 60,       // 3 days
    EXPLANATIONS: 30 * 24 * 60 * 60 // 30 days
};

export const PROMPT_VERSION = 'v1.0';

/**
 * Generates a deterministic, versioned hash for a prompt
 */
export function generateCacheKey(prompt, type, model = 'gemini-2.5-pro') {
    const rawString = `${PROMPT_VERSION}:${model}:${type}:${prompt}`;
    return crypto.createHash('sha256').update(rawString).digest('hex');
}

/**
 * Fetch from cache
 */
export async function getCachedResponse(key) {
    if (!process.env.UPSTASH_REDIS_REST_URL) return null;

    try {
        const data = await redis.get(key);
        return data; // returns parsed JSON if it was stored as JSON
    } catch (e) {
        console.error('Redis GET error:', e);
        return null;
    }
}

/**
 * Save to cache
 * CTO Constraint: Only cache successful, complete responses.
 */
export async function setCachedResponse(key, responseData, ttlSeconds) {
    if (!process.env.UPSTASH_REDIS_REST_URL) return;
    if (!responseData || responseData.error) return; // Never cache errors

    try {
        await redis.set(key, responseData, { ex: ttlSeconds });
    } catch (e) {
        console.error('Redis SET error:', e);
    }
}
