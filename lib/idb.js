/**
 * P0-1 Trust Hardening: IndexedDB Persistence Layer
 * 
 * IndexedDB = canonical source of truth for test state.
 * localStorage = fast recovery signal only (activeTestId, resumeAvailable).
 * 
 * This separation ensures:
 * - No blocking main-thread writes (IDB is async)
 * - No partial JSON corruption from interrupted localStorage writes
 * - No race conditions across tabs
 * - Survives tab close, browser restart, cache clears
 */

const DB_NAME = 'neet_coach_offline_db';
const DB_VERSION = 2;
const STORE_DRAFTS = 'test_drafts';
const STORE_SESSIONS = 'test_sessions';

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
                db.createObjectStore(STORE_DRAFTS);
            }
            if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
                db.createObjectStore(STORE_SESSIONS);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export const OfflineStorage = {
    async setItem(key, value) {
        try {
            const db = await initDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_DRAFTS, 'readwrite');
                tx.objectStore(STORE_DRAFTS).put(value, key);
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        } catch(e) { console.error('IDB Set Error', e); }
    },
    async getItem(key) {
        try {
            const db = await initDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_DRAFTS, 'readonly');
                const req = tx.objectStore(STORE_DRAFTS).get(key);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
        } catch(e) { return null; }
    },
    async removeItem(key) {
        try {
            const db = await initDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_DRAFTS, 'readwrite');
                tx.objectStore(STORE_DRAFTS).delete(key);
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        } catch(e) { }
    }
};

/**
 * TestSessionStore: Full durable test session persistence in IndexedDB.
 * 
 * Stores complete test state: answers, marks, currentQ, questionTimes,
 * testData, startedAt. Survives tab close, refresh, browser restart.
 * 
 * localStorage only holds a lightweight signal:
 *   { activeTestId, lastUpdatedAt, resumeAvailable }
 */
export const TestSessionStore = {
    /**
     * Save complete test session to IDB + set localStorage signal.
     */
    async saveSession(testId, sessionData) {
        try {
            const db = await initDB();
            const payload = {
                ...sessionData,
                testId,
                lastSavedAt: Date.now()
            };
            await new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_SESSIONS, 'readwrite');
                tx.objectStore(STORE_SESSIONS).put(payload, `session_${testId}`);
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });

            // localStorage = recovery signal only
            try {
                localStorage.setItem('activeTest', JSON.stringify({
                    activeTestId: testId,
                    lastUpdatedAt: Date.now(),
                    resumeAvailable: true
                }));
            } catch (e) { /* localStorage quota exceeded — non-fatal */ }
        } catch (e) {
            console.error('[TestSessionStore] Save failed:', e);
        }
    },

    /**
     * Load complete test session from IDB.
     * Returns null if no session exists for this testId.
     */
    async loadSession(testId) {
        try {
            const db = await initDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_SESSIONS, 'readonly');
                const req = tx.objectStore(STORE_SESSIONS).get(`session_${testId}`);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => reject(req.error);
            });
        } catch (e) {
            console.error('[TestSessionStore] Load failed:', e);
            return null;
        }
    },

    /**
     * Check if any active test signal exists in localStorage.
     * Fast synchronous check for page load.
     */
    getActiveSignal() {
        try {
            const raw = localStorage.getItem('activeTest');
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    },

    /**
     * Clear test session from IDB + remove localStorage signal.
     */
    async clearSession(testId) {
        try {
            const db = await initDB();
            await new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_SESSIONS, 'readwrite');
                tx.objectStore(STORE_SESSIONS).delete(`session_${testId}`);
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        } catch (e) {
            console.error('[TestSessionStore] Clear IDB failed:', e);
        }
        try {
            localStorage.removeItem('activeTest');
        } catch (e) { /* non-fatal */ }
    }
};
