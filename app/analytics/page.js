'use client';
import { Icon } from '@/components/ui/Icon';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { fetcher } from '@/lib/swr';
import { ScoreTrendChart, SubjectRadarChart } from '@/components/Charts';
import { useAuth } from '@/context/AuthContext';
import { Card, Button } from '@/components/ui';
import { AnalyticsSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/ui/EmptyState';
import { openWhatsAppShare } from '@/lib/utils/whatsapp';

export default function AnalyticsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    useEffect(() => {
        if (authLoading) return;
        if (!user) { window.location.href = '/login'; }
    }, [user, authLoading]);

    const { data, error, isLoading: isSwrLoading } = useSWR(
        !authLoading && user ? '/api/performance' : null,
        fetcher,
        { revalidateOnFocus: true }
    );

    useEffect(() => {
        if (error) {
            window.location.href = '/login';
        }
    }, [error]);

    const loading = authLoading || isSwrLoading || (!data && !error);

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
                    <h1 className="page-title"><Icon name="TrendingUp" /> Performance Analytics</h1>
                    <p className="page-subtitle">Your complete NEET preparation insights</p>
                </div>

                {/* Empty State */}
                {(!testHistory || testHistory.length === 0) && (
                    <div style={{ marginTop: 32 }}>
                        <EmptyState
                            type="analytics"
                            onAction={() => router.push('/test/configure')}
                        />
                    </div>
                )}

                {/* Charts Section */}
                {testHistory && testHistory.length > 0 && (
                    <div className="grid grid-2" style={{ gap: 24, marginBottom: 24 }}>
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
                <div className="grid grid-4" style={{ marginBottom: 24 }}>
                    <Card className="analytics-stat-card">
                        <div className="analytics-stat-icon"><Icon name="FileText" /></div>
                        <div className="analytics-stat-value">{overallStats?.total_tests || 0}</div>
                        <div className="analytics-stat-label">Total Tests</div>
                    </Card>
                    <Card className="analytics-stat-card">
                        <div className="analytics-stat-icon"><Icon name="Target" /></div>
                        <div className="analytics-stat-value">{overallStats?.avg_accuracy || 0}%</div>
                        <div className="analytics-stat-label">Avg Accuracy</div>
                    </Card>
                    <Card className="analytics-stat-card">
                        <div className="analytics-stat-icon"><Icon name="Star" size={16} /></div>
                        <div className="analytics-stat-value">{Math.round(overallStats?.avg_score || 0)}</div>
                        <div className="analytics-stat-label">Avg Score / 720</div>
                    </Card>
                    <Card className="analytics-stat-card">
                        <div className="analytics-stat-icon"><Icon name="Trophy" /></div>
                        <div className="analytics-stat-value">{Math.round(overallStats?.best_score || 0)}</div>
                        <div className="analytics-stat-label">Best Score / 720</div>
                    </Card>
                </div>

                {/* Subject Performance */}
                <Card style={{ marginBottom: 24 }}>
                    <h2 className="analytics-section-title"><Icon name="BarChart2" /> Subject-wise Performance</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                <div className="grid grid-2" style={{ gap: 24, marginBottom: 24 }}>
                    <Card >
                        <h3 className="analytics-section-title-sm"><Icon name="AlertCircle" /> Weak Areas</h3>
                        {weakAreas && weakAreas.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {weakAreas.map((w, i) => (
                                    <div key={i} className="analytics-area-item">
                                        <div className="analytics-area-header">
                                            <div className="analytics-area-name">{w.topic_name}</div>
                                            <span style={{ fontWeight: 700 }}>{Math.round(w.accuracy)}%</span>
                                        </div>
                                        <div className="analytics-area-meta">{w.chapter_name} • {w.subject_name}</div>
                                        <div className="analytics-mini-bar-track">
                                            <div className="analytics-mini-bar-fill" style={{ width: `${w.accuracy}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: 20, textAlign: 'center' }}>
                                <p className="analytics-area-meta">Take more tests to identify weak areas</p>
                            </div>
                        )}
                    </Card>

                    <Card >
                        <h3 className="analytics-section-title-sm"><Icon name="Star" size={16} /> Strong Areas</h3>
                        {strongAreas && strongAreas.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {strongAreas.map((s, i) => (
                                    <div key={i} className="analytics-area-item">
                                        <div className="analytics-area-header">
                                            <div className="analytics-area-name">{s.topic_name}</div>
                                            <span style={{ fontWeight: 700 }}>{Math.round(s.accuracy)}%</span>
                                        </div>
                                        <div className="analytics-area-meta">{s.chapter_name} • {s.subject_name}</div>
                                        <div className="analytics-mini-bar-track">
                                            <div className="analytics-mini-bar-fill" style={{ width: `${s.accuracy}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: 20, textAlign: 'center' }}>
                                <p className="analytics-area-meta">Keep practicing to build strong areas</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Rank Prediction */}
                <Card style={{ position: 'relative', overflow: 'hidden', marginBottom: 24 }}>
                    <h2 className="analytics-section-title"><Icon name="Trophy" /> Rank Prediction</h2>

                    {(user?.referrals_count || 0) < 1 && (
                        <div className="analytics-lock-overlay">
                            <div className="analytics-lock-icon"><Icon name="Lock" /></div>
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
                            <div className="analytics-rank-value" >{rankPrediction?.predictedScore || 0}</div>
                            <div className="analytics-rank-label">Predicted Score</div>
                        </div>
                        <div className="analytics-rank-item">
                            <div className="analytics-rank-value" >#{(rankPrediction?.predictedRank || 0).toLocaleString()}</div>
                            <div className="analytics-rank-label">Predicted Rank</div>
                        </div>
                        <div className="analytics-rank-item">
                            <div className="analytics-rank-value" >{rankPrediction?.percentile || 0}%</div>
                            <div className="analytics-rank-label">Percentile</div>
                        </div>
                        <div className="analytics-rank-item">
                            <div className="analytics-rank-value" >{rankPrediction?.improvementProbability || 0}%</div>
                            <div className="analytics-rank-label">Improvement Prob.</div>
                        </div>
                    </div>
                    <p className="analytics-rank-footer">{rankPrediction?.collegePossibility}</p>
                </Card>

                {/* Chapter Strength */}
                {chapterStrength && chapterStrength.length > 0 && (
                    <Card style={{ marginBottom: 24 }}>
                        <h2 className="analytics-section-title"><Icon name="Star" size={16} /> Chapter Strength</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {chapterStrength.map((c, i) => (
                                <div key={i} className="analytics-chapter-row">
                                    <span className="analytics-chapter-name">{c.name}</span>
                                    <div className="analytics-bar-track" style={{ flex: 1 }}>
                                        <div style={{
                                            background: c.accuracy >= 70 ? 'var(--success)' : c.accuracy >= 40 ? 'var(--warning)' : 'var(--danger)',
                                            width: `${c.accuracy}%`,
                                            height: '100%',
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
                        <h2 className="analytics-section-title"><Icon name="FileText" /> Test History</h2>
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
