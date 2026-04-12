/**
 * Centralized Resiliency Engine: Multi-State Circuit Breaker
 * 
 * Intercepts third-party HTTP timeouts and 5xx failures. If thresholds are breached,
 * the circuit "OPENs" and gracefully rejects downstream API hits for 60 seconds
 * to prevent Vercel Node memory exhaustion and scaling death.
 */

const breakers = new Map();

// MD Tuned Config
const FAILURES_TO_OPEN = 5;
const COOLDOWN_MS = 60000; // 60 seconds

export async function withCircuitBreaker(serviceName, apiCallFn) {
    if (!breakers.has(serviceName)) {
        breakers.set(serviceName, { failures: 0, state: 'CLOSED', nextAttempt: 0 });
    }

    const breaker = breakers.get(serviceName);

    if (breaker.state === 'OPEN') {
        if (Date.now() > breaker.nextAttempt) {
            breaker.state = 'HALF_OPEN';
        } else {
            throw new Error(`[CIRCUIT_OPEN] ${serviceName} is currently failing. Graceful rejection invoked.`);
        }
    }

    try {
        const result = await apiCallFn();
        
        // Success resets the circuit
        breaker.failures = 0;
        breaker.state = 'CLOSED';
        return result;
        
    } catch (error) {
        // Is it a 4xx error? We do NOT penalize the circuit breaker for user-error!
        const isClientError = error.message.includes('40') || (error.status && error.status >= 400 && error.status < 500);
        
        if (!isClientError) {
            // It's a Timeout or 5xx Server Error
            breaker.failures += 1;
            console.warn(`[CIRCUIT_IMPACT] ${serviceName} failure recorded. (Count: ${breaker.failures}/${FAILURES_TO_OPEN})`);

            if (breaker.failures >= FAILURES_TO_OPEN) {
                breaker.state = 'OPEN';
                breaker.nextAttempt = Date.now() + COOLDOWN_MS;
                console.error(`🚨 [CIRCUIT_BREAKER_TRIPPED] ${serviceName} isolated. Vercel Compute protected. Retry after 60s.`);
            }
        }
        throw error;
    }
}

export function getCircuitStates() {
    const states = {};
    for (const [name, breaker] of breakers) {
        states[name] = {
            state: breaker.state,
            failures: breaker.failures,
            nextAttempt: breaker.state === 'OPEN' ? new Date(breaker.nextAttempt).toISOString() : null
        };
    }
    return states;
}
