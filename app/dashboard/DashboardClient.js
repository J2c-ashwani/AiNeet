'use client';
import { Icon } from '@/components/ui/Icon';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { fetcher } from '@/lib/swr';
import { ActivityHeatmap } from '@/components/Charts';
import RevisionCard from '@/components/RevisionCard';
import CoachWidget from '@/components/CoachWidget';
import AdBanner from "@/components/monetization/AdBanner";
import PricingModal from "@/components/monetization/PricingModal";
import { useAuth } from '@/context/AuthContext';
import { openWhatsAppShare } from '@/lib/utils/whatsapp';
import { DashboardSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Flame, Trophy, Star, Target, CheckCircle2, Zap } from 'lucide-react';

function streakColor(streak) {
    if (!streak) return 'var(--text-muted)';
    if (streak >= 30) return '#ff7b00';
    if (streak >= 7) return 'var(--biology)';
    return 'var(--warning)';
}

export default function DashboardClient() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [showPricing, setShowPricing] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { window.location.href = '/login'; }
    }, [user, authLoading]);

    const { data: performance, error: apiError, isLoading: isSwrLoading } = useSWR(
        !authLoading && user ? '/api/performance' : null,
        fetcher,
        { revalidateOnFocus: true }
    );

    const loading = authLoading || isSwrLoading || (!performance && !apiError);
    const isFree = !user?.subscription_tier || user?.subscription_tier === 'free';

    useEffect(() => {
        if (!loading && typeof window.setPremiumUser === 'function') {
            window.setPremiumUser(!isFree);
        }
    }, [loading, isFree]);

    if (loading) return (
        <div style={{ minHeight: '100vh' }}>
            <DashboardSkeleton />
        </div>
    );

    if (apiError) return (
        <div className="dash-error-container">
            <div className="dash-error-icon"><Icon name="BarChart2" /></div>
            <h2 className="dash-error-title">Dashboard Loading Issue</h2>
            <p className="dash-error-body">We could not load your performance data. This usually resolves after your first test.</p>
            <a href="/test/configure" className="dash-error-cta">Take Your First Test →</a>
        </div>
    );

    const stats = performance?.overallStats || {};
    const rankPrediction = performance?.rankPrediction || {};
    const weakAreas = performance?.weakAreas || [];
    const testHistory = performance?.testHistory || [];

    return (
        <div className="page dash-page">
            {/* Header */}
            <div className="dash-header">
                <div className="dash-user-row">
                    <ProgressRing
                        progress={user?.levelInfo?.progress || 0}
                        level={user?.levelInfo?.level || 1}
                        initials={(user?.name || user?.email || 'U')[0].toUpperCase()}
                        size={64}
                        strokeWidth={5}
                    />
                    <div>
                        <h1 className="dash-greeting">
                            Welcome back, {user?.name?.split(' ')[0]}!
                        </h1>
                        <div className="dash-xp-label">
                            {user?.levelInfo?.xpToNext} XP to next level
                        </div>
                    </div>
                </div>
            </div>

            {/* Streak / XP / Rank */}
            <div className="dash-kpi-row">
                <div className="dash-kpi-card">
                    <Flame
                        size={24}
                        className="dash-kpi-icon"
                        style={{
                            color: streakColor(user?.streak),
                            filter: (user?.streak >= 7) ? 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.4))' : 'none',
                        }}
                    />
                    <div className="dash-kpi-value">{user?.streak || 0}</div>
                    <div className="dash-kpi-label">Day Streak</div>
                </div>
                <div className="dash-kpi-card">
                    <Star
                        size={24}
                        className="dash-kpi-icon"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.3))' }}
                    />
                    <div className="dash-kpi-value">{user?.xp || 0}</div>
                    <div className="dash-kpi-label">Total XP</div>
                </div>
                <div className="dash-kpi-card">
                    <Trophy
                        size={24}
                        className="dash-kpi-icon"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.3))' }}
                    />
                    <div className="dash-kpi-value">
                        {rankPrediction.predictedRank ? `#${(rankPrediction.predictedRank/1000).toFixed(1)}k` : 'N/A'}
                    </div>
                    <div className="dash-kpi-label">Est. Rank</div>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="dash-stat-grid">
                <div className="dash-stat-card">
                    <Target size={20} style={{ marginBottom: 12 }} />
                    <div className="dash-stat-value">{stats.total_tests || 0}</div>
                    <div className="dash-stat-label">Tests Taken</div>
                </div>
                <div className="dash-stat-card">
                    <CheckCircle2 size={20} style={{ marginBottom: 12 }} />
                    <div className="dash-stat-value">{stats.avg_accuracy || 0}%</div>
                    <div className="dash-stat-label">Avg Accuracy</div>
                </div>
            </div>

            {/* Empty State vs Continue Test Block */}
            {stats.total_tests === 0 ? (
                <div className="dash-stat-card">
                    <EmptyState
                        type="tests"
                        headline="Begin Your Journey"
                        body="Start your first full test to establish your baseline and get your first rank prediction."
                        ctaLabel="Take Your First Test"
                        ctaHref="/test/configure"
                        showGhostCards={false}
                    />
                </div>
            ) : (
                <div className="dash-next-section">
                    <div className="dash-next-header">
                        <Zap size={20}  />
                        <h2 className="dash-next-title">Next up for you</h2>
                    </div>
                    {weakAreas.length > 0 ? (
                        <>
                            <p className="dash-next-body">
                                Your accuracy in <strong >{weakAreas[0].topic_name}</strong> is currently {Math.round(weakAreas[0].accuracy)}%. Practice this weak area now.
                            </p>
                            <a href={`/test/configure?type=custom&topic=${encodeURIComponent(weakAreas[0].topic_name)}`} className="dash-next-cta">
                                Practice Weak Area →
                            </a>
                        </>
                    ) : (
                        <>
                            <p className="dash-next-body">Ready for your next challenge? Generate an AI-curated mock test based on your current level.</p>
                            <a href="/test/configure?type=ai_generated" className="dash-next-cta">
                                Generate AI Test →
                            </a>
                        </>
                    )}
                </div>
            )}

            <CoachWidget />
            <RevisionCard />

            {/* Activity Block */}
            {testHistory.length > 0 && (
                <div className="dash-activity">
                    <h2 className="dash-activity-title">Recent Activity</h2>

                    {performance?.activityData && performance.activityData.length > 0 && (
                        <div className="dash-heatmap-card">
                            <ActivityHeatmap data={
                                (performance.activityData || []).reduce((acc, curr) => ({
                                    ...acc, [new Date(curr.date).toLocaleDateString(undefined, { weekday: 'short' })]: curr.count
                                }), {})
                            } />
                        </div>
                    )}

                    <div className="dash-history-list">
                        {testHistory.slice(0, 5).map((t, i) => (
                            <a key={i} href={`/test/${t.id}/results`} className="dash-history-item">
                                <div>
                                    <div className="dash-history-item-name">{t.type.charAt(0).toUpperCase() + t.type.slice(1)} Test</div>
                                    <div className="dash-history-item-meta">{t.total_questions} questions • {new Date(t.completed_at).toLocaleDateString()}</div>
                                </div>
                                <span className="dash-history-item-score">{Math.round(t.score)}/720</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
