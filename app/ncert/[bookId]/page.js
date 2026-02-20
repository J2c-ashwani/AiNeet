'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PDFViewerClient from '@/components/PDFViewerClient';
import Navbar from '@/components/Navbar';

export default function NCERTReaderPage() {
    const params = useParams();
    const router = useRouter();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchBook() {
            try {
                const res = await fetch(`/api/ncert/book/${params.bookId}`);
                if (!res.ok) {
                    setError('Book not found');
                    return;
                }
                const data = await res.json();
                setBook(data.book);
            } catch (e) {
                setError('Failed to load book');
            }
            setLoading(false);
        }
        if (params.bookId) fetchBook();
    }, [params.bookId]);

    if (loading) return (
        <div>
            <Navbar />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <div className="spinner" style={{ width: 32, height: 32 }}></div>
            </div>
        </div>
    );

    if (error || !book) return (
        <div>
            <Navbar />
            <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>📖</div>
                <h2>{error || 'Book not found'}</h2>
                <button onClick={() => router.push('/ncert')} className="btn btn-primary" style={{ marginTop: 16 }}>
                    Back to Library
                </button>
            </div>
        </div>
    );

    return (
        <div className="h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 overflow-hidden relative">
                <PDFViewerClient book={book} />
            </div>
        </div>
    );
}
