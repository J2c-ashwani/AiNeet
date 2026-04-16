import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request) {
    try {
        const supabase = await createSupabaseServerClient();
        
        // 1. Authenticate Request
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
            return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
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
        const limitPos = rateLimit(`${ip}:password_update`, 10, 60000); 
        if (!limitPos.success) {
            return NextResponse.json({ error: 'Too many attempts. Please slow down.' }, { status: 429 });
        }

        // 4. Execute Update
        const { error: updateError } = await supabase.auth.updateUser({
            password: password
        });

        if (updateError) {
            console.error('Password Update Error:', updateError);
            return NextResponse.json({ error: 'Failed to update password. Please try again or request a new link.' }, { status: 500 });
        }

        // Return pure JSON success. The UI handler will seamlessly redirect.
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update Password API error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
