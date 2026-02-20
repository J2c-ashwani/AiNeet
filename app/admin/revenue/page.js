
'use client';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function AdminRevenuePage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) setStats(await res.json());
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        fetchData();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div style={{ width: 40, height: 40, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
    );

    const subs = stats?.subscriptionBreakdown || { free: 0, pro: 0, premium: 0 };
    const proRevenue = subs.pro * 299;
    const premiumRevenue = subs.premium * 599;
    const totalMRR = proRevenue + premiumRevenue;
    const conversionRate = (subs.pro + subs.premium) > 0 && stats?.users > 0
        ? (((subs.pro + subs.premium) / stats.users) * 100).toFixed(1)
        : '0';

    const revenueCards = [
        { title: 'Monthly Revenue', value: `₹${totalMRR.toLocaleString()}`, subtitle: 'Estimated MRR', icon: '💰', color: '#10b981' },
        { title: 'Paid Users', value: (subs.pro + subs.premium), subtitle: `${conversionRate}% conversion`, icon: '💎', color: '#6366f1' },
        { title: 'Free Users', value: subs.free, subtitle: 'Potential upsell', icon: '🆓', color: '#64748b' },
        { title: 'AI API Calls', value: stats?.questions || 0, subtitle: 'Questions generated', icon: '🤖', color: '#f59e0b' },
    ];

    const planRevData = [
        { name: 'Pro (₹299)', value: proRevenue, color: '#3b82f6' },
        { name: 'Premium (₹599)', value: premiumRevenue, color: '#f59e0b' },
    ].filter(d => d.value > 0);

    if (planRevData.length === 0) planRevData.push({ name: 'No Revenue', value: 1, color: '#334155' });

    const tierBarData = [
        { name: 'Free', users: subs.free, fill: '#475569' },
        { name: 'Pro', users: subs.pro, fill: '#3b82f6' },
        { name: 'Premium', users: subs.premium, fill: '#f59e0b' },
    ];

    return (
        <div style={{ padding: 32 }}>
            <header style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Revenue Dashboard
                </h1>
                <p style={{ color: '#64748b', marginTop: 8 }}>Track monetization, subscriptions, and AI cost metrics.</p>
            </header>

            {/* Revenue Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
                {revenueCards.map((card, i) => (
                    <div key={i} style={{
                        background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden',
                        backdropFilter: 'blur(20px)'
                    }}>
                        <div style={{ position: 'absolute', right: -15, top: -15, width: 70, height: 70, borderRadius: '50%', background: card.color, opacity: 0.08 }}></div>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.title}</p>
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginTop: 8 }}>{card.value}</h3>
                        <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: 4 }}>{card.subtitle}</p>
                        <span style={{ position: 'absolute', right: 20, top: 20, fontSize: '1.5rem' }}>{card.icon}</span>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                {/* Revenue Breakdown Pie */}
                <div style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, backdropFilter: 'blur(20px)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>💰 Revenue by Plan</h3>
                    <div style={{ height: 220, display: 'flex', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={planRevData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ₹${value}`}>
                                    {planRevData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9' }} formatter={(v) => `₹${v}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Tier Bar Chart */}
                <div style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, backdropFilter: 'blur(20px)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Users by Plan</h3>
                    <div style={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={tierBarData}>
                                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9' }} />
                                <Bar dataKey="users" radius={[8, 8, 0, 0]}>
                                    {tierBarData.map((entry, index) => (
                                        <Cell key={index} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Pricing Summary */}
            <div style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, backdropFilter: 'blur(20px)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>📋 Plan Pricing Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {[
                        { name: 'Free', price: '₹0', color: '#475569', features: ['5 doubts/day', '2 AI tests/day', 'Basic analytics'], users: subs.free },
                        { name: 'Pro', price: '₹299/mo', color: '#3b82f6', features: ['30 doubts/day', '10 AI tests/day', 'Advanced analytics', 'Priority support'], users: subs.pro },
                        { name: 'Premium', price: '₹599/mo', color: '#f59e0b', features: ['Unlimited doubts', 'Unlimited tests', 'Vision AI (Snap & Solve)', 'Parent reports', 'Priority support'], users: subs.premium },
                    ].map((plan, i) => (
                        <div key={i} style={{
                            padding: 20, borderRadius: 14, border: `1px solid ${plan.color}33`,
                            background: `${plan.color}08`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <h4 style={{ fontWeight: 700, color: plan.color, fontSize: '1rem' }}>{plan.name}</h4>
                                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f1f5f9' }}>{plan.price}</span>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>{plan.users}</div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Active Users</p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {plan.features.map((f, j) => (
                                    <li key={j} style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '3px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ color: plan.color }}>✓</span> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
