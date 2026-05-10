'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, Badge, Skeleton } from '@/components/ui';

export default function ResultsPage({ params }) {
    const { id: testId } = use(params);
    const router = useRouter();
    const [results, setResults] = useState(null);
    const [showExplanation, setShowExplanation] = useState({});

    useEffect(() => {
        const stored = sessionStorage.getItem('testResults');
        if (stored) {
            setResults(JSON.parse(stored));
            // Trigger interstitial ad on mobile app (natural pause point after test)
            // Only fires inside the Flutter WebView — no-op on desktop browsers
            if (typeof window.showInterstitialAd === 'function') {
                setTimeout(() => window.showInterstitialAd(), 1500);
            }
            return;
        }
        window.location.href = '/dashboard';
    }, [router]);

    if (!results) return (
        <div className="page" style={{ maxWidth: 900, margin: '0 auto', minHeight: 'calc(100vh - 64px)' }}>
            <Card style={{ marginBottom: '24px', textAlign: 'center', padding: '40px' }}>
                <Skeleton style={{ width: '120px', height: '60px', margin: '0 auto 16px' }} />
                <Skeleton style={{ width: '80px', height: '24px', margin: '0 auto 32px' }} />
                <Skeleton style={{ height: '12px', width: '100%', marginBottom: '32px' }} />
                <div className="grid grid-4"><Skeleton style={{ height: '80px' }} /><Skeleton style={{ height: '80px' }} /><Skeleton style={{ height: '80px' }} /><Skeleton style={{ height: '80px' }} /></div>
            </Card>
        </div>
    );

    const { score, xpEarned, level, answers, referralRewardUnlocked } = results;

    const toggleExplanation = (idx) => {
        setShowExplanation(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    return (
        <div className="page">
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                {/* Score Display */}
                <Card className="animate-fade-in-up" style={{ marginBottom: '24px', padding: '40px 24px' }}>
                    <div className="score-display" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{score.scaledScore}</div>
                        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginTop: '8px' }}>out of 720</div>

                        {/* Result bar */}
                        <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', margin: '32px 0 24px' }}>
                            <div style={{ flex: score.correct, background: 'var(--success)' }}></div>
                            <div style={{ flex: score.incorrect, background: 'var(--danger)' }}></div>
                            <div style={{ flex: score.unanswered, background: 'var(--border)' }}></div>
                        </div>

                        <div className="grid grid-4" style={{ gap: '16px' }}>
                            <Card style={{ padding: '16px', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{score.correct}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Correct (+{score.correct * 4})</div>
                            </Card>
                            <Card style={{ padding: '16px', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)' }}>{score.incorrect}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Incorrect (-{score.incorrect})</div>
                            </Card>
                            <Card style={{ padding: '16px', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{score.unanswered}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Unanswered</div>
                            </Card>
                            <Card style={{ padding: '16px', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{score.accuracy}%</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Accuracy</div>
                            </Card>
                        </div>
                    </div>
                </Card>

                {/* DOPAMINE UI: Referral Reward Loop */}
                {referralRewardUnlocked && (
                    <Card className="animate-fade-in-up" style={{
                        marginBottom: '24px', padding: '24px', textAlign: 'center',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
                        border: '1px solid rgba(168,85,247,0.4)',
                    }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                            🎉 Referral Validated!
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '1.1rem' }}>
                            You and your friend both earned <strong style={{ color: 'var(--success)' }}>+20 Trust Score</strong> and unlocked <strong style={{ color: 'var(--primary)' }}>24h of Premium AI!</strong>
                        </p>
                        
                        <Badge variant="accent" style={{ padding: '8px 16px', fontSize: '0.95rem' }}>
                            🔥 Invite 3 more friends → Unlock 7 days premium!
                        </Badge>
                    </Card>
                )}

                {/* XP & Level */}
                <div className="grid grid-2" style={{ marginBottom: '24px' }}>
                    <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⭐</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>+{xpEarned} XP</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Experience Earned</div>
                    </Card>
                    <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎖️</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>Level {level.level}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{level.name}</div>
                    </Card>
                </div>

                {/* Habit Retention Cycle: XP Progression Trigger */}
                <Card style={{ padding: '16px', marginBottom: '24px', textAlign: 'center', background: 'var(--bg-glass)' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>
                        You are extremely close to Level {level.level + 1}. <span style={{ color: 'var(--primary)' }}>Take 1 more test to rank up!</span>
                    </p>
                </Card>

                {/* Habit Retention Cycle: Next-Action Contiguous Testing */}
                <Card style={{ padding: '32px', marginBottom: '24px', textAlign: 'center', background: 'var(--bg-glass)', border: '1px solid var(--primary-dark)' }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>🧠 Keep the Momentum Going</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem' }}>Your physics logic starts decaying when you only focus on Biology. Maintain your All-India rank streak.</p>
                    <Link href="/test/configure">
                        <Button variant="accent" size="lg">
                            Switch Physics Weaknesses Now →
                        </Button>
                    </Link>
                </Card>

                {/* MD Transparency: Trust Status Hint */}
                {results.trustHint && (
                    <Card className="animate-fade-in" style={{
                        marginBottom: '24px', padding: '16px 24px',
                        background: results.trustHint.severity === 'success' ? 'rgba(34,197,94,0.05)' : results.trustHint.severity === 'warning' ? 'rgba(245,158,11,0.05)' : 'rgba(239,68,68,0.05)',
                        border: `1px solid ${results.trustHint.severity === 'success' ? 'rgba(34,197,94,0.2)' : results.trustHint.severity === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                        <p style={{ margin: 0, color: results.trustHint.severity === 'success' ? 'var(--success)' : results.trustHint.severity === 'warning' ? 'var(--warning)' : 'var(--danger)', fontSize: '0.95rem', fontWeight: 600 }}>
                            {results.trustHint.severity === 'success' ? '🌟' : results.trustHint.severity === 'warning' ? '⚠️' : '🔒'} {results.trustHint.message}
                        </p>
                    </Card>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                    <Link href="/test/configure"><Button variant="primary">📝 Take Another Test</Button></Link>
                    <Link href="/analytics"><Button variant="secondary">📊 View Analytics</Button></Link>
                    <Link href="/dashboard"><Button variant="secondary">🏠 Dashboard</Button></Link>
                    <Button
                        variant="success"
                        onClick={() => {
                            const text = `I just scored ${score.scaledScore}/720 on my AI NEET Mock Test! 🚀\n\nCheck out my scorecard and rank prediction here:\nhttps://aineetcoach.com/test/${testId}/share`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        style={{ marginLeft: 'auto' }}
                    >
                        📱 Share to WhatsApp
                    </Button>
                </div>

                {/* Answer Review */}
                <div style={{ marginBottom: '80px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>📋 Answer Review</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {answers.map((a, idx) => (
                            <div key={idx} className="animate-fade-in" style={{ animationDelay: `${Math.min(idx * 0.03, 0.5)}s` }}>
                                <Card style={{ padding: '24px', background: 'var(--bg-glass)', border: `1px solid ${a.is_correct ? 'rgba(16,185,129,0.3)' : a.selected_option ? 'rgba(239,68,68,0.3)' : 'var(--border)'}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <Badge variant="secondary" style={{ fontWeight: 700 }}>Question {idx + 1}</Badge>
                                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: a.is_correct ? 'var(--success)' : a.selected_option ? 'var(--danger)' : 'var(--text-muted)' }}>
                                            {a.is_correct ? '✓ Correct (+4)' : a.selected_option ? '✗ Incorrect (-1)' : '— Skipped (0)'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '20px', lineHeight: 1.6 }}>{a.text}</p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {[
                                            { key: 'A', text: a.option_a },
                                            { key: 'B', text: a.option_b },
                                            { key: 'C', text: a.option_c },
                                            { key: 'D', text: a.option_d },
                                        ].map(opt => {
                                            const isCorrectAnswer = opt.key === a.correct_option;
                                            const isSelectedWrong = opt.key === a.selected_option && !a.is_correct;
                                            
                                            return (
                                                <div key={opt.key} style={{
                                                    display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px',
                                                    background: isCorrectAnswer ? 'rgba(16,185,129,0.1)' : isSelectedWrong ? 'rgba(239,68,68,0.1)' : 'var(--bg-card)',
                                                    border: `1px solid ${isCorrectAnswer ? 'rgba(16,185,129,0.3)' : isSelectedWrong ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                                                    borderRadius: 'var(--radius-md)'
                                                }}>
                                                    <div style={{
                                                        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: isCorrectAnswer ? 'var(--success)' : isSelectedWrong ? 'var(--danger)' : 'var(--bg-glass)',
                                                        color: isCorrectAnswer || isSelectedWrong ? '#fff' : 'var(--text-secondary)',
                                                        borderRadius: '50%', fontSize: '0.8rem', fontWeight: 700
                                                    }}>
                                                        {opt.key}
                                                    </div>
                                                    <span style={{ flex: 1, fontSize: '0.95rem', color: isCorrectAnswer ? 'var(--success)' : isSelectedWrong ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: isCorrectAnswer || isSelectedWrong ? 600 : 400 }}>{opt.text}</span>
                                                    {isCorrectAnswer && <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}>✓ Correct</span>}
                                                    {isSelectedWrong && <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)' }}>Your answer</span>}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div style={{ marginTop: '20px' }}>
                                        <Button variant="outline" size="sm" onClick={() => toggleExplanation(idx)}>
                                            {showExplanation[idx] ? '🔽 Hide Explanation' : '💡 Show Explanation'}
                                        </Button>
                                    </div>

                                    {showExplanation[idx] && (
                                        <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>💡 Explanation</h4>
                                            {a.explanation ? (
                                                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{a.explanation}</p>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No specific explanation available.</p>
                                                    <Link href={`/doubts?q=${encodeURIComponent('Please explain this NEET question: ' + a.text + ' The correct option is ' + a.correct_option)}`}>
                                                        <Button variant="secondary" size="sm">
                                                            🤖 Ask AI Coach to Explain
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
