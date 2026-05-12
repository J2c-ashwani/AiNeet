'use client';

/**
 * lib/mobile/lifecycle-manager.js
 *
 * Manages WebView lifecycle transitions deterministically.
 * Hooks into visibility API to handle: incoming calls, battery saver,
 * WhatsApp overlays, app minimize, and process suspension.
 *
 * Integrates with recovery-manager (snapshots) and telemetry (logging).
 */

import { forceSnapshot } from '@/lib/recovery/recovery-manager';
import { bufferEvent, flushEvents } from '@/lib/telemetry/mobile-buffer';

let activeTestStateProvider = null; // Callback set by test screen
let isBackground = false;
let backgroundEnteredAt = null;

// ---------------------------------------------------------------------------
// Initialization — call once from boot orchestrator
// ---------------------------------------------------------------------------

export function initLifecycleManager() {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    // Flutter can signal lifecycle events via the bridge
    window.NEET_LIFECYCLE = handleNativeLifecycleEvent;
}

// ---------------------------------------------------------------------------
// Test Integration
// ---------------------------------------------------------------------------

/**
 * Called by the test screen to register its state for emergency snapshots.
 * @param {Function} stateProvider — returns current test state object
 */
export function registerTestStateProvider(provider) {
    activeTestStateProvider = provider;
}

export function unregisterTestStateProvider() {
    activeTestStateProvider = null;
}

// ---------------------------------------------------------------------------
// Event Handlers
// ---------------------------------------------------------------------------

async function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
        await onAppBackground('visibility_hidden');
    } else if (document.visibilityState === 'visible' && isBackground) {
        await onAppForeground();
    }
}

async function handlePageHide() {
    // pagehide fires on process suspension — force final snapshot
    await onAppBackground('page_hide');
}

async function handleNativeLifecycleEvent(event) {
    // Called by Flutter bridge
    switch (event) {
        case 'PAUSE':    await onAppBackground('flutter_pause'); break;
        case 'RESUME':   await onAppForeground(); break;
        case 'BATTERY':  onBatterySaver(); break;
    }
}

// ---------------------------------------------------------------------------
// State Transitions
// ---------------------------------------------------------------------------

async function onAppBackground(trigger) {
    if (isBackground) return; // Already in background
    isBackground = true;
    backgroundEnteredAt = Date.now();

    // 1. Force snapshot if test is active
    if (activeTestStateProvider) {
        const state = activeTestStateProvider();
        if (state) await forceSnapshot(state);
    }

    // 2. Mark session as interrupted on server (fire-and-forget)
    if (activeTestStateProvider) {
        const state = activeTestStateProvider?.();
        if (state?.testId) {
            fetch('/api/tests/session-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testId: state.testId, status: 'suspended' })
            }).catch(() => {});
        }
    }

    // 3. Log lifecycle event
    await bufferEvent({
        event_type: 'lifecycle_background',
        failure_reason: trigger,
        route: window.location?.pathname
    });
}

async function onAppForeground() {
    const backgroundDurationMs = backgroundEnteredAt ? Date.now() - backgroundEnteredAt : 0;
    isBackground = false;
    backgroundEnteredAt = null;

    // Flush buffered telemetry on resume
    await flushEvents();

    await bufferEvent({
        event_type: 'lifecycle_foreground',
        device_info: { backgroundDurationMs }
    });
}

function onBatterySaver() {
    // Signal to reduce non-critical polling intervals
    window.dispatchEvent(new CustomEvent('neet:battery_saver'));
    bufferEvent({ event_type: 'lifecycle_battery_saver' });
}
