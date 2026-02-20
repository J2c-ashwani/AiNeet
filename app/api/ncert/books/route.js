import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();
        let books = [];
        try {
            books = await db.all(`
                SELECT b.*, s.name as subject_name, s.color as subject_color, s.icon as subject_icon
                FROM ncert_books b
                LEFT JOIN subjects s ON b.subject_id = s.id
                ORDER BY b.subject_id, b.chapter_id
            `);
        } catch (e) {
            // table may not exist yet
            try {
                books = await db.all('SELECT * FROM ncert_content ORDER BY subject_id, chapter_id');
            } catch (e2) { /* */ }
        }
        return NextResponse.json({ books });
    } catch (error) {
        return NextResponse.json({ books: [] });
    }
}
