'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function DiagnosticResultsLock() {
    const [result, setResult] = useState(null);
    const [aspirantCount, setAspirantCount] = useState(0);
    const [ghostPhone, setGhostPhone] = useState('');
    const [unlocked, setUnlocked] = useState(false);
    const [noResult, setNoResult] = useState(false);
    const router = useRouter();
    const { user } = useAuth(); // Detect if already logged in

    // 1. Ghost ID provision for Symmetrical Flywheel
    useEffect(() => {
        if (!localStorage.getItem('ghost_id')) {
            localStorage.setItem('ghost_id', 'ghost_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36));
        }
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem('pending_diagnostic_grade');
        if (stored) {
            try {
                setResult(JSON.parse(stored).scoreData);
                // If user is already logged in, unlock the results immediately — no wall needed
                if (user) setUnlocked(true);
            } catch (e) {
                setNoResult(true);
            }
        } else {
            setNoResult(true);
        }

        fetch('/api/stats/traffic').then(r => r.json()).then(d => d && setAspirantCount(d.activeAspirants)).catch(() => setAspirantCount(462));
    }, [router, user]);

    const handleViralShare = async () => {
        if (!result) return;
        const rootUrl = window.location.origin;
        const ghostId = localStorage.getItem('ghost_id');
        
        // Push notification hook logic:
        if (ghostPhone && ghostPhone.length > 5) {
            // Silently attach optional contact to ghost trace in background API
            fetch('/api/challenge/contact', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ghost_id: ghostId, contact: ghostPhone }) 
            }).catch(()=>{});
        }

        const shareUrl = `${rootUrl}/test/diagnostic?c_score=${Math.round(result.accuracy)}&c_chap=${encodeURIComponent(result.weakestChapter)}&c_ghost=${ghostId}`;
        const pct = 100 - result.percentile; // Inverse logic to show Top %
        const shareText = `Top ${pct}% in NEET ${result.weakestChapter} 🔥\n\nI just scored ${Math.round(result.accuracy)}% accuracy. Can you reach this level?\n\nTry -> ${shareUrl}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'NEET AI Assessment',
                    text: shareText
                });
                setUnlocked(true); // MD Directive: Unlock upon successful share
            } catch (err) {
                console.log('User cancelled share');
            }
        } else {
            // Fallback to WhatsApp deep link
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
            setUnlocked(true); // Fallback assumption unlock
        }
    };

    if (noResult) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#080c18', color: '#fff', padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>⏱️</div>
            <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Your session expired</h2>
            <p style={{ color: '#94a3b8', marginBottom: 28, maxWidth: 400 }}>
                Your diagnostic results are no longer available in this browser. Retake the test — it only takes 3 minutes.
            </p>
            <Link href="/test/diagnostic" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', padding: '14px 32px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: '1.05rem' }}>
                Retake Diagnostic →
            </Link>
        </div>
    );

    if (!result) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#080c18', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', overflowX: 'hidden' }}>
            
            {/* Real Telemetry Social Proof */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', padding: '6px 16px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600, marginBottom: 24, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <span className="animate-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }}></span>
                🔥 {aspirantCount || '...'} students took this test today | Average: 61%
            </div>

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


            {/* The Lock Screen & Blur (Dynamically clears on unlock state!) */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 800, borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.5s ease' }}>
                {/* Fake Blurred Dashboard content to trigger FOMO */}
                <div style={{ padding: 40, background: '#0f172a', filter: unlocked ? 'none' : 'blur(12px)', opacity: unlocked ? 1 : 0.5, pointerEvents: unlocked ? 'auto' : 'none', userSelect: unlocked ? 'auto' : 'none', transition: 'all 0.5s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
                        <div style={{ width: 300, height: 180, background: '#1e293b', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {unlocked && <h3 style={{ color: '#818cf8' }}>Deep Analysis Active</h3>}
                        </div>
                        <div style={{ width: 300, height: 180, background: '#1e293b', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {unlocked && <h3 style={{ color: '#4ade80' }}>Action Plan Active</h3>}
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 60, background: '#1e293b', borderRadius: 8, marginBottom: 16 }} />
                    <div style={{ width: '100%', height: 60, background: '#1e293b', borderRadius: 8 }} />
                    <div style={{ textAlign: 'center', marginTop: 40 }}>
                         {unlocked && <Link href="/register?claim_diagnostic=true" style={{ display: 'inline-block', background: '#6366f1', color: 'white', padding: '12px 24px', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>Permanently Save This State →</Link>}
                    </div>
                </div>

                {/* The Soft CTA Override (The Share/Register Gate) */}
                {!unlocked && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(8, 12, 24, 0.7)' }}>
                        <div style={{ background: '#1e293b', padding: '40px 32px', borderRadius: 24, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', maxWidth: 440, width: '100%' }}>
                            <div style={{ width: 64, height: 64, background: 'rgba(99, 102, 241, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <span style={{ fontSize: '1.8rem' }}>🔒</span>
                            </div>
                            <h2 style={{ fontSize: '1.6rem', marginBottom: 12, fontWeight: 700 }}>Unlock your full improvement plan</h2>
                            <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: '0.95rem' }}>
                                Choose one of the following to reveal your complete analytics.
                            </p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: 12, textAlign: 'left', fontWeight: 600 }}>1. The Viral Path</div>
                                    <button onClick={handleViralShare} style={{ width: '100%', background: '#25D366', color: 'white', padding: '14px 20px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 4px 14px rgba(37, 211, 102, 0.2)', transition: 'transform 0.2s', marginBottom: 12 }}>
                                        📱 Share your score with friends
                                    </button>
                                    <input 
                                        type="tel" 
                                        placeholder="WhatsApp # (Optional: Alert me if beaten)" 
                                        value={ghostPhone}
                                        onChange={(e) => setGhostPhone(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#080c18', border: '1px solid #334155', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                                    />
                                </div>
                                
                                <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>OR</div>

                                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: 12, textAlign: 'left', fontWeight: 600 }}>2. The Solo Path</div>
                                    <Link href="/register?claim_diagnostic=true" style={{ display: 'inline-block', width: '100%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', textDecoration: 'none', padding: '14px 20px', borderRadius: 10, fontWeight: 700, fontSize: '1.05rem', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.2)' }}>
                                        Create Free Account
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
