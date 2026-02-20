import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { sanitizeString } from '@/lib/validate';

export async function GET(request, { params }) {
    try {
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { bookId: rawBookId } = await params;
        const bookId = sanitizeString(rawBookId, 128);
        if (!bookId) return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });

        const db = getDb();

        let book = null;
        try {
            book = await db.get(
                'SELECT b.*, s.name as subject_name, s.icon as subject_icon FROM ncert_books b LEFT JOIN subjects s ON b.subject_id = s.id WHERE b.id = ?',
                [bookId]
            );
        } catch (e) {
            // fallback to ncert_content table
            try {
                book = await db.get('SELECT * FROM ncert_content WHERE id = ?', [bookId]);
            } catch (e2) { /* */ }
        }

        if (!book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        return NextResponse.json({ book });
    } catch (error) {
        console.error('NCERT book fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
    }
}
