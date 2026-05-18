'use client';

/**
 * lib/platform.js — Unified Mobile Runtime Platform Layer
 *
 * This is the ONLY file that may access window.NEETCoachNativeBridge,
 * navigator.share, navigator.clipboard, or window.open directly.
 * All page components and hooks must use this API.
 *
 * See docs/native-bridge-contract.md for the full specification.
 */

// ---------------------------------------------------------------------------
// 1. Environment Detection
// ---------------------------------------------------------------------------

export function isInsideNativeApp() {
    if (typeof window === 'undefined') return false;
    const userAgent = getBrowserUserAgent();
    return Boolean(
        window.NEETCoachNativeBridge ||
        window.ReactNativeWebView ||
        window.nativeApp ||
        userAgent.includes('NEETCoachApp') ||
        document.cookie.includes('native_app=true')
    );
}

export function getBrowserUserAgent() {
    if (typeof navigator === 'undefined') return '';
    return navigator['userAgent'] || '';
}

export function isMobileLikeBrowser() {
    return /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(getBrowserUserAgent());
}

/**
 * Checks if the native shell supports a given capability.
 * Safe to call even if the bridge is absent — returns false.
 * This is the APK version-mismatch guard.
 */
export function supportsCapability(cap) {
    if (!isInsideNativeApp()) return false;
    return !!(window.NEETCoachNativeCapabilities?.[cap]);
}

// ---------------------------------------------------------------------------
// 2. Intent Lifecycle State
// ---------------------------------------------------------------------------

const pendingIntents = new Map();
const intentQueue = [];
let appInBackground = false;

if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && appInBackground) {
            appInBackground = false;
            // Replay queued intents on app resume (Redmi battery saver / incoming call recovery)
            const queued = [...intentQueue];
            intentQueue.length = 0;
            queued.forEach(([type, payload]) => postNativeIntent(type, payload).catch(() => {}));
        } else if (document.visibilityState === 'hidden') {
            appInBackground = true;
        }
    });

    // Register global ACK handler — called by Flutter
    window.NEET_NATIVE_ACK = (json) => {
        try {
            const { id, status, reason, payload } = typeof json === 'string' ? JSON.parse(json) : json;
            const pending = pendingIntents.get(id);
            if (!pending) return;
            clearTimeout(pending.timer);
            pendingIntents.delete(id);
            if (status === 'ok') {
                pending.resolve(payload);
            } else {
                pending.reject(new Error(`NATIVE_ERROR: ${reason}`));
            }
        } catch (e) {
            console.error('[Bridge] Failed to parse ACK:', e);
        }
    };
}

// ---------------------------------------------------------------------------
// 3. Bridge Payload Validation
// ---------------------------------------------------------------------------

const SCHEMAS = {
    SHARE:             { required: ['title', 'text'] },
    COPY:              { required: ['text'] },
    OPEN_URL:          { required: ['url'] },
    HAPTIC:            { required: [] },
    REGISTER_FCM:      { required: [] },
    RESTORE_PURCHASES: { required: [] },
    SHOW_INTERSTITIAL: { required: [] },
    SHOW_REWARDED:     { required: [] },
    CAPTURE_IMAGE:     { required: [] },
};

function validatePayload(type, payload) {
    const schema = SCHEMAS[type];
    if (!schema) throw new Error(`[Bridge] Unknown intent type: ${type}`);
    for (const field of schema.required) {
        if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
            throw new Error(`[Bridge] Intent "${type}" missing required field: "${field}"`);
        }
    }
}

// ---------------------------------------------------------------------------
// 4. Core Intent Dispatcher
// ---------------------------------------------------------------------------

/**
 * Dispatches a structured intent to Flutter with ACK/timeout protocol.
 * See docs/native-bridge-contract.md for payload schemas.
 *
 * @param {string} type - Intent type (SHARE, COPY, OPEN_URL)
 * @param {object} payload - Type-specific payload
 * @param {number} timeoutMs - ACK timeout in ms (default 3000)
 * @returns {Promise<void>}
 */
export function postNativeIntent(type, payload, timeoutMs = 3000) {
    return new Promise((resolve, reject) => {
        // Validate payload against contract schema
        try {
            validatePayload(type, payload);
        } catch (validationError) {
            _logTelemetry('schema_violation', { failure_reason: validationError.message });
            return reject(validationError);
        }

        // Queue if app is in background (battery saver / incoming call)
        if (appInBackground) {
            intentQueue.push([type, payload]);
            return resolve(); // Optimistic — will replay on resume
        }

        if (!window.NEETCoachNativeBridge) {
            return reject(new Error('BRIDGE_UNAVAILABLE'));
        }

        const id = crypto.randomUUID();

        const timer = setTimeout(() => {
            pendingIntents.delete(id);
            _logTelemetry('bridge_timeout', { failure_reason: `BRIDGE_TIMEOUT:${type}` });
            reject(new Error(`BRIDGE_TIMEOUT:${type}`));
        }, timeoutMs);

        pendingIntents.set(id, { resolve, reject, timer });

        window.NEETCoachNativeBridge.postMessage(
            JSON.stringify({ id, type, payload })
        );
    });
}

/**
 * Safe intent dispatch: queues during background, dispatches immediately otherwise.
 */
export function safePostIntent(type, payload) {
    if (appInBackground) {
        intentQueue.push([type, payload]);
        return Promise.resolve();
    }
    return postNativeIntent(type, payload);
}

export function openExternalUrl(url) {
    if (supportsCapability('externalIntent')) {
        return safePostIntent('OPEN_URL', { url }).catch(() => {
            if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
        });
    }

    if (typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
    return Promise.resolve();
}

export function triggerHaptic(style = 'light') {
    if (supportsCapability('haptic')) {
        return safePostIntent('HAPTIC', { style }).catch(() => legacyVibrate(style));
    }
    legacyVibrate(style);
    return Promise.resolve();
}

export function restoreNativePurchases() {
    if (supportsCapability('purchaseRestore')) {
        return safePostIntent('RESTORE_PURCHASES', {});
    }
    if (typeof window !== 'undefined' && window.NeetCoachAds?.restorePurchases) {
        window.NeetCoachAds.restorePurchases();
        return Promise.resolve({ status: 'legacy' });
    }
    return Promise.reject(new Error('PURCHASE_RESTORE_UNAVAILABLE'));
}

export function showNativeInterstitial(placement = 'default') {
    if (supportsCapability('adsInterstitial')) {
        return safePostIntent('SHOW_INTERSTITIAL', { placement });
    }
    if (typeof window !== 'undefined' && typeof window.showInterstitialAd === 'function') {
        window.showInterstitialAd();
        return Promise.resolve({ status: 'legacy' });
    }
    return Promise.resolve({ status: 'unavailable' });
}

export function showNativeRewardedAd(placement = 'default') {
    if (supportsCapability('adsRewarded')) {
        return safePostIntent('SHOW_REWARDED', { placement });
    }
    if (typeof window !== 'undefined' && typeof window.showRewardedAd === 'function') {
        window.showRewardedAd();
        return Promise.resolve({ status: 'legacy' });
    }
    return Promise.resolve({ status: 'unavailable' });
}

export function requestNativeFcmRegistration() {
    if (supportsCapability('fcmRegistration')) {
        return safePostIntent('REGISTER_FCM', {});
    }
    return Promise.reject(new Error('FCM_REGISTRATION_UNAVAILABLE'));
}

export function requestNativeImageCapture(payload = {}) {
    if (supportsCapability('cameraCapture')) {
        return safePostIntent('CAPTURE_IMAGE', payload);
    }
    return Promise.reject(new Error('CAMERA_CAPTURE_UNAVAILABLE'));
}

function legacyVibrate(style) {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;
    const duration = style === 'heavy' ? 45 : style === 'medium' ? 30 : 18;
    navigator.vibrate(duration);
}

// ---------------------------------------------------------------------------
// 5. Bridge Initialization
// ---------------------------------------------------------------------------

export function initBridge() {
    // Called during boot orchestration to verify bridge health
    return new Promise((resolve) => {
        if (!isInsideNativeApp()) return resolve({ status: 'browser' });
        // Give Flutter 500ms to inject capabilities after bridge init
        setTimeout(() => {
            const caps = window.NEETCoachNativeCapabilities;
            resolve({ status: 'native', capabilities: caps || {}, version: caps?.version || 0 });
        }, 500);
    });
}

export function negotiateCapabilities() {
    // Called after initBridge — logs capability version for telemetry
    const caps = window.NEETCoachNativeCapabilities;
    if (caps) {
        _logTelemetry('bridge_capabilities_negotiated', { device_info: caps });
    }
    return Promise.resolve();
}

// ---------------------------------------------------------------------------
// 6. Internal Telemetry (lazy import to avoid circular deps)
// ---------------------------------------------------------------------------

function _logTelemetry(event_type, extra = {}) {
    if (typeof window === 'undefined') return;
    import('./telemetry/mobile-buffer').then(m => {
        m.bufferEvent({ event_type, route: window.location?.pathname, ...extra });
    }).catch(() => {});
}
