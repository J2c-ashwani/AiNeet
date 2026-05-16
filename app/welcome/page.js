'use client';
import { Icon } from '@/components/ui/Icon';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { resilientStorage, STORAGE_KEYS } from '@/lib/storage-resilient';
import { Card, Button } from '@/components/ui';

export default function WelcomePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    const firstName = user?.name?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'there';

    useEffect(() => {
        setHasMounted(true);
        const checkOnboarding = async () => {
            if (typeof window !== 'undefined') {
                const complete = await resilientStorage.get(STORAGE_KEYS.ONBOARDING_COMPLETE);
                if (complete === 'true') {
                    router.replace('/');
                    return;
                }
            }
            if (user?.onboarding_completed) {
                await resilientStorage.set(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
                router.replace('/');
            }
        };
        checkOnboarding();
    }, [router, user]);

    const handleStartDiagnostic = async () => {
        // Mark onboarding complete in both resilientStorage (instant) and DB (persistent)
        await resilientStorage.set(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
        try {
            await fetch('/api/user/complete-onboarding', { method: 'POST' });
        } catch (e) {
            // Non-blocking
        }
        router.push('/test/diagnostic');
    };

    const handleSkip = async () => {
        await resilientStorage.set(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
        try {
            await fetch('/api/user/complete-onboarding', { method: 'POST' });
        } catch (e) {}
        router.push('/');
    };

    const goNext = () => {
        setIsExiting(true);
        setTimeout(() => {
            setStep(1);
            setIsExiting(false);
        }, 200);
    };

    if (!hasMounted) return null;

    if (authLoading) {
        return (
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
        );
    }

    return (
        <div className="page" style={{
            maxWidth: 520,
            margin: '0 auto',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '40px 20px 120px',
        }}>
            {/* Progress dots */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 48 }}>
                {[0, 1].map(i => (
                    <div
                        key={i}
                        style={{
                            width: step === i ? 32 : 8,
                            height: 8,
                            background: i <= step ? 'var(--accent-primary)' : 'var(--border-color)',
                            transition: 'all 0.3s ease',
                        }}
                    />
                ))}
            </div>

            {/* Content area */}
            <div style={{
                opacity: isExiting ? 0 : 1,
                transform: isExiting ? 'translateY(10px)' : 'translateY(0)',
                transition: 'all 0.2s ease',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
            }}>
                {step === 0 ? (
                    /* ── Step 1: Welcome ── */
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 32 }}>
                            <div style={{ marginBottom: 20 }}><Icon name="Smile" /></div>
                            <h1 style={{
                                fontWeight: 800,
                                marginBottom: 12, lineHeight: 1.2,
                            }}>
                                Welcome, {firstName}!
                            </h1>
                            <p style={{
                                lineHeight: 1.6, maxWidth: 380, margin: '0 auto',
                            }}>
                                Let's find your weakest NEET chapter in just 5 minutes.
                            </p>
                        </div>

                        {/* Quick value cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                            {[
                                { icon: <Icon name="Search" size={24} />, title: 'AI finds your weak areas', desc: 'Answer 15 quick questions across all subjects' },
                                { icon: <Icon name="FileText" size={24} />, title: 'Get a personalized plan', desc: 'Know exactly what to study first' },
                                { icon: <Icon name="TrendingUp" size={24} />, title: 'Track your improvement', desc: 'Watch your accuracy grow week by week' },
                            ].map((card, i) => (
                                <Card key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 16, padding: 16,
                                }}>
                                    <div style={{
                                        width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        {card.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: 2 }}>
                                            {card.title}
                                        </div>
                                        <div style={{ lineHeight: 1.4 }}>
                                            {card.desc}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </>
                ) : (
                    /* ── Step 2: Ready ── */
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 32 }}>
                            <div style={{ marginBottom: 20 }}><Icon name="Zap" /></div>
                            <h1 style={{
                                fontWeight: 800,
                                marginBottom: 12, lineHeight: 1.2,
                            }}>
                                You're ready!
                            </h1>
                            <p style={{
                                lineHeight: 1.6, maxWidth: 380, margin: '0 auto',
                            }}>
                                Take a quick 5-minute diagnostic test. No prep needed — just answer honestly.
                            </p>
                        </div>

                        <Card style={{
                            padding: 24, textAlign: 'center', marginBottom: 32,
                            border: '1px solid rgba(99,102,241,0.2)',
                        }}>
                            <p style={{ lineHeight: 1.6, margin: 0 }}>
                                After the test, you'll see your <strong >weakest subject</strong>,{' '}
                                <strong >estimated level</strong>, and a{' '}
                                <strong >recommended next step</strong>.
                            </p>
                        </Card>

                        <div style={{
                            display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap',
                        }}>
                            {[
                                { icon: <Icon name="Zap" size={16} />, label: '5 minutes' },
                                { icon: <Icon name="FileText" size={16} />, label: '15 questions' },
                                { icon: <Icon name="Target" size={16} />, label: 'All subjects' },
                            ].map((v, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '8px 14px',
                                    border: '1px solid var(--border-color)',
                                    fontWeight: 600, }}>
                                    <span>{v.icon}</span> {v.label}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Bottom buttons */}
            <div style={{ marginTop: 'auto' }}>
                {step === 0 ? (
                    <Button
                        variant="primary" size="lg"
                        onClick={goNext}
                        style={{ width: '100%', minHeight: 56, marginBottom: 12 }}
                    >
                        Next →
                    </Button>
                ) : (
                    <Button
                        variant="primary" size="lg"
                        onClick={handleStartDiagnostic}
                        style={{ width: '100%', minHeight: 56, marginBottom: 12 }}
                    >
                        Start My Diagnostic Test →
                    </Button>
                )}
                <Button
                    onClick={handleSkip}
                    style={{
                        width: '100%', padding: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                >
                    Skip for now
                </Button>
            </div>
        </div>
    );
}
