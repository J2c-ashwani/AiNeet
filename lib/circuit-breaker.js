/**
 * Redis-Backed Circuit Breaker
 * 
 * Replaces the in-memory Map with Upstash Redis so breaker state is
 * shared across all Vercel serverless instances. When Gemini trips on
 * instance A, instances B, C, D all see it and stop forwarding traffic.
 * 
 * S7 Fail Behavior: If Redis is down, circuit breaker fails OPEN.
 * Rationale: We prefer letting a degraded provider receive traffic
 * over silently blocking all AI requests due to a Redis outage.
 * The provider's own error handling will degrade gracefully.
 */

import { Redis } from '@upstash/redis';

let redis;
function getRedis() {
    if (!redis) redis = Redis.fromEnv();
    return redis;
}

const FAILURES_TO_OPEN = 5;
const COOLDOWN_SEC = 60; // 60 seconds half-open window

function failuresKey(svc) { return `neet:cb:failures:${svc}`; }
function stateKey(svc)    { return `neet:cb:state:${svc}`; }
function nextAttemptKey(svc) { return `neet:cb:next:${svc}`; }

export async function withCircuitBreaker(serviceName, apiCallFn) {
    const r = getRedis();

    try {
        const [state, nextAttemptStr] = await Promise.all([
            r.get(stateKey(serviceName)),
            r.get(nextAttemptKey(serviceName)),
        ]);

        if (state === 'OPEN') {
            const nextAttempt = parseInt(nextAttemptStr || '0', 10);
            if (Date.now() > nextAttempt) {
                // Transition to HALF_OPEN — let one request through to probe
                await r.set(stateKey(serviceName), 'HALF_OPEN', { ex: COOLDOWN_SEC * 2 });
            } else {
                throw new Error(`[CIRCUIT_OPEN] ${serviceName} is currently failing. Graceful rejection invoked.`);
            }
        }
    } catch (redisErr) {
        if (redisErr.message.includes('[CIRCUIT_OPEN]')) throw redisErr;
        // S7: Redis down → fail open, let the request through
        console.error(`[CB_REDIS_FAIL] ${serviceName} state check failed — failing open. err=${redisErr.message}`);
    }

    try {
        const result = await apiCallFn();

        // Success — reset the circuit
        try {
            const r2 = getRedis();
            await Promise.all([
                r2.del(failuresKey(serviceName)),
                r2.set(stateKey(serviceName), 'CLOSED', { ex: 3600 }),
            ]);
        } catch { /* Redis write failure on success — non-critical, ignore */ }

        return result;

    } catch (error) {
        const isClientError = error.message?.includes('40') || 
            (error.status && error.status >= 400 && error.status < 500);

        if (!isClientError) {
            try {
                const r3 = getRedis();
                const failures = await r3.incr(failuresKey(serviceName));
                await r3.expire(failuresKey(serviceName), COOLDOWN_SEC * 10);

                console.warn(`[CIRCUIT_IMPACT] ${serviceName} failure recorded. (${failures}/${FAILURES_TO_OPEN})`);

                if (failures >= FAILURES_TO_OPEN) {
                    const nextAttempt = Date.now() + COOLDOWN_SEC * 1000;
                    await Promise.all([
                        r3.set(stateKey(serviceName), 'OPEN', { ex: COOLDOWN_SEC * 3 }),
                        r3.set(nextAttemptKey(serviceName), String(nextAttempt), { ex: COOLDOWN_SEC * 3 }),
                    ]);
                    console.error(`🚨 [CIRCUIT_BREAKER_TRIPPED] ${serviceName} isolated. Retry after ${COOLDOWN_SEC}s.`);
                }
            } catch (redisErr) {
                // S7: Redis down during failure recording — log but don't crash
                console.error(`[CB_REDIS_FAIL] Could not record failure for ${serviceName}: ${redisErr.message}`);
            }
        }

        throw error;
    }
}

export async function getCircuitStates() {
    try {
        const r = getRedis();
        const keys = ['gemini', 'groq', 'openrouter'].flatMap(svc => [
            stateKey(svc), failuresKey(svc), nextAttemptKey(svc)
        ]);
        const values = await r.mget(...keys);
        
        const states = {};
        ['gemini', 'groq', 'openrouter'].forEach((svc, i) => {
            states[svc] = {
                state: values[i * 3] || 'CLOSED',
                failures: parseInt(values[i * 3 + 1] || '0', 10),
                nextAttempt: values[i * 3 + 2] ? new Date(parseInt(values[i * 3 + 2], 10)).toISOString() : null,
            };
        });
        return states;
    } catch {
        return { error: 'Redis unavailable — circuit state unknown' };
    }
}
