import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Head from 'next/head';

export async function generateMetadata({ params }) {
    const { id: testId } = params;

    initializeDatabase();
    const db = getDb();

    // Fetch test details for metadata
    const test = await db.get('SELECT t.score, u.name FROM tests t JOIN users u ON t.user_id = u.id WHERE t.id = ?', [testId]);

    if (!test) {
        return { title: 'Test Not Found' };
    }

    const title = `${test.name} scored ${test.score}/720 on AI NEET Coach!`;
    const description = `Check out ${test.name}'s predicted All India Rank and mock test performance. Can you beat this score?`;
    const imageUrl = `https://aineetcoach.com/api/tests/scorecard?testId=${testId}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://aineetcoach.com/test/${testId}/share`,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: 'AI NEET Coach Scorecard',
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default async function SharePage({ params }) {
    const { id: testId } = params;

    initializeDatabase();
    const db = getDb();

    const test = await db.get(`
        SELECT t.*, u.name, u.streak 
        FROM tests t 
        JOIN users u ON t.user_id = u.id 
        WHERE t.id = ?
    `, [testId]);

    if (!test) {
        notFound();
    }

    const imageUrl = `/api/tests/scorecard?testId=${testId}`;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#0a0e1a', color: '#f1f5f9', padding: '40px 20px' }}>
            <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 800 }}>
                <span>🧠</span> <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI NEET Coach</span>
            </div>

            <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px' }}>
                    {test.name}'s NEET Assessment
                </h1>

                <img
                    src={imageUrl}
                    alt="Test Scorecard"
                    style={{ width: '100%', maxWidth: '600px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '40px' }}
                />

                <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '16px' }}>Can you beat this score?</h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '32px' }}>
                        Generate your own personalized AI mock test, get your All India Rank prediction, and see where you stand.
                    </p>
                    <Link href="/register" className="btn btn-primary btn-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)', color: 'white', padding: '16px 32px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                        Take a Free Mock Test →
                    </Link>
                </div>
            </div>
        </div>
    );
}
