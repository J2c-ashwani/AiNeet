import crypto from 'crypto';
import { checkedFetch } from '../http';

// No database writes live here; subscription state mutations are handled by API/webhook routes through db-safe.

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';

let accessTokenCache = null;
let jwksCache = null;

function base64Url(input) {
    return Buffer.from(input).toString('base64url');
}

function parseJsonEnv(name) {
    const raw = process.env[name];
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (error) {
        throw new Error(`${name} must be valid JSON`);
    }
}

function getServiceAccount() {
    return parseJsonEnv('GOOGLE_PLAY_SERVICE_ACCOUNT');
}

function isProduction() {
    return process.env.NODE_ENV === 'production';
}

function localMockAllowed() {
    return !isProduction() && process.env.GOOGLE_PLAY_ALLOW_MOCK === 'true';
}

async function getGoogleAccessToken() {
    if (accessTokenCache && accessTokenCache.expiresAt > Date.now() + 60000) {
        return accessTokenCache.token;
    }

    const serviceAccount = getServiceAccount();
    if (!serviceAccount?.client_email || !serviceAccount?.private_key) {
        throw new Error('Google Play service account is not configured');
    }

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claim = {
        iss: serviceAccount.client_email,
        scope: 'https://www.googleapis.com/auth/androidpublisher',
        aud: serviceAccount.token_uri || GOOGLE_TOKEN_URL,
        exp: now + 3600,
        iat: now,
    };

    const unsignedJwt = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claim))}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(unsignedJwt);
    signer.end();
    const signature = signer.sign(serviceAccount.private_key).toString('base64url');

    const response = await checkedFetch(serviceAccount.token_uri || GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: `${unsignedJwt}.${signature}`,
        }),
    }, {
        allowedStatuses: [400, 401, 403],
        errorMessage: 'Google OAuth token request failed',
    });

    const payload = await response.json();
    if (!response.ok) {
        throw new Error(payload.error_description || payload.error || 'Failed to authenticate Google Play service account');
    }

    accessTokenCache = {
        token: payload.access_token,
        expiresAt: Date.now() + ((payload.expires_in || 3600) * 1000),
    };

    return accessTokenCache.token;
}

function normalizeSubscriptionState(state) {
    if (state === 'SUBSCRIPTION_STATE_ACTIVE') return 'active';
    if (state === 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD') return 'grace';
    if (state === 'SUBSCRIPTION_STATE_CANCELED') return 'canceled';
    if (state === 'SUBSCRIPTION_STATE_EXPIRED') return 'expired';
    if (state === 'SUBSCRIPTION_STATE_ON_HOLD') return 'grace';
    return 'pending';
}

export async function verifyGooglePlaySubscription({ purchaseToken, productId }) {
    if (localMockAllowed()) {
        return {
            isValid: true,
            source: 'local_mock',
            productId,
            expiryTimeMillis: Date.now() + 30 * 24 * 60 * 60 * 1000,
            subscriptionState: 'active',
            raw: { mock: true },
        };
    }

    const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME;
    if (!packageName) {
        throw new Error('GOOGLE_PLAY_PACKAGE_NAME is required for Play verification');
    }

    const accessToken = await getGoogleAccessToken();
    const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`;
    const response = await checkedFetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    }, {
        allowedStatuses: [400, 401, 403, 404, 409, 410, 422],
        errorMessage: 'Google Play subscription verification failed',
    });

    const payload = await response.json();
    if (!response.ok) {
        return {
            isValid: false,
            source: 'google_play',
            reason: payload.error?.message || 'Google Play rejected purchase token',
            raw: payload,
        };
    }

    const matchingLineItem = (payload.lineItems || []).find(item => item.productId === productId) || payload.lineItems?.[0];
    const expiryTimeMillis = matchingLineItem?.expiryTime ? Date.parse(matchingLineItem.expiryTime) : 0;
    const state = normalizeSubscriptionState(payload.subscriptionState);
    const isValid = Boolean(matchingLineItem)
        && matchingLineItem.productId === productId
        && ['active', 'grace', 'canceled'].includes(state)
        && expiryTimeMillis > Date.now();

    return {
        isValid,
        source: 'google_play',
        productId: matchingLineItem?.productId || productId,
        expiryTimeMillis,
        subscriptionState: state,
        raw: payload,
    };
}

async function getGoogleJwks() {
    if (jwksCache && jwksCache.expiresAt > Date.now()) {
        return jwksCache.keys;
    }

    const response = await checkedFetch(GOOGLE_JWKS_URL, {}, {
        errorMessage: 'Google JWKS fetch failed',
    });
    const payload = await response.json();
    if (!response.ok || !Array.isArray(payload.keys)) {
        throw new Error('Unable to fetch Google JWKS');
    }

    jwksCache = {
        keys: payload.keys,
        expiresAt: Date.now() + 60 * 60 * 1000,
    };

    return jwksCache.keys;
}

function parseJwt(token) {
    const [headerRaw, payloadRaw, signatureRaw] = token.split('.');
    if (!headerRaw || !payloadRaw || !signatureRaw) {
        throw new Error('Malformed JWT');
    }

    return {
        header: JSON.parse(Buffer.from(headerRaw, 'base64url').toString('utf8')),
        payload: JSON.parse(Buffer.from(payloadRaw, 'base64url').toString('utf8')),
        signingInput: `${headerRaw}.${payloadRaw}`,
        signature: signatureRaw,
    };
}

export async function verifyGooglePubSubRequest(request) {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

    if (!token) {
        if (localMockAllowed()) return { verified: true, source: 'local_mock' };
        throw new Error('Missing Google Pub/Sub OIDC token');
    }

    const { header, payload, signingInput, signature } = parseJwt(token);
    if (header.alg !== 'RS256') {
        throw new Error('Unsupported Google Pub/Sub JWT algorithm');
    }

    const jwks = await getGoogleJwks();
    const jwk = jwks.find(key => key.kid === header.kid);
    if (!jwk) {
        throw new Error('Unknown Google Pub/Sub JWT key id');
    }

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(signingInput);
    verifier.end();
    const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
    const validSignature = verifier.verify(publicKey, Buffer.from(signature, 'base64url'));
    if (!validSignature) {
        throw new Error('Invalid Google Pub/Sub JWT signature');
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) throw new Error('Expired Google Pub/Sub JWT');
    if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) {
        throw new Error('Invalid Google Pub/Sub JWT issuer');
    }

    const expectedAudience = process.env.GOOGLE_PLAY_RTDN_AUDIENCE || request.url;
    if (payload.aud !== expectedAudience) {
        throw new Error('Invalid Google Pub/Sub JWT audience');
    }

    const expectedEmail = process.env.GOOGLE_PLAY_PUBSUB_SERVICE_ACCOUNT_EMAIL;
    if (expectedEmail && payload.email !== expectedEmail) {
        throw new Error('Invalid Google Pub/Sub service account');
    }

    return { verified: true, source: 'google_pubsub_oidc', claims: payload };
}
