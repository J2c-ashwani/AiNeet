'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScoreTrendChart, SubjectRadarChart } from '@/components/Charts';
import { useAuth } from '@/context/AuthContext';
import { Card, Button } from '@/components/ui';
import { AnalyticsSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/ui/EmptyState';
import { openWhatsAppShare } from '@/lib/utils/whatsapp';

export default function AnalyticsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { window.location.href = '/login'; return; }
        fetch('/api/performance').then(r => r.json()).then(perf => {
            setData(perf);
            setLoading(false);
        }).catch(() => window.location.href = '/login');
    }, [user, authLoading, router]);

    if (loading) return (
        <div style={{ minHeight: '100vh' }}>
            <AnalyticsSkeleton />
        </div>
    );

    const { subjectPerformance, chapterStrength, weakAreas, strongAreas, testHistory, overallStats, rankPrediction } = data || {};

    return (
        <div>
            <div className="page">
                <div className="page-header">
                    <h1 className="page-title">📈 Performance Analytics</h1>
                    <p className="page-subtitle">Your complete NEET preparation insights</p>
                </div>

                {/* Empty State */}
                {(!testHistory || testHistory.length === 0) && (
                    <div style={{ marginTop: '32px' }}>
                        <EmptyState
                            type="analytics"
                            onAction={() => router.push('/test/configure')}
                        />
                    </div>
                )}

                {/* Charts Section */}
                {testHistory && testHistory.length > 0 && (
                    <div className="grid grid-2" style={{ gap: '24px', marginBottom: '24px' }}>
                        <Card>
                            <ScoreTrendChart data={
                                [...testHistory].reverse().map(t => ({ date: t.completed_at, score: t.score }))
                            } />
                        </Card>
                        <Card>
                            <SubjectRadarChart data={
                                (subjectPerformance || []).reduce((acc, curr) => ({ ...acc, [curr.name]: curr.avg_accuracy }), {})
                            } />
                        </Card>
                    </div>
                )}

                {/* Overall Stats */}
                <div className="grid grid-4" style={{ marginBottom: '24px' }}>
                    <Card className="analytics-stat-card">
                        <div className="analytics-stat-icon">📝</div>
                        <div className="analytics-stat-value">{overallStats?.total_tests || 0}</div>
                        <div className="analytics-stat-label">Total Tests</div>
                    </Card>
                    <Card className="analytics-stat-card">
                        <div className="analytics-stat-icon">🎯</div>
                        <div className="analytics-stat-value">{overallStats?.avg_accuracy || 0}%</div>
                        <div className="analytics-stat-label">Avg Accuracy</div>
                    </Card>
                    <Card className="analytics-stat-card">
                        <div className="analytics-stat-icon">🏅</div>
                        <div className="analytics-stat-value">{Math.round(overallStats?.avg_score || 0)}</div>
                        <div className="analytics-stat-label">Avg Score / 720</div>
                    </Card>
                    <Card className="analytics-stat-card">
                        <div className="analytics-stat-icon">🏆</div>
                        <div className="analytics-stat-value">{Math.round(overallStats?.best_score || 0)}</div>
                        <div className="analytics-stat-label">Best Score / 720</div>
                    </Card>
                </div>

                {/* Subject Performance */}
                <Card style={{ marginBottom: '24px' }}>
                    <h2 className="analytics-section-title">📊 Subject-wise Performance</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {(subjectPerformance || []).map(s => (
                            <div key={s.id}>
                                <div className="analytics-subject-row">
                                    <div className="analytics-subject-row-left">
                                        <span>{s.icon}</span>
                                        <span className="analytics-subject-name">{s.name}</span>
                                    </div>
                                    <span style={{ fontWeight: 700, color: s.color }}>{Math.round(s.avg_accuracy)}%</span>
                                </div>
                                <div className="analytics-bar-track">
                                    <div
                                        className="analytics-bar-fill"
                                        style={{ width: `${Math.round(s.avg_accuracy)}%`, background: `linear-gradient(90deg, ${s.color}88, ${s.color})` }}
                                    />
                                </div>
                                <div className="analytics-bar-meta">{s.total_attempted} questions attempted • {s.total_correct} correct</div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Weak & Strong Areas */}
                <div className="grid grid-2" style={{ gap: '24px', marginBottom: '24px' }}>
                    <Card style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        <h3 className="analytics-section-title-sm">⚠️ Weak Areas</h3>
                        {weakAreas && weakAreas.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {weakAreas.map((w, i) => (
                                    <div key={i} className="analytics-area-item">
                                        <div className="analytics-area-header">
                                            <div className="analytics-area-name">{w.topic_name}</div>
                                            <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{Math.round(w.accuracy)}%</span>
                                        </div>
                                        <div className="analytics-area-meta">{w.chapter_name} • {w.subject_name}</div>
                                        <div className="analytics-mini-bar-track">
                                            <div className="analytics-mini-bar-fill" style={{ background: 'var(--danger)', width: `${w.accuracy}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <p className="analytics-area-meta">Take more tests to identify weak areas</p>
                            </div>
                        )}
                    </Card>

                    <Card style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                        <h3 className="analytics-section-title-sm">💪 Strong Areas</h3>
                        {strongAreas && strongAreas.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {strongAreas.map((s, i) => (
                                    <div key={i} className="analytics-area-item">
                                        <div className="analytics-area-header">
                                            <div className="analytics-area-name">{s.topic_name}</div>
                                            <span style={{ color: 'var(--success)', fontWeight: 700 }}>{Math.round(s.accuracy)}%</span>
                                        </div>
                                        <div className="analytics-area-meta">{s.chapter_name} • {s.subject_name}</div>
                                        <div className="analytics-mini-bar-track">
                                            <div className="analytics-mini-bar-fill" style={{ background: 'var(--success)', width: `${s.accuracy}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <p className="analytics-area-meta">Keep practicing to build strong areas</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Rank Prediction */}
                <Card style={{ position: 'relative', overflow: 'hidden', marginBottom: '24px' }}>
                    <h2 className="analytics-section-title">🏆 Rank Prediction</h2>

                    {(user?.referrals_count || 0) < 1 && (
                        <div className="analytics-lock-overlay">
                            <div className="analytics-lock-icon">🔒</div>
                            <h3 className="analytics-lock-title">Premium Analytics Locked</h3>
                            <p className="analytics-lock-body">Refer 1 friend to unlock your AIR prediction</p>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    const text = `Prepare for NEET 2026 with AI! 🧠\n\nJoin me: https://aineetcoach.com/register?ref=${user?.referral_code || ''}`;
                                    openWhatsAppShare(text);
                                }}
                            >
                                📱 Share &amp; Unlock
                            </Button>
                        </div>
                    )}

                    <div className="analytics-rank-grid">
                        <div className="analytics-rank-item">
                            <div className="analytics-rank-value" style={{ color: 'var(--accent-primary)' }}>{rankPrediction?.predictedScore || 0}</div>
                            <div className="analytics-rank-label">Predicted Score</div>
                        </div>
                        <div className="analytics-rank-item">
                            <div className="analytics-rank-value" style={{ color: 'var(--warning)' }}>#{(rankPrediction?.predictedRank || 0).toLocaleString()}</div>
                            <div className="analytics-rank-label">Predicted Rank</div>
                        </div>
                        <div className="analytics-rank-item">
                            <div className="analytics-rank-value" style={{ color: 'var(--success)' }}>{rankPrediction?.percentile || 0}%</div>
                            <div className="analytics-rank-label">Percentile</div>
                        </div>
                        <div className="analytics-rank-item">
                            <div className="analytics-rank-value" style={{ color: 'var(--info)' }}>{rankPrediction?.improvementProbability || 0}%</div>
                            <div className="analytics-rank-label">Improvement Prob.</div>
                        </div>
                    </div>
                    <p className="analytics-rank-footer">{rankPrediction?.collegePossibility}</p>
                </Card>

                {/* Chapter Strength */}
                {chapterStrength && chapterStrength.length > 0 && (
                    <Card style={{ marginBottom: '24px' }}>
                        <h2 className="analytics-section-title">📖 Chapter Strength</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {chapterStrength.map((c, i) => (
                                <div key={i} className="analytics-chapter-row">
                                    <span className="analytics-chapter-name">{c.name}</span>
                                    <div className="analytics-bar-track" style={{ flex: 1 }}>
                                        <div style={{
                                            background: c.accuracy >= 70 ? 'var(--success)' : c.accuracy >= 40 ? 'var(--warning)' : 'var(--danger)',
                                            width: `${c.accuracy}%`,
                                            height: '100%',
                                            borderRadius: 'var(--radius-sm)',
                                        }} />
                                    </div>
                                    <span className="analytics-chapter-pct">{Math.round(c.accuracy)}%</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Test History */}
                {testHistory && testHistory.length > 0 && (
                    <Card>
                        <h2 className="analytics-section-title">📋 Test History</h2>
                        <div className="analytics-table-wrapper">
                            <table className="analytics-table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th className="center">Score</th>
                                        <th className="center">Correct</th>
                                        <th className="center">Accuracy</th>
                                        <th className="right">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {testHistory.map((t, i) => (
                                        <tr key={i}>
                                            <td>{t.type.charAt(0).toUpperCase() + t.type.slice(1)}</td>
                                            <td className="score">{Math.round(t.score)}/720</td>
                                            <td className="center">{t.correct_count}/{t.total_questions}</td>
                                            <td className="center">{t.total_questions > 0 ? Math.round(t.correct_count / t.total_questions * 100) : 0}%</td>
                                            <td className="right">{new Date(t.completed_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
