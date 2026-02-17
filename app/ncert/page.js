
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';

// Server Component
export default function NCERTLibrary() {
    initializeDatabase();
    const db = getDb();

    // Fetch books with subject info
    // Assuming books have valid subject_id
    const books = db.prepare(`
        SELECT b.*, s.name as subject_name, s.color as subject_color, s.icon as subject_icon
        FROM ncert_books b
        LEFT JOIN subjects s ON b.subject_id = s.id
        ORDER BY b.subject_id, b.chapter_id
    `).all();

    return (
        <div>
            <Navbar />
            <div className="page">
                <div className="page-header">
                    <h1 className="page-title">📚 NCERT Smart Library</h1>
                    <p className="page-subtitle">Read, highlight, and get AI explanations instantly.</p>
                </div>

                <div className="grid grid-3 gap-4">
                    {books.length === 0 ? (
                        <div className="text-muted col-span-3 text-center py-10">
                            No books added yet. Run seeding script.
                        </div>
                    ) : (
                        books.map(book => (
                            <Link href={`/ncert/${book.id}`} key={book.id} className="card hover-card no-underline">
                                <div className="flex items-center gap-3 mb-3">
                                    <span style={{ fontSize: '1.5rem', background: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 8 }}>
                                        {book.subject_icon || '📖'}
                                    </span>
                                    <div>
                                        <div className="text-sm text-muted">{book.subject_name || 'Subject'}</div>
                                        <div className="font-semibold text-lg">{book.title}</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="badge">Class 11</span>
                                    <span className="text-primary text-sm flex items-center gap-1">
                                        Read Now <span>→</span>
                                    </span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
