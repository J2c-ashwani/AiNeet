import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { safeUpdate } from '@/lib/core/db-safe';

export async function POST(request) {
    try {
        const supabase = await getDb();
        let _body;

        try { _body = await request.json(); } catch (parseErr) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const body = _body;
        const { notification_id, route, device_info } = body;

        // Verify the user is authenticated (optional: could just rely on notification_id if it's a UUID)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (!notification_id) {
            return NextResponse.json({ error: 'Missing notification ID' }, { status: 400 });
        }

        const updates = {
            click_opened_at: new Date().toISOString(),
            delivery_status: 'opened'
        };

        if (device_info) {
            updates.device_info = device_info;
        }

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await safeUpdate('notifications_log', { id: notification_id, user_id: user.id }, updates, {
            route: '/api/notifications/click',
            userId: user.id,
        });

        return NextResponse.json({ success: true, redirect_route: route });

    } catch (error) {
        console.error('Notification click tracking error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
