import { NextResponse } from 'next/server';
import { NCERT_BOOKS, getChapterPdfUrl, getBookUrl } from '@/lib/ncert-data';
import { getDb } from '@/lib/db';

/**
 * GET /api/ncert/library
 * Returns all NCERT books with chapter-wise PDF links and real PYQ counts.
 *
 * Bug fix (Wave 7):
 * - Was using Supabase fuzzy chapter name matching → always returned 0
 * - Now uses direct postgres query joining questions → topics → chapters
 * - Guest-safe: no auth required
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const subject = searchParams.get('subject');
        const classNum = searchParams.get('class');

        let books = NCERT_BOOKS;
        if (subject) books = books.filter(b => b.subject === subject.toLowerCase());
        if (classNum) books = books.filter(b => b.class === parseInt(classNum));

        // ── Fetch real PYQ counts from postgres ─────────────────────────────
        // Query: count PYQ questions grouped by chapter name
        // Uses ILIKE for case-insensitive matching across topic→chapter→name chain
        let pyqByChapter = {};
        try {
            const db = getDb();
            const rows = await db.all(`
                SELECT 
                    c.name        AS chapter_name,
                    COUNT(q.id)   AS pyq_count
                FROM questions q
                JOIN topics t    ON q.topic_id   = t.id
                JOIN chapters c  ON t.chapter_id = c.id
                WHERE q.is_pyq = 1
                GROUP BY c.name
            `);

            rows.forEach(row => {
                const key = row.chapter_name.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
                pyqByChapter[key] = parseInt(row.pyq_count, 10);
            });
        } catch (dbErr) {
            console.error('[NCERT library] PYQ count query failed:', dbErr.message);
            // DB unavailable: degrade gracefully, show 0 counts but keep library available.
        }

        const getPyqCount = (title) => {
            const cleanTitle = title.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

            // 1. Exact match
            if (pyqByChapter[cleanTitle] !== undefined) return pyqByChapter[cleanTitle];

            // 2. DB chapter name starts with our title prefix (handles truncated names)
            const prefix = cleanTitle.split(' ').slice(0, 4).join(' ');
            const prefixMatch = Object.entries(pyqByChapter).find(
                ([k]) => k.startsWith(prefix) || cleanTitle.startsWith(k.split(' ').slice(0, 4).join(' '))
            );
            if (prefixMatch) return prefixMatch[1];

            return 0;
        };

        // Enrich books with PDF URLs and PYQ counts
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
        return NextResponse.json(
            { error: 'Failed to fetch NCERT library. Please try again in a moment.' },
            { status: 500 }
        );
    }
}
