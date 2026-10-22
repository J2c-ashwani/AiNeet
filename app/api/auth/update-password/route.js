import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request) {
    try {
        // 1. Authenticate Request (supports both Bearer token from mobile and cookies from web)
        const user = await getUserFromRequest(request);
        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized session. Please log in or request a new reset code.' }, { status: 401 });
        }

        let _body;
        try { _body = await request.json(); } catch (parseErr) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }
        
        const { password } = _body;

        // 2. MD Security Fix 3: Strict Password Enforcements
        if (!password || password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
        }
        const hasNumber = /\d/;
        const hasLetter = /[a-zA-Z]/;
        if (!hasNumber.test(password) || !hasLetter.test(password)) {
            return NextResponse.json({ error: 'Password must contain at least one letter and one number.' }, { status: 400 });
        }

        // 3. Strict Rate Limiting (Prevent Brute-Forcing Update Endpoint)
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const limitPos = await rateLimit(`${ip}:password_update`, 10, 60000, 'closed');
        if (!limitPos.success) {
            return NextResponse.json({ error: 'Too many attempts. Please slow down.' }, { status: 429 });
        }

        // 4. Execute Update via Supabase Admin (reliably updates password in Supabase Auth for mobile & web)
        const adminDb = await getDb();
        const { error: updateError } = await adminDb.auth.admin.updateUserById(user.id, {
            password: password,
            email_confirm: true,
        });

        if (updateError) {
            console.error('Password Update Error:', updateError);
            return NextResponse.json({ error: updateError.message || 'Failed to update password. Please try again or request a new link.' }, { status: 500 });
        }

        // Return pure JSON success.
        return NextResponse.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Update Password API error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
