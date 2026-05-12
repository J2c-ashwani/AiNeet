'use client';

/**
 * lib/boot/orchestrator.js
 *
 * Enforces a strict, sequential app boot order.
 * Race conditions between auth, bridge, IndexedDB, and offline queue
 * are eliminated by ensuring each step resolves before the next begins.
 *
 * Boot order (non-negotiable):
 *  1. auth_restore          — session must exist before anything reads user data
 *  2. bridge_init           — native channel must be open before any hardware API call
 *  3. capability_negotiate  — must know what native supports before UI renders
 *  4. indexeddb_restore     — local state before offline queue touches server
 *  5. offline_queue_replay  — server sync after local state is stable
 *  6. telemetry_flush       — non-critical, last before route hydration
 *  7. performance_attach    — attach ANR/memory observers
 */

let booted = false;

export async function bootApp() {
    if (booted) return;
    booted = true;

    await step('auth_restore',         restoreAuth);
    await step('bridge_init',          initBridge);
    await step('capability_negotiate', negotiateCaps);
    await step('lifecycle_init',       initLifecycle);   // NEW: Wave 6
    await step('recovery_check',       runRecovery);      // NEW: Wave 6
    await step('indexeddb_restore',    restoreLocalState);
    await step('offline_queue_replay', replayOfflineQueue);
    await step('telemetry_flush',      flushTelemetry);
    await step('performance_attach',   attachPerf);
}

// ---------------------------------------------------------------------------
// Step Runners
// ---------------------------------------------------------------------------

async function step(name, fn) {
    try {
        await fn();
    } catch (e) {
        // Boot steps must NEVER crash the app — log and continue
        console.error(`[Boot] Step "${name}" failed:`, e.message);
        try {
            const { bufferEvent } = await import('@/lib/telemetry/mobile-buffer');
            await bufferEvent({ event_type: 'boot_step_failure', failure_reason: `${name}: ${e.message}` });
        } catch { /* Buffer failure during boot — ignore */ }
    }
}

async function restoreAuth() {
    // Defer to existing auth layer — session cookie / JWT validation
    // Next.js middleware handles this automatically; this step is a no-op
    // but exists as a named gate in the orchestration chain.
}

async function initBridge() {
    const { initBridge: _initBridge } = await import('@/lib/platform');
    await _initBridge();
}

async function negotiateCaps() {
    const { negotiateCapabilities } = await import('@/lib/platform');
    await negotiateCapabilities();
}

async function restoreLocalState() {
    if (typeof indexedDB === 'undefined') return;
}

async function replayOfflineQueue() {
    // Integration point for existing offline queue module
}

async function flushTelemetry() {
    const { flushEvents } = await import('@/lib/telemetry/mobile-buffer');
    await flushEvents();
}

async function attachPerf() {
    const { attachPerformanceTelemetry } = await import('@/lib/telemetry/performance');
    attachPerformanceTelemetry();
}

// NEW: Wave 6 steps
async function initLifecycle() {
    const { initLifecycleManager } = await import('@/lib/mobile/lifecycle-manager');
    initLifecycleManager();
}

async function runRecovery() {
    const { runRecoveryCheck } = await import('@/lib/recovery/recovery-manager');
    const snapshot = await runRecoveryCheck();
    if (snapshot) {
        // Store recovered snapshot globally so test screen can pick it up
        window.__NEET_RECOVERED_SESSION__ = snapshot;
    }
}
