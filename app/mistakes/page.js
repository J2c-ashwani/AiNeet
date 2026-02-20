'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function MistakesPage() {
    const router = useRouter();
    const [mistakes, setMistakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch('/api/auth/me').then(r => r.json()).then(auth => {
            if (!auth.user) { router.push('/login'); return; }
            setUser(auth.user);
            fetch('/api/performance').then(r => r.json()).then(data => {
                setMistakes(data.weakAreas || []);
                setLoading(false);
            });
        }).catch(() => router.push('/login'));
    }, [router]);

    const handleExportPDF = async () => {
        setExporting(true);
        try {
            const res = await fetch('/api/mistakes/export');
            if (res.status === 403) {
                const data = await res.json();
                if (data.locked) { setShowLockModal(true); return; }
            }
            if (!res.ok) { const d = await res.json(); alert(d.error); return; }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'NEET_Mistakes.pdf'; a.click();
            URL.revokeObjectURL(url);
        } catch (e) { alert('Failed to export PDF'); }
        finally { setExporting(false); }
    };

    if (loading) return (
        <div className="loading-overlay" style={{ minHeight: '100vh' }}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
        </div>
    );

    return (
        <div>
            <Navbar />

            <div className="page" style={{ maxWidth: 800 }}>
                <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 className="page-title">📓 Mistake Notebook</h1>
                        <p className="page-subtitle">Your weak areas and repeated mistakes — focus here for maximum improvement</p>
                    </div>
                    {mistakes.length > 0 && (
                        <button onClick={handleExportPDF} disabled={exporting} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                            {exporting ? '⏳ Generating PDF...' : '📄 Download PDF'}
                        </button>
                    )}
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

            {/* Referral Lock Modal for PDF Export */}
            {showLockModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '40px', maxWidth: '500px', width: '100%', textAlign: 'center', position: 'relative' }}>
                        <button onClick={() => setShowLockModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📄</div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>PDF Export Locked</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>Refer 2 friends to unlock unlimited Mistake Notebook PDF exports for last-minute revision.</p>
                        <button
                            onClick={() => {
                                const text = `I'm preparing for NEET 2026 with AI NEET Coach! 🧠\n\nJoin me: https://aineetcoach.com/register?ref=${user?.referral_code || ''}`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            className="btn btn-success btn-lg w-full"
                            style={{ fontSize: '1.1rem', padding: '14px', fontWeight: 700 }}
                        >
                            📱 Share via WhatsApp
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
