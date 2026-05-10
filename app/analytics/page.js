'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScoreTrendChart, SubjectRadarChart } from '@/components/Charts';
import { useAuth } from '@/context/AuthContext';
import { Card, Button } from '@/components/ui';

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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
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

                {/* Charts Section */}
                {testHistory && testHistory.length > 0 && (
                    <div className="grid grid-2" style={{ gap: '24px', marginBottom: '24px' }}>
                        <Card>
                            <ScoreTrendChart data={
                                [...testHistory].reverse().map(t => ({
                                    date: t.completed_at,
                                    score: t.score
                                }))
                            } />
                        </Card>
                        <Card>
                            <SubjectRadarChart data={
                                (subjectPerformance || []).reduce((acc, curr) => ({
                                    ...acc, [curr.name]: curr.avg_accuracy
                                }), {})
                            } />
                        </Card>
                    </div>
                )}

                {/* Overall Stats */}
                <div className="grid grid-4" style={{ marginBottom: '24px' }}>
                    <Card style={{ textAlign: 'center', padding: '24px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📝</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{overallStats?.total_tests || 0}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Tests</div>
                    </Card>
                    <Card style={{ textAlign: 'center', padding: '24px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎯</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{overallStats?.avg_accuracy || 0}%</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Avg Accuracy</div>
                    </Card>
                    <Card style={{ textAlign: 'center', padding: '24px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏅</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{Math.round(overallStats?.avg_score || 0)}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Avg Score / 720</div>
                    </Card>
                    <Card style={{ textAlign: 'center', padding: '24px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏆</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{Math.round(overallStats?.best_score || 0)}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Best Score / 720</div>
                    </Card>
                </div>

                {/* Subject Performance */}
                <Card style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>📊 Subject-wise Performance</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {(subjectPerformance || []).map(s => (
                            <div key={s.id}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>{s.icon}</span>
                                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                                    </div>
                                    <span style={{ fontWeight: 700, color: s.color }}>{Math.round(s.avg_accuracy)}%</span>
                                </div>
                                <div style={{ background: 'var(--bg-glass)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.round(s.avg_accuracy)}%`,
                                        background: `linear-gradient(90deg, ${s.color}88, ${s.color})`,
                                        borderRadius: '4px'
                                    }}></div>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{s.total_attempted} questions attempted • {s.total_correct} correct</div>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="grid grid-2" style={{ gap: '24px', marginBottom: '24px' }}>
                    {/* Weak Areas */}
                    <Card style={{ borderColor: 'var(--danger-light, rgba(239, 68, 68, 0.2))' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '16px' }}>⚠️ Weak Areas</h3>
                        {weakAreas && weakAreas.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {weakAreas.map((w, i) => (
                                    <div key={i} style={{ padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{w.topic_name}</div>
                                            <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{Math.round(w.accuracy)}%</span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{w.chapter_name} • {w.subject_name}</div>
                                        <div style={{ background: 'var(--bg-elevated)', height: '4px', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
                                            <div style={{ background: 'var(--danger)', height: '100%', width: `${w.accuracy}%`, borderRadius: '2px' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Take more tests to identify weak areas</p>
                            </div>
                        )}
                    </Card>

                    {/* Strong Areas */}
                    <Card style={{ borderColor: 'var(--success-light, rgba(16, 185, 129, 0.2))' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '16px' }}>💪 Strong Areas</h3>
                        {strongAreas && strongAreas.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {strongAreas.map((s, i) => (
                                    <div key={i} style={{ padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.topic_name}</div>
                                            <span style={{ color: 'var(--success)', fontWeight: 700 }}>{Math.round(s.accuracy)}%</span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.chapter_name} • {s.subject_name}</div>
                                        <div style={{ background: 'var(--bg-elevated)', height: '4px', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
                                            <div style={{ background: 'var(--success)', height: '100%', width: `${s.accuracy}%`, borderRadius: '2px' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Keep practicing to build strong areas</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Rank Prediction — Locked behind referral */}
                <Card style={{ position: 'relative', overflow: 'hidden', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>🏆 Rank Prediction</h2>

                    {(user?.referrals_count || 0) < 1 && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-overlay)', backdropFilter: 'blur(10px)', borderRadius: 'inherit' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔒</div>
                            <h3 style={{ fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>Premium Analytics Locked</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>Refer 1 friend to unlock your AIR prediction</p>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    const text = `Prepare for NEET 2026 with AI! 🧠\n\nJoin me: https://aineetcoach.com/register?ref=${user?.referral_code || ''}`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                            >
                                📱 Share & Unlock
                            </Button>
                        </div>
                    )}

                    <div className="grid grid-4" style={{ gap: '16px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{rankPrediction?.predictedScore || 0}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Predicted Score</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>#{(rankPrediction?.predictedRank || 0).toLocaleString()}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Predicted Rank</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{rankPrediction?.percentile || 0}%</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Percentile</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--info)' }}>{rankPrediction?.improvementProbability || 0}%</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Improvement Prob.</div>
                        </div>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '16px' }}>{rankPrediction?.collegePossibility}</p>
                </Card>

                {/* Chapter Strength */}
                {chapterStrength && chapterStrength.length > 0 && (
                    <Card style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>📖 Chapter Strength</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {chapterStrength.map((c, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span style={{ fontSize: '0.875rem', width: '200px' }}>{c.name}</span>
                                    <div style={{ flex: 1, background: 'var(--bg-glass)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{
                                            background: c.accuracy >= 70 ? 'var(--success)' : c.accuracy >= 40 ? 'var(--warning)' : 'var(--danger)',
                                            width: `${c.accuracy}%`,
                                            height: '100%',
                                            borderRadius: '3px'
                                        }}></div>
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '0.875rem', width: '50px', textAlign: 'right' }}>{Math.round(c.accuracy)}%</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Test History */}
                {testHistory && testHistory.length > 0 && (
                    <Card>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>📋 Test History</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)' }}>Type</th>
                                        <th style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>Score</th>
                                        <th style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>Correct</th>
                                        <th style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>Accuracy</th>
                                        <th style={{ padding: '10px', textAlign: 'right', color: 'var(--text-muted)' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {testHistory.map((t, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '10px' }}>{t.type.charAt(0).toUpperCase() + t.type.slice(1)}</td>
                                            <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>{Math.round(t.score)}/720</td>
                                            <td style={{ padding: '10px', textAlign: 'center' }}>{t.correct_count}/{t.total_questions}</td>
                                            <td style={{ padding: '10px', textAlign: 'center' }}>{t.total_questions > 0 ? Math.round(t.correct_count / t.total_questions * 100) : 0}%</td>
                                            <td style={{ padding: '10px', textAlign: 'right', color: 'var(--text-muted)' }}>{new Date(t.completed_at).toLocaleDateString()}</td>
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
