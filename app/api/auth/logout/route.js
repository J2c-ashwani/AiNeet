import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function POST() {
    try {
        const supabase = await createSupabaseServerClient();
        await supabase.auth.signOut();
        const response = NextResponse.json({ success: true });
        // Clear manual legacy token just in case
        response.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 });
        return response;
    } catch (error) {
        console.error('Logout API Error:', error);
        return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
    }
}
