import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

function requireAdmin(request) {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') return null;
    return user;
}

export async function GET(request) {
    const admin = requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const db = getDb();
        const users = db.prepare(
            'SELECT id, name, email, xp, subscription_tier, subscription_expires, created_at, role FROM users ORDER BY id DESC'
        ).all();

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Users API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
