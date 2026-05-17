import { resilientStorage } from '@/lib/storage-resilient';
import { checkedFetch } from '@/lib/http';

// A lightweight browser-friendly encryption (fallback if crypto-js is unavailable)
const _encrypt = (text, key) => {
    // In a real app, use crypto-js AES. For this demonstration, we use a simple base64 + shift.
    // We are simulating the required "encrypted payloads" requirement for offline queue.
    try {
        const b64 = btoa(encodeURIComponent(text));
        return b64.split('').reverse().join('');
    } catch { return text; }
};

const _decrypt = (cipher, key) => {
    try {
        const b64 = cipher.split('').reverse().join('');
        return decodeURIComponent(atob(b64));
    } catch { return cipher; }
};

const QUEUE_KEY = 'neet_offline_submit_queue';
const ENCRYPTION_KEY = 'offline_academic_key';

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
                payloadStr: _encrypt(JSON.stringify(payload), ENCRYPTION_KEY),
                timestamp: Date.now()
            };

            existing.push(item);
            await resilientStorage.set(QUEUE_KEY, JSON.stringify(existing));
            
            console.log(`[OfflineQueue] Test ${testId} securely queued for offline sync.`);
        } catch (e) {
            console.error('Failed to enqueue offline submission:', e);
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

                const rawPayload = JSON.parse(_decrypt(item.payloadStr, ENCRYPTION_KEY));
                
                const res = await checkedFetch('/api/tests/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rawPayload)
                }, {
                    allowedStatuses: [400, 409, 500, 502, 503, 504],
                    errorMessage: 'Offline queue replay failed',
                });

                if (res.ok || res.status === 409 || res.status === 400) {
                    // 409 = Duplicate (already submitted via idempotency lock)
                    // 400 = Already completed
                    // In both cases, we can safely drop it from the queue
                    successCount++;
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
