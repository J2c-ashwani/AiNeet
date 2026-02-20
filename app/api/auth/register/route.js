import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import { hashPassword, generateToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { getLevelFromXP } from '@/lib/scoring';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeString, validateEmail, validatePassword } from '@/lib/validate';

export async function POST(request) {
    try {
        initializeDatabase();
        const db = getDb();
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

        const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        const id = uuidv4();
        const hash = hashPassword(password);
        const myReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        let referredBy = null;
        if (referralCode) {
            const referrer = await db.get('SELECT id FROM users WHERE referral_code = ?', [referralCode.trim().toUpperCase()]);
            if (referrer) {
                referredBy = referrer.id;
                // Increment referrer's count
                await db.run('UPDATE users SET referrals_count = referrals_count + 1 WHERE id = ?', [referrer.id]);
            }
        }

        await db.run(
            'INSERT INTO users (id, name, email, password_hash, target_year, referral_code, referred_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, cleanName, email.toLowerCase().trim(), hash, parseInt(targetYear) || 2026, myReferralCode, referredBy]
        );

        const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
        const token = generateToken(user);
        const levelInfo = getLevelFromXP(user.xp);

        const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, xp: user.xp, level: user.level, streak: user.streak, levelInfo } });
        response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 604800, sameSite: 'lax' });
        return response;
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
