import { NextResponse } from 'next/server';
import { NCERT_BOOKS, getChapterPdfUrl, getBookUrl } from '@/lib/ncert-data';

/**
 * GET /api/ncert/library — Returns all NCERT books with chapter-wise PDF links
 * Replaces the old DB-dependent books API with static data + official NCERT URLs
 */
export async function GET(request) {
    try {
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

        // Enrich with URLs
        const enriched = books.map(book => ({
            ...book,
            bookUrl: getBookUrl(book.code),
            chapters: book.chapters.map(ch => ({
                ...ch,
                pdfUrl: getChapterPdfUrl(book.code, ch.ch),
            }))
        }));

        return NextResponse.json({ books: enriched });
    } catch (error) {
        console.error('NCERT Library API error:', error);
        return NextResponse.json({ error: 'Failed to fetch NCERT library' }, { status: 500 });
    }
}
