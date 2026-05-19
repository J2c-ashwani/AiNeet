import { NextResponse } from 'next/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { checkedFetch } from '@/lib/http';

const PROTECTED_ROUTES = [
    '/api/tests/submit',
    '/api/tests/result',
    '/api/xp/update',
    '/api/battleground',
    '/api/battle',
    '/api/omr',
    '/api/user/update-fcm-token',
    '/api/subscription/create',
    '/api/subscription/verify',
    '/api/rankings/update',
    '/api/leaderboard/mutate',
];

const APP_CHECK_PUBLIC_KEY_URL =
    'https://firebaseappcheck.googleapis.com/v1/jwks';

let cachedJwks = null;
let cachedJwksExpiry = 0;

function getEnforcementMode() {
    const configured = (process.env.APP_CHECK_ENFORCEMENT || '').toLowerCase();
    if (['off', 'native', 'strict'].includes(configured)) return configured;
    return process.env.NODE_ENV === 'production' ? 'native' : 'off';
}

function isNativeRequest(request) {
    const ua = request.headers.get('user-agent') || '';
    return ua.includes('NEETCoachApp')
        || request.headers.get('x-neet-native-app') === '1'
        || request.headers.get('x-neet-app') === 'native';
}

function protectedRouteApplies(request) {
    const pathname = request.nextUrl?.pathname || request.url;
    return PROTECTED_ROUTES.some(r => pathname.startsWith(r));
}

async function getFirebaseJwks() {
    if (cachedJwks && cachedJwksExpiry > Date.now()) return cachedJwks;

    const response = await checkedFetch(APP_CHECK_PUBLIC_KEY_URL, {}, {
        timeoutMs: 5_000,
        errorMessage: 'Firebase App Check JWKS fetch failed',
    });
    const payload = await response.json();
    cachedJwks = payload.keys || [];

    const cacheControl = response.headers.get('cache-control') || '';
    const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1] || 3600);
    cachedJwksExpiry = Date.now() + Math.max(60, maxAge) * 1000;
    return cachedJwks;
}

async function verifyTokenSignature(appCheckToken) {
    const decodedHeader = jwt.decode(appCheckToken, { complete: true })?.header;
    if (!decodedHeader?.kid) throw new Error('APP_CHECK_MALFORMED');

    const keys = await getFirebaseJwks();
    const jwk = keys.find(key => key.kid === decodedHeader.kid);
    if (!jwk) throw new Error('APP_CHECK_UNKNOWN_KEY');

    const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
    const claims = jwt.verify(appCheckToken, publicKey, {
        algorithms: ['RS256'],
        clockTolerance: 60,
    });

    const expectedAppId = process.env.FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
    if (expectedAppId) {
        const tokenAppId = claims.sub || claims.app_id || claims.aud;
        if (Array.isArray(tokenAppId)) {
            if (!tokenAppId.includes(expectedAppId)) throw new Error('APP_CHECK_APP_MISMATCH');
        } else if (tokenAppId && tokenAppId !== expectedAppId && !String(tokenAppId).includes(expectedAppId)) {
            throw new Error('APP_CHECK_APP_MISMATCH');
        }
    }

    return claims;
}

export async function verifyAppCheck(request, options = {}) {
    if (!options.required && !protectedRouteApplies(request)) return null;

    const mode = options.mode || getEnforcementMode();
    if (mode === 'off') return null;
    if (mode === 'native' && !isNativeRequest(request) && !options.required) return null;

    const appCheckToken = request.headers.get('X-Firebase-AppCheck');

    if (!appCheckToken) {
        return NextResponse.json(
            { error: 'App Check token required', code: 'APP_CHECK_MISSING' },
            { status: 401 }
        );
    }

    try {
        await verifyTokenSignature(appCheckToken);
        return null;
    } catch (error) {
        console.warn('[AppCheck] Verification failed:', error.message);
        return NextResponse.json(
            { error: 'Invalid App Check token', code: 'APP_CHECK_INVALID' },
            { status: 403 }
        );
    }
}

export async function requireAppCheck(request, options = {}) {
    return verifyAppCheck(request, { required: true, ...options });
}
