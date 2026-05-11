'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Badge, Skeleton } from '@/components/ui';
import Link from 'next/link';

const ACHIEVEMENT_ICONS = {
    'first_test': '🎯', 'test_veteran': '🏆', 'perfect_score': '💯',
    'streak_7': '🔥', 'streak_30': '🌋', 'xp_1000': '⭐',
    'xp_5000': '💎', 'physics_master': '⚛️', 'chemistry_master': '🧪',
    'biology_master': '🧬', 'speed_demon': '⚡', 'consistent': '📅'
};

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [badges, setBadges] = useState([]);
    const [entitlement, setEntitlement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRestoring, setIsRestoring] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
        if (authLoading) return;
        if (!user) { window.location.href = '/login'; return; }
        Promise.all([
            fetch('/api/performance').then(r => r.json()),
            fetch('/api/achievements').then(r => r.json()),
            fetch('/api/subscription/status').then(r => r.json())
        ]).then(([perf, achv, ent]) => {
            setStats(perf.overallStats || {});
            setBadges(achv.badges || []);
            setEntitlement(ent || { current_plan: 'free', active_status: 'free' });
            setLoading(false);
        }).catch(() => window.location.href = '/login');
    }, [user, authLoading, router]);

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
                    fetch('/api/subscription/status').then(r => r.json()).then(ent => setEntitlement(ent));
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
        <div className="page" style={{ maxWidth: 700, margin: '0 auto' }}>
            <Card style={{ padding: '40px', textAlign: 'center', marginBottom: '24px' }}>
                <Skeleton style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px' }} />
                <Skeleton style={{ height: '24px', width: '200px', margin: '0 auto 8px' }} />
                <Skeleton style={{ height: '16px', width: '150px', margin: '0 auto' }} />
            </Card>
            <div className="grid grid-4" style={{ marginBottom: '24px' }}>
                {[1,2,3,4].map(i => <Card key={i}><Skeleton style={{ height: '60px' }} /></Card>)}
            </div>
            <Card><Skeleton style={{ height: '200px' }} /></Card>
        </div>
    );

    const levelProgress = user?.levelInfo?.progress || 0;

    return (
        <div className="page">
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
                {/* Profile Hero */}
                <Card style={{ textAlign: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden', marginBottom: '24px' }}>
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '120px',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(167,139,250,0.1))',
                    }}></div>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-gradient)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: 800, color: 'white', margin: '0 auto 16px',
                        border: '3px solid var(--accent-primary)', position: 'relative', zIndex: 1
                    }}>
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{user?.name}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{user?.email}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', margin: '24px 0' }}>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{user?.levelInfo?.level}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Level</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{user?.xp || 0}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>XP</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>🔥 {user?.streak || 0}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Streak</div>
                        </div>
                    </div>

                    <div style={{ maxWidth: 300, margin: '0 auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                            <span>{user?.levelInfo?.name}</span>
                            <span>{user?.levelInfo?.xpToNext} XP to next</span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${levelProgress}%`, background: 'var(--accent-primary)', borderRadius: '4px' }}></div>
                        </div>
                    </div>
                </Card>

                {/* Subscription Management Card */}
                <Card style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Subscription Details</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your billing and plan settings.</p>
                        </div>
                        {entitlement?.is_premium ? (
                            <Badge variant="success" style={{ textTransform: 'capitalize' }}>
                                {entitlement.active_status}
                            </Badge>
                        ) : (
                            <Badge variant="secondary">Free Plan</Badge>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '24px', background: 'var(--bg-glass)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>Current Plan</div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', textTransform: 'capitalize' }}>
                                {entitlement?.current_plan === 'free' ? 'Basic (Free)' : entitlement?.current_plan}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>Renewal / Expiry</div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                                {entitlement?.current_plan === 'free' ? '—' : (entitlement?.expires_at ? new Date(entitlement.expires_at).toLocaleDateString() : '—')}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>Billing Source</div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', textTransform: 'capitalize' }}>
                                {entitlement?.current_plan === 'free' ? '—' : (entitlement?.billing_source === 'play' ? 'Google Play' : 'Cashfree (Web)')}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {!entitlement?.is_premium ? (
                            <>
                                <Link href="/pricing" style={{ flex: 1, minWidth: '200px' }}>
                                    <Button variant="accent" style={{ width: '100%' }}>
                                        Upgrade to Pro / Premium
                                    </Button>
                                </Link>
                                {typeof window !== 'undefined' && window.showInterstitialAd && (
                                    <Button variant="outline" onClick={handleRestorePurchases} disabled={isRestoring} style={{ flex: 1, minWidth: '150px' }}>
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
                                }} style={{ flex: 1, minWidth: '150px' }}>
                                    Manage Subscription
                                </Button>
                                <Button variant="outline" onClick={() => alert('Redirecting to Support Chat...')} style={{ flex: 1, minWidth: '150px' }}>
                                    Billing Help
                                </Button>
                            </>
                        )}
                    </div>
                </Card>

                {/* Stats */}
                <div className="grid grid-4" style={{ marginBottom: '24px' }}>
                    <Card style={{ textAlign: 'center', padding: '20px 16px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{stats?.total_tests || 0}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Tests</div>
                    </Card>
                    <Card style={{ textAlign: 'center', padding: '20px 16px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{stats?.avg_accuracy || 0}%</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Accuracy</div>
                    </Card>
                    <Card style={{ textAlign: 'center', padding: '20px 16px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{Math.round(stats?.best_score || 0)}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Best Score</div>
                    </Card>
                    <Card style={{ textAlign: 'center', padding: '20px 16px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{Math.round(stats?.avg_score || 0)}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Avg Score</div>
                    </Card>
                </div>

                {/* Achievements */}
                <Card style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>🏅 Achievements</h3>
                    {badges.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
                            {badges.map((b, i) => (
                                <div key={i} style={{
                                    padding: '20px 12px', background: 'var(--bg-glass)',
                                    borderRadius: 'var(--radius-md)', textAlign: 'center',
                                    border: '1px solid var(--border)'
                                }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{ACHIEVEMENT_ICONS[b.achievement_id] || '🏆'}</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{b.name || b.achievement_id}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '32px 20px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.8 }}>🎯</div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>Take tests to unlock achievements!</p>
                        </div>
                    )}
                </Card>

                {/* Quick Links */}
                <Card style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>⚡ Quick Links</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { href: '/test/configure', icon: '📝', label: 'Take a Test' },
                            { href: '/analytics', icon: '📈', label: 'View Analytics' },
                            { href: '/study-plan', icon: '📅', label: 'Study Plan' },
                            { href: '/mistakes', icon: '📓', label: 'Mistake Notebook' },
                            { href: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
                        ].map(link => (
                            <Link key={link.href} href={link.href} style={{
                                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                                background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
                                textDecoration: 'none', color: 'var(--text-primary)', fontSize: '0.95rem',
                                fontWeight: 600, border: '1px solid transparent', transition: 'border-color 0.2s ease'
                            }}>
                                <span style={{ fontSize: '1.4rem' }}>{link.icon}</span>{link.label}
                            </Link>
                        ))}
                    </div>
                </Card>



                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
                    <Button variant="danger" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
}
