
'use client';
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }}></div>
        </div>
    );

    const statCards = [
        { title: 'Total Users', value: stats?.users || 0, icon: '👥', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.12)' },
        { title: 'Question Bank', value: stats?.questions || 0, subtitle: `${stats?.pyqs || 0} PYQs`, icon: '📚', color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.12)' },
        { title: 'Pending Reports', value: stats?.reports || 0, icon: '🚩', color: '#ef4444', bgColor: 'rgba(239,68,68,0.12)' },
        { title: 'System Status', value: 'Healthy', icon: '✅', color: '#10b981', bgColor: 'rgba(16,185,129,0.12)' },
    ];

    const chartData = stats?.dailyActivity?.length > 0 ? stats.dailyActivity.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        tests: d.tests,
        accuracy: d.avg_accuracy || 0,
    })) : [
        { date: 'No Data', tests: 0, accuracy: 0 }
    ];

    const subBreakdown = stats?.subscriptionBreakdown || { free: 0, pro: 0, premium: 0 };
    const totalSubs = subBreakdown.free + subBreakdown.pro + subBreakdown.premium;
    const pieData = [
        { name: 'Free', value: subBreakdown.free || 1, color: '#64748b' },
        { name: 'Pro', value: subBreakdown.pro, color: '#3b82f6' },
        { name: 'Premium', value: subBreakdown.premium, color: '#f59e0b' },
    ].filter(d => d.value > 0);

    const recentSignups = stats?.recentSignups || [];

    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    const getTierStyle = (tier) => {
        switch (tier) {
            case 'pro': return { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' };
            case 'premium': return { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' };
            default: return { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' };
        }
    };

    return (
        <div style={{ padding: '32px' }}>
            <header style={{ marginBottom: 32 }}>
                <h1 style={{
                    fontSize: '2rem', fontWeight: 800,
                    background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                    Dashboard Overview
                </h1>
                <p style={{ color: '#64748b', marginTop: 8 }}>Welcome back, Admin. Here's what's happening.</p>
            </header>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
                {statCards.map((card, i) => (
                    <div key={i} style={{
                        background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden',
                        backdropFilter: 'blur(20px)', transition: 'all 0.25s ease'
                    }}>
                        <div style={{
                            position: 'absolute', right: -20, top: -20, width: 80, height: 80,
                            borderRadius: '50%', background: card.bgColor, opacity: 0.5
                        }}></div>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.title}</p>
                                    <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginTop: 8 }}>
                                        {card.value}
                                    </h3>
                                    {card.subtitle && <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: 4 }}>{card.subtitle}</p>}
                                </div>
                                <div style={{
                                    padding: 12, borderRadius: 12, background: card.bgColor,
                                    fontSize: '1.4rem', lineHeight: 1
                                }}>{card.icon}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
                {/* Activity Chart */}
                <div style={{
                    background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16, padding: 24, backdropFilter: 'blur(20px)'
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 24, color: '#f1f5f9' }}>📈 Test Activity (Last 7 Days)</h3>
                    <div style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9' }}
                                    labelStyle={{ color: '#94a3b8' }}
                                />
                                <Area type="monotone" dataKey="tests" stroke="#6366f1" strokeWidth={2} fill="url(#colorTests)" name="Tests" />
                                <Area type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} fill="url(#colorAccuracy)" name="Avg Accuracy %" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subscription Breakdown */}
                <div style={{
                    background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16, padding: 24, backdropFilter: 'blur(20px)'
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: '#f1f5f9' }}>📊 User Plans</h3>
                    <div style={{ height: 180, display: 'flex', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                        {pieData.map((d, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }}></div>
                                <span style={{ color: '#94a3b8' }}>{d.name} ({d.value})</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 20, textAlign: 'center' }}>
                        <p style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9' }}>{totalSubs}</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</p>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Recent Signups */}
                <div style={{
                    background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16, padding: 24, backdropFilter: 'blur(20px)'
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: '#f1f5f9' }}>🆕 Recent Signups</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {recentSignups.length === 0 && (
                            <p style={{ color: '#475569', fontSize: '0.85rem' }}>No signups yet.</p>
                        )}
                        {recentSignups.slice(0, 7).map((u, i) => {
                            const tier = getTierStyle(u.subscription_tier);
                            return (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                                    background: 'rgba(255,255,255,0.03)', borderRadius: 10
                                }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0
                                    }}>
                                        {u.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>{u.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                                    </div>
                                    <span style={{
                                        padding: '3px 10px', borderRadius: 20, fontSize: '0.65rem',
                                        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                                        background: tier.bg, color: tier.color, border: `1px solid ${tier.border}`
                                    }}>
                                        {u.subscription_tier || 'free'}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: '#475569', whiteSpace: 'nowrap' }}>
                                        {formatTimeAgo(u.created_at)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{
                    background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16, padding: 24, backdropFilter: 'blur(20px)'
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: '#f1f5f9' }}>⚡ Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <a href="/admin/questions" style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
                            border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12,
                            textDecoration: 'none', color: '#c7d2fe', fontWeight: 600, fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>📝</span> Manage Questions
                        </a>
                        <a href="/admin/ncert" style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
                            textDecoration: 'none', color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>📚</span> NCERT Library
                        </a>
                        <a href="/admin/users" style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
                            textDecoration: 'none', color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>👥</span> User Management
                        </a>
                        <a href="/admin/revenue" style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
                            textDecoration: 'none', color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>💰</span> Revenue Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
