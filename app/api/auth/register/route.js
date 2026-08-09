import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/core/db';
import { safeDelete, safeInsert } from '@/lib/core/db-safe';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { getLevelFromXP } from '@/lib/scoring';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeString, validateEmail, validatePassword } from '@/lib/validate';
import { isFeatureEnabled } from '@/lib/feature-flags';

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

        // Anti-Abuse Feature: Risk Scoring
        let fraudRiskScore = 0;
        const deviceHash = crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');

        if (limitPos.remaining < 3) fraudRiskScore += 20;

        const { data: matchedDevice } = await supabase.from('users').select('id').eq('device_hash', deviceHash).limit(1).single();
        if (matchedDevice) {
            fraudRiskScore += 50;
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

        const cleanEmail = email.toLowerCase().trim();

        // Check if email already exists in our users table
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', cleanEmail)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'This email is already registered. Please sign in instead.' }, { status: 409 });
        }

        // Create confirmed user directly via Supabase Admin API
        let authData, authError;
        try {
            const result = await supabase.auth.admin.createUser({
                email: cleanEmail,
                password,
                email_confirm: true,
                user_metadata: {
                    full_name: cleanName
                }
            });
            authData = result.data;
            authError = result.error;
        } catch (signUpCrash) {
            console.error('Supabase admin.createUser crashed:', signUpCrash);
            return NextResponse.json({ error: 'Authentication service unavailable. Please try again later.' }, { status: 503 });
        }

        if (authError || !authData.user) {
            console.error('Supabase createUser error:', authError);
            return NextResponse.json({ error: authError?.message || 'Registration failed' }, { status: 400 });
        }

        const id = authData.user.id;
        const myReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const referralsEnabled = await isFeatureEnabled('referrals');

        let referredBy = null;
        if (referralsEnabled && referralCode) {
            const { data: referrer } = await supabase
                .from('users')
                .select('id, referrals_count')
                .eq('referral_code', referralCode.trim().toUpperCase())
                .single();

            if (referrer) {
                referredBy = referrer.id;
            }
        }

        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        await safeInsert('users', {
            id,
            name: cleanName,
            email: cleanEmail,
            password_hash: passwordHash,
            target_year: parseInt(targetYear) || 2027,
            referral_code: myReferralCode,
            referred_by: referredBy,
            utm_source: tracking?.utmSource || null,
            utm_medium: tracking?.utmMedium || null,
            utm_campaign: tracking?.utmCampaign || null,
            acquired_via: tracking?.acquiredVia || (referredBy ? 'referral' : 'organic'),
            device_hash: deviceHash,
            fraud_risk_score: fraudRiskScore
        }, {
            route: '/api/auth/register',
            userId: id,
        });

        // Sign in user using anon client to generate real session token
        let token = null;
        let refreshToken = null;
        try {
            const anonClient = await createSupabaseServerClient();
            const { data: loginData } = await anonClient.auth.signInWithPassword({
                email: cleanEmail,
                password,
            });
            if (loginData?.session) {
                token = loginData.session.access_token;
                refreshToken = loginData.session.refresh_token;
            }
        } catch (signInErr) {
            console.error('Instant sign-in error:', signInErr);
        }

        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        const levelInfo = user ? getLevelFromXP(user.xp) : null;

        return NextResponse.json({
            success: true,
            token,
            refresh_token: refreshToken,
            user: user ? { id: user.id, name: user.name, email: user.email, xp: user.xp, level: user.level, streak: user.streak, levelInfo } : { id },
        }, { status: 201 });

    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Something went wrong during signup.' }, { status: 500 });
    }
}
