
'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const AdminCharts = dynamic(() => import('./AdminCharts'), { ssr: false, loading: () => <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading charts...</div> });

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

            {/* AI Telemetry Dashboard (CTO Requirement) */}
            {stats?.aiTelemetry && (
                <div style={{
                    background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16, padding: 24, marginBottom: 32, backdropFilter: 'blur(20px)'
                }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>🧠</span> AI API Telemetry (Today)
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4 }}>Tokens (In)</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#a78bfa' }}>
                                {(stats.aiTelemetry.totalTokensIn / 1000).toFixed(1)}k
                            </div>
                        </div>
                        <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4 }}>Tokens (Out)</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399' }}>
                                {(stats.aiTelemetry.totalTokensOut / 1000).toFixed(1)}k
                            </div>
                        </div>
                        <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4 }}>Est. Cost (USD)</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fbbf24' }}>
                                ${stats.aiTelemetry.estimatedCostUSD.toFixed(4)}
                            </div>
                        </div>
                        <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4 }}>Est. Cost (INR)</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f87171' }}>
                                ₹{stats.aiTelemetry.estimatedCostINR.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <AdminCharts chartData={chartData} pieData={pieData} totalSubs={totalSubs} />

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
