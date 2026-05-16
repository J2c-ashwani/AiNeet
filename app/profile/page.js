'use client';
import { Icon } from '@/components/ui/Icon';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ParentSettings from '@/components/ParentSettings';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Badge, Skeleton } from '@/components/ui';
import Link from 'next/link';
import useSWR from 'swr';
import { fetcher } from '@/lib/swr';

const ACHIEVEMENT_ICONS = {
    'first_test': <Icon name="Target" size={20} />, 'test_veteran': <Icon name="Trophy" size={20} />, 'perfect_score': '💯',
    'streak_7': <Icon name="Flame" size={20} />, 'streak_30': '🌋', 'xp_1000': <Icon name="Star" size={20} />,
    'xp_5000': '💎', 'physics_master': <Icon name="Atom" size={20} />, 'chemistry_master': '🧪',
    'biology_master': <Icon name="Dna" size={20} />, 'speed_demon': <Icon name="Zap" size={20} />, 'consistent': <Icon name="CalendarDays" size={20} />
};

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading, logout } = useAuth();
    const [isRestoring, setIsRestoring] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
        if (authLoading) return;
        if (!user) { window.location.href = '/login'; }
    }, [user, authLoading]);

    const { data: perf, isLoading: loadingPerf } = useSWR(!authLoading && user ? '/api/performance' : null, fetcher);
    const { data: achv, isLoading: loadingAchv } = useSWR(!authLoading && user ? '/api/achievements' : null, fetcher);
    const { data: ent, mutate: mutateEnt, isLoading: loadingEnt } = useSWR(!authLoading && user ? '/api/subscription/status' : null, fetcher);

    const stats = perf?.overallStats || {};
    const badges = achv?.badges || [];
    const entitlement = ent || { current_plan: 'free', active_status: 'free' };
    const loading = authLoading || loadingPerf || loadingAchv || loadingEnt;

    const handleLogout = async () => {
        await logout();
    };

    const handleRestorePurchases = async () => {
        if (typeof window !== 'undefined' && window.NeetCoachAds && window.NeetCoachAds.restorePurchases) {
            setIsRestoring(true);
            try {
                // Tell flutter app to fetch purchases and post them to our backend
                window.NeetCoachAds.restorePurchases();
                alert('Restoring purchases... please wait.');
                // Refresh state after 3 seconds
                setTimeout(() => {
                    mutateEnt();
                    setIsRestoring(false);
                }, 3000);
            } catch (err) {
                console.error(err);
                alert('Failed to restore purchases. Please try again.');
                setIsRestoring(false);
            }
        } else {
            alert('Restore purchases is only available on the Android app.');
        }
    };

    if (!hasMounted) return null;

    if (loading) return (
        <div className="page profile-wrapper">
            <Card className="profile-loading-card">
                <Skeleton className="profile-loading-avatar" />
                <Skeleton className="profile-loading-title" />
                <Skeleton className="profile-loading-subtitle" />
            </Card>
            <div className="grid grid-4 profile-loading-grid">
                {[1,2,3,4].map(i => <Card key={i}><Skeleton className="profile-loading-stat" /></Card>)}
            </div>
            <Card><Skeleton className="profile-loading-achievements" /></Card>
        </div>
    );

    const levelProgress = user?.levelInfo?.progress || 0;

    return (
        <div className="page">
            <div className="profile-wrapper">
                {/* Profile Hero */}
                <Card className="profile-hero-card">
                    <div className="profile-hero-bg"></div>
                    <div className="profile-hero-avatar">
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <h1 className="profile-hero-name">{user?.name}</h1>
                    <p className="profile-hero-email">{user?.email}</p>
                    
                    <div className="profile-stats-container">
                        <div>
                            <div className="profile-stat-val">{user?.levelInfo?.level}</div>
                            <div className="profile-stat-label">Level</div>
                        </div>
                        <div>
                            <div className="profile-stat-val">{user?.xp || 0}</div>
                            <div className="profile-stat-label">XP</div>
                        </div>
                        <div>
                            <div className="profile-stat-val"><Icon name="Flame" /> {user?.streak || 0}</div>
                            <div className="profile-stat-label">Streak</div>
                        </div>
                    </div>

                    <div className="profile-level-container">
                        <div className="profile-level-header">
                            <span>{user?.levelInfo?.name}</span>
                            <span>{user?.levelInfo?.xpToNext} XP to next</span>
                        </div>
                        <div className="profile-level-bar-bg">
                            <div className="profile-level-bar-fill" style={{ width: `${levelProgress}%` }}></div>
                        </div>
                    </div>
                </Card>

                {/* Subscription Management Card */}
                <Card className="profile-sub-card">
                    <div className="profile-sub-header">
                        <div>
                            <h3 className="profile-sub-title">Subscription Details</h3>
                            <p className="profile-sub-desc">Manage your billing and plan settings.</p>
                        </div>
                        {entitlement?.is_premium ? (
                            <Badge variant="success" style={{ textTransform: 'capitalize' }}>
                                {entitlement.active_status}
                            </Badge>
                        ) : (
                            <Badge variant="secondary">Free Plan</Badge>
                        )}
                    </div>

                    <div className="profile-sub-grid">
                        <div>
                            <div className="profile-sub-grid-label">Current Plan</div>
                            <div className="profile-sub-grid-val">
                                {entitlement?.current_plan === 'free' ? 'Basic (Free)' : entitlement?.current_plan}
                            </div>
                        </div>
                        <div>
                            <div className="profile-sub-grid-label">Renewal / Expiry</div>
                            <div className="profile-sub-grid-val">
                                {entitlement?.current_plan === 'free' ? '—' : (entitlement?.expires_at ? new Date(entitlement.expires_at).toLocaleDateString() : '—')}
                            </div>
                        </div>
                        <div>
                            <div className="profile-sub-grid-label">Billing Source</div>
                            <div className="profile-sub-grid-val">
                                {entitlement?.current_plan === 'free' ? '—' : (entitlement?.billing_source === 'play' ? 'Google Play' : 'Cashfree (Web)')}
                            </div>
                        </div>
                    </div>

                    <div className="profile-sub-actions">
                        {!entitlement?.is_premium ? (
                            <>
                                <Link href="/pricing" className="profile-sub-btn-upgrade">
                                    <Button variant="accent" style={{ width: '100%' }}>
                                        Upgrade to Pro / Premium
                                    </Button>
                                </Link>
                                {typeof window !== 'undefined' && window.showInterstitialAd && (
                                    <Button variant="outline" onClick={handleRestorePurchases} disabled={isRestoring} className="profile-sub-btn">
                                        {isRestoring ? 'Restoring...' : 'Restore Purchases'}
                                    </Button>
                                )}
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => {
                                    if (entitlement?.billing_source === 'play') {
                                        window.location.href = 'https://play.google.com/store/account/subscriptions';
                                    } else {
                                        alert('Redirecting to Cashfree Billing Portal...');
                                    }
                                }} className="profile-sub-btn">
                                    Manage Subscription
                                </Button>
                                <Button variant="outline" onClick={() => alert('Redirecting to Support Chat...')} className="profile-sub-btn">
                                    Billing Help
                                </Button>
                            </>
                        )}
                    </div>
                </Card>

                {/* Stats */}
                <div className="grid grid-4 profile-perf-grid">
                    <Card className="profile-perf-card">
                        <div className="profile-perf-val">{stats?.total_tests || 0}</div>
                        <div className="profile-perf-label">Tests</div>
                    </Card>
                    <Card className="profile-perf-card">
                        <div className="profile-perf-val">{stats?.avg_accuracy || 0}%</div>
                        <div className="profile-perf-label">Accuracy</div>
                    </Card>
                    <Card className="profile-perf-card">
                        <div className="profile-perf-val">{Math.round(stats?.best_score || 0)}</div>
                        <div className="profile-perf-label">Best Score</div>
                    </Card>
                    <Card className="profile-perf-card">
                        <div className="profile-perf-val">{Math.round(stats?.avg_score || 0)}</div>
                        <div className="profile-perf-label">Avg Score</div>
                    </Card>
                </div>

                {/* Achievements */}
                <Card style={{ marginBottom: 24 }}>
                    <h3 className="profile-section-title"><Icon name="Star" size={16} /> Achievements</h3>
                    {badges.length > 0 ? (
                        <div className="profile-achievements-grid">
                            {badges.map((b, i) => (
                                <div key={i} className="profile-achievement-card">
                                    <div className="profile-achievement-icon">{ACHIEVEMENT_ICONS[b.achievement_id] || <Icon name="Trophy" size={20} />}</div>
                                    <div className="profile-achievement-label">{b.name || b.achievement_id}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="profile-achievements-empty">
                            <div className="profile-empty-icon"><Icon name="Target" /></div>
                            <p className="profile-empty-text">Take tests to unlock achievements!</p>
                        </div>
                    )}
                </Card>

                {/* Quick Links */}
                <Card style={{ marginBottom: 24 }}>
                    <h3 className="profile-section-title"><Icon name="Zap" /> Quick Links</h3>
                    <div className="profile-links-container">
                        {[
                            { href: '/test/configure', icon: <Icon name="FileText" size={16} />, label: 'Take a Test' },
                            { href: '/analytics', icon: <Icon name="TrendingUp" size={16} />, label: 'View Analytics' },
                            { href: '/study-plan', icon: <Icon name="CalendarDays" size={16} />, label: 'Study Plan' },
                            { href: '/mistakes', icon: '📓', label: 'Mistake Notebook' },
                            { href: '/leaderboard', icon: <Icon name="Trophy" size={16} />, label: 'Leaderboard' },
                        ].map(link => (
                            <Link key={link.href} href={link.href} className="profile-link-card">
                                <span className="profile-link-icon">{link.icon}</span>{link.label}
                            </Link>
                        ))}
                    </div>
                </Card>

                {/* Parent Connect Settings */}
                <div className="profile-parent-settings">
                    <ParentSettings />
                </div>

                <div className="profile-logout-container">
                    <Button variant="danger" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
}
