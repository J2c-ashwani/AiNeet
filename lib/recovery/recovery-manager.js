'use client';

/**
 * lib/recovery/recovery-manager.js — App Resume Kernel
 *
 * Runs BEFORE any route renders on every app launch.
 * Detects interrupted test sessions, validates snapshot integrity,
 * and restores exact test state within 20s of process death.
 *
 * This is the single most important reliability component in the app.
 * A student must never lose a test because Android killed the process.
 */

import { flushEvents, bufferEvent } from '@/lib/telemetry/mobile-buffer';

const SNAPSHOT_DB    = 'neet_snapshots_v1';
const SNAPSHOT_STORE = 'test_snapshots';
const SNAPSHOT_INTERVAL_MS = 20000; // Every 20s during active test

let snapshotTimer = null;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run on every app launch — the resume kernel.
 * Must complete before any route renders.
 */
export async function runRecoveryCheck() {
    const snapshot = await loadSnapshot();
    if (!snapshot) return null;

    // Validate checksum — reject silently corrupted state
    const isValid = await validateSnapshot(snapshot);
    if (!isValid) {
        await bufferEvent({ event_type: 'recovery_corrupted', failure_reason: 'Checksum mismatch' });
        await clearSnapshot();
        return null;
    }

    // Check if this session is still within server grace window
    const now = Date.now();
    const expiresAt = new Date(snapshot.expiresAt).getTime();
    const graceWindowMs = (snapshot.graceWindowSeconds || 30) * 1000;

    if (now > expiresAt + graceWindowMs) {
        // Session expired beyond grace — test cannot be recovered
        await bufferEvent({ event_type: 'recovery_expired', failure_reason: `Expired at ${snapshot.expiresAt}` });
        await clearSnapshot();
        return null;
    }

    await bufferEvent({ event_type: 'recovery_success', device_info: { snapshotAge: now - snapshot.savedAt } });
    return snapshot;
}

/**
 * Start periodic snapshotting during an active test.
 * Call when test screen mounts.
 */
export function startSnapshotting(getStateCallback) {
    stopSnapshotting(); // Clear any existing timer
    snapshotTimer = setInterval(async () => {
        const state = getStateCallback();
        if (state) await saveSnapshot(state);
    }, SNAPSHOT_INTERVAL_MS);
}

/**
 * Stop snapshotting and clear the stored snapshot.
 * Call on test submit or deliberate exit.
 */
export async function stopSnapshotting() {
    if (snapshotTimer) {
        clearInterval(snapshotTimer);
        snapshotTimer = null;
    }
    await clearSnapshot();
}

/**
 * Force an immediate snapshot (call on lifecycle pause events).
 */
export async function forceSnapshot(state) {
    if (state) await saveSnapshot(state);
}

// ---------------------------------------------------------------------------
// Snapshot Persistence (IndexedDB)
// ---------------------------------------------------------------------------

async function openSnapshotDB() {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') return resolve(null);
        const req = indexedDB.open(SNAPSHOT_DB, 1);
        req.onupgradeneeded = (e) => {
            e.target.result.createObjectStore(SNAPSHOT_STORE, { keyPath: 'id' });
        };
        req.onsuccess  = (e) => resolve(e.target.result);
        req.onerror    = ()  => reject(req.error);
    });
}

async function saveSnapshot(state) {
    try {
        const db = await openSnapshotDB();
        if (!db) return;

        const payload = {
            id:               'active_test',
            testId:           state.testId,
            answers:          state.answers,
            currentIndex:     state.currentIndex,
            questionIds:      state.questionIds,
            startedAt:        state.startedAt,
            expiresAt:        state.expiresAt,
            graceWindowSeconds: state.graceWindowSeconds || 30,
            savedAt:          Date.now(),
        };

        // Compute checksum for tamper + corruption detection
        payload.checksum = await sha256(JSON.stringify({
            testId: payload.testId,
            answers: payload.answers,
            expiresAt: payload.expiresAt,
        }));

        const tx = db.transaction(SNAPSHOT_STORE, 'readwrite');
        tx.objectStore(SNAPSHOT_STORE).put(payload);
    } catch {
        // Snapshot failure must never crash the test
    }
}

async function loadSnapshot() {
    try {
        const db = await openSnapshotDB();
        if (!db) return null;
        return new Promise((resolve) => {
            const req = db.transaction(SNAPSHOT_STORE, 'readonly')
                         .objectStore(SNAPSHOT_STORE).get('active_test');
            req.onsuccess = () => resolve(req.result || null);
            req.onerror   = () => resolve(null);
        });
    } catch {
        return null;
    }
}

async function clearSnapshot() {
    try {
        const db = await openSnapshotDB();
        if (!db) return;
        db.transaction(SNAPSHOT_STORE, 'readwrite')
          .objectStore(SNAPSHOT_STORE).delete('active_test');
    } catch { /* Ignore */ }
}

async function validateSnapshot(snapshot) {
    if (!snapshot?.checksum) return false;
    const expected = await sha256(JSON.stringify({
        testId:   snapshot.testId,
        answers:  snapshot.answers,
        expiresAt: snapshot.expiresAt,
    }));
    return expected === snapshot.checksum;
}

// ---------------------------------------------------------------------------
// Crypto Utilities
// ---------------------------------------------------------------------------

async function sha256(message) {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
        // Fallback for environments without SubtleCrypto
        return btoa(message).substring(0, 32);
    }
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0')).join('');
}
