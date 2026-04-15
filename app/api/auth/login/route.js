import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { getLevelFromXP } from '@/lib/scoring';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request) {
    try {
        const supabaseAdmin = await getDb();
        const supabaseAuth = await createSupabaseServerClient();
        let _body;
        try { _body = await request.json(); } catch (parseErr) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }
        const { email, password, tracking } = _body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Rate Limiting (5 req/min per IP)
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const limitPos = rateLimit(`${ip}:login`, 5, 60000);
        if (!limitPos.success) {
            return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
        }

        // Supabase Native SignIn via SSR Cookies
        const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
            email: email.toLowerCase().trim(),
            password: password
        });

        if (authError || !authData.user) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const authUserId = authData.user.id;

        const { data: user } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', authUserId)
            .single();

        // Log session for journey analytics
        if (tracking?.utmSource || tracking?.acquiredVia) {
            await supabaseAdmin.from('user_sessions').insert({
                user_id: authUserId,
                source: tracking.acquiredVia || tracking.utmSource
            });
        }

        if (user) {
            const levelInfo = getLevelFromXP(user.xp);
            return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, xp: user.xp, level: user.level, streak: user.streak, levelInfo } });
        }

        // Failsafe returned minimal user
        return NextResponse.json({ user: { id: authUserId, email: authData.user.email, name: authData.user.user_metadata?.full_name || 'User' } });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Login failed. Please check your connection and try again.' }, { status: 500 });
    }
}
