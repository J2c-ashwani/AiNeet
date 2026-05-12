'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { openWhatsAppShare } from '@/lib/utils/whatsapp';
import { EmptyState } from '@/components/ui/EmptyState';
import { MistakeCardsSkeleton } from '@/components/skeletons';
import { NotebookPen, Download, Share2, Loader2 } from 'lucide-react';

export default function MistakesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [mistakes, setMistakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);

    useEffect(() => {
        fetch('/api/performance').then(r => r.json()).then(data => {
            setMistakes(data.weakAreas || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

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

    if (loading) return <MistakeCardsSkeleton count={4} />;

    return (
        <div>
            

            <div className="page" style={{ maxWidth: 800 }}>
                <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <NotebookPen size={22} style={{ color: 'var(--accent-secondary)' }} aria-hidden="true" />
                            <h1 className="page-title" style={{ margin: 0 }}>Mistake Notebook</h1>
                        </div>
                        <p className="page-subtitle">Your weak areas and repeated mistakes — focus here for maximum improvement</p>
                    </div>
                    {mistakes.length > 0 && (
                        <button onClick={handleExportPDF} disabled={exporting} className="btn btn-primary" style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '7px' }}>
                            {exporting
                                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" /> Generating PDF...</>
                                : <><Download size={15} aria-hidden="true" /> Download PDF</>
                            }
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
                    <EmptyState type="mistakes" />
                )}
            </div>

            {/* Referral Lock Modal for PDF Export */}
            {showLockModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '40px', maxWidth: '500px', width: '100%', textAlign: 'center', position: 'relative' }}>
                        <button onClick={() => setShowLockModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(124,77,255,0.12)', border: '1.5px solid rgba(124,77,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Download size={28} style={{ color: 'var(--accent-secondary)' }} aria-hidden="true" />
                            </div>
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>PDF Export Locked</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>Refer 2 friends to unlock unlimited Mistake Notebook PDF exports for last-minute revision.</p>
                        <button
                            onClick={() => {
                                const text = `I'm preparing for NEET 2026 with AI NEET Coach!\n\nJoin me: https://aineetcoach.com/register?ref=${user?.referral_code || ''}`;
                                openWhatsAppShare(text);
                            }}
                            className="btn btn-success btn-lg w-full"
                            style={{ fontSize: '1.1rem', padding: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <Share2 size={18} aria-hidden="true" /> Share via WhatsApp
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
