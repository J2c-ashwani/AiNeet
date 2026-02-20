import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import { hashPassword, generateToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { getLevelFromXP } from '@/lib/scoring';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request) {
    try {
        initializeDatabase();
        const db = getDb();
        const { name, email, password, targetYear } = await request.json();

        // Rate Limiting (5 req/min per IP)
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const limitPos = rateLimit(`${ip}:register`, 5, 60000);
        if (!limitPos.success) {
            return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
        }

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email and password required' }, { status: 400 });
        }

        const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        const id = uuidv4();
        const hash = hashPassword(password);
        await db.run('INSERT INTO users (id, name, email, password_hash, target_year) VALUES (?, ?, ?, ?, ?)', [id, name, email, hash, parseInt(targetYear) || 2026]);

        const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
        const token = generateToken(user);
        const levelInfo = getLevelFromXP(user.xp);

        const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, xp: user.xp, level: user.level, streak: user.streak, levelInfo } });
        response.cookies.set('token', token, { httpOnly: true, path: '/', maxAge: 604800, sameSite: 'lax' });
        return response;
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
