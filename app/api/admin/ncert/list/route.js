import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const db = getDb();
        const books = await db.all(
            'SELECT id, subject_id, chapter_id, title, created_at FROM ncert_content ORDER BY id DESC'
        );
        return NextResponse.json({ books });
    } catch (error) {
        // Table might not exist yet
        return NextResponse.json({ books: [] });
    }
}
