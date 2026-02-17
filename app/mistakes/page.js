'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function MistakesPage() {
    const router = useRouter();
    const [mistakes, setMistakes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/auth/me').then(r => r.json()).then(auth => {
            if (!auth.user) { router.push('/login'); return; }
            fetch('/api/performance').then(r => r.json()).then(data => {
                setMistakes(data.weakAreas || []);
                setLoading(false);
            });
        }).catch(() => router.push('/login'));
    }, [router]);

    if (loading) return (
        <div className="loading-overlay" style={{ minHeight: '100vh' }}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
        </div>
    );

    return (
        <div>
            <Navbar />

            <div className="page" style={{ maxWidth: 800 }}>
                <div className="page-header">
                    <h1 className="page-title">📓 Mistake Notebook</h1>
                    <p className="page-subtitle">Your weak areas and repeated mistakes — focus here for maximum improvement</p>
                </div>

                {mistakes.length > 0 ? (
                    <div className="flex flex-col gap-4 stagger">
                        {mistakes.map((m, i) => (
                            <div key={i} className="card" style={{ borderLeft: `3px solid ${m.accuracy < 30 ? 'var(--danger)' : 'var(--warning)'}` }}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm">{m.topic_name}</h3>
                                    <span className={`font-bold ${m.accuracy < 30 ? 'text-danger' : 'text-warning'}`}>{Math.round(m.accuracy)}% accuracy</span>
                                </div>
                                <p className="text-muted text-xs mb-3">{m.chapter_name} • {m.subject_name}</p>
                                <div className="progress-bar" style={{ height: 6 }}>
                                    <div className={`progress-fill ${m.accuracy < 30 ? 'danger' : 'warning'}`} style={{ width: `${m.accuracy}%` }}></div>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-xs text-muted">{m.total_attempted} attempted • {m.total_correct} correct</span>
                                    <a href="/test/configure" className="btn btn-sm btn-secondary">Practice →</a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📓</div>
                        <div className="empty-state-title">No mistakes recorded yet</div>
                        <p className="text-muted text-sm">Take tests and your weak areas will appear here. Focus on improving them for better NEET scores!</p>
                        <a href="/test/configure" className="btn btn-primary mt-4">Take a Test →</a>
                    </div>
                )}
            </div>
        </div>
    );
}
