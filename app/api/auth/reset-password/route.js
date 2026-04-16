import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request) {
    try {
        const supabase = await createSupabaseServerClient();
        let _body;
        try { _body = await request.json(); } catch (parseErr) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }
        const { email } = _body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // MD SECURITY FIX 2: Strict Rate Limiting (3 requests per hour)
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const limitPos = rateLimit(`${ip}:password_reset`, 3, 3600000); 
        if (!limitPos.success) {
            return NextResponse.json({ error: 'Too many reset requests limit reached. Please wait.' }, { status: 429 });
        }

        const originUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        // Trigger Supabase email. Even if email doesn't exist, Supabase resolves this silently in latest versions, 
        // but we enforce an absolute generic overlay response regardless of outcome.
        await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
            redirectTo: `${originUrl}/api/auth/callback?next=/update-password`,
        });

        // MD SECURITY FIX 1: Email Enumeration Blocking. (Always return success).
        return NextResponse.json({ success: true, message: 'If this email exists, a reset link has been sent.' });

    } catch (error) {
        console.error('Reset Password API error:', error);
        // We still fail silently to the frontend on system collapse to avoid enumerations
        return NextResponse.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
    }
}
