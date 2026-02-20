import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import { getUserFromRequest } from '@/lib/auth';
import { getLevelFromXP } from '@/lib/scoring';
import bcrypt from 'bcryptjs';

export async function GET(request) {
    try {
        await initializeDatabase();
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ user: null });

        const user = await db.get('SELECT id, name, email, xp, level, streak, target_year, daily_goal, avatar FROM users WHERE id = ?', [decoded.id]);
        if (!user) return NextResponse.json({ user: null });

        const levelInfo = getLevelFromXP(user.xp);
        return NextResponse.json({ user: { ...user, levelInfo } });
    } catch (error) {
        console.error('Auth me error:', error);
        return NextResponse.json({ user: null });
    }
}

export async function PUT(request) {
    try {
        await initializeDatabase();
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { name, targetYear, dailyGoal, password } = await request.json();

        const updates = [];
        const values = [];

        if (name) { updates.push('name = ?'); values.push(name); }
        if (targetYear) { updates.push('target_year = ?'); values.push(targetYear); }
        if (dailyGoal) { updates.push('daily_goal = ?'); values.push(dailyGoal); }
        if (password) {
            const hash = await bcrypt.hash(password, 10);
            updates.push('password_hash = ?');
            values.push(hash);
        }

        if (updates.length === 0) return NextResponse.json({ success: true });

        values.push(decoded.id);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        await db.run(query, values);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
