'use client';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

import { useState, useEffect } from 'react';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterTier, setFilterTier] = useState('all');

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const filtered = users.filter(u => {
        const matchesSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
        const matchesTier = filterTier === 'all' || (u.subscription_tier || 'free') === filterTier;
        return matchesSearch && matchesTier;
    });

    const getTierStyle = (tier) => {
        switch (tier) {
            case 'pro': return { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)', label: '<Icon name="Zap" /> PRO' };
            case 'premium': return { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)', label: '<Icon name="Crown" /> PREMIUM' };
            default: return { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)', label: 'FREE' };
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <div style={{ padding: 32 }}>
            <header style={{ marginBottom: 32 }}>
                <h1 style={{ fontWeight: 800, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    User Management
                </h1>
                <p style={{ marginTop: 8 }}>
                    {users.length} total users registered
                </p>
            </header>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 400 }}>
                    <Input
                        type="text" placeholder="Search by name or email..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.1)', outline: 'none'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['all', 'free', 'pro', 'premium'].map(tier => (
                        <Button key={tier} onClick={() => setFilterTier(tier)} style={{
                            padding: '10px 18px', border: '1px solid',
                            fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase',
                            letterSpacing: '0.05em', transition: 'all 0.2s',
                            background: filterTier === tier ? 'var(--bg-glass)' : 'transparent',
                            borderColor: filterTier === tier ? 'var(--bg-glass)' : 'var(--bg-glass)',
                            color: filterTier === tier ? 'var(--text-primary)' : 'var(--text-primary)'
                        }}>
                            {tier}
                        </Button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                    <div style={{ width: 32, height: 32, border: '2px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                </div>
            ) : (
                <div style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    overflow: 'hidden', }}>
                    {/* Table Header */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '48px 1.5fr 2fr 100px 120px 80px',
                        gap: 12, padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                        fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.08em'
                    }}>
                        <span>#</span><span>Name</span><span>Email</span><span>Plan</span><span>Joined</span><span>XP</span>
                    </div>

                    {/* Rows */}
                    {filtered.length === 0 && (
                        <div style={{ padding: 40, textAlign: 'center', }}>
                            No users found matching your filters.
                        </div>
                    )}
                    {filtered.map((u, i) => {
                        const tier = getTierStyle(u.subscription_tier);
                        return (
                            <div key={u.id} style={{
                                display: 'grid', gridTemplateColumns: '48px 1.5fr 2fr 100px 120px 80px',
                                gap: 12, padding: '14px 20px', alignItems: 'center',
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                transition: 'background 0.15s', cursor: 'default'
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <span style={{ fontFamily: 'monospace' }}>
                                    {u.id}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, flexShrink: 0
                                    }}>
                                        {u.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <span style={{ fontWeight: 600, }}>{u.name}</span>
                                </div>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</span>
                                <span style={{
                                    padding: '3px 10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                                    background: tier.bg, color: tier.color, border: `1px solid ${tier.border}`,
                                    display: 'inline-block', textAlign: 'center'
                                }}>
                                    {tier.label}
                                </span>
                                <span >{formatDate(u.created_at)}</span>
                                <span style={{ fontWeight: 600, }}>{u.xp || 0}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
