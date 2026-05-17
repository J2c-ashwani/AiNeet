'use client';
import { Icon } from '@/components/ui/Icon';
import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { NCERT_BOOKS, getChapterPdfUrl } from '@/lib/ncert-data';
import { Button } from '@/components/ui';
import { openExternalUrl } from '@/lib/platform';

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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 40, gap: 16 }}>
            <div style={{ marginBottom: 8 }}><Icon name="Star" size={16} /></div>
            <h2 style={{ fontWeight: 800 }}>{error || 'Failed to load PDF.'}</h2>
            <p >The chapter PDF could not be loaded.</p>
            <a
                href="/ncert"
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    marginTop: 0, padding: '12px 24px', fontWeight: 700, textDecoration: 'none', }}
            >
                ← Back to Library
            </a>
        </div>
    );

    return (
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderBottom: '1px solid var(--border)', padding: 12, alignItems: 'center', justifyContent: 'space-between', display: 'flex' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <a
                        href="/ncert"
                        style={{ padding: '6px 14px', border: '1px solid var(--border)', textDecoration: 'none', fontWeight: 600 }}
                    >
                        ← Back
                    </a>
                    <h1 style={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 400 }}>{bookData.title}</h1>
                </div>
                <div >
                    Select text to AI Explain ✨
                </div>
            </div>

            {/* Mobile Back Button */}
            <div className="md:hidden" style={{ padding: 8, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button variant="ghost" onClick={() => window.location.href = '/ncert'} style={{ fontWeight: 800, padding: 0 }}>
                    ← Back
                </Button>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{bookData.title}</div>
            </div>

            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <PDFViewerClient book={bookData} />
                {/* Fallback: always give user a direct escape hatch */}
                <div style={{ textAlign: 'center', padding: 12, borderTop: '1px solid var(--border)' }}>
                    <span >PDF not loading? </span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => openExternalUrl(bookData.directUrl)}
                        style={{ fontWeight: 600, textDecoration: 'none', color: 'var(--primary)' }}>
                        Open in New Tab ↗
                    </Button>
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
