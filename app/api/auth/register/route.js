import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/core/db';
import { safeInsert } from '@/lib/core/db-safe';
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

        // Risk Scoring
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

        // Create user via Supabase Admin API with OTP requirement (email_confirm: false)
        let authData, authError;
        try {
            const result = await supabase.auth.admin.createUser({
                email: cleanEmail,
                password,
                email_confirm: false,
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

        // Send OTP email token
        let otpSent = true;
        try {
            const anonClient = await createSupabaseServerClient();
            const { error: resendError } = await anonClient.auth.resend({
                type: 'signup',
                email: cleanEmail,
            });
            if (resendError) {
                console.error('OTP email resend error (non-fatal):', resendError.message);
                otpSent = false;
            }
        } catch (emailErr) {
            console.error('OTP email trigger error (non-fatal):', emailErr);
            otpSent = false;
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

        return NextResponse.json({
            success: true,
            otpSent,
            message: otpSent ? 'A 6-digit OTP code has been sent to your email.' : 'Account created. Enter OTP code or check email.',
            email: cleanEmail,
        }, { status: 201 });

    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Something went wrong during signup.' }, { status: 500 });
    }
}
