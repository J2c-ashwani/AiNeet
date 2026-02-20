'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { ActivityHeatmap } from '@/components/Charts';
import RevisionCard from '@/components/RevisionCard';
import CoachWidget from '@/components/CoachWidget';
import AdBanner from "@/components/monetization/AdBanner";
import PricingModal from "@/components/monetization/PricingModal";

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPricing, setShowPricing] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/auth/me').then(r => r.json()),
            fetch('/api/performance').then(r => r.json())
        ]).then(([authData, perfData]) => {
            if (!authData.user) { router.push('/login'); return; }
            setUser(authData.user);
            setPerformance(perfData);
            setLoading(false);
        }).catch(() => router.push('/login'));
    }, [router]);

    if (loading) return (
        <div className="loading-overlay" style={{ minHeight: '100vh' }}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
            <p>Loading your dashboard...</p>
        </div>
    );

    const isFree = !user?.subscription_tier || user?.subscription_tier === 'free';

    const stats = performance?.overallStats || {};
    const rankPrediction = performance?.rankPrediction || {};
    const weakAreas = performance?.weakAreas || [];
    const testHistory = performance?.testHistory || [];

    return (
        <div>
            <Navbar />

            <div className="page">
                {/* Welcome */}
                <div className="page-header">
                    <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                    <p className="page-subtitle">
                        Level {user?.levelInfo?.level} — {user?.levelInfo?.name} • {user?.levelInfo?.xpToNext} XP to next level
                    </p>
                    <div className="progress-bar mt-2" style={{ maxWidth: 300 }}>
                        <div className="progress-fill" style={{ width: `${user?.levelInfo?.progress || 0}%` }}></div>
                    </div>
                </div>

                <CoachWidget />

                {/* Stats Grid */}
                <div className="grid grid-4 stagger mb-6">
                    <div className="stat-card">
                        <div className="stat-icon">📝</div>
                        <div className="stat-value">{stats.total_tests || 0}</div>
                        <div className="stat-label">Tests Taken</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-value">{stats.avg_accuracy || 0}%</div>
                        <div className="stat-label">Avg Accuracy</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🏅</div>
                        <div className="stat-value">{Math.round(stats.best_score || 0)}</div>
                        <div className="stat-label">Best Score / 720</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-value">{rankPrediction.predictedRank ? `#${rankPrediction.predictedRank.toLocaleString()}` : 'N/A'}</div>
                        <div className="stat-label">Predicted Rank</div>
                    </div>
                </div>

                {/* Spaced Repetition */}
                <RevisionCard />

                {/* Activity Heatmap */}
                {performance?.activityData && performance.activityData.length > 0 && (
                    <div className="card mb-6">
                        <ActivityHeatmap data={
                            (performance.activityData || []).reduce((acc, curr) => ({
                                ...acc, [new Date(curr.date).toLocaleDateString(undefined, { weekday: 'short' })]: curr.count
                            }), {})
                        } />
                    </div>
                )}

                <div className="grid grid-2 gap-6">
                    {/* Quick Actions */}
                    <div>
                        <h2 className="mb-4">🚀 Quick Actions</h2>
                        <div className="flex flex-col gap-3 stagger">
                            <a href="/test/configure" className="quick-action">
                                <div className="quick-action-icon" style={{ background: 'rgba(99,102,241,0.1)' }}>🎯</div>
                                <div className="quick-action-text">
                                    <h3>Generate AI Test</h3>
                                    <p>Create a personalized test based on your level</p>
                                </div>
                            </a>
                            <a href="/test/configure?type=mock" className="quick-action">
                                <div className="quick-action-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>⏱️</div>
                                <div className="quick-action-text">
                                    <h3>Full Mock Test</h3>
                                    <p>180 questions • 720 marks • 3 hours</p>
                                </div>
                            </a>
                            <a href="/doubts" className="quick-action">
                                <div className="quick-action-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>🤖</div>
                                <div className="quick-action-text">
                                    <h3>Ask AI Doubt</h3>
                                    <p>Get instant NEET-focused explanations</p>
                                </div>
                            </a>
                            <a href="/study-plan" className="quick-action">
                                <div className="quick-action-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>📅</div>
                                <div className="quick-action-text">
                                    <h3>Today's Study Plan</h3>
                                    <p>AI-generated personalized schedule</p>
                                </div>
                            </a>
                            <button
                                onClick={async (e) => {
                                    e.currentTarget.disabled = true;
                                    e.currentTarget.innerHTML = '<div class="quick-action-icon" style="background: rgba(168,85,247,0.1)">⏳</div><div class="quick-action-text"><h3>Generating...</h3><p>Creating challenge link</p></div>';
                                    try {
                                        const res = await fetch('/api/challenge/create', { method: 'POST' });
                                        const data = await res.json();
                                        if (data.success) {
                                            const text = `I'm challenging you to a 10-question AI NEET Mock Test duel! ⚔️\n\nCan you beat my score? Accept here:\n${data.shareUrl}`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                        } else {
                                            alert(data.error || 'Failed to create challenge. Have you taken enough tests?');
                                        }
                                    } catch (err) {
                                        alert('Error creating challenge.');
                                    }
                                    window.location.reload();
                                }}
                                className="quick-action" style={{ textAlign: 'left', cursor: 'pointer', border: 'none', background: 'var(--bg-glass)', width: '100%', fontFamily: 'inherit' }}
                            >
                                <div className="quick-action-icon" style={{ background: 'rgba(168,85,247,0.1)' }}>⚔️</div>
                                <div className="quick-action-text">
                                    <h3 style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Challenge a Friend</h3>
                                    <p>Send a 10-question duel via WhatsApp</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Right column */}
                    <div>
                        {/* Rank Prediction */}
                        {stats.total_tests > 0 && (
                            <div className="card mb-4">
                                <h3 className="mb-4">🏆 Rank Prediction</h3>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-secondary">Predicted Score</span>
                                    <span className="font-bold">{rankPrediction.predictedScore}/720</span>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-secondary">Predicted Rank</span>
                                    <span className="font-bold">#{rankPrediction.predictedRank?.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-secondary">Percentile</span>
                                    <span className="font-bold">{rankPrediction.percentile}%</span>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-secondary">Selection Probability</span>
                                    <span className="font-bold">
                                        {rankPrediction.successProbability}%
                                        {rankPrediction.trend === 'up' ? ' ↗️' : rankPrediction.trend === 'down' ? ' ↘️' : ''}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-secondary">Status</span>
                                    <span className="font-bold" style={{ color: rankPrediction.category === 'Excellent' ? 'var(--success)' : rankPrediction.category === 'Good' ? 'var(--info)' : 'var(--warning)' }}>
                                        {rankPrediction.category}
                                    </span>
                                </div>
                                <p className="text-sm text-muted mt-2">{rankPrediction.collegePossibility}</p>
                            </div>
                        )}

                        {/* Weak Areas Alert */}
                        {weakAreas.length > 0 && (
                            <div className="card" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
                                <h3 className="mb-4">⚠️ Weak Areas</h3>
                                <div className="flex flex-col gap-2">
                                    {weakAreas.slice(0, 5).map((w, i) => (
                                        <div key={i} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                                            <div>
                                                <div className="text-sm font-semibold">{w.topic_name}</div>
                                                <div className="text-xs text-muted">{w.chapter_name}</div>
                                            </div>
                                            <span className="text-danger font-bold">{Math.round(w.accuracy)}%</span>
                                        </div>
                                    ))}
                                </div>
                                <a href="/test/configure" className="btn btn-sm btn-secondary mt-4 w-full" style={{ textAlign: 'center' }}>
                                    Practice Weak Areas 📝
                                </a>
                            </div>
                        )}

                        {/* Recent Tests */}
                        {testHistory.length > 0 && (
                            <div className="card mt-4">
                                <h3 className="mb-4">📋 Recent Tests</h3>
                                <div className="flex flex-col gap-2">
                                    {testHistory.slice(0, 5).map((t, i) => (
                                        <a key={i} href={`/test/${t.id}/results`} className="flex items-center justify-between" style={{ padding: '10px 12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', color: 'inherit' }}>
                                            <div>
                                                <div className="text-sm font-semibold">{t.type.charAt(0).toUpperCase() + t.type.slice(1)} Test</div>
                                                <div className="text-xs text-muted">{t.total_questions} questions • {new Date(t.completed_at).toLocaleDateString()}</div>
                                            </div>
                                            <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>{Math.round(t.score)}/720</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty state for new users */}
                        {stats.total_tests === 0 && (
                            <div className="card text-center">
                                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎯</div>
                                <h3>No tests taken yet</h3>
                                <p className="text-secondary text-sm mt-2 mb-4">Start your first test to see performance analytics, rank prediction, and personalized study plans!</p>
                                <a href="/test/configure" className="btn btn-primary">Take Your First Test →</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
