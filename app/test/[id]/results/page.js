'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, Badge, Skeleton } from '@/components/ui';
import { TrustBadge } from '@/components/trust/TrustBadge';
import { openWhatsAppShare } from '@/lib/utils/whatsapp';

export default function ResultsPage({ params }) {
    const { id: testId } = use(params);
    const router = useRouter();
    const [results, setResults] = useState(null);
    const [showExplanation, setShowExplanation] = useState({});

    useEffect(() => {
        const stored = sessionStorage.getItem('testResults');
        if (stored) {
            setResults(JSON.parse(stored));
            if (typeof window.showInterstitialAd === 'function') {
                setTimeout(() => window.showInterstitialAd(), 1500);
            }
            return;
        }
        window.location.href = '/dashboard';
    }, [router]);

    if (!results) return (
        <div className="page results-wrapper" style={{ minHeight: 'calc(100vh - 64px)' }}>
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

    // Severity → background/border helper (dynamic, kept in JS)
    function trustCardStyle(severity) {
        const map = {
            success: { bg: 'rgba(34,197,94,0.05)', border: 'rgba(34,197,94,0.2)' },
            warning: { bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.2)' },
            danger:  { bg: 'rgba(239,68,68,0.05)',  border: 'rgba(239,68,68,0.2)' },
        };
        const s = map[severity] || map.danger;
        return { background: s.bg, border: `1px solid ${s.border}` };
    }
    function trustMsgColor(severity) {
        const map = { success: 'var(--success)', warning: 'var(--warning)', danger: 'var(--danger)' };
        return map[severity] || 'var(--danger)';
    }

    return (
        <div className="page">
            <div className="results-wrapper">

                {/* Score Display */}
                <Card className="animate-fade-in-up" style={{ marginBottom: '24px', padding: '40px 24px' }}>
                    <div className="results-score-section">
                        <div className="results-score-value">{score.scaledScore}</div>
                        <div className="results-score-label">out of 720</div>

                        <div className="results-bar">
                            <div className="results-bar-correct" style={{ flex: score.correct }} />
                            <div className="results-bar-incorrect" style={{ flex: score.incorrect }} />
                            <div className="results-bar-unanswered" style={{ flex: score.unanswered }} />
                        </div>

                        <div className="grid grid-4" style={{ gap: '16px' }}>
                            <Card className="results-mini-card">
                                <div className="results-mini-value" style={{ color: 'var(--success)' }}>{score.correct}</div>
                                <div className="results-mini-label">Correct (+{score.correct * 4})</div>
                            </Card>
                            <Card className="results-mini-card">
                                <div className="results-mini-value" style={{ color: 'var(--danger)' }}>{score.incorrect}</div>
                                <div className="results-mini-label">Incorrect (-{score.incorrect})</div>
                            </Card>
                            <Card className="results-mini-card">
                                <div className="results-mini-value" style={{ color: 'var(--text-secondary)' }}>{score.unanswered}</div>
                                <div className="results-mini-label">Unanswered</div>
                            </Card>
                            <Card className="results-mini-card">
                                <div className="results-mini-value" style={{ color: 'var(--accent-primary)' }}>{score.accuracy}%</div>
                                <div className="results-mini-label">Accuracy</div>
                            </Card>
                        </div>
                    </div>
                </Card>

                {/* Referral Reward */}
                {referralRewardUnlocked && (
                    <Card className="animate-fade-in-up results-referral-card">
                        <h3 className="results-referral-title">🎉 Referral Validated!</h3>
                        <p className="results-referral-body">
                            You and your friend both earned <strong style={{ color: 'var(--success)' }}>+20 Trust Score</strong> and unlocked <strong style={{ color: 'var(--accent-primary)' }}>24h of Premium AI!</strong>
                        </p>
                        <Badge variant="accent" style={{ padding: '8px 16px', fontSize: '0.95rem' }}>
                            🔥 Invite 3 more friends → Unlock 7 days premium!
                        </Badge>
                    </Card>
                )}

                {/* XP & Level */}
                <div className="grid grid-2 results-xp-cards">
                    <Card className="results-xp-card">
                        <div className="results-xp-icon">⭐</div>
                        <div className="results-xp-value">+{xpEarned} XP</div>
                        <div className="results-xp-label">Experience Earned</div>
                    </Card>
                    <Card className="results-xp-card">
                        <div className="results-xp-icon">🎖️</div>
                        <div className="results-xp-value">Level {level.level}</div>
                        <div className="results-xp-label">{level.name}</div>
                    </Card>
                </div>

                {/* Momentum nudge */}
                <Card style={{ padding: '16px', marginBottom: '24px', textAlign: 'center', background: 'var(--bg-glass)' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>
                        You are extremely close to Level {level.level + 1}. <span style={{ color: 'var(--accent-primary)' }}>Take 1 more test to rank up!</span>
                    </p>
                </Card>

                {/* Next-Action */}
                <Card style={{ padding: '32px', marginBottom: '24px', textAlign: 'center', background: 'var(--bg-glass)', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>🧠 Keep the Momentum Going</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem' }}>Your physics logic starts decaying when you only focus on Biology. Maintain your All-India rank streak.</p>
                    <Link href="/test/configure">
                        <Button variant="accent" size="lg">Switch Physics Weaknesses Now →</Button>
                    </Link>
                </Card>

                {/* Trust Status Hint — dynamic severity, kept as inline style */}
                {results.trustHint && (
                    <Card className="animate-fade-in results-trust-card" style={trustCardStyle(results.trustHint.severity)}>
                        <p className="results-trust-msg" style={{ color: trustMsgColor(results.trustHint.severity) }}>
                            {results.trustHint.severity === 'success' ? '🌟' : results.trustHint.severity === 'warning' ? '⚠️' : '🔒'} {results.trustHint.message}
                        </p>
                    </Card>
                )}

                {/* Actions */}
                <div className="results-actions">
                    <Link href="/test/configure"><Button variant="primary">📝 Take Another Test</Button></Link>
                    <Link href="/analytics"><Button variant="secondary">📊 View Analytics</Button></Link>
                    <Link href="/dashboard"><Button variant="secondary">🏠 Dashboard</Button></Link>
                    <Button
                        variant="success"
                        className="results-share-btn"
                        onClick={() => {
                            const text = `I just scored ${score.scaledScore}/720 on my AI NEET Mock Test! 🚀\n\nCheck out my scorecard and rank prediction here:\nhttps://aineetcoach.com/test/${testId}/share`;
                            openWhatsAppShare(text);
                        }}
                    >
                        📱 Share to WhatsApp
                    </Button>
                </div>

                {/* Answer Review */}
                <div className="results-review-section">
                    <h2 className="results-review-title">📋 Answer Review</h2>
                    <div className="results-review-list">
                        {answers.map((a, idx) => (
                            <div key={idx} className="animate-fade-in" style={{ animationDelay: `${Math.min(idx * 0.03, 0.5)}s` }}>
                                <Card style={{
                                    padding: '24px', background: 'var(--bg-glass)',
                                    border: `1px solid ${a.is_correct ? 'rgba(16,185,129,0.3)' : a.selected_option ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Badge variant="secondary" style={{ fontWeight: 700 }}>Question {idx + 1}</Badge>
                                            {(a.year_asked || a.exam_name) && <TrustBadge type="verified-pyq" />}
                                            {a.is_teacher_reviewed && <TrustBadge type="teacher-reviewed" />}
                                        </div>
                                        <span className={`results-option-tag results-option-tag--${a.is_correct ? 'correct' : a.selected_option ? 'wrong' : ''}`}
                                            style={!a.is_correct && !a.selected_option ? { color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 800 } : { fontSize: '0.9rem', fontWeight: 800 }}>
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
                                            const isCorrect = opt.key === a.correct_option;
                                            const isWrong = opt.key === a.selected_option && !a.is_correct;
                                            const variant = isCorrect ? 'correct' : isWrong ? 'wrong' : 'neutral';

                                            return (
                                                <div key={opt.key} style={{
                                                    display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px',
                                                    background: isCorrect ? 'rgba(16,185,129,0.1)' : isWrong ? 'rgba(239,68,68,0.1)' : 'var(--bg-card)',
                                                    border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : isWrong ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}`,
                                                    borderRadius: 'var(--radius-md)',
                                                }}>
                                                    <div className={`results-option-key results-option-key--${variant}`}>{opt.key}</div>
                                                    <span className={`results-option-label--${variant}`} style={{ flex: 1, fontSize: '0.95rem' }}>{opt.text}</span>
                                                    {isCorrect && <span className="results-option-tag results-option-tag--correct">✓ Correct</span>}
                                                    {isWrong && <span className="results-option-tag results-option-tag--wrong">Your answer</span>}
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
                                        <div className="results-explanation">
                                            <div className="results-explanation-header">
                                                <h4 className="results-explanation-title">💡 Explanation</h4>
                                                {(a.is_ai_generated === 1 || a.ai_confidence) && (
                                                    <TrustBadge type="ai-confidence" meta={{ score: a.ai_confidence || 0.95 }} />
                                                )}
                                            </div>
                                            {a.explanation ? (
                                                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{a.explanation}</p>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No specific explanation available.</p>
                                                    <Link href={`/doubts?q=${encodeURIComponent('Please explain this NEET question: ' + a.text + ' The correct option is ' + a.correct_option)}`}>
                                                        <Button variant="secondary" size="sm">🤖 Ask AI Coach to Explain</Button>
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
