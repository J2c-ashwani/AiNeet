import crypto from 'crypto';
import { checkedFetch } from './http';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const FCM_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';

let accessTokenCache = null;

function base64Url(input) {
    return Buffer.from(input).toString('base64url');
}

function getServiceAccount() {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY must be valid service-account JSON');
    }
}

async function getAccessToken(serviceAccount) {
    if (accessTokenCache && accessTokenCache.expiresAt > Date.now() + 60000) {
        return accessTokenCache.token;
    }

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claim = {
        iss: serviceAccount.client_email,
        scope: FCM_SCOPE,
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
        errorMessage: 'Firebase OAuth token request failed',
    });

    const payload = await response.json();
    if (!response.ok) {
        throw new Error(payload.error_description || payload.error || 'Failed to authenticate Firebase service account');
    }

    accessTokenCache = {
        token: payload.access_token,
        expiresAt: Date.now() + ((payload.expires_in || 3600) * 1000),
    };

    return accessTokenCache.token;
}

function normalizeAndroidConfig(android = {}) {
    if (!android.notification) return android;
    const notification = { ...android.notification };
    if (notification.channelId) {
        notification.channel_id = notification.channelId;
        delete notification.channelId;
    }
    return { ...android, notification };
}

function normalizeData(data = {}) {
    return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value == null ? '' : String(value)])
    );
}

function toFirebaseError(payload) {
    const status = payload?.error?.status;
    const message = payload?.error?.message || 'Firebase Cloud Messaging request failed';
    const error = new Error(message);

    if (status === 'NOT_FOUND' || message.includes('UNREGISTERED')) {
        error.code = 'messaging/registration-token-not-registered';
    } else if (status === 'INVALID_ARGUMENT') {
        error.code = 'messaging/invalid-registration-token';
    } else {
        error.code = `messaging/${String(status || 'unknown').toLowerCase()}`;
    }

    error.providerResponse = payload;
    return error;
}

export function getMessaging() {
    const serviceAccount = getServiceAccount();
    if (!serviceAccount?.project_id || !serviceAccount?.client_email || !serviceAccount?.private_key) {
        return null;
    }

    return {
        async send(message) {
            const accessToken = await getAccessToken(serviceAccount);
            const response = await checkedFetch(
                `https://fcm.googleapis.com/v1/projects/${encodeURIComponent(serviceAccount.project_id)}/messages:send`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: {
                            token: message.token,
                            notification: message.notification,
                            data: normalizeData(message.data),
                            android: normalizeAndroidConfig(message.android),
                        },
                    }),
                },
                {
                    allowedStatuses: [400, 401, 403, 404],
                    errorMessage: 'Firebase Cloud Messaging request failed',
                }
            );

            const payload = await response.json();
            if (!response.ok) {
                throw toFirebaseError(payload);
            }

            return payload.name;
        },
    };
}

export function isFirebaseConfigured() {
    const serviceAccount = getServiceAccount();
    return Boolean(serviceAccount?.project_id && serviceAccount?.client_email && serviceAccount?.private_key);
}
