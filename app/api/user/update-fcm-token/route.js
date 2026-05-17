import { getDb } from '@/lib/core/db';
import { safeUpdate } from '@/lib/core/db-safe';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const supabase = await getDb();

        // Verify the user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let _body;

        try { _body = await request.json(); } catch (parseErr) {

            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

        }

        const body = _body;
        const { token, timezone } = body;

        if (!token || typeof token !== 'string') {
            return NextResponse.json({ error: 'Invalid FCM token' }, { status: 400 });
        }

        const validTimezone = timezone && typeof timezone === 'string' ? timezone : 'Asia/Kolkata';

        // Update FCM token in users table
        await safeUpdate('users', { id: user.id }, {
            fcm_token: token,
            fcm_token_updated_at: new Date().toISOString(),
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
