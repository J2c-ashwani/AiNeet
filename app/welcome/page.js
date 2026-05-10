'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, Button } from '@/components/ui';

export default function WelcomePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    const firstName = user?.name?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'there';

    useEffect(() => {
        // If already onboarded (DB flag via user object or localStorage cache), skip
        if (typeof window !== 'undefined') {
            if (localStorage.getItem('onboarding_complete') === 'true') {
                router.replace('/');
                return;
            }
        }
        if (user?.onboarding_completed) {
            localStorage.setItem('onboarding_complete', 'true');
            router.replace('/');
        }
    }, [router, user]);

    const handleStartDiagnostic = async () => {
        // Mark onboarding complete in both localStorage (instant) and DB (persistent)
        localStorage.setItem('onboarding_complete', 'true');
        try {
            await fetch('/api/user/complete-onboarding', { method: 'POST' });
        } catch (e) {
            // Non-blocking — localStorage is the fallback
        }
        router.push('/test/diagnostic');
    };

    const handleSkip = async () => {
        localStorage.setItem('onboarding_complete', 'true');
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

    if (authLoading) {
        return (
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
        );
    }

    return (
        <div className="page" style={{
            maxWidth: '520px',
            margin: '0 auto',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '40px 20px 120px',
        }}>
            {/* Progress dots */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '48px' }}>
                {[0, 1].map(i => (
                    <div
                        key={i}
                        style={{
                            width: step === i ? '32px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
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
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👋</div>
                            <h1 style={{
                                fontSize: '2rem', fontWeight: 800,
                                color: 'var(--text-primary)', marginBottom: '12px', lineHeight: 1.2,
                            }}>
                                Welcome, {firstName}!
                            </h1>
                            <p style={{
                                fontSize: '1.05rem', color: 'var(--text-secondary)',
                                lineHeight: 1.6, maxWidth: '380px', margin: '0 auto',
                            }}>
                                Let's find your weakest NEET chapter in just 5 minutes.
                            </p>
                        </div>

                        {/* Quick value cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                            {[
                                { icon: '🔍', title: 'AI finds your weak areas', desc: 'Answer 15 quick questions across all subjects' },
                                { icon: '📋', title: 'Get a personalized plan', desc: 'Know exactly what to study first' },
                                { icon: '📈', title: 'Track your improvement', desc: 'Watch your accuracy grow week by week' },
                            ].map((card, i) => (
                                <Card key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                                }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '10px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.3rem', flexShrink: 0,
                                    }}>
                                        {card.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                                            {card.title}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
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
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚀</div>
                            <h1 style={{
                                fontSize: '2rem', fontWeight: 800,
                                color: 'var(--text-primary)', marginBottom: '12px', lineHeight: 1.2,
                            }}>
                                You're ready!
                            </h1>
                            <p style={{
                                fontSize: '1.05rem', color: 'var(--text-secondary)',
                                lineHeight: 1.6, maxWidth: '380px', margin: '0 auto',
                            }}>
                                Take a quick 5-minute diagnostic test. No prep needed — just answer honestly.
                            </p>
                        </div>

                        <Card style={{
                            padding: '24px', textAlign: 'center', marginBottom: '32px',
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05))',
                            border: '1px solid rgba(99,102,241,0.2)',
                        }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                                After the test, you'll see your <strong style={{ color: 'var(--text-primary)' }}>weakest subject</strong>,{' '}
                                <strong style={{ color: 'var(--text-primary)' }}>estimated level</strong>, and a{' '}
                                <strong style={{ color: 'var(--text-primary)' }}>recommended next step</strong>.
                            </p>
                        </Card>

                        <div style={{
                            display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px', flexWrap: 'wrap',
                        }}>
                            {[
                                { icon: '⚡', label: '5 minutes' },
                                { icon: '📝', label: '15 questions' },
                                { icon: '🎯', label: 'All subjects' },
                            ].map((v, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '8px 14px',
                                    background: 'var(--bg-glass)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)',
                                }}>
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
                        style={{ width: '100%', minHeight: '56px', fontSize: '1.1rem', marginBottom: '12px' }}
                    >
                        Next →
                    </Button>
                ) : (
                    <Button
                        variant="primary" size="lg"
                        onClick={handleStartDiagnostic}
                        style={{ width: '100%', minHeight: '56px', fontSize: '1.1rem', marginBottom: '12px' }}
                    >
                        Start My Diagnostic Test →
                    </Button>
                )}
                <button
                    onClick={handleSkip}
                    style={{
                        width: '100%', padding: '14px', background: 'none',
                        border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem',
                        cursor: 'pointer', fontFamily: 'inherit',
                    }}
                >
                    Skip for now
                </button>
            </div>
        </div>
    );
}
