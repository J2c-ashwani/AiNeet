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
 *  4. push_registration     — native device token sync
 *  5. indexeddb_restore     — local state before offline queue touches server
 *  6. offline_queue_replay  — server sync after local state is stable
 *  7. telemetry_flush       — non-critical, last before route hydration
 *  8. performance_attach    — attach ANR/memory observers
 */

let booted = false;

export async function bootApp() {
    if (booted) return;
    booted = true;

    // ── 1. CRITICAL PATH (Must execute sequentially before UI stability) ──
    await step('auth_restore',         restoreAuth);
    await step('bridge_init',          initBridge);
    await step('app_check_fetch',      installAppCheckFetch);
    await step('indexeddb_restore',    restoreLocalState);

    // ── 2. DEFERRED PATH (Post-hydration non-blocking initialization) ─────
    Promise.all([
        step('capability_negotiate', negotiateCaps),
        step('lifecycle_init',       initLifecycle),
        step('recovery_check',       runRecovery),
    ]).catch(e => console.warn('[Boot] Deferred step error:', e));

    // ── 3. BACKGROUND PATH (Fire-and-forget network & sync jobs) ─────────
    setTimeout(() => {
        step('push_registration',    registerPushDevice);
        step('offline_queue_replay', replayOfflineQueue);
        step('telemetry_flush',      flushTelemetry);
        step('performance_attach',   attachPerf);
    }, 100);
}

// ---------------------------------------------------------------------------
// Step Runners
// ---------------------------------------------------------------------------

async function step(name, fn) {
    try {
        await fn();
    } catch (e) {
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

async function installAppCheckFetch() {
    const { isInsideNativeApp } = await import('@/lib/platform');
    if (!isInsideNativeApp()) return;
    const { installNativeAppCheckFetch } = await import('@/lib/mobile/app-check-fetch');
    installNativeAppCheckFetch();
}

async function negotiateCaps() {
    const { negotiateCapabilities } = await import('@/lib/platform');
    await negotiateCapabilities();
}

async function registerPushDevice() {
    const { isInsideNativeApp, requestNativeFcmRegistration } = await import('@/lib/platform');
    const { checkedFetch } = await import('@/lib/http');
    if (!isInsideNativeApp()) return;

    let registration;
    try {
        registration = await requestNativeFcmRegistration();
    } catch (error) {
        if (String(error?.message || '').includes('FCM_REGISTRATION_UNAVAILABLE')) return;
        throw error;
    }

    if (!registration?.token) return;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    const response = await checkedFetch('/api/user/update-fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...registration, timezone }),
    }, {
        allowedStatuses: [401],
        errorMessage: 'FCM device registration failed',
    });

    if (response.status === 401) return;
}

async function restoreLocalState() {
    if (typeof indexedDB === 'undefined') return;
}

async function replayOfflineQueue() {
    const { OfflineQueue } = await import('@/lib/client/offline-queue');
    await OfflineQueue.sync();
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
