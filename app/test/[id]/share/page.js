import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
    const { id: testId } = params;
    const supabase = getSupabase();

    // Fetch test details for metadata
    const { data: testRow } = await supabase.from('tests').select('score, users(name)').eq('id', testId).single();
    const test = testRow ? { score: testRow.score, name: testRow.users?.name } : null;

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
    const supabase = getSupabase();

    const { data: testRow } = await supabase.from('tests').select('*, users(name, streak)').eq('id', testId).single();
    const test = testRow ? { ...testRow, name: testRow.users?.name, streak: testRow.users?.streak } : null;

    if (!test) {
        notFound();
    }

    const imageUrl = `/api/tests/scorecard?testId=${testId}`;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '40px 20px' }}>
            <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 800 }}>
                <span>🧠</span> <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI NEET Coach</span>
            </div>

            <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px' }}>
                    {test.name}'s NEET Assessment
                </h1>

                <img
                    src={imageUrl}
                    alt="Test Scorecard"
                    style={{ width: '100%', maxWidth: '600px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)', marginBottom: '40px' }}
                />

                <Card style={{ padding: '40px', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '16px' }}>Can you beat this score?</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '32px' }}>
                        Generate your own personalized AI mock test, get your All India Rank prediction, and see where you stand.
                    </p>
                    <a href="/register" style={{ textDecoration: 'none' }}>
                        <Button variant="primary" size="lg">
                            Take a Free Mock Test →
                        </Button>
                    </a>
                </Card>
            </div>
        </div>
    );
}
