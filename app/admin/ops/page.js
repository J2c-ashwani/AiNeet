'use client';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
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
            <div className="spinner" style={{ width: 40, height: 40, borderTopColor: 'transparent' }} />
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
            <div className="ops-circuit-card" style={{ borderColor: `${color}33`, borderWidth: 1, borderStyle: 'solid' }}>
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
                    <h1 className="ops-title"><Icon name="Zap" /> Operations Control Room</h1>
                    <p className="ops-subtitle">Real-time infrastructure health &amp; resilience telemetry</p>
                </div>
                <div className="ops-header-actions">
                    <Button onClick={fetchOps} className="ops-refresh-btn"><Icon name="RefreshCw" /> Refresh</Button>
                    {lastRefresh && <p className="ops-last-refresh">Last: {lastRefresh.toLocaleTimeString('en-IN')}</p>}
                </div>
            </header>

            {/* Kill Switches */}
            <div className="ops-section">
                <h3 className="ops-section-title"><span><Icon name="Star" size={16} /></span> Feature Kill Switches</h3>
                <div className="ops-grid-3">
                    <StatusDot active={ks.ai} label="AI Engine" />
                    <StatusDot active={ks.payments} label="Payment Gateway" />
                    <StatusDot active={ks.referrals} label="Referral System" />
                </div>
            </div>

            {/* Circuit Breakers + Error Rate */}
            <div className="ops-grid-2-1">
                <div className="ops-section" style={{ marginBottom: 0 }}>
                    <h3 className="ops-section-title"><span><Icon name="Star" size={16} /></span> Circuit Breaker Status</h3>
                    <div className="ops-grid-3">
                        {['gemini', 'groq', 'openrouter'].map(name => (
                            <CircuitCard key={name} name={name} data={cs[name]} />
                        ))}
                    </div>
                </div>

                <div className="ops-section" style={{ marginBottom: 0 }}>
                    <h3 className="ops-section-title"><span><Icon name="Activity" /></span> Error Rate (24h)</h3>
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
                <h3 className="ops-section-title"><span><Icon name="Star" size={16} /></span> Revenue Intelligence &amp; Unit Economics</h3>
                <div className="ops-grid-4">
                    <div className="ops-ue-card" style={{ border: '1px solid rgba(34,197,94,0.1)' }}>
                        <div className="ops-ue-label" >Projected MRR (Subs)</div>
                        <div className="ops-ue-value">₹{ue.projectedMRR?.toLocaleString() || 0}</div>
                        <div className="ops-ue-meta" >Est. Target: ₹{Math.round(ue.projectedMRR / 30 || 0)}/day</div>
                    </div>
                    <div className="ops-ue-card" style={{ border: '1px solid rgba(239,68,68,0.1)' }}>
                        <div className="ops-ue-label" >API Burn (Today)</div>
                        <div className="ops-ue-value">₹{Math.round(ue.dailyCost || 0)}</div>
                        <div className="ops-ue-meta" >Total platform cost</div>
                    </div>
                    <div className="ops-ue-card" style={{ background: ue.margin < 30 ? 'var(--bg-glass)' : 'var(--bg-glass)', border: `1px solid ${ue.margin < 30 ? 'var(--bg-glass)' : 'var(--bg-glass)'}` }}>
                        <div className="ops-ue-label" style={{ color: ue.margin < 30 ? 'var(--danger)' : 'var(--success)' }}>Gross Margin</div>
                        <div className="ops-ue-value">{ue.margin || 100}%</div>
                        <div className="ops-ue-meta" style={{ color: ue.margin < 30 ? 'var(--danger)' : 'var(--text-muted)' }}>
                            {ue.margin < 30 ? <><Icon name="AlertCircle" size={16} /> EMERGENCY DOWNGRADE ACTIVE</> : 'Healthy operating margin'}
                        </div>
                    </div>
                    <div className="ops-ue-card" style={{ border: '1px solid rgba(99,102,241,0.1)' }}>
                        <div className="ops-ue-label" >Ops Efficiency</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ fontWeight: 600 }}>₹{ue.costPerRequest?.toFixed(4) || 0} <span style={{ fontWeight: 400 }}>/ request</span></div>
                            <div style={{ fontWeight: 600 }}>₹{ue.costPerSession?.toFixed(2) || 0} <span style={{ fontWeight: 400 }}>/ active user</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Token Consumption + Trust Score */}
            <div className="ops-grid-1-1">
                {/* Token Consumption */}
                <div className="ops-section" style={{ marginBottom: 0 }}>
                    <h3 className="ops-section-title"><span><Icon name="BarChart2" /></span> Token Consumption (Today)</h3>
                    <div className="ops-grid-1-1" style={{ gap: 12, marginBottom: 20 }}>
                        <div className="ops-token-card" style={{ border: '1px solid rgba(167,139,250,0.15)' }}>
                            <div className="ops-token-label" >Total Tokens</div>
                            <div className="ops-token-value" >{(ts.totalDaily / 1000).toFixed(1)}k</div>
                        </div>
                        <div className="ops-token-card" style={{ border: '1px solid rgba(59,130,246,0.15)' }}>
                            <div className="ops-token-label" >Active Users</div>
                            <div className="ops-token-value" >{ts.uniqueUsers}</div>
                        </div>
                    </div>

                    {/* Top Consumers */}
                    {ts.topConsumers?.length > 0 && (
                        <div>
                            <h4 style={{ fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Consumers</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {ts.topConsumers.slice(0, 5).map((c, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', }}>
                                        <span style={{ fontFamily: 'monospace' }}>{c.userId.slice(0, 8)}...</span>
                                        <span style={{ fontWeight: 700 }}>{(c.tokens / 1000).toFixed(1)}k</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Trust Score Distribution */}
                <div className="ops-section" style={{ marginBottom: 0 }}>
                    <h3 className="ops-section-title"><span><Icon name="Star" size={16} />️</span> Trust Score Distribution</h3>
                    
                    {[
                        { label: 'Healthy (80-100)', count: tr.healthy, bgColor: 'rgba(34,197,94,0.1)' },
                        { label: 'Warning (50-79)', count: tr.warning, bgColor: 'rgba(245,158,11,0.1)' },
                        { label: 'Flagged (20-49)', count: tr.flagged, bgColor: 'rgba(239,68,68,0.1)' },
                        { label: 'Banned (<20)', count: tr.banned, bgColor: 'rgba(153,27,27,0.1)' },
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
