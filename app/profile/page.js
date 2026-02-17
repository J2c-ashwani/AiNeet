'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const ACHIEVEMENT_ICONS = {
    'first_test': '🎯', 'test_veteran': '🏆', 'perfect_score': '💯',
    'streak_7': '🔥', 'streak_30': '🌋', 'xp_1000': '⭐',
    'xp_5000': '💎', 'physics_master': '⚛️', 'chemistry_master': '🧪',
    'biology_master': '🧬', 'speed_demon': '⚡', 'consistent': '📅'
};

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/auth/me').then(r => r.json()),
            fetch('/api/performance').then(r => r.json()),
            fetch('/api/achievements').then(r => r.json())
        ]).then(([auth, perf, achv]) => {
            if (!auth.user) { router.push('/login'); return; }
            setUser(auth.user);
            setStats(perf.overallStats || {});
            setBadges(achv.badges || []);
            setLoading(false);
        }).catch(() => router.push('/login'));
    }, [router]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.push('/');
    };

    if (loading) return (
        <div className="loading-overlay" style={{ minHeight: '100vh' }}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
        </div>
    );

    const levelProgress = user?.levelInfo?.progress || 0;

    return (
        <div>
            <Navbar />
            <div className="page" style={{ maxWidth: 700 }}>
                {/* Profile Hero */}
                <div className="card mb-6" style={{ textAlign: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '120px',
                        background: 'var(--accent-gradient)', opacity: 0.15
                    }}></div>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-gradient)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: 800, color: 'white', margin: '0 auto 16px',
                        border: '3px solid var(--accent-primary)', boxShadow: '0 0 20px var(--accent-glow)'
                    }}>
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <h1 style={{ fontSize: '1.6rem', marginBottom: 4 }}>{user?.name}</h1>
                    <p className="text-muted text-sm">{user?.email}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '20px 0' }}>
                        <div>
                            <div className="stat-value" style={{ fontSize: '1.4rem' }}>{user?.levelInfo?.level}</div>
                            <div className="text-xs text-muted">Level</div>
                        </div>
                        <div>
                            <div className="stat-value" style={{ fontSize: '1.4rem' }}>{user?.xp || 0}</div>
                            <div className="text-xs text-muted">XP</div>
                        </div>
                        <div>
                            <div className="stat-value" style={{ fontSize: '1.4rem' }}>🔥 {user?.streak || 0}</div>
                            <div className="text-xs text-muted">Streak</div>
                        </div>
                    </div>
                    <div style={{ maxWidth: 300, margin: '0 auto' }}>
                        <div className="flex items-center justify-between text-xs text-muted mb-1">
                            <span>{user?.levelInfo?.name}</span>
                            <span>{user?.levelInfo?.xpToNext} XP to next</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${levelProgress}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-4 mb-6">
                    <div className="stat-card" style={{ textAlign: 'center' }}>
                        <div className="stat-value" style={{ fontSize: '1.3rem' }}>{stats?.total_tests || 0}</div>
                        <div className="stat-label">Tests</div>
                    </div>
                    <div className="stat-card" style={{ textAlign: 'center' }}>
                        <div className="stat-value" style={{ fontSize: '1.3rem' }}>{stats?.avg_accuracy || 0}%</div>
                        <div className="stat-label">Accuracy</div>
                    </div>
                    <div className="stat-card" style={{ textAlign: 'center' }}>
                        <div className="stat-value" style={{ fontSize: '1.3rem' }}>{Math.round(stats?.best_score || 0)}</div>
                        <div className="stat-label">Best Score</div>
                    </div>
                    <div className="stat-card" style={{ textAlign: 'center' }}>
                        <div className="stat-value" style={{ fontSize: '1.3rem' }}>{Math.round(stats?.avg_score || 0)}</div>
                        <div className="stat-label">Avg Score</div>
                    </div>
                </div>

                {/* Achievements */}
                <div className="card mb-6">
                    <h3 className="mb-4">🏅 Achievements</h3>
                    {badges.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                            {badges.map((b, i) => (
                                <div key={i} style={{
                                    padding: '16px 12px', background: 'var(--bg-glass)',
                                    borderRadius: 'var(--radius-md)', textAlign: 'center',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>{ACHIEVEMENT_ICONS[b.achievement_id] || '🏆'}</div>
                                    <div className="text-xs font-semibold">{b.name || b.achievement_id}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 20 }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎯</div>
                            <p className="text-muted text-sm">Take tests to unlock achievements!</p>
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="card mb-6">
                    <h3 className="mb-4">⚡ Quick Links</h3>
                    <div className="flex flex-col gap-2">
                        {[
                            { href: '/test/configure', icon: '📝', label: 'Take a Test' },
                            { href: '/analytics', icon: '📈', label: 'View Analytics' },
                            { href: '/study-plan', icon: '📅', label: 'Study Plan' },
                            { href: '/mistakes', icon: '📓', label: 'Mistake Notebook' },
                            { href: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
                        ].map(link => (
                            <a key={link.href} href={link.href} style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                                background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)',
                                textDecoration: 'none', color: 'var(--text-primary)', fontSize: '0.9rem',
                                transition: 'background var(--transition-fast)'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>{link.icon}</span>{link.label}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Logout */}
                <button onClick={handleLogout} className="btn btn-danger w-full" style={{ padding: '14px' }}>
                    🚪 Logout
                </button>
            </div>
        </div>
    );
}
