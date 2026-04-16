'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DiagnosticResultsLock() {
    const [result, setResult] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem('pending_diagnostic_grade');
        if (stored) {
            try {
                setResult(JSON.parse(stored).scoreData);
            } catch (e) {}
        } else {
            router.push('/test/diagnostic');
        }
    }, [router]);

    if (!result) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#080c18', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', overflowX: 'hidden' }}>
            
            {/* The Hook: Immediate Reality Check */}
            <div style={{ textAlign: 'center', maxWidth: 640, marginBottom: 40, animation: 'fadeInDown 0.6s ease-out' }}>
                <div style={{ display: 'inline-block', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '6px 16px', borderRadius: 20, fontSize: '0.9rem', fontWeight: 700, marginBottom: 16 }}>
                    CRITICAL DIAGNOSIS COMPLETE
                </div>
                <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 800, lineHeight: 1.2 }}>
                    Your primary weakness is <br/>
                    <span style={{ color: '#ef4444' }}>{result.weakestChapter}</span>
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: 16 }}>
                    This single chapter is dragging down your entire NEET preparation trajectory.
                </p>
            </div>

            {/* The Psychological Stack Panel */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900, marginBottom: 60 }}>
                {/* Fear Panel */}
                <div style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 16, padding: 24, width: 280, boxShadow: '0 10px 30px rgba(239, 68, 68, 0.05)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>📉</div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#ef4444', fontWeight: 800 }}>-{result.lostMarks} Marks</h3>
                    <p style={{ color: '#94a3b8', margin: '8px 0 0', fontSize: '0.95rem' }}>Projected score penalty in the actual NEET exam due to this blind spot.</p>
                </div>

                {/* Peer Pressure Panel */}
                <div style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 16, padding: 24, width: 280, boxShadow: '0 10px 30px rgba(245, 158, 11, 0.05)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>👥</div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fbbf24', fontWeight: 800 }}>Bottom {result.percentile}%</h3>
                    <p style={{ color: '#94a3b8', margin: '8px 0 0', fontSize: '0.95rem' }}>Your accuracy places you behind {100 - result.percentile}% of active NEET aspirants this week.</p>
                </div>

                {/* Hope Panel */}
                <div style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 16, padding: 24, width: 280, boxShadow: '0 10px 30px rgba(34, 197, 94, 0.05)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>🚀</div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#4ade80', fontWeight: 800 }}>{result.peerImprovementText}</h3>
                    <p style={{ color: '#94a3b8', margin: '8px 0 0', fontSize: '0.95rem' }}>Students who started with your exact profile improved their score significantly in 14 days.</p>
                </div>
            </div>

            {/* The Lock Screen & Blur */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 800, borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                {/* Fake Blurred Dashboard content to trigger FOMO */}
                <div style={{ padding: 40, background: '#0f172a', filter: 'blur(12px)', opacity: 0.5, pointerEvents: 'none', userSelect: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
                        <div style={{ width: 300, height: 180, background: '#1e293b', borderRadius: 16 }} />
                        <div style={{ width: 300, height: 180, background: '#1e293b', borderRadius: 16 }} />
                    </div>
                    <div style={{ width: '100%', height: 60, background: '#1e293b', borderRadius: 8, marginBottom: 16 }} />
                    <div style={{ width: '100%', height: 60, background: '#1e293b', borderRadius: 8 }} />
                </div>

                {/* The Hard CTA Override */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(8, 12, 24, 0.6)' }}>
                    <div style={{ background: '#1e293b', padding: 40, borderRadius: 24, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <div style={{ width: 64, height: 64, background: 'rgba(99, 102, 241, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <span style={{ fontSize: '1.8rem' }}>🔒</span>
                        </div>
                        <h2 style={{ fontSize: '1.6rem', marginBottom: 12, fontWeight: 700 }}>Unlock Your Improvement Plan</h2>
                        <p style={{ color: '#94a3b8', marginBottom: 32, maxWidth: 320, margin: '0 auto 32px' }}>
                            Save your diagnosis permanently and join 500+ aspirants fixing their weaknesses daily.
                        </p>
                        <Link href="/register?claim_diagnostic=true" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', textDecoration: 'none', padding: '16px 36px', borderRadius: 12, fontWeight: 700, fontSize: '1.1rem', transition: 'all 0.2s', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)' }}>
                            Claim Results & Fix {result.weakestChapter} →
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
}
