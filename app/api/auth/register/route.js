import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { getLevelFromXP } from '@/lib/scoring';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeString, validateEmail, validatePassword } from '@/lib/validate';

export async function POST(request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { name, email, password, targetYear, referralCode } = await request.json();

        // Rate Limiting (5 req/min per IP)
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const limitPos = rateLimit(`${ip}:register`, 5, 60000);
        if (!limitPos.success) {
            return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
        }

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email and password required' }, { status: 400 });
        }

        // Input validation
        const cleanName = sanitizeString(name, 100);
        if (cleanName.length < 2) {
            return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
        }
        if (!validateEmail(email)) {
            return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
        }
        const pwCheck = validatePassword(password);
        if (!pwCheck.valid) {
            return NextResponse.json({ error: pwCheck.message }, { status: 400 });
        }

        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        // Supabase Native SignUp
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email.toLowerCase().trim(),
            password,
            options: {
                data: {
                    full_name: cleanName
                }
            }
        });

        if (authError || !authData.user) {
            return NextResponse.json({ error: authError?.message || 'Registration failed' }, { status: 400 });
        }

        const id = authData.user.id;
        const myReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        let referredBy = null;
        if (referralCode) {
            const { data: referrer } = await supabase
                .from('users')
                .select('id, referrals_count')
                .eq('referral_code', referralCode.trim().toUpperCase())
                .single();

            if (referrer) {
                referredBy = referrer.id;
                // Increment referrer's count
                await supabase
                    .from('users')
                    .update({ referrals_count: (referrer.referrals_count || 0) + 1 })
                    .eq('id', referrer.id);
            }
        }

        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        const { error: insertError } = await supabase
            .from('users')
            .insert({
                id,
                name: cleanName,
                email: email.toLowerCase().trim(),
                password_hash: passwordHash,
                target_year: parseInt(targetYear) || 2026,
                referral_code: myReferralCode,
                referred_by: referredBy
            });

        if (insertError) throw insertError;

        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        const levelInfo = user ? getLevelFromXP(user.xp) : null;

        return NextResponse.json({ user: user ? { id: user.id, name: user.name, email: user.email, xp: user.xp, level: user.level, streak: user.streak, levelInfo } : { id } });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
