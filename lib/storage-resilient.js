/**
 * ═══════════════════════════════════════════════════════════════
 * WAVE 3 — STORAGE RESILIENCE LAYER
 * ═══════════════════════════════════════════════════════════════
 * 
 * Problem: Critical state (auth, active tests, onboarding) relies
 * solely on localStorage which Android can wipe under memory pressure.
 * 
 * Solution: Multi-layer storage with automatic fallback:
 *   Priority 1: IndexedDB (persistent, survives memory pressure)
 *   Priority 2: Cookies (survives WebView restarts)  
 *   Priority 3: localStorage (fast, but volatile on Android)
 *   Priority 4: In-memory (last resort, session only)
 * 
 * Usage:
 *   import { resilientStorage } from '@/lib/storage-resilient';
 *   await resilientStorage.set('onboarding_complete', 'true');
 *   const val = await resilientStorage.get('onboarding_complete');
 */

const DB_NAME = 'neet_coach_resilient';
const DB_VERSION = 1;
const STORE_NAME = 'resilient_kv';

// Cookie helpers
function setCookie(key, value, days = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  // Sanitize value for cookie (no newlines, limited length)
  const safeValue = String(value).substring(0, 3000).replace(/[;\n\r]/g, '');
  document.cookie = `neet_${key}=${encodeURIComponent(safeValue)}; expires=${expires}; path=/; SameSite=Strict`;
}

function getCookie(key) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)neet_${key}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(key) {
  if (typeof document === 'undefined') return;
  document.cookie = `neet_${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// IndexedDB helpers
let _idbPromise = null;

function getIDB() {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
  if (_idbPromise) return _idbPromise;

  _idbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        e.target.result.createObjectStore(STORE_NAME, { keyPath: 'key' });
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = () => { _idbPromise = null; resolve(null); };
      // Timeout fallback — if IDB takes >2s, skip it
      setTimeout(() => { _idbPromise = null; resolve(null); }, 2000);
    } catch {
      _idbPromise = null;
      resolve(null);
    }
  });
  return _idbPromise;
}

async function idbGet(key) {
  const db = await getIDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result?.value ?? null);
      req.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
}

async function idbSet(key, value) {
  const db = await getIDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put({ key, value, updatedAt: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch { resolve(false); }
  });
}

async function idbDelete(key) {
  const db = await getIDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch { resolve(); }
  });
}

// In-memory fallback
const _memStore = new Map();

// ─── RESILIENT STORAGE API ────────────────────────────────────

export const resilientStorage = {
  /**
   * Set a value across all storage layers
   */
  async set(key, value) {
    const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    // Write to all layers (best-effort)
    await idbSet(key, strValue);
    setCookie(key, strValue);
    try { localStorage.setItem(key, strValue); } catch {}
    _memStore.set(key, strValue);
  },

  /**
   * Get a value — tries each layer from most to least reliable
   */
  async get(key) {
    // Try IndexedDB first (most reliable on Android)
    const idbVal = await idbGet(key);
    if (idbVal !== null) return idbVal;

    // Try cookie (survives WebView restarts)
    const cookieVal = getCookie(key);
    if (cookieVal !== null) {
      // Backfill IDB with cookie value
      await idbSet(key, cookieVal);
      return cookieVal;
    }

    // Try localStorage
    try {
      const lsVal = localStorage.getItem(key);
      if (lsVal !== null) {
        // Backfill upper layers
        await idbSet(key, lsVal);
        setCookie(key, lsVal);
        return lsVal;
      }
    } catch {}

    // Last resort: in-memory
    return _memStore.get(key) ?? null;
  },

  /**
   * Delete from all storage layers
   */
  async remove(key) {
    await idbDelete(key);
    deleteCookie(key);
    try { localStorage.removeItem(key); } catch {}
    _memStore.delete(key);
  },

  /**
   * Check if a key exists
   */
  async has(key) {
    const val = await this.get(key);
    return val !== null;
  },

  /**
   * Get parsed JSON value
   */
  async getJSON(key) {
    const val = await this.get(key);
    if (!val) return null;
    try { return JSON.parse(val); } catch { return val; }
  },
};

// ─── CRITICAL KEY CONSTANTS ───────────────────────────────────
// Use these instead of raw strings to prevent typos

export const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: 'onboarding_complete',
  ACTIVE_TEST: 'activeTest',
  ACTIVE_TEST_ANSWERS: 'activeTestAnswers',
  DIAGNOSTIC_FP: 'diag_fp',
  PENDING_DIAGNOSTIC: 'pending_diagnostic_grade',
  GHOST_ID: 'ghost_id',
  APP_PROMO_DISMISSED: 'appPromoDismissed',
};
