'use client';
import { Icon } from '@/components/ui/Icon';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Button, Badge, Skeleton } from '@/components/ui';
import { resilientStorage, STORAGE_KEYS } from '@/lib/storage-resilient';

function DiagnosticComponent() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [limitReached, setLimitReached] = useState(false);
    const [answers, setAnswers] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const challengerScore = searchParams.get('c_score');
    const challengerChap = searchParams.get('c_chap');
    const challengerGhost = searchParams.get('c_ghost');

    useEffect(() => {
        const fetchTest = async () => {
            try {
                let fp = await resilientStorage.get(STORAGE_KEYS.DIAGNOSTIC_FP);
                if (!fp) {
                    fp = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    await resilientStorage.set(STORAGE_KEYS.DIAGNOSTIC_FP, fp);
                }

                const res = await fetch('/api/tests/diagnostic/generate', {
                    method: 'POST',
                    headers: {
                        'x-device-print': fp
                    }
                });
                
                const data = await res.json();
                if (!res.ok) {
                    if (data.limitReached) setLimitReached(true);
                    throw new Error(data.error || 'Failed to initialize system.');
                }
                
                setQuestions(data.questions);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTest();
    }, []);

    const handleAnswerSelect = (opt) => {
        setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: opt }));
        if (currentIndex < questions.length - 1) {
            setTimeout(() => setCurrentIndex(c => c + 1), 300);
        }
    };

    const handleDiagnosticSubmit = async () => {
        if (Object.keys(answers).length === 0) return;
        setSubmitting(true);
        try {
            const payloadData = { 
                answers,
                c_score: challengerScore,
                c_chap: challengerChap,
                c_ghost: challengerGhost
            };

            const verifyRes = await fetch('/api/tests/diagnostic/grade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadData)
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
                await resilientStorage.set(STORAGE_KEYS.PENDING_DIAGNOSTIC, JSON.stringify({
                    scoreData: verifyData.grade,
                    signature: verifyData.signature
                }));
                window.location.href = '/test/diagnostic/results';
            } else {
                throw new Error(verifyData.error || "Grading failed");
            }
        } catch (err) {
            alert('Failed to process answers: ' + err.message);
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
            <div className="spinner" style={{ width: 50, height: 50, marginBottom: 24 }}></div>
            <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Preparing your test...</h2>
            <p >Picking 15 questions across all subjects</p>
        </div>
    );

    if (limitReached) return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
            <Card style={{ maxWidth: 500, textAlign: 'center', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <h2 style={{ fontWeight: 800, marginBottom: 12 }}><Icon name="Star" size={16} /> You've unlocked today's free diagnostics!</h2>
                <p style={{ marginBottom: 0, }}>Create a free account to get unlimited tests, track your progress, and get AI-powered study plans.</p>
                <Button variant="primary" style={{ width: '100%' }} onClick={() => window.location.href = '/login'}>Sign Up Free</Button>
            </Card>
        </div>
    );

    if (error) return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
            <Card style={{ maxWidth: 500, textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <h2 style={{ fontWeight: 800, marginBottom: 12 }}>Something went wrong</h2>
                <p style={{ marginBottom: 0, }}>{error}</p>
                <Button variant="primary" onClick={() => window.location.reload()}>Try Again</Button>
            </Card>
        </div>
    );

    if (questions.length === 0) return null;

    const currentQ = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;

    return (
        <div className="page" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', justifyContent: 'center', padding: '40px 16px' }}>
            <div style={{ maxWidth: 800, width: '100%' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, borderBottom: '1px solid var(--border)', paddingBottom: 20 }}>
                    <div>
                        <span style={{ fontWeight: 700, letterSpacing: 1, }}>
                            {challengerScore ? 'CHALLENGE ACCEPTED' : 'QUICK DIAGNOSTIC'}                        </span>
                        <h1 style={{ margin: 0, marginTop: 4, fontWeight: 800 }}>
                            {challengerScore ? `Your friend scored ${challengerScore}% in ${challengerChap || 'Biology'}. Try to beat it.` : 'Find Your Weakest Chapter'}
                        </h1>
                    </div>
                    <Badge variant="secondary" style={{ fontWeight: 600 }}>
                        {currentIndex + 1} <span >/ {questions.length}</span>
                    </Badge>
                </div>

                <Card style={{ padding: 32, marginBottom: 0, }}>
                    {currentQ.is_ai_generated === 1 && (
                        <Badge variant="accent" style={{ marginBottom: 0, }}>
                            ✨ AI Generated Target
                        </Badge>
                    )}
                    
                    <h2 style={{ lineHeight: 1.6, marginBottom: 32, fontWeight: 500, }}>{currentQ.text}</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {['A', 'B', 'C', 'D'].map((optKey) => {
                            const optValue = currentQ[`option_${optKey.toLowerCase()}`];
                            const isSelected = answers[currentQ.id] === optKey;
                            
                            return (
                                <Button
                                    key={optKey}
                                    onClick={() => handleAnswerSelect(optKey)}
                                    variant="ghost"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                                        background: isSelected ? 'var(--bg-glass-hover)' : 'var(--bg-card)',
                                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                                        cursor: 'pointer', transition: 'all 0.2s ease',
                                        textAlign: 'left', outline: 'none',
                                        width: '100%'
                                    }}
                                >
                                    <div style={{ 
                                        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: isSelected ? 'var(--primary)' : 'var(--bg-glass)', 
                                        
                                        fontWeight: 600, flexShrink: 0
                                    }}>
                                        {optKey}
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'left' }}>{optValue}</div>
                                </Button>
                            );
                        })}
                    </div>
                </Card>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button 
                        variant="secondary"
                        onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
                        disabled={currentIndex === 0}
                    >
                        ← Back
                    </Button>

                    {isLast ? (
                        <Button 
                            variant="accent"
                            onClick={handleDiagnosticSubmit}
                            disabled={submitting || !answers[currentQ.id]}
                            loading={submitting}
                        >
                            See My Results →
                        </Button>
                    ) : (
                        <Button 
                            variant="primary"
                            onClick={() => setCurrentIndex(c => c + 1)}
                            disabled={!answers[currentQ.id]}
                        >
                            Next →
                        </Button>
                    )}
                </div>

            </div>
        </div>
    );
}

export default function DiagnosticTestEngine() {
    return (
        <Suspense fallback={<div className="page" style={{ minHeight: 'calc(100vh - 64px)' }}></div>}>
            <DiagnosticComponent />
        </Suspense>
    );
}
