'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { ScoreTrendChart, SubjectRadarChart } from '@/components/Charts';

export default function AnalyticsPage() {
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        Promise.all([
            fetch('/api/auth/me').then(r => r.json()),
            fetch('/api/performance').then(r => r.json())
        ]).then(([auth, perf]) => {
            if (!auth.user) { router.push('/login'); return; }
            setUser(auth.user);
            setData(perf);
            setLoading(false);
        }).catch(() => router.push('/login'));
    }, [router]);

    if (loading) return (
        <div className="loading-overlay" style={{ minHeight: '100vh' }}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
        </div>
    );

    const { subjectPerformance, chapterStrength, weakAreas, strongAreas, testHistory, overallStats, rankPrediction } = data || {};

    return (
        <div>
            <Navbar />

            <div className="page">
                <div className="page-header">
                    <h1 className="page-title">📈 Performance Analytics</h1>
                    <p className="page-subtitle">Your complete NEET preparation insights</p>
                </div>

                {/* Charts Section */}
                {testHistory && testHistory.length > 0 && (
                    <div className="grid grid-2 gap-6 mb-6">
                        <div className="card">
                            <ScoreTrendChart data={
                                [...testHistory].reverse().map(t => ({
                                    date: t.completed_at,
                                    score: t.score
                                }))
                            } />
                        </div>
                        <div className="card">
                            <SubjectRadarChart data={
                                (subjectPerformance || []).reduce((acc, curr) => ({
                                    ...acc, [curr.name]: curr.avg_accuracy
                                }), {})
                            } />
                        </div>
                    </div>
                )}

                {/* Overall Stats */}
                <div className="grid grid-4 mb-6 stagger">
                    <div className="stat-card">
                        <div className="stat-icon">📝</div>
                        <div className="stat-value">{overallStats?.total_tests || 0}</div>
                        <div className="stat-label">Total Tests</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-value">{overallStats?.avg_accuracy || 0}%</div>
                        <div className="stat-label">Avg Accuracy</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🏅</div>
                        <div className="stat-value">{Math.round(overallStats?.avg_score || 0)}</div>
                        <div className="stat-label">Avg Score / 720</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-value">{Math.round(overallStats?.best_score || 0)}</div>
                        <div className="stat-label">Best Score / 720</div>
                    </div>
                </div>

                {/* Subject Performance */}
                <div className="card mb-6">
                    <h2 className="mb-4">📊 Subject-wise Performance</h2>
                    <div className="flex flex-col gap-4">
                        {(subjectPerformance || []).map(s => (
                            <div key={s.id}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span>{s.icon}</span>
                                        <span className="font-semibold">{s.name}</span>
                                    </div>
                                    <span className="font-bold" style={{ color: s.color }}>{Math.round(s.avg_accuracy)}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{
                                        width: `${Math.round(s.avg_accuracy)}%`,
                                        background: `linear-gradient(90deg, ${s.color}88, ${s.color})`
                                    }}></div>
                                </div>
                                <div className="text-xs text-muted mt-1">{s.total_attempted} questions attempted • {s.total_correct} correct</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-2 gap-6">
                    {/* Weak Areas */}
                    <div className="card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
                        <h3 className="mb-4">⚠️ Weak Areas</h3>
                        {weakAreas && weakAreas.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {weakAreas.map((w, i) => (
                                    <div key={i} style={{ padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold text-sm">{w.topic_name}</div>
                                            <span className="text-danger font-bold">{Math.round(w.accuracy)}%</span>
                                        </div>
                                        <div className="text-xs text-muted">{w.chapter_name} • {w.subject_name}</div>
                                        <div className="progress-bar mt-2" style={{ height: 4 }}>
                                            <div className="progress-fill danger" style={{ width: `${w.accuracy}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state" style={{ padding: 20 }}>
                                <p className="text-muted text-sm">Take more tests to identify weak areas</p>
                            </div>
                        )}
                    </div>

                    {/* Strong Areas */}
                    <div className="card" style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
                        <h3 className="mb-4">💪 Strong Areas</h3>
                        {strongAreas && strongAreas.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {strongAreas.map((s, i) => (
                                    <div key={i} style={{ padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold text-sm">{s.topic_name}</div>
                                            <span className="text-success font-bold">{Math.round(s.accuracy)}%</span>
                                        </div>
                                        <div className="text-xs text-muted">{s.chapter_name} • {s.subject_name}</div>
                                        <div className="progress-bar mt-2" style={{ height: 4 }}>
                                            <div className="progress-fill success" style={{ width: `${s.accuracy}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state" style={{ padding: 20 }}>
                                <p className="text-muted text-sm">Keep practicing to build strong areas</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Rank Prediction — Locked behind referral */}
                <div className="card mt-6" style={{ position: 'relative', overflow: 'hidden' }}>
                    <h2 className="mb-4">🏆 Rank Prediction</h2>

                    {(user?.referrals_count || 0) < 1 && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(10px)', borderRadius: 'inherit' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔒</div>
                            <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>Premium Analytics Locked</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>Refer 1 friend to unlock your AIR prediction</p>
                            <button
                                onClick={() => {
                                    const text = `Prepare for NEET 2026 with AI! 🧠\n\nJoin me: https://aineetcoach.com/register?ref=${user?.referral_code || ''}`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                className="btn btn-primary"
                            >
                                📱 Share & Unlock
                            </button>
                        </div>
                    )}

                    <div className="grid grid-4 gap-4">
                        <div className="text-center">
                            <div className="font-bold" style={{ fontSize: '2rem', color: 'var(--accent-primary)' }}>{rankPrediction?.predictedScore || 0}</div>
                            <div className="text-xs text-muted">Predicted Score</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold" style={{ fontSize: '2rem', color: 'var(--warning)' }}>#{(rankPrediction?.predictedRank || 0).toLocaleString()}</div>
                            <div className="text-xs text-muted">Predicted Rank</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold" style={{ fontSize: '2rem', color: 'var(--success)' }}>{rankPrediction?.percentile || 0}%</div>
                            <div className="text-xs text-muted">Percentile</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold" style={{ fontSize: '2rem', color: 'var(--info)' }}>{rankPrediction?.improvementProbability || 0}%</div>
                            <div className="text-xs text-muted">Improvement Prob.</div>
                        </div>
                    </div>
                    <p className="text-center text-sm text-muted mt-4">{rankPrediction?.collegePossibility}</p>
                </div>

                {/* Chapter Strength */}
                {chapterStrength && chapterStrength.length > 0 && (
                    <div className="card mt-6">
                        <h2 className="mb-4">📖 Chapter Strength</h2>
                        <div className="flex flex-col gap-2">
                            {chapterStrength.map((c, i) => (
                                <div key={i} className="flex items-center gap-4" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                                    <span className="text-sm" style={{ width: 200 }}>{c.name}</span>
                                    <div className="progress-bar" style={{ flex: 1, height: 6 }}>
                                        <div className={`progress-fill ${c.accuracy >= 70 ? 'success' : c.accuracy >= 40 ? 'warning' : 'danger'}`}
                                            style={{ width: `${c.accuracy}%` }}></div>
                                    </div>
                                    <span className="font-bold text-sm" style={{ width: 50, textAlign: 'right' }}>{Math.round(c.accuracy)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Test History */}
                {testHistory && testHistory.length > 0 && (
                    <div className="card mt-6">
                        <h2 className="mb-4">📋 Test History</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)' }}>Type</th>
                                        <th style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>Score</th>
                                        <th style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>Correct</th>
                                        <th style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>Accuracy</th>
                                        <th style={{ padding: '10px', textAlign: 'right', color: 'var(--text-muted)' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {testHistory.map((t, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '10px' }}>{t.type.charAt(0).toUpperCase() + t.type.slice(1)}</td>
                                            <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700, color: 'var(--accent-primary)' }}>{Math.round(t.score)}/720</td>
                                            <td style={{ padding: '10px', textAlign: 'center' }}>{t.correct_count}/{t.total_questions}</td>
                                            <td style={{ padding: '10px', textAlign: 'center' }}>{t.total_questions > 0 ? Math.round(t.correct_count / t.total_questions * 100) : 0}%</td>
                                            <td style={{ padding: '10px', textAlign: 'right', color: 'var(--text-muted)' }}>{new Date(t.completed_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
