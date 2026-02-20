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
            return;
        }
        router.push('/dashboard');
    }, [router]);

    if (!results) return (
        <div className="loading-overlay" style={{ minHeight: '100vh' }}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
        </div>
    );

    const { score, xpEarned, level, answers } = results;

    const toggleExplanation = (idx) => {
        setShowExplanation(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    return (
        <div>
            <nav className="navbar">
                <a href="/dashboard" className="nav-brand" style={{ textDecoration: 'none' }}>
                    <span style={{ fontSize: '1.4rem' }}>🧠</span>
                    <span>AI NEET Coach</span>
                </a>
                <div className="nav-links">
                    <a href="/dashboard">📊 Dashboard</a>
                    <a href="/test/configure">📝 New Test</a>
                    <a href="/analytics">📈 Analytics</a>
                </div>
                <div></div>
            </nav>

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
