'use client';
import { useState, useEffect } from 'react';

export default function OpsControlRoom() {
    const [ops, setOps] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(null);

    const fetchOps = async () => {
        try {
            const res = await fetch('/api/admin/ops');
            if (res.ok) {
                const data = await res.json();
                setOps(data);
                setLastRefresh(new Date());
            }
        } catch (e) { console.error('Ops fetch failed:', e); }
        setLoading(false);
    };

    useEffect(() => {
        fetchOps();
        const interval = setInterval(fetchOps, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ width: 40, height: 40, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
    );

    const StatusDot = ({ active, label }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: `1px solid ${active ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: active ? '#22c55e' : '#ef4444', boxShadow: `0 0 12px ${active ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}` }}></div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: active ? '#4ade80' : '#f87171' }}>{label}</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: active ? '#22c55e' : '#ef4444', background: active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '3px 10px', borderRadius: 20 }}>
                {active ? 'ONLINE' : 'KILLED'}
            </span>
        </div>
    );

    const CircuitCard = ({ name, data }) => {
        const stateColors = { CLOSED: '#22c55e', OPEN: '#ef4444', HALF_OPEN: '#f59e0b', UNKNOWN: '#64748b' };
        const state = data?.state || 'UNKNOWN';
        const color = stateColors[state] || '#64748b';
        return (
            <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: `1px solid ${color}33` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', textTransform: 'capitalize' }}>{name}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', padding: '3px 10px', borderRadius: 20, background: `${color}22`, color, border: `1px solid ${color}44` }}>{state}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Failures: {data?.failures || 0}/5
                    {data?.nextAttempt && <span> · Retry: {new Date(data.nextAttempt).toLocaleTimeString('en-IN')}</span>}
                </div>
            </div>
        );
    };

    const ks = ops?.killSwitches || {};
    const cs = ops?.circuitStates || {};
    const ts = ops?.tokenStats || {};
    const tr = ops?.trustDistribution || {};
    const em = ops?.errorMetrics || {};
    const ue = ops?.unitEconomics || {};
    const totalTrust = (tr.healthy || 0) + (tr.warning || 0) + (tr.flagged || 0) + (tr.banned || 0);

    return (
        <div style={{ padding: 32 }}>
            <header style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #ef4444, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ⚡ Operations Control Room
                    </h1>
                    <p style={{ color: '#64748b', marginTop: 8 }}>Real-time infrastructure health & resilience telemetry</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <button onClick={fetchOps} style={{ padding: '8px 20px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                        🔄 Refresh
                    </button>
                    {lastRefresh && <p style={{ fontSize: '0.7rem', color: '#475569', marginTop: 6 }}>Last: {lastRefresh.toLocaleTimeString('en-IN')}</p>}
                </div>
            </header>

            {/* Kill Switches */}
            <div style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 24, backdropFilter: 'blur(20px)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🧯</span> Feature Kill Switches
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <StatusDot active={ks.ai} label="AI Engine" />
                    <StatusDot active={ks.payments} label="Payment Gateway" />
                    <StatusDot active={ks.referrals} label="Referral System" />
                </div>
            </div>

            {/* Circuit Breakers + Error Rate */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
                <div style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, backdropFilter: 'blur(20px)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>🚦</span> Circuit Breaker Status
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        {['gemini', 'groq', 'openrouter'].map(name => (
                            <CircuitCard key={name} name={name} data={cs[name]} />
                        ))}
                    </div>
                </div>

                <div style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, backdropFilter: 'blur(20px)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>📉</span> Error Rate (24h)
                    </h3>
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: '3rem', fontWeight: 800, color: em.failedSubmissions > 0 ? '#f59e0b' : '#22c55e' }}>
                            {em.totalTests > 0 ? Math.round((em.failedSubmissions / em.totalTests) * 100) : 0}%
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                            {em.failedSubmissions} failed / {em.totalTests} total tests
                        </p>
                    </div>
                </div>
            </div>

            {/* Unit Economics & Revenue Intelligence */}
            <div style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 24, backdropFilter: 'blur(20px)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>💰</span> Revenue Intelligence & Unit Economics
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    <div style={{ padding: 16, background: 'rgba(34,197,94,0.05)', borderRadius: 12, border: '1px solid rgba(34,197,94,0.1)' }}>
                        <div style={{ fontSize: '0.75rem', color: '#4ade80', marginBottom: 4 }}>Projected MRR (Subs)</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f1f5f9' }}>₹{ue.projectedMRR?.toLocaleString() || 0}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 4 }}>Est. Target: ₹{Math.round(ue.projectedMRR / 30 || 0)}/day</div>
                    </div>
                    <div style={{ padding: 16, background: 'rgba(239,68,68,0.05)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.1)' }}>
                        <div style={{ fontSize: '0.75rem', color: '#f87171', marginBottom: 4 }}>API Burn (Today)</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f1f5f9' }}>₹{Math.round(ue.dailyCost || 0)}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 4 }}>Total platform cost</div>
                    </div>
                    <div style={{ padding: 16, background: ue.margin < 30 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.05)', borderRadius: 12, border: `1px solid ${ue.margin < 30 ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.1)'}` }}>
                        <div style={{ fontSize: '0.75rem', color: ue.margin < 30 ? '#f87171' : '#4ade80', marginBottom: 4 }}>Gross Margin</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f1f5f9' }}>{ue.margin || 100}%</div>
                        <div style={{ fontSize: '0.7rem', color: ue.margin < 30 ? '#fca5a5' : '#64748b', marginTop: 4 }}>
                            {ue.margin < 30 ? '⚠️ EMERGENCY DOWNGRADE ACTIVE' : 'Healthy operating margin'}
                        </div>
                    </div>
                    <div style={{ padding: 16, background: 'rgba(99,102,241,0.05)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.1)' }}>
                        <div style={{ fontSize: '0.75rem', color: '#818cf8', marginBottom: 4 }}>Ops Efficiency</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ fontSize: '0.85rem', color: '#e0e7ff', fontWeight: 600 }}>₹{ue.costPerRequest?.toFixed(4) || 0} <span style={{ color: '#6366f1', fontSize: '0.7rem', fontWeight: 400 }}>/ request</span></div>
                            <div style={{ fontSize: '0.85rem', color: '#e0e7ff', fontWeight: 600 }}>₹{ue.costPerSession?.toFixed(2) || 0} <span style={{ color: '#6366f1', fontSize: '0.7rem', fontWeight: 400 }}>/ active user</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Token Consumption + Trust Score */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Token Consumption */}
                <div style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, backdropFilter: 'blur(20px)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>📊</span> Token Consumption (Today)
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                        <div style={{ padding: 16, background: 'rgba(167,139,250,0.08)', borderRadius: 12, border: '1px solid rgba(167,139,250,0.15)' }}>
                            <div style={{ fontSize: '0.75rem', color: '#a78bfa', marginBottom: 4 }}>Total Tokens</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c4b5fd' }}>{(ts.totalDaily / 1000).toFixed(1)}k</div>
                        </div>
                        <div style={{ padding: 16, background: 'rgba(59,130,246,0.08)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.15)' }}>
                            <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginBottom: 4 }}>Active Users</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#93c5fd' }}>{ts.uniqueUsers}</div>
                        </div>
                    </div>

                    {/* Top Consumers */}
                    {ts.topConsumers?.length > 0 && (
                        <div>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Consumers</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {ts.topConsumers.slice(0, 5).map((c, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, fontSize: '0.8rem' }}>
                                        <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{c.userId.slice(0, 8)}...</span>
                                        <span style={{ color: '#a78bfa', fontWeight: 700 }}>{(c.tokens / 1000).toFixed(1)}k</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Trust Score Distribution */}
                <div style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, backdropFilter: 'blur(20px)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>🛡️</span> Trust Score Distribution
                    </h3>
                    
                    {[
                        { label: 'Healthy (80-100)', count: tr.healthy, color: '#22c55e', bgColor: 'rgba(34,197,94,0.1)' },
                        { label: 'Warning (50-79)', count: tr.warning, color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)' },
                        { label: 'Flagged (20-49)', count: tr.flagged, color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)' },
                        { label: 'Banned (<20)', count: tr.banned, color: '#991b1b', bgColor: 'rgba(153,27,27,0.1)' },
                    ].map((tier, i) => {
                        const pct = totalTrust > 0 ? Math.round((tier.count / totalTrust) * 100) : 0;
                        return (
                            <div key={i} style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{tier.label}</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: tier.color }}>{tier.count} ({pct}%)</span>
                                </div>
                                <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${pct}%`, background: tier.color, borderRadius: 4, transition: 'width 0.5s ease' }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
