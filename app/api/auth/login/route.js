import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import { comparePassword, generateToken } from '@/lib/auth';
import { getLevelFromXP } from '@/lib/scoring';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request) {
    try {
        initializeDatabase();
        const db = getDb();
        const { email, password } = await request.json();

        // Rate Limiting (5 req/min per IP)
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const limitPos = rateLimit(`${ip}:login`, 5, 60000);
        if (!limitPos.success) {
            return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
        }

        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user || !comparePassword(password, user.password_hash)) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const token = generateToken(user);
        const levelInfo = getLevelFromXP(user.xp);

        const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, xp: user.xp, level: user.level, streak: user.streak, levelInfo } });
        response.cookies.set('token', token, { httpOnly: true, path: '/', maxAge: 604800, sameSite: 'lax' });
        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
