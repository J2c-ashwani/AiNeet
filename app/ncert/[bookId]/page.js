'use client';
import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { NCERT_BOOKS, getChapterPdfUrl } from '@/lib/ncert-data';

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
        <div className="flex-1 flex flex-col items-center justify-center pt-10">
            <div className="text-5xl mb-4">📖</div>
            <h2 className="text-xl font-bold">{error || 'Failed to load PDF.'}</h2>
            {error && (
                <button onClick={() => router.push('/ncert')} className="btn btn-primary mt-4">
                    Back to Library
                </button>
            )}
        </div>
    );

    return (
        <div className="flex-1 overflow-hidden relative flex flex-col">
            <div className="bg-gray-900 border-b border-gray-800 p-3 flex items-center justify-between z-10 hidden md:flex">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/ncert')} className="btn btn-secondary btn-sm">
                        ← Back
                    </button>
                    <h1 className="text-lg font-bold truncate max-w-md">{bookData.title}</h1>
                </div>
                <div className="text-sm text-gray-400">
                    Select text to AI Explain ✨
                </div>
            </div>

            {/* Mobile Back Button */}
            <div className="md:hidden p-2 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
                <button onClick={() => router.push('/ncert')} className="text-blue-400 text-sm font-bold">
                    ← Back
                </button>
                <div className="text-xs text-gray-400 truncate max-w-[200px]">{bookData.title}</div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                <PDFViewerClient book={bookData} />
                {/* Fallback: always give user a direct escape hatch */}
                <div style={{ textAlign: 'center', padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>PDF not loading? </span>
                    <a href={bookData.directUrl} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#60a5fa', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                        Open in New Tab ↗
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function NCERTReaderPage() {
    return (
        <div className="h-screen flex flex-col bg-gray-950">
            
            <Suspense fallback={<div className="flex-1 flex justify-center items-center"><div className="spinner mx-auto w-8 h-8"></div></div>}>
                <NCERTReaderContent />
            </Suspense>
        </div>
    );
}
