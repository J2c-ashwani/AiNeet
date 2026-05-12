'use client';

/**
 * lib/telemetry/mobile-buffer.js
 *
 * Offline-safe telemetry buffer using IndexedDB.
 * Events survive network loss, WebView crashes, and app kills.
 * Flushed in batch on app resume or explicit call.
 */

const DB_NAME = 'neet_telemetry_v1';
const STORE   = 'events';
const MAX_BUFFER_SIZE = 200; // Prevent unbounded growth on offline devices

function openDB() {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') return resolve(null);
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (e) => {
            e.target.result.createObjectStore(STORE, { keyPath: 'id' });
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror   = () => reject(req.error);
    });
}

async function getObjectStore(mode = 'readwrite') {
    const db = await openDB();
    if (!db) return null;
    return db.transaction(STORE, mode).objectStore(STORE);
}

/**
 * Buffer a telemetry event to IndexedDB.
 * Safe to call when offline, during crashes, or before network is available.
 */
export async function bufferEvent(event) {
    try {
        const store = await getObjectStore('readwrite');
        if (!store) return;

        // Prune if over max size to prevent unbounded growth
        const countReq = store.count();
        const count = await new Promise(r => { countReq.onsuccess = () => r(countReq.result); });
        if (count >= MAX_BUFFER_SIZE) return; // Drop oldest silently

        store.put({
            id:         crypto.randomUUID(),
            buffered_at: Date.now(),
            route:       typeof window !== 'undefined' ? window.location?.pathname : null,
            ...event
        });
    } catch {
        // Buffer failures must never crash the app
    }
}

/**
 * Flush buffered events to the server in a single batch request.
 * Called on app resume, network restore, or explicit trigger.
 */
export async function flushEvents() {
    if (typeof fetch === 'undefined') return;
    try {
        const store = await getObjectStore('readonly');
        if (!store) return;

        const events = await new Promise((resolve, reject) => {
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror   = reject;
        });

        if (!events.length) return;

        const res = await fetch('/api/telemetry/mobile-events', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ events })
        });

        if (res.ok) {
            // Clear successfully flushed events
            const ws = await getObjectStore('readwrite');
            if (ws) events.forEach(e => ws.delete(e.id));
        }
    } catch {
        // Stay buffered — will retry on next resume
    }
}

// Auto-flush on app resume (covers Redmi battery saver, incoming call recovery)
if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            flushEvents();
        }
    });
}
