'use client';
import { Icon } from '@/components/ui/Icon';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const RevenueCharts = dynamic(() => import('./RevenueCharts'), { ssr: false, loading: () => <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading charts...</div> });

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
            <div style={{ width: 40, height: 40, border: '2px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
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
        { title: 'Monthly Revenue', value: `₹${totalMRR.toLocaleString()}`, subtitle: 'Estimated MRR', icon: '💰', },
        { title: 'Paid Users', value: (subs.pro + subs.premium), subtitle: `${conversionRate}% conversion`, icon: '💎', },
        { title: 'Free Users', value: subs.free, subtitle: 'Potential upsell', icon: '🆓', },
        { title: 'AI API Calls', value: stats?.questions || 0, subtitle: 'Questions generated', icon: <Icon name="Cpu" size={24} />, },
    ];

    const planRevData = [
        { name: 'Pro (₹299)', value: proRevenue, },
        { name: 'Premium (₹599)', value: premiumRevenue, },
    ].filter(d => d.value > 0);

    if (planRevData.length === 0) planRevData.push({ name: 'No Revenue', value: 1, });

    const tierBarData = [
        { name: 'Free', users: subs.free, fill: '#475569' },
        { name: 'Pro', users: subs.pro, fill: '#3b82f6' },
        { name: 'Premium', users: subs.premium, fill: '#f59e0b' },
    ];

    return (
        <div style={{ padding: 32 }}>
            <header style={{ marginBottom: 32 }}>
                <h1 style={{ fontWeight: 800, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Revenue Dashboard
                </h1>
                <p style={{ marginTop: 8 }}>Track monetization, subscriptions, and AI cost metrics.</p>
            </header>

            {/* Revenue Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
                {revenueCards.map((card, i) => (
                    <div key={i} style={{
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: 24, position: 'relative', overflow: 'hidden',
                        }}>
                        <div style={{ position: 'absolute', right: -15, top: -15, width: 70, height: 70, background: card.color, opacity: 0.08 }}></div>
                        <p style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.title}</p>
                        <h3 style={{ fontWeight: 800, marginTop: 8 }}>{card.value}</h3>
                        <p style={{ marginTop: 4 }}>{card.subtitle}</p>
                        <span style={{ position: 'absolute', right: 20, top: 20, }}>{card.icon}</span>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <RevenueCharts planRevData={planRevData} tierBarData={tierBarData} />

            {/* Pricing Summary */}
            <div style={{ border: '1px solid rgba(255,255,255,0.08)', padding: 24, }}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}><Icon name="FileText" /> Plan Pricing Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {[
                        { name: 'Free', price: '₹0', features: ['5 doubts/day', '2 AI tests/day', 'Basic analytics'], users: subs.free },
                        { name: 'Pro', price: '₹299/mo', features: ['30 doubts/day', '10 AI tests/day', 'Advanced analytics', 'Priority support'], users: subs.pro },
                        { name: 'Premium', price: '₹599/mo', features: ['Unlimited doubts', 'Unlimited tests', 'Vision AI (Snap & Solve)', 'Parent reports', 'Priority support'], users: subs.premium },
                    ].map((plan, i) => (
                        <div key={i} style={{
                            padding: 20, border: `1px solid ${plan.color}33`,
                            background: `${plan.color}08`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <h4 style={{ fontWeight: 700, color: plan.color, }}>{plan.name}</h4>
                                <span style={{ fontWeight: 800, }}>{plan.price}</span>
                            </div>
                            <div style={{ fontWeight: 800, marginBottom: 8 }}>{plan.users}</div>
                            <p style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Active Users</p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {plan.features.map((f, j) => (
                                    <li key={j} style={{ padding: '3px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ color: plan.color }}><Icon name="Star" size={16} /></span> {f}
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
