import { Icon } from '@/components/ui/Icon';
import { Card, Button } from '@/components/ui';
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
    const description = `Check out ${test.name}'s predicted All India Rank and mock test performance for NEET 2027. Can you beat this score?`;
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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.12), transparent 50%)' }}>
            <div style={{ marginBottom: 30, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800 }}>
                <span><Icon name="Brain" /></span> <span style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.25rem' }}>AI NEET Coach</span>
            </div>

            <div style={{ maxWidth: 700, width: '100%', textAlign: 'center' }}>
                <h1 style={{ fontWeight: 800, marginBottom: 12, fontSize: '1.75rem' }}>
                    {test.name}&apos;s NEET Assessment
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 24 }}>
                    Scorecard verified by AI NEET Coach Engine for NEET 2027
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
                    <img
                        src={imageUrl}
                        alt="Test Scorecard"
                        style={{ width: '100%', maxWidth: 540, borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                </div>

                {/* Viral Conversion Box */}
                <div style={{
                    padding: '32px 24px',
                    borderRadius: 20,
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-focus)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                    marginBottom: 32,
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 10, color: 'var(--text-primary)' }}>
                        Can you beat {test.name}&apos;s {test.score}/720?
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24, maxWidth: 500, margin: '0 auto 24px auto', lineHeight: 1.5 }}>
                        Experience India&apos;s most accurate NEET 2027 AI Mock Tests with instant AIR prediction, physical OMR scanning, and live 1v1 battlegrounds.
                    </p>

                    {/* Primary Android App CTA */}
                    <div style={{ maxWidth: 420, margin: '0 auto' }}>
                        <a
                            href="/downloads/neet-coach.apk"
                            download="AI-NEET-Coach-v2.0.apk"
                            className="btn btn-primary btn-lg"
                            style={{
                                width: '100%',
                                padding: '16px 24px',
                                fontWeight: 800,
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10,
                                fontSize: '1.05rem',
                                boxShadow: '0 8px 30px rgba(99, 102, 241, 0.5)',
                                borderRadius: 12,
                                marginBottom: 12
                            }}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span>Download Android App & Beat Score</span>
                        </a>

                        {/* Feature Badges */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 12,
                            padding: '8px 12px',
                            borderRadius: 8,
                            background: 'rgba(99, 102, 241, 0.08)',
                            fontSize: '0.78rem',
                            color: 'var(--text-secondary)',
                            marginBottom: 18,
                            flexWrap: 'wrap'
                        }}>
                            <span>📷 Camera OMR</span>
                            <span>•</span>
                            <span>⚡ 0-Lag UI</span>
                            <span>•</span>
                            <span>🎯 AIR Predictor</span>
                        </div>

                        {/* Web Alternative */}
                        <a
                            href="/register"
                            style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.88rem',
                                textDecoration: 'underline',
                                textUnderlineOffset: 3,
                                fontWeight: 600
                            }}
                        >
                            Or try free mock test on Web Browser →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
