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
            <div className="spinner" style={{ width: '40px', height: '40px', borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
        </div>
    );

    const StatusDot = ({ active, label }) => (
        <div className={`ops-status-dot-container ${active ? 'ops-status-dot-container--active' : 'ops-status-dot-container--inactive'}`}>
            <div className={`ops-status-dot ${active ? 'ops-status-dot--active' : 'ops-status-dot--inactive'}`} />
            <span className={`ops-status-label ${active ? 'ops-status-label--active' : 'ops-status-label--inactive'}`}>{label}</span>
            <span className={`ops-status-badge ${active ? 'ops-status-badge--active' : 'ops-status-badge--inactive'}`}>
                {active ? 'ONLINE' : 'KILLED'}
            </span>
        </div>
    );

    const CircuitCard = ({ name, data }) => {
        // We still use inline vars for dynamic colors here, but map to tokens where possible.
        const stateColors = { CLOSED: 'var(--success)', OPEN: 'var(--danger)', HALF_OPEN: 'var(--warning)', UNKNOWN: 'var(--text-muted)' };
        const state = data?.state || 'UNKNOWN';
        const color = stateColors[state] || 'var(--text-muted)';
        return (
            <div className="ops-circuit-card" style={{ borderColor: `${color}33`, borderWidth: '1px', borderStyle: 'solid' }}>
                <div className="ops-circuit-header">
                    <span className="ops-circuit-name">{name}</span>
                    <span className="ops-circuit-state" style={{ background: `${color}22`, color: color, border: `1px solid ${color}44` }}>{state}</span>
                </div>
                <div className="ops-circuit-meta">
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
        <div className="ops-page">
            <header className="ops-header">
                <div>
                    <h1 className="ops-title">⚡ Operations Control Room</h1>
                    <p className="ops-subtitle">Real-time infrastructure health &amp; resilience telemetry</p>
                </div>
                <div className="ops-header-actions">
                    <button onClick={fetchOps} className="ops-refresh-btn">🔄 Refresh</button>
                    {lastRefresh && <p className="ops-last-refresh">Last: {lastRefresh.toLocaleTimeString('en-IN')}</p>}
                </div>
            </header>

            {/* Kill Switches */}
            <div className="ops-section">
                <h3 className="ops-section-title"><span>🧯</span> Feature Kill Switches</h3>
                <div className="ops-grid-3">
                    <StatusDot active={ks.ai} label="AI Engine" />
                    <StatusDot active={ks.payments} label="Payment Gateway" />
                    <StatusDot active={ks.referrals} label="Referral System" />
                </div>
            </div>

            {/* Circuit Breakers + Error Rate */}
            <div className="ops-grid-2-1">
                <div className="ops-section" style={{ marginBottom: 0 }}>
                    <h3 className="ops-section-title"><span>🚦</span> Circuit Breaker Status</h3>
                    <div className="ops-grid-3">
                        {['gemini', 'groq', 'openrouter'].map(name => (
                            <CircuitCard key={name} name={name} data={cs[name]} />
                        ))}
                    </div>
                </div>

                <div className="ops-section" style={{ marginBottom: 0 }}>
                    <h3 className="ops-section-title"><span>📉</span> Error Rate (24h)</h3>
                    <div className="ops-error-rate-container">
                        <div className="ops-error-rate-value" style={{ color: em.failedSubmissions > 0 ? 'var(--warning)' : 'var(--success)' }}>
                            {em.totalTests > 0 ? Math.round((em.failedSubmissions / em.totalTests) * 100) : 0}%
                        </div>
                        <p className="ops-error-rate-meta">
                            {em.failedSubmissions} failed / {em.totalTests} total tests
                        </p>
                    </div>
                </div>
            </div>

            {/* Unit Economics & Revenue Intelligence */}
            <div className="ops-section">
                <h3 className="ops-section-title"><span>💰</span> Revenue Intelligence &amp; Unit Economics</h3>
                <div className="ops-grid-4">
                    <div className="ops-ue-card" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
                        <div className="ops-ue-label" style={{ color: 'var(--success)' }}>Projected MRR (Subs)</div>
                        <div className="ops-ue-value">₹{ue.projectedMRR?.toLocaleString() || 0}</div>
                        <div className="ops-ue-meta" style={{ color: 'var(--text-muted)' }}>Est. Target: ₹{Math.round(ue.projectedMRR / 30 || 0)}/day</div>
                    </div>
                    <div className="ops-ue-card" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                        <div className="ops-ue-label" style={{ color: 'var(--danger)' }}>API Burn (Today)</div>
                        <div className="ops-ue-value">₹{Math.round(ue.dailyCost || 0)}</div>
                        <div className="ops-ue-meta" style={{ color: 'var(--text-muted)' }}>Total platform cost</div>
                    </div>
                    <div className="ops-ue-card" style={{ background: ue.margin < 30 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.05)', border: `1px solid ${ue.margin < 30 ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.1)'}` }}>
                        <div className="ops-ue-label" style={{ color: ue.margin < 30 ? 'var(--danger)' : 'var(--success)' }}>Gross Margin</div>
                        <div className="ops-ue-value">{ue.margin || 100}%</div>
                        <div className="ops-ue-meta" style={{ color: ue.margin < 30 ? 'var(--danger)' : 'var(--text-muted)' }}>
                            {ue.margin < 30 ? '⚠️ EMERGENCY DOWNGRADE ACTIVE' : 'Healthy operating margin'}
                        </div>
                    </div>
                    <div className="ops-ue-card" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                        <div className="ops-ue-label" style={{ color: 'var(--info)' }}>Ops Efficiency</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>₹{ue.costPerRequest?.toFixed(4) || 0} <span style={{ color: 'var(--info)', fontSize: '0.7rem', fontWeight: 400 }}>/ request</span></div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>₹{ue.costPerSession?.toFixed(2) || 0} <span style={{ color: 'var(--info)', fontSize: '0.7rem', fontWeight: 400 }}>/ active user</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Token Consumption + Trust Score */}
            <div className="ops-grid-1-1">
                {/* Token Consumption */}
                <div className="ops-section" style={{ marginBottom: 0 }}>
                    <h3 className="ops-section-title"><span>📊</span> Token Consumption (Today)</h3>
                    <div className="ops-grid-1-1" style={{ gap: '12px', marginBottom: '20px' }}>
                        <div className="ops-token-card" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}>
                            <div className="ops-token-label" style={{ color: 'var(--accent-secondary)' }}>Total Tokens</div>
                            <div className="ops-token-value" style={{ color: 'var(--text-primary)' }}>{(ts.totalDaily / 1000).toFixed(1)}k</div>
                        </div>
                        <div className="ops-token-card" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                            <div className="ops-token-label" style={{ color: 'var(--accent-primary)' }}>Active Users</div>
                            <div className="ops-token-value" style={{ color: 'var(--text-primary)' }}>{ts.uniqueUsers}</div>
                        </div>
                    </div>

                    {/* Top Consumers */}
                    {ts.topConsumers?.length > 0 && (
                        <div>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Consumers</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {ts.topConsumers.slice(0, 5).map((c, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                                        <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{c.userId.slice(0, 8)}...</span>
                                        <span style={{ color: 'var(--accent-secondary)', fontWeight: 700 }}>{(c.tokens / 1000).toFixed(1)}k</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Trust Score Distribution */}
                <div className="ops-section" style={{ marginBottom: 0 }}>
                    <h3 className="ops-section-title"><span>🛡️</span> Trust Score Distribution</h3>
                    
                    {[
                        { label: 'Healthy (80-100)', count: tr.healthy, color: 'var(--success)', bgColor: 'rgba(34,197,94,0.1)' },
                        { label: 'Warning (50-79)', count: tr.warning, color: 'var(--warning)', bgColor: 'rgba(245,158,11,0.1)' },
                        { label: 'Flagged (20-49)', count: tr.flagged, color: 'var(--danger)', bgColor: 'rgba(239,68,68,0.1)' },
                        { label: 'Banned (<20)', count: tr.banned, color: '#991b1b', bgColor: 'rgba(153,27,27,0.1)' },
                    ].map((tier, i) => {
                        const pct = totalTrust > 0 ? Math.round((tier.count / totalTrust) * 100) : 0;
                        return (
                            <div key={i} className="ops-trust-row">
                                <div className="ops-trust-header">
                                    <span className="ops-trust-label">{tier.label}</span>
                                    <span className="ops-trust-value" style={{ color: tier.color }}>{tier.count} ({pct}%)</span>
                                </div>
                                <div className="ops-trust-bar-bg">
                                    <div className="ops-trust-bar-fill" style={{ width: `${pct}%`, background: tier.color }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
