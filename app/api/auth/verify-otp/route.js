import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

/**
 * OTP Verification for Password Recovery
 * 
 * Supabase sends a 6-digit OTP in the password reset email.
 * This endpoint verifies that OTP and establishes an authenticated
 * session so the user can then call /api/auth/update-password.
 * 
 * This replaces the magic-link flow which breaks inside mobile WebViews
 * (the link opens in the system browser, not the app).
 */
export async function POST(request) {
    try {
        let _body;
        try { _body = await request.json(); } catch (parseErr) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const { email, otp, type } = _body;

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP code are required.' }, { status: 400 });
        }

        // Rate limit: 10 attempts per 15 minutes per IP
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const limitPos = await rateLimit(`${ip}:otp_verify`, 10, 900000, 'closed');
        if (!limitPos.success) {
            return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
        }

        const supabase = await createSupabaseServerClient();

        // Verify the OTP token with Supabase Auth
        const { data, error } = await supabase.auth.verifyOtp({
            email: email.toLowerCase().trim(),
            token: otp.trim(),
            type: type || 'recovery',
        });

        if (error) {
            console.error('OTP verification error:', error.message);
            
            if (error.message.includes('expired')) {
                return NextResponse.json({ error: 'This code has expired. Please request a new one.' }, { status: 400 });
            }
            
            return NextResponse.json({ error: 'Invalid code. Please check and try again.' }, { status: 400 });
        }

        if (!data?.session) {
            return NextResponse.json({ error: 'Verification failed. Please request a new code.' }, { status: 400 });
        }

        // OTP verified successfully — session is now established via cookies
        // The user can now call /api/auth/update-password
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('OTP Verify API error:', error);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
