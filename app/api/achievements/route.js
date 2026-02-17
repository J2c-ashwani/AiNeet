import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
    try {
        initializeDatabase();
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const badges = db.prepare('SELECT * FROM user_achievements WHERE user_id = ? ORDER BY earned_at DESC').all(decoded.id);
        return NextResponse.json({ badges });
    } catch (error) {
        console.error('Achievements error:', error);
        return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
    }
}
