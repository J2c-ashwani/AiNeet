import { resilientStorage } from '@/lib/storage-resilient';
import { checkedFetch } from '@/lib/http';

const QUEUE_KEY = 'neet_offline_submit_queue';
const CRYPTO_DB_NAME = 'neet_offline_crypto_v1';
const CRYPTO_STORE = 'keys';
const CRYPTO_KEY_ID = 'academic_payload_key';

function bytesToBase64(bytes) {
    let binary = '';
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    arr.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
}

function base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function legacyDecrypt(cipher) {
    try {
        const b64 = cipher.split('').reverse().join('');
        return decodeURIComponent(atob(b64));
    } catch {
        return cipher;
    }
}

function openCryptoDb() {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') return resolve(null);
        const req = indexedDB.open(CRYPTO_DB_NAME, 1);
        req.onupgradeneeded = (e) => {
            e.target.result.createObjectStore(CRYPTO_STORE, { keyPath: 'id' });
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = () => reject(req.error);
    });
}

async function loadStoredKey() {
    const db = await openCryptoDb();
    if (!db) return null;
    return new Promise((resolve) => {
        const req = db.transaction(CRYPTO_STORE, 'readonly')
            .objectStore(CRYPTO_STORE)
            .get(CRYPTO_KEY_ID);
        req.onsuccess = () => resolve(req.result?.key || null);
        req.onerror = () => resolve(null);
    });
}

async function storeKey(key) {
    const db = await openCryptoDb();
    if (!db) return false;
    return new Promise((resolve) => {
        const tx = db.transaction(CRYPTO_STORE, 'readwrite');
        tx.objectStore(CRYPTO_STORE).put({ id: CRYPTO_KEY_ID, key, createdAt: Date.now() });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
    });
}

async function getCryptoKey() {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
        throw new Error('Offline encryption is unavailable on this WebView.');
    }

    const stored = await loadStoredKey();
    if (stored) return stored;

    const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );

    const storedOk = await storeKey(key);
    if (!storedOk) {
        throw new Error('Offline encryption key could not be stored.');
    }
    return key;
}

async function encryptPayload(payload) {
    const key = await getCryptoKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(payload));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

    return {
        v: 2,
        alg: 'AES-GCM',
        iv: bytesToBase64(iv),
        ciphertext: bytesToBase64(ciphertext),
    };
}

async function decryptPayload(item) {
    if (item.payloadCipher?.v === 2) {
        const key = await getCryptoKey();
        const iv = base64ToBytes(item.payloadCipher.iv);
        const ciphertext = base64ToBytes(item.payloadCipher.ciphertext);
        const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
        return JSON.parse(new TextDecoder().decode(plain));
    }

    if (item.payloadStr) {
        return JSON.parse(legacyDecrypt(item.payloadStr));
    }

    throw new Error('Offline queue payload is unreadable.');
}

export const OfflineQueue = {
    /**
     * Pushes a failed test submission to the encrypted offline queue.
     */
    enqueue: async (testId, payload) => {
        if (typeof window === 'undefined') return;

        try {
            const queueStr = await resilientStorage.get(QUEUE_KEY);
            const existing = JSON.parse(queueStr || '[]');
            
            // Check if test already in queue to prevent duplicates
            if (existing.some(item => item.testId === testId)) return;

            const item = {
                id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
                testId,
                payloadCipher: await encryptPayload(payload),
                timestamp: Date.now()
            };

            existing.push(item);
            await resilientStorage.set(QUEUE_KEY, JSON.stringify(existing));
            
            console.log(`[OfflineQueue] Test ${testId} securely queued for offline sync.`);
            return true;
        } catch (e) {
            console.error('Failed to enqueue offline submission:', e);
            return false;
        }
    },

    /**
     * Attempts to sync all queued items.
     * Returns the number of successful syncs.
     */
    sync: async () => {
        if (typeof window === 'undefined') return 0;
        if (!navigator.onLine) return 0;

        let existing = [];
        try {
            const queueStr = await resilientStorage.get(QUEUE_KEY);
            existing = JSON.parse(queueStr || '[]');
        } catch (e) { return 0; }

        if (existing.length === 0) return 0;

        let successCount = 0;
        const failedItems = [];

        for (const item of existing) {
            try {
                // Check expiration (48 hours max)
                if (Date.now() - item.timestamp > 48 * 3600 * 1000) {
                    console.warn(`[OfflineQueue] Dropping expired item ${item.id}`);
                    continue;
                }

                const rawPayload = await decryptPayload(item);
                
                const res = await checkedFetch('/api/tests/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rawPayload)
                }, {
                    allowedStatuses: [400, 409, 500, 502, 503, 504],
                    errorMessage: 'Offline queue replay failed',
                });

                const responsePayload = await res.clone().json().catch(() => null);
                const alreadySubmitted = responsePayload?.code === 'TEST_ALREADY_SUBMITTED'
                    || responsePayload?.error === 'Test already submitted'
                    || responsePayload?.error === 'Duplicate submission blocked.';

                if (res.ok || ((res.status === 409 || res.status === 400) && alreadySubmitted)) {
                    // Only idempotent "already submitted" responses are safe to drop.
                    // Other 400s remain queued for investigation instead of silently losing work.
                    successCount++;
                    window.dispatchEvent(new CustomEvent('neet:offline_queue_synced', {
                        detail: { testId: item.testId, status: res.status }
                    }));
                } else {
                    // 500 etc -> keep in queue
                    failedItems.push(item);
                }
            } catch (e) {
                console.error(`[OfflineQueue] Sync failed for ${item.id}:`, e);
                failedItems.push(item);
            }
        }

        // Update queue
        await resilientStorage.set(QUEUE_KEY, JSON.stringify(failedItems));
        
        if (successCount > 0) {
            console.log(`[OfflineQueue] Successfully synced ${successCount} items.`);
        }
        
        return successCount;
    }
};

// Global listener for online event to trigger sync
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.log('[OfflineQueue] Network restored. Attempting sync...');
        OfflineQueue.sync();
    });
}
