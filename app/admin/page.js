'use client';
import { Icon } from '@/components/ui/Icon';

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
            <div className="w-10 h-10 border-2 border-t-transparent radius_full animate-spin" style={{ borderTopColor: 'transparent' }}></div>
        </div>
    );

    const statCards = [
        { title: 'Total Users', value: stats?.users || 0, icon: '👥', bgColor: 'rgba(59,130,246,0.12)' },
        { title: 'Question Bank', value: stats?.questions || 0, subtitle: `${stats?.pyqs || 0} PYQs`, icon: <Icon name="BookOpen" size={28} />, bgColor: 'rgba(139,92,246,0.12)' },
        { title: 'Pending Reports', value: stats?.reports || 0, icon: '🚩', bgColor: 'rgba(239,68,68,0.12)' },
        { title: 'System Status', value: stats?.killSwitchesActive === false ? 'Degraded' : 'Healthy', icon: stats?.killSwitchesActive === false ? <Icon name="AlertCircle" size={28} /> : <Icon name="CheckCircle" size={28} />, color: stats?.killSwitchesActive === false ? '#f59e0b' : '#10b981', bgColor: stats?.killSwitchesActive === false ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)' },
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
        { name: 'Free', value: subBreakdown.free || 1, },
        { name: 'Pro', value: subBreakdown.pro, },
        { name: 'Premium', value: subBreakdown.premium, },
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
            case 'pro': return { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' };
            case 'premium': return { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' };
            default: return { bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.3)' };
        }
    };

    return (
        <div style={{ padding: 32 }}>
            <header style={{ marginBottom: 32 }}>
                <h1 style={{
                    fontWeight: 800,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                    Dashboard Overview
                </h1>
                <p style={{ marginTop: 8 }}>Welcome back, Admin. Here's what's happening.</p>
            </header>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
                {statCards.map((card, i) => (
                    <div key={i} style={{
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: 24, position: 'relative', overflow: 'hidden',
                        transition: 'all 0.25s ease'
                    }}>
                        <div style={{
                            position: 'absolute', right: -20, top: -20, width: 80, height: 80,
                            background: card.bgColor, opacity: 0.5
                        }}></div>
                        <div style={{ position: 'relative', }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.title}</p>
                                    <h3 style={{ fontWeight: 800, marginTop: 8 }}>
                                        {card.value}
                                    </h3>
                                    {card.subtitle && <p style={{ marginTop: 4 }}>{card.subtitle}</p>}
                                </div>
                                <div style={{
                                    padding: 12, background: card.bgColor,
                                    lineHeight: 1
                                }}>{card.icon}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Telemetry Dashboard (CTO Requirement) */}
            {stats?.aiTelemetry && (
                <div style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: 24, marginBottom: 32, }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span><Icon name="Brain" /></span> AI API Telemetry (Today)
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        <div style={{ padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ marginBottom: 4 }}>Tokens (In)</div>
                            <div style={{ fontWeight: 700, }}>
                                {(stats.aiTelemetry.totalTokensIn / 1000).toFixed(1)}k
                            </div>
                        </div>
                        <div style={{ padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ marginBottom: 4 }}>Tokens (Out)</div>
                            <div style={{ fontWeight: 700, }}>
                                {(stats.aiTelemetry.totalTokensOut / 1000).toFixed(1)}k
                            </div>
                        </div>
                        <div style={{ padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ marginBottom: 4 }}>Est. Cost (USD)</div>
                            <div style={{ fontWeight: 700, }}>
                                ${stats.aiTelemetry.estimatedCostUSD.toFixed(4)}
                            </div>
                        </div>
                        <div style={{ padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ marginBottom: 4 }}>Est. Cost (INR)</div>
                            <div style={{ fontWeight: 700, }}>
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
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: 24, }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 16, }}>🆕 Recent Signups</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {recentSignups.length === 0 && (
                            <p >No signups yet.</p>
                        )}
                        {recentSignups.slice(0, 7).map((u, i) => {
                            const tier = getTierStyle(u.subscription_tier);
                            return (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                                    }}>
                                    <div style={{
                                        width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, flexShrink: 0
                                    }}>
                                        {u.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, }}>{u.name}</div>
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                                    </div>
                                    <span style={{
                                        padding: '3px 10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                                        background: tier.bg, color: tier.color, border: `1px solid ${tier.border}`
                                    }}>
                                        {u.subscription_tier || 'free'}
                                    </span>
                                    <span style={{ whiteSpace: 'nowrap' }}>
                                        {formatTimeAgo(u.created_at)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: 24, }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 16, }}><Icon name="Zap" /> Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <a href="/admin/questions" style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                            border: '1px solid rgba(99,102,241,0.2)', textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s'
                        }}>
                            <span ><Icon name="FileText" /></span> Manage Questions
                        </a>
                        <a href="/admin/ncert" style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                            border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s'
                        }}>
                            <span ><Icon name="BookOpen" /></span> NCERT Library
                        </a>
                        <a href="/admin/users" style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                            border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s'
                        }}>
                            <span ><Icon name="Star" size={16} /></span> User Management
                        </a>
                        <a href="/admin/revenue" style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                            border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s'
                        }}>
                            <span ><Icon name="Star" size={16} /></span> Revenue Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
