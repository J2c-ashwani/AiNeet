import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';

export async function POST() {
    const supabase = await getDb();
    await supabase.auth.signOut();
    const response = NextResponse.json({ success: true });
    // Clear old token if it exists
    response.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 });
    return response;
}
