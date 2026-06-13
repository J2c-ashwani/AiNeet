'use client';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { openWhatsAppShare } from '@/lib/utils/whatsapp';
import { EmptyState } from '@/components/ui/EmptyState';
import { MistakeCardsSkeleton } from '@/components/skeletons';
import { NotebookPen, Download, Share2, Loader2 } from 'lucide-react';

export default function MistakesClient() {
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
                <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <NotebookPen size={22}  aria-hidden="true" />
                            <h1 className="page-title" style={{ margin: 0 }}>Mistake Notebook</h1>
                        </div>
                        <p className="page-subtitle">Your weak areas and repeated mistakes — focus here for maximum improvement</p>
                    </div>
                    {mistakes.length > 0 && (
                        <Button onClick={handleExportPDF} disabled={exporting} className="btn btn-primary" style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 7 }}>
                            {exporting
                                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" /> Generating PDF...</>
                                : <><Download size={15} aria-hidden="true" /> Download PDF</>
                            }
                        </Button>
                    )}
                </div>

                {mistakes.length > 0 ? (
                    <div className="flex flex-col gap-4 stagger">
                        {mistakes.map((m, i) => (
                            <div key={i} className="card" style={{ borderLeft: `3px solid ${m.accuracy < 30 ? 'var(--danger)' : 'var(--warning)'}` }}>
                                <div className="flex items-center justify-between space_mb_2">
                                    <h3 className="text-sm">{m.topic_name}</h3>
                                    <span className={`font-bold ${m.accuracy < 30 ? 'text-danger' : 'text-warning'}`}>{Math.round(m.accuracy)}% accuracy</span>
                                </div>
                                <p className="text-muted text-xs space_mb_3">{m.chapter_name} • {m.subject_name}</p>
                                <div className="progress-bar" style={{ height: 6 }}>
                                    <div className={`progress-fill ${m.accuracy < 30 ? 'danger' : 'warning'}`} style={{ width: `${m.accuracy}%` }}></div>
                                </div>
                                <div className="flex items-center justify-between space_mt_3">
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
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ border: '1px solid var(--border-color)', padding: 40, maxWidth: 500, width: '100%', textAlign: 'center', position: 'relative' }}>
                        <Button onClick={() => setShowLockModal(false)} style={{ position: 'absolute', top: 16, right: 16, border: 'none', cursor: 'pointer' }}>×</Button>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                            <div style={{ width: 64, height: 64, border: '1.5px solid rgba(124,77,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Download size={28}  aria-hidden="true" />
                            </div>
                        </div>
                        <h2 style={{ fontWeight: 800, marginBottom: 12 }}>PDF Export Locked</h2>
                        <p style={{ marginBottom: 24, lineHeight: 1.6 }}>Refer 2 friends to unlock unlimited Mistake Notebook PDF exports for last-minute revision.</p>
                        <Button
                            onClick={() => {
                                const text = `I'm preparing for NEET 2026 with AI NEET Coach!\n\nJoin me: https://aineetcoach.com/register?ref=${user?.referral_code || ''}`;
                                openWhatsAppShare(text);
                            }}
                            className="btn btn-success btn-lg w-full"
                            style={{ padding: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            <Share2 size={18} aria-hidden="true" /> Share via WhatsApp
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
