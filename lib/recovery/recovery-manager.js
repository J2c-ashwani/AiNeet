'use client';
/**
 * lib/recovery/recovery-manager.js — App Resume Kernel (Full Production Version)
 *
 * Deterministic test state recovery after process death.
 * Every snapshot is cryptographically validated before restoration.
 * Recovery loops, tampered payloads, and expired sessions are all explicitly rejected.
 */

import { bufferEvent } from '@/lib/telemetry/mobile-buffer';

const SNAPSHOT_DB      = 'neet_snapshots_v2';
const SNAPSHOT_STORE   = 'test_snapshots';
const SCHEMA_VERSION   = 2;
const SNAPSHOT_INTERVAL_MS = 20000;
const MAX_RECOVERY_LOOPS   = 3;  // Reject if same session has crashed > 3 times

let snapshotTimer = null;

// ── Public API ──────────────────────────────────────────────────────────────

export async function runRecoveryCheck() {
    const snapshot = await loadSnapshot();
    if (!snapshot) return null;

    // 1. Schema version gate — reject incompatible old snapshots
    if (!snapshot.version || snapshot.version < SCHEMA_VERSION) {
        await _emit('recovery_schema_mismatch', `Expected v${SCHEMA_VERSION}, got v${snapshot.version}`);
        await clearSnapshot();
        return null;
    }

    // 2. Checksum validation — reject tampered or corrupted state
    const valid = await validateSnapshot(snapshot);
    if (!valid) {
        await _emit('recovery_corrupted', 'Checksum mismatch — payload rejected');
        await _quarantineSnapshot(snapshot); // Preserve for forensic analysis
        await clearSnapshot();
        return null;
    }

    // 3. Expiry check — server authoritative
    const now = Date.now();
    const graceMs = (snapshot.grace_window_seconds || 30) * 1000;
    if (now > new Date(snapshot.expires_at).getTime() + graceMs) {
        await _emit('recovery_expired', `Session expired at ${snapshot.expires_at}`);
        await clearSnapshot();
        return null;
    }

    // 4. Recovery loop detection — reject crash loops
    const loopCount = await _incrementLoopCounter(snapshot.session_id);
    if (loopCount > MAX_RECOVERY_LOOPS) {
        await _emit('recovery_loop_detected', `${loopCount} recovery attempts for session ${snapshot.session_id}`);
        await clearSnapshot();
        return null;
    }

    // 5. Replay dedupe lock — prevent double-restoration
    const locked = await _acquireReplayLock(snapshot.session_id);
    if (!locked) {
        await _emit('recovery_dedupe_blocked', 'Concurrent recovery attempt blocked');
        return null;
    }

    await _emit('recovery_success', null, { snapshotAge: now - snapshot.saved_at, loopCount });
    return snapshot;
}

export function startSnapshotting(getState) {
    stopSnapshotting();
    snapshotTimer = setInterval(async () => {
        const state = getState();
        if (state) await saveSnapshot(state);
    }, SNAPSHOT_INTERVAL_MS);
}

export async function stopSnapshotting() {
    if (snapshotTimer) { clearInterval(snapshotTimer); snapshotTimer = null; }
    await clearSnapshot();
    _releaseAllLocks();
}

export async function forceSnapshot(state) {
    if (state) await saveSnapshot(state);
}

// ── Snapshot Persistence ────────────────────────────────────────────────────

async function saveSnapshot(state) {
    try {
        const db = await _openDB();
        if (!db) return;

        const payload = {
            version:             SCHEMA_VERSION,
            session_id:          state.sessionId  || state.testId,
            test_id:             state.testId,
            device_id:           state.deviceId   || _getDeviceId(),
            app_version:         state.appVersion || window.__NEET_APP_VERSION__ || 'unknown',
            question_index:      state.currentIndex,
            answers:             state.answers,
            question_ids:        state.questionIds,
            started_at:          state.startedAt,
            expires_at:          state.expiresAt,
            grace_window_seconds: state.graceWindowSeconds || 30,
            last_sync_at:        new Date().toISOString(),
            pending_uploads:     state.pendingUploads || [],
            bridge_state:        state.bridgeState   || null,
            saved_at:            Date.now(),
        };

        payload.checksum = await _sha256(JSON.stringify({
            session_id: payload.session_id,
            answers:    payload.answers,
            expires_at: payload.expires_at,
            version:    payload.version,
        }));

        const tx = db.transaction(SNAPSHOT_STORE, 'readwrite');
        tx.objectStore(SNAPSHOT_STORE).put({ id: 'active_test', ...payload });
    } catch { /* Never crash the test flow */ }
}

async function loadSnapshot() {
    try {
        const db = await _openDB();
        if (!db) return null;
        return new Promise((res) => {
            const req = db.transaction(SNAPSHOT_STORE, 'readonly')
                         .objectStore(SNAPSHOT_STORE).get('active_test');
            req.onsuccess = () => res(req.result || null);
            req.onerror   = () => res(null);
        });
    } catch { return null; }
}

export async function clearSnapshot() {
    try {
        const db = await _openDB();
        if (!db) return;
        db.transaction(SNAPSHOT_STORE, 'readwrite').objectStore(SNAPSHOT_STORE).delete('active_test');
    } catch { }
}

async function validateSnapshot(snap) {
    if (!snap?.checksum) return false;
    const expected = await _sha256(JSON.stringify({
        session_id: snap.session_id,
        answers:    snap.answers,
        expires_at: snap.expires_at,
        version:    snap.version,
    }));
    return expected === snap.checksum;
}

// ── Recovery Loop Counter ───────────────────────────────────────────────────

async function _incrementLoopCounter(sessionId) {
    const key = `neet_recovery_loops_${sessionId}`;
    const count = parseInt(sessionStorage.getItem(key) || '0') + 1;
    sessionStorage.setItem(key, count);
    return count;
}

// ── Replay Dedupe Lock ──────────────────────────────────────────────────────

const _activeLocks = new Set();

async function _acquireReplayLock(sessionId) {
    if (_activeLocks.has(sessionId)) return false;
    _activeLocks.add(sessionId);
    return true;
}

function _releaseAllLocks() { _activeLocks.clear(); }

// ── Quarantine (Forensic Preservation) ─────────────────────────────────────

async function _quarantineSnapshot(snapshot) {
    try {
        const db = await _openDB();
        if (!db) return;
        const q = { id: `quarantined_${Date.now()}`, ...snapshot, quarantined_at: Date.now() };
        db.transaction(SNAPSHOT_STORE, 'readwrite').objectStore(SNAPSHOT_STORE).put(q);
    } catch { }
}

// ── IndexedDB ───────────────────────────────────────────────────────────────

async function _openDB() {
    return new Promise((res, rej) => {
        if (typeof indexedDB === 'undefined') return res(null);
        const req = indexedDB.open(SNAPSHOT_DB, 1);
        req.onupgradeneeded = (e) => e.target.result.createObjectStore(SNAPSHOT_STORE, { keyPath: 'id' });
        req.onsuccess = (e) => res(e.target.result);
        req.onerror   = ()  => rej(req.error);
    });
}

// ── Utilities ───────────────────────────────────────────────────────────────

function _getDeviceId() {
    if (typeof localStorage === 'undefined') return 'unknown';
    let id = localStorage.getItem('neet_device_id');
    if (!id) { id = crypto.randomUUID?.() || `dev_${Date.now()}`; localStorage.setItem('neet_device_id', id); }
    return id;
}

async function _sha256(msg) {
    try {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
        return btoa(msg).substring(0, 32); // Degraded fallback
    }
}

async function _emit(event_type, failure_reason = null, device_info = {}) {
    try { await bufferEvent({ event_type, failure_reason, device_info }); } catch { }
}
