import { getDb } from '@/lib/core/db';
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
        const { token } = body;

        if (!token || typeof token !== 'string') {
            return NextResponse.json({ error: 'Invalid FCM token' }, { status: 400 });
        }

        // Update FCM token in users table
        const { error } = await supabase
            .from('users')
            .update({
                fcm_token: token,
                fcm_token_updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('FCM token update error:', error);
        return NextResponse.json({ error: 'Could not update your settings. Please try again.' }, { status: 500 });
    }
}
