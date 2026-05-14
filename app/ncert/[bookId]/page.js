'use client';
import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { NCERT_BOOKS, getChapterPdfUrl } from '@/lib/ncert-data';
import { Button } from '@/components/ui';

// react-pdf uses DOM APIs (like DOMMatrix) which crash during SSR. Force client-side rendering.
const PDFViewerClient = dynamic(() => import('@/components/PDFViewerClient'), {
    ssr: false,
    loading: () => <div className="flex-1 flex justify-center items-center"><div className="spinner w-8 h-8"></div></div>
});

function NCERTReaderContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [bookData, setBookData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const bookCode = params.bookId;
        const chapterNum = searchParams.get('ch') || 1;

        // Find the book from our static data
        const book = NCERT_BOOKS.find(b => b.code === bookCode);

        if (!book) {
            setError('Book not found in library.');
            setLoading(false);
            return;
        }

        const chapter = book.chapters.find(c => c.ch === parseInt(chapterNum));
        if (!chapter) {
            setError('Chapter not found.');
            setLoading(false);
            return;
        }

        const originalPdfUrl = getChapterPdfUrl(bookCode, chapter.ch);
        // Use direct NCERT URL — browser fetch is permitted; server-side proxy is blocked by ncert.nic.in CDN
        setBookData({
            id: `${bookCode}_${chapter.ch}`,
            title: `${book.book} - ${chapter.title}`,
            file_path: originalPdfUrl,
            directUrl: originalPdfUrl
        });

        setLoading(false);

    }, [params.bookId, searchParams]);

    if (loading) return (
        <div className="flex-1 flex justify-center items-center">
            <div className="spinner w-8 h-8"></div>
        </div>
    );

    if (error || !bookData) return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '40px', gap: '16px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📖</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{error || 'Failed to load PDF.'}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>The chapter PDF could not be loaded.</p>
            <a
                href="/ncert"
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    marginTop: '8px', padding: '10px 24px', borderRadius: '10px',
                    background: 'var(--accent-gradient)', color: '#fff',
                    fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem',
                }}
            >
                ← Back to Library
            </a>
        </div>
    );

    return (
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', padding: '12px', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, display: 'flex' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <a
                        href="/ncert"
                        style={{ padding: '6px 14px', borderRadius: '8px', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                        ← Back
                    </a>
                    <h1 style={{ fontSize: '1.125rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>{bookData.title}</h1>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Select text to AI Explain ✨
                </div>
            </div>

            {/* Mobile Back Button */}
            <div className="md:hidden" style={{ padding: '8px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button variant="ghost" onClick={() => window.location.href = '/ncert'} style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 800, padding: 0 }}>
                    ← Back
                </Button>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{bookData.title}</div>
            </div>

            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <PDFViewerClient book={bookData} />
                {/* Fallback: always give user a direct escape hatch */}
                <div style={{ textAlign: 'center', padding: '12px', borderTop: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>PDF not loading? </span>
                    <a href={bookData.directUrl} target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                        Open in New Tab ↗
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function NCERTReaderPage() {
    return (
        <div className="page" style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            
            <Suspense fallback={<div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="spinner mx-auto w-8 h-8"></div></div>}>
                <NCERTReaderContent />
            </Suspense>
        </div>
    );
}
