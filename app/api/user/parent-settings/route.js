
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { initializeDatabase } from '@/lib/schema';

export async function GET(request) {
    try {
        await initializeDatabase();
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await db.get("SELECT parent_email, parent_phone FROM users WHERE id = ?", [decoded.id]);
        return NextResponse.json({
            parent_email: user?.parent_email || '',
            parent_phone: user?.parent_phone || ''
        });

    } catch (error) {
        console.error('Parent Settings GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await initializeDatabase();
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { parent_email, parent_phone } = await request.json();

        // Basic validation
        if (parent_email && !parent_email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        await db.run(
            "UPDATE users SET parent_email = ?, parent_phone = ? WHERE id = ?",
            [parent_email, parent_phone, decoded.id]
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Parent Settings POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
