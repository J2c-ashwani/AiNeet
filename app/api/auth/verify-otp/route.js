import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { ServerLog } from '@/lib/logger';

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
            ServerLog.alert('OTP_SPAM', 'OTP Rate limit exceeded', { ip });
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
            ServerLog.authFailure('verify_otp_supabase', error);
            
            if (error.message.includes('expired')) {
                return NextResponse.json({ error: 'This code has expired. Please request a new one.' }, { status: 400 });
            }
            
            return NextResponse.json({ error: 'Invalid code. Please check and try again.' }, { status: 400 });
        }

        if (!data?.session) {
            ServerLog.authFailure('verify_otp_no_session', new Error('No session returned after valid OTP'));
            return NextResponse.json({ error: 'Verification failed. Please request a new code.' }, { status: 400 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        ServerLog.apiFailure('/api/auth/verify-otp', error);
        return NextResponse.json({ error: 'Our authentication service is currently experiencing issues. Please try again in a few moments.' }, { status: 500 });
    }
}
