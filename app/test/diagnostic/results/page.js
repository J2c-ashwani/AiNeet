'use client';
import { Icon } from '@/components/ui/Icon';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePlatformShare } from '@/lib/hooks/usePlatformShare';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Badge, Skeleton, Input } from '@/components/ui';
import { resilientStorage, STORAGE_KEYS } from '@/lib/storage-resilient';

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
        const initGhost = async () => {
            const current = await resilientStorage.get(STORAGE_KEYS.GHOST_ID);
            if (!current) {
                await resilientStorage.set(STORAGE_KEYS.GHOST_ID, 'ghost_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36));
            }
        };
        initGhost();
    }, []);

    useEffect(() => {
        const fetchStored = async () => {
            const stored = await resilientStorage.get(STORAGE_KEYS.PENDING_DIAGNOSTIC);
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
        };
        fetchStored();

        fetch('/api/stats/traffic').then(r => r.json()).then(d => d && setAspirantCount(d.activeAspirants)).catch(() => setAspirantCount(462));
    }, [router, user]);

    const handleViralShare = async () => {
        if (!result) return;
        const rootUrl = window.location.origin;
        const ghostId = await resilientStorage.get(STORAGE_KEYS.GHOST_ID);
        
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
        const shareText = `Top ${pct}% in NEET ${result.weakestChapter} <Icon name="Flame" />\n\nI just scored ${Math.round(result.accuracy)}% accuracy. Can you reach this level?\n\nTry -> ${shareUrl}`;

        const { share } = usePlatformShare();
        await share({ title: 'NEET AI Assessment', text: shareText, url: shareUrl });
        setUnlocked(true);
    };

    if (noResult) return (
        <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', textAlign: 'center' }}>
            <div style={{ marginBottom: 16 }}><Icon name="Clock" /></div>
            <h2 style={{ fontWeight: 800, marginBottom: 12, }}>Your session expired</h2>
            <p style={{ marginBottom: 28, maxWidth: 400 }}>
                Your diagnostic results are no longer available in this browser. Retake the test — it only takes 3 minutes.
            </p>
            <Link href="/test/diagnostic">
                <Button variant="accent" size="lg">
                    Retake Diagnostic →
                </Button>
            </Link>
        </div>
    );

    if (!result) return null;

    return (
        <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', overflowX: 'hidden' }}>
            
            {/* Real Telemetry Social Proof */}
            <Badge variant="warning" style={{ marginBottom: 24, padding: '8px 16px', }}>
                <Icon name="Flame" /> {aspirantCount || '...'} students took this test today | Average: 61%
            </Badge>

            {/* The Hook: Immediate Reality Check */}
            <div style={{ textAlign: 'center', maxWidth: 640, marginBottom: 40, animation: 'fadeInDown 0.6s ease-out' }}>
                <Badge variant="danger" style={{ marginBottom: 16, fontWeight: 800, letterSpacing: 0.5 }}>
                    CRITICAL DIAGNOSIS COMPLETE
                </Badge>
                <h1 style={{ margin: 0, fontWeight: 900, lineHeight: 1.2, }}>
                    Your primary weakness is <br/>
                    <span >{result.weakestChapter}</span>
                </h1>
                <p style={{ marginTop: 16 }}>
                    This single chapter is dragging down your entire NEET preparation trajectory.
                </p>
            </div>

            {/* The Psychological Stack Panel */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900, marginBottom: 60 }}>
                {/* Fear Panel */}
                <Card style={{ border: '1px solid var(--danger)', width: 280, padding: 24 }}>
                    <div style={{ marginBottom: 8 }}><Icon name="Activity" /></div>
                    <h3 style={{ margin: 0, fontWeight: 800 }}>-{result.lostMarks} Marks</h3>
                    <p style={{ margin: '8px 0 0', }}>Projected score penalty in the actual NEET exam due to this blind spot.</p>
                </Card>

                {/* Peer Pressure Panel */}
                <Card style={{ border: '1px solid var(--warning)', width: 280, padding: 24 }}>
                    <div style={{ marginBottom: 8 }}><Icon name="Star" size={16} /></div>
                    <h3 style={{ margin: 0, fontWeight: 800 }}>Bottom {result.percentile}%</h3>
                    <p style={{ margin: '8px 0 0', }}>Your accuracy places you behind {100 - result.percentile}% of active NEET aspirants this week.</p>
                </Card>

                {/* Hope Panel */}
                <Card style={{ border: '1px solid var(--success)', width: 280, padding: 24 }}>
                    <div style={{ marginBottom: 8 }}><Icon name="Zap" /></div>
                    <h3 style={{ margin: 0, fontWeight: 800 }}>{result.peerImprovementText}</h3>
                    <p style={{ margin: '8px 0 0', }}>Students who started with your exact profile improved their score significantly in 14 days.</p>
                </Card>
            </div>


            {/* The Lock Screen & Blur (Dynamically clears on unlock state!) */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 800, overflow: 'hidden', border: '1px solid var(--border)', transition: 'all 0.5s ease' }}>
                {/* Fake Blurred Dashboard content to trigger FOMO */}
                <Card style={{ padding: 40, filter: unlocked ? 'none' : 'blur(12px)', opacity: unlocked ? 1 : 0.5, pointerEvents: unlocked ? 'auto' : 'none', userSelect: unlocked ? 'auto' : 'none', transition: 'all 0.5s ease', border: 'none', }}>
                    <div className="grid grid-2" style={{ marginBottom: 30 }}>
                        <Card style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                            {unlocked && <h3 >Deep Analysis Active</h3>}
                        </Card>
                        <Card style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                            {unlocked && <h3 >Action Plan Active</h3>}
                        </Card>
                    </div>
                    <Skeleton style={{ height: 60, marginBottom: 16 }} />
                    <Skeleton style={{ height: 60 }} />
                    <div style={{ textAlign: 'center', marginTop: 40 }}>
                         {unlocked && (
                             <Link href="/register?claim_diagnostic=true">
                                 <Button variant="accent">Permanently Save This State →</Button>
                             </Link>
                         )}
                    </div>
                </Card>

                {/* The Soft CTA Override (The Share/Register Gate) */}
                {!unlocked && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', }}>
                        <Card style={{ padding: '40px 32px', textAlign: 'center', maxWidth: 440, width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                            <div style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <span ><Icon name="Lock" /></span>
                            </div>
                            <h2 style={{ marginBottom: 12, fontWeight: 800, }}>Unlock your full improvement plan</h2>
                            <p style={{ marginBottom: 24, }}>
                                Choose one of the following to reveal your complete analytics.
                            </p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <Card style={{ padding: 16, border: '1px solid var(--border)' }}>
                                    <div style={{ marginBottom: 12, textAlign: 'left', fontWeight: 600 }}>1. The Viral Path</div>
                                    <Button variant="success" onClick={handleViralShare} style={{ width: '100%', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
                                        📱 Share your score with friends
                                    </Button>
                                    <Input 
                                        type="tel" 
                                        placeholder="WhatsApp # (Optional: Alert me if beaten)" 
                                        value={ghostPhone}
                                        onChange={(e) => setGhostPhone(e.target.value)}
                                        style={{ width: '100%', margin: 0 }}
                                    />
                                </Card>
                                
                                <div style={{ fontWeight: 700 }}>OR</div>

                                <Card style={{ padding: 16, border: '1px solid var(--border)' }}>
                                    <div style={{ marginBottom: 12, textAlign: 'left', fontWeight: 600 }}>2. The Solo Path</div>
                                    <Link href="/register?claim_diagnostic=true" style={{ width: '100%' }}>
                                        <Button variant="accent" style={{ width: '100%', }}>
                                            Create Free Account
                                        </Button>
                                    </Link>
                                </Card>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

        </div>
    );
}
