import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';

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

        const { error } = await supabase
            .from('notifications_log')
            .update(updates)
            .eq('id', notification_id)
            .eq('user_id', user ? user.id : undefined); // Add user_id check if authenticated

        if (error) throw error;

        return NextResponse.json({ success: true, redirect_route: route });

    } catch (error) {
        console.error('Notification click tracking error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
