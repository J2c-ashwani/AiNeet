'use client';
import { Icon } from '@/components/ui/Icon';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ParentSettings from '@/components/ParentSettings';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Badge, Skeleton } from '@/components/ui';
import Link from 'next/link';
import useSWR from 'swr';
import { fetcher } from '@/lib/swr';
import { acknowledgeNativePurchase, isInsideNativeApp, restoreNativePurchases } from '@/lib/platform';
import { checkedFetch } from '@/lib/http';
import { purgeLocalUserData } from '@/lib/client/purge-local-user-data';

const ACHIEVEMENT_ICONS = {
    'first_test': <Icon name="Target" size={20} />, 'test_veteran': <Icon name="Trophy" size={20} />, 'perfect_score': '💯',
    'streak_7': <Icon name="Flame" size={20} />, 'streak_30': '🌋', 'xp_1000': <Icon name="Star" size={20} />,
    'xp_5000': '💎', 'physics_master': <Icon name="Atom" size={20} />, 'chemistry_master': '🧪',
    'biology_master': <Icon name="Dna" size={20} />, 'speed_demon': <Icon name="Zap" size={20} />, 'consistent': <Icon name="CalendarDays" size={20} />
};

function renderAchievementIcon(achievementId) {
    switch (achievementId) {
        case 'perfect_score': return '💯';
        case 'streak_30': return '🌋';
        case 'xp_5000': return '💎';
        case 'chemistry_master': return '🧪';
        case 'first_test': return <Icon name="Target" size={20} />;
        case 'test_veteran': return <Icon name="Trophy" size={20} />;
        case 'streak_7': return <Icon name="Flame" size={20} />;
        case 'xp_1000': return <Icon name="Star" size={20} />;
        case 'physics_master': return <Icon name="Atom" size={20} />;
        case 'biology_master': return <Icon name="Dna" size={20} />;
        case 'speed_demon': return <Icon name="Zap" size={20} />;
        case 'consistent': return <Icon name="CalendarDays" size={20} />;
        default: return <Icon name="Trophy" size={20} />;
    }
}

export default function ProfilePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading, logout } = useAuth();
    const [isRestoring, setIsRestoring] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('');
    const [accountStatus, setAccountStatus] = useState('');

    useEffect(() => {
        setHasMounted(true);
        if (authLoading) return;
        if (!user) { window.location.href = '/login'; }
    }, [user, authLoading]);

    const { data: perf, isLoading: loadingPerf } = useSWR(!authLoading && user ? '/api/performance' : null, fetcher);
    const { data: achv, isLoading: loadingAchv } = useSWR(!authLoading && user ? '/api/achievements' : null, fetcher);
    const { data: ent, mutate: mutateEnt, isLoading: loadingEnt } = useSWR(!authLoading && user ? '/api/subscription/status' : null, fetcher);

    useEffect(() => {
        if (authLoading || !user) return;

        const payment = searchParams.get('payment');
        const orderId = searchParams.get('order_id');
        const planId = searchParams.get('plan_id');
        if (payment !== 'success' || !orderId || !planId) return;

        let cancelled = false;

        async function verifyReturnedPayment() {
            setPaymentStatus('Verifying your payment...');
            try {
                const res = await fetch('/api/subscription/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId, planId }),
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Payment verification failed.');
                }
                if (!cancelled) {
                    setPaymentStatus('Payment verified. Your plan is now active.');
                    mutateEnt();
                    router.replace('/profile', { scroll: false });
                }
            } catch (err) {
                if (!cancelled) {
                    setPaymentStatus(err.message || 'Payment verification failed.');
                }
            }
        }

        verifyReturnedPayment();
        return () => { cancelled = true; };
    }, [authLoading, user, searchParams, mutateEnt, router]);

    const stats = perf?.overallStats || {};
    const badges = achv?.badges || [];
    const entitlement = ent || { current_plan: 'free', active_status: 'free' };
    const loading = authLoading || loadingPerf || loadingAchv || loadingEnt;

    const handleLogout = async () => {
        await logout();
    };

    const handleRestorePurchases = async () => {
        setIsRestoring(true);
        setPaymentStatus('Checking for active purchases...');
        try {
            const restoreResult = await restoreNativePurchases();
            const purchases = Array.isArray(restoreResult?.purchases) ? restoreResult.purchases : [];
            let verifiedCount = 0;

            for (const purchase of purchases) {
                const purchaseToken = purchase.purchaseToken || purchase.token;
                const productId = purchase.productId || purchase.productID;
                if (!purchaseToken || !productId) continue;

                const res = await checkedFetch('/api/subscription/play/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ purchaseToken, productId }),
                }, {
                    allowedStatuses: [400, 409],
                    errorMessage: 'Restore purchase verification failed',
                });

                if (res.ok) {
                    if (purchase.pendingCompletePurchase !== false) {
                        await acknowledgeNativePurchase(purchaseToken);
                    }
                    verifiedCount++;
                }
            }

            await mutateEnt();
            setPaymentStatus(verifiedCount > 0 ? 'Purchases restored successfully.' : 'No active purchases were found.');
            setIsRestoring(false);
        } catch (err) {
            console.error(err);
            setPaymentStatus('Restore purchases is only available on the Android app.');
            setIsRestoring(false);
        }
    };

    const handleManageSubscription = async () => {
        if (entitlement?.billing_source === 'play') {
            window.location.href = 'https://play.google.com/store/account/subscriptions';
            return;
        }

        const confirmed = window.confirm('Cancel renewal for this subscription? You will keep access until the current billing period ends.');
        if (!confirmed) return;

        setIsCancelling(true);
        setPaymentStatus('Cancelling renewal...');
        try {
            const res = await checkedFetch('/api/subscription/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }, {
                allowedStatuses: [400, 404, 409],
                errorMessage: 'Subscription cancellation failed',
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Unable to cancel renewal.');
            }

            const accessUntil = data.accessUntil ? new Date(data.accessUntil).toLocaleDateString() : 'the end of your current billing period';
            setPaymentStatus(`Renewal canceled. Your paid access stays active until ${accessUntil}.`);
            await mutateEnt();
        } catch (err) {
            setPaymentStatus(err.message || 'Unable to cancel renewal. Please contact billing support.');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleBillingHelp = () => {
        const subject = encodeURIComponent('Billing Help');
        const body = encodeURIComponent(`Hi NEET Coach Support,\n\nI need help with billing for ${user?.email || 'my account'}.\n\nIssue:\n`);
        window.location.href = `mailto:support@aineetcoach.com?subject=${subject}&body=${body}`;
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            'Delete your AI NEET Coach account and associated personal data? This ends access immediately and cannot be undone.'
        );
        if (!confirmed) return;

        const finalConfirmation = window.confirm(
            'Final confirmation: permanently delete this account? Active Google Play renewal must be canceled first.'
        );
        if (!finalConfirmation) return;

        setIsDeleting(true);
        setAccountStatus('Submitting your deletion request...');

        try {
            const response = await checkedFetch('/api/auth/delete-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }, {
                allowedStatuses: [409],
                errorMessage: 'Account deletion failed',
            });
            const data = await response.json();

            if (response.status === 409 && data.code === 'PLAY_SUBSCRIPTION_ACTIVE') {
                setAccountStatus('Cancel your active Google Play subscription first, then return here to delete the account.');
                return;
            }
            if (!response.ok) {
                throw new Error(data.error || 'Unable to delete the account.');
            }

            await purgeLocalUserData();
            await logout();
        } catch (error) {
            setAccountStatus(error.message || 'Unable to delete the account. Please contact support.');
        } finally {
            setIsDeleting(false);
        }
    };

    if (!hasMounted) return null;

    if (loading) return (
        <div className="page">
            <div className="profile-wrapper">
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
                    {paymentStatus && (
                        <div className="profile-payment-status">
                            {paymentStatus}
                        </div>
                    )}

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
                                {hasMounted && isInsideNativeApp() && (
                                    <Button variant="outline" onClick={handleRestorePurchases} disabled={isRestoring} className="profile-sub-btn">
                                        {isRestoring ? 'Restoring...' : 'Restore Purchases'}
                                    </Button>
                                )}
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={handleManageSubscription} disabled={isCancelling} className="profile-sub-btn">
                                    {entitlement?.billing_source === 'play'
                                        ? 'Manage in Google Play'
                                        : isCancelling ? 'Cancelling...' : 'Cancel Renewal'}
                                </Button>
                                <Button variant="outline" onClick={handleBillingHelp} className="profile-sub-btn">
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
                                    <div className="profile-achievement-icon">{renderAchievementIcon(b.achievement_id)}</div>
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

                <Card className="profile-account-card">
                    <h3 className="profile-section-title"><Icon name="Shield" /> Account and Data</h3>
                    <p className="profile-account-copy">
                        Review our policies or permanently delete your account and associated personal data.
                    </p>
                    <div className="profile-account-links">
                        <Link href="/privacy">Privacy Policy</Link>
                        <Link href="/terms">Terms of Service</Link>
                        <Link href="/refund-policy">Refund Policy</Link>
                        <Link href="/account-deletion">Deletion Information</Link>
                    </div>
                    {accountStatus && <p className="profile-account-status" role="status">{accountStatus}</p>}
                    <Button variant="danger" onClick={handleDeleteAccount} disabled={isDeleting}>
                        {isDeleting ? 'Deleting Account...' : 'Delete Account'}
                    </Button>
                </Card>

                <div className="profile-logout-container">
                    <Button variant="danger" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
}
