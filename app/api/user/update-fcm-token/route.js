import { safeUpdate, safeUpsert } from '@/lib/core/db-safe';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/core/auth';

const MAX_TOKEN_LENGTH = 4096;
const MAX_META_LENGTH = 160;
const VALID_PLATFORMS = new Set(['android', 'ios', 'web', 'unknown']);
const VALID_PERMISSIONS = new Set(['granted', 'denied', 'prompt', 'unknown']);

export async function POST(request) {
    try {
        // Verify the user is authenticated
        const user = await getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let _body;

        try { _body = await request.json(); } catch (parseErr) {

            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

        }

        const body = _body;
        const { token, timezone } = body;

        if (!token || typeof token !== 'string' || token.length > MAX_TOKEN_LENGTH) {
            return NextResponse.json({ error: 'Invalid FCM token' }, { status: 400 });
        }

        const validTimezone = sanitizeString(timezone, 80) || 'Asia/Kolkata';
        const deviceId = sanitizeString(body.deviceId || request.headers.get('x-device-id'), MAX_META_LENGTH) || `legacy-${user.id}`;
        const platform = VALID_PLATFORMS.has(body.platform) ? body.platform : 'android';
        const permission = VALID_PERMISSIONS.has(body.permission) ? body.permission : 'granted';
        const now = new Date().toISOString();

        await safeUpdate('user_devices', { fcm_token: token }, {
            is_active: false,
            fcm_token_invalidated_at: now,
            updated_at: now,
        }, {
            route: '/api/user/update-fcm-token',
            userId: user.id,
        });

        await safeUpsert('user_devices', {
            user_id: user.id,
            device_id: deviceId,
            platform,
            app_version: sanitizeString(body.appVersion, MAX_META_LENGTH),
            fcm_token: token,
            push_permission: permission,
            timezone: validTimezone,
            webview_version: sanitizeString(body.webviewVersion, MAX_META_LENGTH),
            android_version: sanitizeString(body.androidVersion, MAX_META_LENGTH),
            last_seen_at: now,
            fcm_token_updated_at: now,
            fcm_token_invalidated_at: null,
            notification_failure_count: 0,
            is_active: true,
            updated_at: now,
        }, {
            onConflict: 'user_id,device_id',
        }, {
            route: '/api/user/update-fcm-token',
            userId: user.id,
        });

        // Keep the legacy column as a denormalized latest-token cache for older code paths.
        await safeUpdate('users', { id: user.id }, {
            fcm_token: token,
            fcm_token_updated_at: now,
            fcm_token_invalidated_at: null,
            notification_failure_count: 0,
            timezone: validTimezone
        }, {
            route: '/api/user/update-fcm-token',
            userId: user.id,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('FCM token update error:', error);
        return NextResponse.json({ error: 'Could not update your settings. Please try again.' }, { status: 500 });
    }
}

function sanitizeString(value, maxLength) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed.slice(0, maxLength);
}
