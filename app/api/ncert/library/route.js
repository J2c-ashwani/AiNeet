import { NextResponse } from 'next/server';
import { NCERT_BOOKS, getChapterPdfUrl, getBookUrl } from '@/lib/ncert-data';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';

/**
 * GET /api/ncert/library — Returns all NCERT books with chapter-wise PDF links
 * Replaces the old DB-dependent books API with static data + official NCERT URLs
 */
export async function GET(request) {
    try {
        await initializeDatabase();
        const db = getDb();

        const { searchParams } = new URL(request.url);
        const subject = searchParams.get('subject');
        const classNum = searchParams.get('class');

        let books = NCERT_BOOKS;

        if (subject) {
            books = books.filter(b => b.subject === subject.toLowerCase());
        }
        if (classNum) {
            books = books.filter(b => b.class === parseInt(classNum));
        }

        // Fetch pyq counts from DB
        const chapterList = await db.all("SELECT c.name, COUNT(q.id) as pyq_count FROM chapters c LEFT JOIN questions q ON c.id = q.chapter_id AND q.is_pyq = 1 GROUP BY c.id;");

        const getPyqCount = (title) => {
            const cleanTitle = title.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
            
            // Try exact match first
            let match = chapterList.find(c => c.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim() === cleanTitle);
            
            // If no exact match, try matching the first few words
            if (!match) {
                const prefix = cleanTitle.split(' ').slice(0, 3).join(' ');
                match = chapterList.find(c => c.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().startsWith(prefix));
            }
            return match ? match.pyq_count : 0;
        }

        // Enrich with URLs and PYQ counts
        const enriched = books.map(book => ({
            ...book,
            bookUrl: getBookUrl(book.code),
            chapters: book.chapters.map(ch => ({
                ...ch,
                pdfUrl: getChapterPdfUrl(book.code, ch.ch),
                pyqCount: getPyqCount(ch.title)
            }))
        }));

        return NextResponse.json({ books: enriched });
    } catch (error) {
        console.error('NCERT Library API error:', error);
        return NextResponse.json({ error: 'Failed to fetch NCERT library' }, { status: 500 });
    }
}
