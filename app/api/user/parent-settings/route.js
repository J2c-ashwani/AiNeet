
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { initializeDatabase } from '@/lib/schema';
import { validateEmail, sanitizeString, sanitizePhone } from '@/lib/validate';

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

        const body = await request.json();

        // Sanitize and validate
        const parent_email = body.parent_email ? sanitizeString(body.parent_email, 320) : '';
        const parent_phone = body.parent_phone ? sanitizePhone(body.parent_phone) : '';

        if (parent_email && !validateEmail(parent_email)) {
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
