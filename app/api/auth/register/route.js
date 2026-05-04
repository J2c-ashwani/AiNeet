import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/core/db';
import { getLevelFromXP } from '@/lib/scoring';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeString, validateEmail, validatePassword } from '@/lib/validate';

export async function POST(request) {
    try {
        const supabase = await getDb();
        
        let body;
        try {
            body = await request.json();
        } catch (parseErr) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }
        const { name, email, password, targetYear, referralCode, tracking } = body;

        // Rate Limiting (5 req/min per IP)
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown-device';
        const limitPos = await rateLimit(`${ip}:register`, 5, 60000, 'closed');
        if (!limitPos.success) {
            return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
        }

        // Anti-Abuse Feature: Risk Scoring (MD Mandate)
        let fraudRiskScore = 0;
        const deviceHash = crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');

        // Rapid signup penalty
        if (limitPos.remaining < 3) fraudRiskScore += 20;

        const { data: matchedDevice } = await supabase.from('users').select('id').eq('device_hash', deviceHash).limit(1).single();
        if (matchedDevice) {
            fraudRiskScore += 50; // High probability of self-referral farming
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

        // Check if email already exists in our users table
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (existing) {
            // Check if the Supabase auth user is confirmed or still pending verification
            const { data: authUserData } = await supabase.auth.admin.getUserById(existing.id);
            const isConfirmed = authUserData?.user?.email_confirmed_at;

            if (isConfirmed) {
                // Fully registered user — reject
                return NextResponse.json({ error: 'This email is already registered. Please sign in instead.' }, { status: 409 });
            } else {
                // Zombie: account created but OTP never completed — clean up and allow fresh re-registration
                console.log(`Cleaning up zombie unconfirmed account for ${email}`);
                await supabase.auth.admin.deleteUser(existing.id);
                await supabase.from('users').delete().eq('id', existing.id);
            }
        }

        // Supabase Native SignUp via Admin API
        // CRITICAL FIX: Using admin.createUser prevents the backend 'supabase' client from accidentally modifying its Bearer
        // token and locking itself out via RLS.
        let authData, authError;
        try {
            const result = await supabase.auth.admin.createUser({
                email: email.toLowerCase().trim(),
                password,
                email_confirm: false,
                user_metadata: {
                    full_name: cleanName
                }
            });
            authData = result.data;
            authError = result.error;
        } catch (signUpCrash) {
            console.error('Supabase signUp crashed:', signUpCrash);
            return NextResponse.json({ error: 'Authentication service unavailable. Please try again later.' }, { status: 503 });
        }

        if (authError || !authData.user) {
            console.error('Supabase signUp error:', authError);
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
                // MD Feature: Do NOT instantly increment referral counts here to prevent abuse.
                // The referral reward will only unlock organically in `tests/submit` 
                // when this newly registered student completes their first meaningful Mock Test.
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
                referred_by: referredBy,
                utm_source: tracking?.utmSource || null,
                utm_medium: tracking?.utmMedium || null,
                utm_campaign: tracking?.utmCampaign || null,
                acquired_via: tracking?.acquiredVia || (referredBy ? 'referral' : 'organic'),
                device_hash: deviceHash,
                fraud_risk_score: fraudRiskScore
            });

        if (insertError) throw insertError;

        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        const levelInfo = user ? getLevelFromXP(user.xp) : null;

        // P0-2 Trust Fix: Server only creates account. Client will handle login separately.
        // This eliminates SSR cookie propagation ambiguity that caused forced double-login.
        return NextResponse.json({ user: user ? { id: user.id, name: user.name, email: user.email, xp: user.xp, level: user.level, streak: user.streak, levelInfo } : { id } });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: error.message || 'Something went wrong during signup.', details: JSON.stringify(error) }, { status: 500 });
    }
}
