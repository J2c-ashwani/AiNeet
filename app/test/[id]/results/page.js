'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

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
        router.push('/dashboard');
    }, [router]);

    if (!results) return (
        <div className="loading-overlay" style={{ minHeight: '100vh' }}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
        </div>
    );

    const { score, xpEarned, level, answers, referralRewardUnlocked } = results;

    const toggleExplanation = (idx) => {
        setShowExplanation(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    return (
        <div>


            <div className="page" style={{ maxWidth: 900 }}>
                {/* Score Display */}
                <div className="card animate-fade-in-up mb-6">
                    <div className="score-display">
                        <div className="score-big">{score.scaledScore}</div>
                        <div className="score-max">out of 720</div>

                        {/* Result bar */}
                        <div className="result-bar mt-6">
                            <div className="result-bar-correct" style={{ flex: score.correct }}></div>
                            <div className="result-bar-incorrect" style={{ flex: score.incorrect }}></div>
                            <div className="result-bar-unanswered" style={{ flex: score.unanswered }}></div>
                        </div>

                        <div className="flex justify-center gap-6 mt-4">
                            <div className="text-center">
                                <div className="font-bold text-success" style={{ fontSize: '1.3rem' }}>{score.correct}</div>
                                <div className="text-xs text-muted">Correct (+{score.correct * 4})</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-danger" style={{ fontSize: '1.3rem' }}>{score.incorrect}</div>
                                <div className="text-xs text-muted">Incorrect (-{score.incorrect})</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-muted" style={{ fontSize: '1.3rem' }}>{score.unanswered}</div>
                                <div className="text-xs text-muted">Unanswered</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold" style={{ fontSize: '1.3rem', color: 'var(--accent-primary)' }}>{score.accuracy}%</div>
                                <div className="text-xs text-muted">Accuracy</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DOPAMINE UI: Referral Reward Loop */}
                {referralRewardUnlocked && (
                    <div className="mb-6 animate-fade-in-up" style={{
                        padding: '24px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
                        border: '1px solid rgba(168,85,247,0.4)',
                        position: 'relative', overflow: 'hidden', textAlign: 'center'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '12px' }}>
                            🎉 Referral Validated!
                        </h3>
                        <p style={{ color: '#cbd5e1', marginBottom: '20px', fontSize: '1.1rem' }}>
                            You and your friend both earned <strong style={{ color: '#4ade80' }}>+20 Trust Score</strong> and unlocked <strong style={{ color: '#c084fc' }}>24h of Premium AI!</strong>
                        </p>
                        
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', display: 'inline-block' }}>
                            <p style={{ margin: 0, fontWeight: 700, color: '#e2e8f0', fontSize: '0.95rem' }}>
                                🔥 Invite 3 more friends → Unlock 7 days premium!
                            </p>
                        </div>
                    </div>
                )}

                {/* XP & Level */}
                <div className="grid grid-2 gap-4 mb-6 stagger">
                    <div className="stat-card">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-value">+{xpEarned} XP</div>
                        <div className="stat-label">Experience Earned</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎖️</div>
                        <div className="stat-value">Level {level.level}</div>
                        <div className="stat-label">{level.name}</div>
                    </div>
                </div>

                {/* Habit Retention Cycle: XP Progression Trigger */}
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, marginBottom: 24, textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#e0e7ff' }}>
                        You are extremely close to Level {level.level + 1}. <span style={{ color: '#818cf8' }}>Take 1 more test to rank up!</span>
                    </p>
                </div>

                {/* Habit Retention Cycle: Next-Action Contiguous Testing */}
                <div style={{ background: 'linear-gradient(135deg, rgba(8, 12, 24, 0.8), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: 16, padding: 24, marginBottom: 24, textAlign: 'center', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.1)' }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>🧠 Keep the Momentum Going</h3>
                    <p style={{ color: '#94a3b8', marginBottom: 16 }}>Your physics logic starts decaying when you only focus on Biology. Maintain your All-India rank streak.</p>
                    <Link href="/test/configure" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
                        Switch Physics Weaknesses Now →
                    </Link>
                </div>

                {/* MD Transparency: Trust Status Hint */}
                {results.trustHint && (
                    <div className="mb-6 animate-fade-in" style={{
                        padding: '14px 20px', borderRadius: 12,
                        background: results.trustHint.severity === 'success' ? 'rgba(34,197,94,0.08)' : results.trustHint.severity === 'warning' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
                        border: `1px solid ${results.trustHint.severity === 'success' ? 'rgba(34,197,94,0.25)' : results.trustHint.severity === 'warning' ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'}`,
                        color: results.trustHint.severity === 'success' ? '#4ade80' : results.trustHint.severity === 'warning' ? '#fbbf24' : '#f87171',
                        fontSize: '0.85rem', fontWeight: 500
                    }}>
                        {results.trustHint.severity === 'success' ? '🌟' : results.trustHint.severity === 'warning' ? '⚠️' : '🔒'} {results.trustHint.message}
                    </div>
                )}
                {/* Actions */}
                <div className="flex gap-3 mb-6 flex-wrap">
                    <a href="/test/configure" className="btn btn-primary">📝 Take Another Test</a>
                    <a href="/analytics" className="btn btn-secondary">📊 View Analytics</a>
                    <a href="/dashboard" className="btn btn-secondary">🏠 Dashboard</a>
                    <button
                        onClick={() => {
                            const text = `I just scored ${score.scaledScore}/720 on my AI NEET Mock Test! 🚀\n\nCheck out my scorecard and rank prediction here:\nhttps://aineetcoach.com/test/${testId}/share`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="btn btn-success"
                        style={{ marginLeft: 'auto' }}
                    >
                        📱 Share to WhatsApp
                    </button>
                </div>

                {/* Answer Review */}
                <div className="card-flat">
                    <h2 className="mb-4">📋 Answer Review</h2>
                    <div className="flex flex-col gap-4">
                        {answers.map((a, idx) => (
                            <div key={idx} className="animate-fade-in" style={{ animationDelay: `${Math.min(idx * 0.03, 0.5)}s` }}>
                                <div style={{ padding: '16px', background: 'var(--bg-glass)', border: `1px solid ${a.is_correct ? 'rgba(16,185,129,0.3)' : a.selected_option ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)' }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="question-number">Question {idx + 1}</span>
                                        <span className={a.is_correct ? 'text-success font-bold' : a.selected_option ? 'text-danger font-bold' : 'text-muted'}>
                                            {a.is_correct ? '✓ Correct (+4)' : a.selected_option ? '✗ Incorrect (-1)' : '— Skipped (0)'}
                                        </span>
                                    </div>
                                    <p className="text-sm mb-3">{a.text}</p>

                                    <div className="flex flex-col gap-2">
                                        {[
                                            { key: 'A', text: a.option_a },
                                            { key: 'B', text: a.option_b },
                                            { key: 'C', text: a.option_c },
                                            { key: 'D', text: a.option_d },
                                        ].map(opt => {
                                            let cls = '';
                                            if (opt.key === a.correct_option) cls = 'correct';
                                            else if (opt.key === a.selected_option && !a.is_correct) cls = 'incorrect';
                                            return (
                                                <div key={opt.key} className={`option-card ${cls}`} style={{ cursor: 'default', padding: '10px 14px' }}>
                                                    <span className="option-label" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>{opt.key}</span>
                                                    <span className="text-sm">{opt.text}</span>
                                                    {opt.key === a.correct_option && <span className="text-success text-xs">✓ Correct</span>}
                                                    {opt.key === a.selected_option && opt.key !== a.correct_option && <span className="text-danger text-xs">Your answer</span>}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button className="btn btn-ghost btn-sm mt-3" onClick={() => toggleExplanation(idx)}>
                                        {showExplanation[idx] ? '🔽 Hide Explanation' : '💡 Show Explanation'}
                                    </button>

                                    {showExplanation[idx] && (
                                        <div className="explanation-box">
                                            <h4>💡 Explanation</h4>
                                            <p>{a.explanation || 'No explanation available.'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
