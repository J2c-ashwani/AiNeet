
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import PDFViewerClient from '@/components/PDFViewerClient';
import Navbar from '@/components/Navbar';
import { notFound } from 'next/navigation';

export default async function NCERTReaderPage({ params }) {
    initializeDatabase();
    const db = getDb();

    // Next.js 15 compatible: await params
    const { bookId } = await params;
    const book = db.prepare('SELECT * FROM ncert_books WHERE id = ?').get(bookId);

    if (!book) return notFound();

    return (
        <div className="h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 overflow-hidden relative">
                <PDFViewerClient book={book} />
            </div>
        </div>
    );
}
