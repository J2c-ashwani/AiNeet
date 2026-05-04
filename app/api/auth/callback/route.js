import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // next is the default URL to redirect to after sign in
    const next = searchParams.get('next') ?? '/';

    if (code) {
        const supabase = await createSupabaseServerClient();
        
        try {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (!error) {
                // Successful exchange, redirect to final path
                return NextResponse.redirect(`${origin}${next}`);
            } else {
                console.error('Supabase Auth Callback Error:', error);
                // MD UX FIX: Send bad/expired links directly to a clean login state with parameter
                return NextResponse.redirect(`${origin}/login?error=reset_link_invalid`);
            }
        } catch (err) {
            console.error('Auth callback exception:', err);
            return NextResponse.redirect(`${origin}/login?error=reset_link_invalid`);
        }
    }

    // No code present, invalid route
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
