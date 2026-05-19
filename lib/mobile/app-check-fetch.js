'use client';

const PROTECTED_MUTATION_PREFIXES = [
    '/api/tests/submit',
    '/api/battleground',
    '/api/battle',
    '/api/omr',
    '/api/user/update-fcm-token',
    '/api/subscription/create',
    '/api/subscription/verify',
];

let installed = false;

function isProtectedMutation(input, init = {}) {
    const method = String(init.method || 'GET').toUpperCase();
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return false;

    const url = typeof input === 'string' ? input : input?.url || '';
    if (!url) return false;

    let pathname = url;
    try {
        pathname = new URL(url, window.location.origin).pathname;
    } catch {
        // Relative paths are already fine.
    }

    return PROTECTED_MUTATION_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

async function getNativeAppCheckToken() {
    if (typeof window === 'undefined') return null;
    if (typeof window.getNEETAppCheckToken !== 'function') return null;

    const token = await window.getNEETAppCheckToken();
    return typeof token === 'string' && token.trim() ? token.trim() : null;
}

export function installNativeAppCheckFetch() {
    if (typeof window === 'undefined') return;
    if (installed) return;
    if (typeof window.fetch !== 'function') return;

    const nativeFetch = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => {
        if (!isProtectedMutation(input, init)) {
            return nativeFetch(input, init);
        }

        const token = await getNativeAppCheckToken();
        if (!token) return nativeFetch(input, init);

        const headers = new Headers(init.headers || {});
        headers.set('X-Firebase-AppCheck', token);
        headers.set('x-neet-native-app', '1');

        return nativeFetch(input, {
            ...init,
            headers,
        });
    };
    installed = true;
}
