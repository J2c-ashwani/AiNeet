import { NextResponse } from 'next/server';
import { safeUpdate } from '@/lib/core/db-safe';
import { getUserFromRequest } from '@/lib/core/auth';
import { sanitizeString, validateId } from '@/lib/validate';

export async function POST(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let _body;

        try { _body = await request.json(); } catch (parseErr) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const body = _body;
        const { notification_id, route, device_info } = body;

        if (!validateId(notification_id)) {
            return NextResponse.json({ error: 'Missing notification ID' }, { status: 400 });
        }

        const redirectRoute = typeof route === 'string' && route.startsWith('/') && !route.startsWith('//')
            ? sanitizeString(route, 256)
            : '/dashboard';

        const updates = {
            click_opened_at: new Date().toISOString(),
            delivery_status: 'opened'
        };

        if (device_info && typeof device_info === 'object' && !Array.isArray(device_info)) {
            updates.device_info = device_info;
        }

        await safeUpdate('notifications_log', { id: notification_id, user_id: user.id }, updates, {
            route: '/api/notifications/click',
            userId: user.id,
        });

        return NextResponse.json({ success: true, redirect_route: redirectRoute });

    } catch (error) {
        console.error('Notification click tracking error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
