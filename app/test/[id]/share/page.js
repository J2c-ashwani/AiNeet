import { Icon } from '@/components/ui/Icon';
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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
            <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800 }}>
                <span><Icon name="Brain" /></span> <span style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI NEET Coach</span>
            </div>

            <div style={{ maxWidth: 800, width: '100%', textAlign: 'center' }}>
                <h1 style={{ fontWeight: 800, marginBottom: 20 }}>
                    {test.name}'s NEET Assessment
                </h1>

                <img
                    src={imageUrl}
                    alt="Test Scorecard"
                    style={{ width: '100%', maxWidth: 600, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)', marginBottom: 40 }}
                />

                <Card style={{ padding: 40, marginBottom: 40 }}>
                    <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Can you beat this score?</h2>
                    <p style={{ marginBottom: 32 }}>
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
