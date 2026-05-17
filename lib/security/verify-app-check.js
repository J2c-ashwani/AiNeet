// lib/security/verify-app-check.js
// Next.js middleware to validate Firebase App Check tokens on integrity endpoints.
// Rejects requests without a valid token on protected routes.

import { NextResponse } from 'next/server';
import { checkedFetch } from '@/lib/http';

// Endpoints that require App Check validation
const PROTECTED_ROUTES = [
    '/api/tests/submit',
    '/api/xp/update',
    '/api/battleground',
    '/api/rankings/update',
    '/api/leaderboard/mutate',
];

const APP_CHECK_PUBLIC_KEY_URL =
    'https://firebaseappcheck.googleapis.com/v1/jwks';

export async function verifyAppCheck(request) {
    const pathname = request.nextUrl?.pathname || request.url;

    // Only enforce on protected routes
    const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
    if (!isProtected) return null; // Not a protected route — continue

    // Skip in development
    if (process.env.NODE_ENV === 'development') return null;

    const appCheckToken = request.headers.get('X-Firebase-AppCheck');

    if (!appCheckToken) {
        return NextResponse.json(
            { error: 'App Check token required', code: 'APP_CHECK_MISSING' },
            { status: 401 }
        );
    }

    try {
        // Verify the token against Firebase App Check endpoint
        const verifyRes = await checkedFetch(
            `https://firebaseappcheck.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/apps/${process.env.FIREBASE_APP_ID}:verifyToken`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: appCheckToken }),
            },
            {
                allowedStatuses: [400, 401, 403],
                errorMessage: 'Firebase App Check verification failed',
            }
        );

        if (!verifyRes.ok) {
            return NextResponse.json(
                { error: 'Invalid App Check token', code: 'APP_CHECK_INVALID' },
                { status: 403 }
            );
        }

        return null; // Token valid — continue to handler
    } catch {
        // Network failure verifying App Check — fail open with logging
        // In production, consider fail-closed here
        console.warn('[AppCheck] Verification service unavailable — failing open');
        return null;
    }
}
