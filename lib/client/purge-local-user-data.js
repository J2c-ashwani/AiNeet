'use client';

const APP_DATABASES = [
    'neet_coach_resilient',
    'neet_coach_offline_db',
    'neet_offline_crypto_v1',
    'neet_telemetry_v1',
    'neet_snapshots_v2',
];

function deleteDatabase(name) {
    return new Promise(resolve => {
        try {
            const request = indexedDB.deleteDatabase(name);
            request.onsuccess = () => resolve({ name, deleted: true });
            request.onerror = () => resolve({ name, deleted: false, reason: 'delete_error' });
            request.onblocked = () => resolve({ name, deleted: false, reason: 'delete_blocked' });
        } catch (error) {
            resolve({ name, deleted: false, reason: error.message || 'delete_exception' });
        }
    });
}

export async function purgeLocalUserData() {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.clear();
    } catch (error) {
        console.warn('[AccountDeletion] Local storage cleanup failed:', error.message);
    }

    try {
        window.sessionStorage.clear();
    } catch (error) {
        console.warn('[AccountDeletion] Session storage cleanup failed:', error.message);
    }

    if (typeof document !== 'undefined') {
        document.cookie.split(';').forEach(rawCookie => {
            const name = rawCookie.split('=')[0]?.trim();
            if (name?.startsWith('neet_')) {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict`;
            }
        });
    }

    if (typeof indexedDB !== 'undefined') {
        const results = [];
        for (const databaseName of APP_DATABASES) {
            results.push(await deleteDatabase(databaseName));
        }
        const failures = results.filter(result => !result.deleted);
        if (failures.length > 0) {
            console.warn('[AccountDeletion] Some local databases remain queued for deletion:', failures);
        }
    }
}
