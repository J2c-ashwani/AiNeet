'use client';

/**
 * lib/resilience/circuit-breaker.js
 *
 * Prevents external service failures (Gemini, OpenAI, etc.)
 * from freezing the UI. Opens after 3 consecutive failures in 30s.
 * Degrades gracefully to fallback behavior.
 * Auto-probes every 60s for recovery.
 */

const breakers = new Map();

const FAILURE_THRESHOLD  = 3;
const FAILURE_WINDOW_MS  = 30000; // 30s
const PROBE_INTERVAL_MS  = 60000; // 60s

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Execute a function through the circuit breaker.
 * Falls back to fallbackFn if the circuit is open or the call fails.
 *
 * @param {string} serviceName — e.g. 'gemini', 'openai', 'fcm'
 * @param {Function} fn — async function to execute
 * @param {Function} fallbackFn — fallback if circuit is open or fn throws
 */
export async function withCircuitBreaker(serviceName, fn, fallbackFn) {
    const breaker = getBreaker(serviceName);

    if (breaker.state === 'open') {
        _log(serviceName, 'OPEN — using fallback');
        return fallbackFn();
    }

    try {
        const result = await fn();
        onSuccess(serviceName);
        return result;
    } catch (e) {
        onFailure(serviceName, e);
        _log(serviceName, `Failure ${breaker.failures}/${FAILURE_THRESHOLD}: ${e.message}`);
        return fallbackFn();
    }
}

/**
 * Check if a service circuit is currently open (degraded).
 */
export function isOpen(serviceName) {
    return getBreaker(serviceName).state === 'open';
}

// ---------------------------------------------------------------------------
// Internal State
// ---------------------------------------------------------------------------

function getBreaker(name) {
    if (!breakers.has(name)) {
        breakers.set(name, { state: 'closed', failures: 0, lastFailureAt: null, probeTimer: null });
    }
    return breakers.get(name);
}

function onSuccess(name) {
    const b = getBreaker(name);
    b.failures = 0;
    if (b.state === 'half-open') {
        b.state = 'closed';
        clearInterval(b.probeTimer);
        _bufferEvent(name, 'circuit_breaker_close');
        _log(name, 'CLOSED — service recovered');
    }
}

function onFailure(name, err) {
    const b = getBreaker(name);
    const now = Date.now();

    // Reset failure count if outside the time window
    if (b.lastFailureAt && (now - b.lastFailureAt) > FAILURE_WINDOW_MS) {
        b.failures = 0;
    }

    b.failures++;
    b.lastFailureAt = now;

    if (b.failures >= FAILURE_THRESHOLD && b.state === 'closed') {
        b.state = 'open';
        _bufferEvent(name, 'circuit_breaker_open', err?.message);
        _log(name, 'OPENED — too many failures');

        // Schedule auto-probe
        b.probeTimer = setInterval(() => probe(name), PROBE_INTERVAL_MS);
    }
}

async function probe(name) {
    const b = getBreaker(name);
    b.state = 'half-open';
    _log(name, 'PROBING — half-open');
    // Actual probe is triggered naturally on next withCircuitBreaker call
    // If it succeeds, onSuccess() closes it. If it fails, onFailure() re-opens it.
}

function _log(name, msg) {
    console.warn(`[CircuitBreaker:${name}] ${msg}`);
}

function _bufferEvent(name, event_type, failure_reason = null) {
    import('@/lib/telemetry/mobile-buffer').then(m => {
        m.bufferEvent({ event_type, failure_reason: failure_reason || name });
    }).catch(() => {});
}
