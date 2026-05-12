'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function Dashboard() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(false);
    const [showPricing, setShowPricing] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { window.location.href = '/login'; return; }
        fetch('/api/performance').then(r => {
            if (!r.ok) throw new Error('API error');
            return r.json();
        }).then(perfData => {
            setPerformance(perfData);
            setLoading(false);
        }).catch(() => {
            setApiError(true);
            setLoading(false);
        });
    }, [user, authLoading]);

    const isFree = !user?.subscription_tier || user?.subscription_tier === 'free';

    useEffect(() => {
        if (!loading && typeof window.setPremiumUser === 'function') {
            window.setPremiumUser(!isFree);
        }
    }, [loading, isFree]);

    if (loading) return (
        <div style={{ minHeight: '100vh', padding: '0px' }}>
            <DashboardSkeleton />
        </div>
    );

    if (apiError) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
            <h2 style={{ color: '#f8fafc', marginBottom: '8px' }}>Dashboard Loading Issue</h2>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>We could not load your performance data. This usually resolves after your first test.</p>
            <a href="/test/configure" style={{ background: 'var(--accent-gradient)', color: 'white', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700 }}>Take Your First Test →</a>
        </div>
    );

    const stats = performance?.overallStats || {};
    const rankPrediction = performance?.rankPrediction || {};
    const weakAreas = performance?.weakAreas || [];
    const testHistory = performance?.testHistory || [];

    return (
        <div className="page" style={{ padding: '20px 16px', gap: '24px', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <ProgressRing 
                        progress={user?.levelInfo?.progress || 0}
                        level={user?.levelInfo?.level || 1}
                        initials={(user?.name || user?.email || 'U')[0].toUpperCase()}
                        size={64}
                        strokeWidth={5}
                    />
                    <div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                            Welcome back, {user?.name?.split(' ')[0]}!
                        </h1>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {user?.levelInfo?.xpToNext} XP to next level
                        </div>
                    </div>
                </div>
            </div>

            {/* Streak / XP / Rank - Wave 7 Restructure (Top) */}
            <div style={{ display: 'flex', gap: '12px' }}>
                <div 
                    style={{ 
                        flex: 1, background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid var(--border)',
                        transition: 'transform var(--duration-tap) cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow var(--duration-tap) ease', cursor: 'pointer'
                    }}
                    onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                    onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                    onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                    onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                    <Flame 
                        size={24} 
                        style={{ 
                            marginBottom: '8px',
                            color: user?.streak === 0 ? '#4b5563' : user?.streak >= 30 ? '#ff7b00' : user?.streak >= 7 ? '#f97316' : '#fcd34d',
                            filter: user?.streak >= 7 ? 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.4))' : 'none',
                            transition: 'color 300ms ease, filter 300ms ease'
                        }} 
                    />
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{user?.streak || 0}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Day Streak</div>
                </div>
                <div 
                    style={{ 
                        flex: 1, background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid var(--border)',
                        transition: 'transform var(--duration-tap) cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow var(--duration-tap) ease', cursor: 'pointer'
                    }}
                    onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                    onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                    onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                    onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                    <Star 
                        size={24} 
                        color="#38bdf8" 
                        style={{ 
                            marginBottom: '8px', 
                            filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.3))' 
                        }} 
                    />
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{user?.xp || 0}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Total XP</div>
                </div>
                <div 
                    style={{ 
                        flex: 1, background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid var(--border)',
                        transition: 'transform var(--duration-tap) cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow var(--duration-tap) ease', cursor: 'pointer'
                    }}
                    onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                    onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                    onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                    onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                    <Trophy 
                        size={24} 
                        color="#a855f7" 
                        style={{ 
                            marginBottom: '8px', 
                            filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.3))' 
                        }} 
                    />
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{rankPrediction.predictedRank ? `#${(rankPrediction.predictedRank/1000).toFixed(1)}k` : 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Est. Rank</div>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border)' }}>
                    <Target size={20} color="#6366f1" style={{ marginBottom: '12px' }} />
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.total_tests || 0}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Tests Taken</div>
                </div>
                <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border)' }}>
                    <CheckCircle2 size={20} color="#22c55e" style={{ marginBottom: '12px' }} />
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.avg_accuracy || 0}%</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Avg Accuracy</div>
                </div>
            </div>

            {/* Empty State vs Continue Test Block */}
            {stats.total_tests === 0 ? (
                <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
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
                <div style={{ background: 'var(--surface-elevated)', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid var(--border)', backgroundImage: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.05) 100%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Zap size={20} color="#a855f7" />
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Next up for you</h2>
                    </div>
                    {weakAreas.length > 0 ? (
                        <>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Your accuracy in <strong style={{color:'var(--text-primary)'}}>{weakAreas[0].topic_name}</strong> is currently {Math.round(weakAreas[0].accuracy)}%. Practice this weak area now.</p>
                            <a href={`/test/configure?type=custom&topic=${encodeURIComponent(weakAreas[0].topic_name)}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', background: 'var(--primary)', color: 'white', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
                                Practice Weak Area →
                            </a>
                        </>
                    ) : (
                        <>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Ready for your next challenge? Generate an AI-curated mock test based on your current level.</p>
                            <a href="/test/configure?type=ai_generated" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', background: 'var(--primary)', color: 'white', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
                                Generate AI Test →
                            </a>
                        </>
                    )}
                </div>
            )}

            <CoachWidget />

            <RevisionCard />

            {/* Activity Block (Bottom) */}
            {testHistory.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '12px 0 0' }}>Recent Activity</h2>
                    
                    {performance?.activityData && performance.activityData.length > 0 && (
                        <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', padding: '16px', border: '1px solid var(--border)' }}>
                            <ActivityHeatmap data={
                                (performance.activityData || []).reduce((acc, curr) => ({
                                    ...acc, [new Date(curr.date).toLocaleDateString(undefined, { weekday: 'short' })]: curr.count
                                }), {})
                            } />
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {testHistory.slice(0, 5).map((t, i) => (
                            <a key={i} href={`/test/${t.id}/results`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                                <div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t.type.charAt(0).toUpperCase() + t.type.slice(1)} Test</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{t.total_questions} questions • {new Date(t.completed_at).toLocaleDateString()}</div>
                                </div>
                                <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.1rem' }}>{Math.round(t.score)}/720</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}
