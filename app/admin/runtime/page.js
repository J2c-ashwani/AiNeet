'use client';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useState, useEffect, useRef } from 'react';

// ─── UI Governance Health Widget ─────────────────────────────
function UIGovernanceHealth() {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Try to load the CI-generated report artifact
        fetch('/ui-governance-report.json')
            .then(r => r.ok ? r.json() : null)
            .then(data => { setReport(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    // MD Directive: Color Language
    const getStatus = (warnings) => {
        if (warnings === null || warnings === undefined) return { color: 'var(--text-muted)', label: 'N/A', status: 'neutral' };
        if (warnings > 2200) return { color: 'var(--danger)',  label: 'Critical', status: 'critical' };
        if (warnings > 1400) return { color: 'var(--warning)', label: 'Warning',  status: 'warn' };
        return { color: 'var(--success)', label: 'Healthy', status: 'ok' };
    };

    const warnStatus = getStatus(report?.total_warnings);
    const adoptionColor = !report ? 'var(--text-muted)' : report.token_adoption_pct >= 80 ? 'var(--success)' : report.token_adoption_pct >= 50 ? 'var(--warning)' : 'var(--danger)';

    // Governance metrics config
    const metrics = [
        {
            label: 'ESLint Warnings Remaining',
            value: loading ? '...' : (report?.total_warnings ?? 'N/A'),
            unit: ' warnings',
            color: warnStatus.color,
            sub: `Week 1 Target: ≤ 2,200 · Status: ${warnStatus.label}`,
        },
        {
            label: 'Token Adoption',
            value: loading ? '...' : `${report?.token_adoption_pct ?? 'N/A'}`,
            unit: '%',
            color: adoptionColor,
            sub: 'Files using canonical design tokens vs total',
        },
        {
            label: 'Inline Styles Remaining',
            value: loading ? '...' : (report?.inline_styles_remaining ?? 'N/A'),
            unit: ' violations',
            color: !report ? 'var(--text-muted)' : report.inline_styles_remaining > 500 ? 'var(--danger)' : report.inline_styles_remaining > 200 ? 'var(--warning)' : 'var(--success)',
            sub: 'Inline color + pixel violations tracked',
        },
        {
            label: 'Snapshot Pass Rate',
            value: loading ? '...' : (report?.snapshot_failures === 0 ? '100' : 'N/A'),
            unit: '%',
            color: report?.snapshot_failures === 0 ? 'var(--success)' : 'var(--danger)',
            sub: 'Playwright visual regression baseline',
        },
    ];

    const weeklyTargets = [
        { week: 'Week 1', target: 2200, label: '3000 → 2200' },
        { week: 'Week 2', target: 1400, label: '2200 → 1400' },
        { week: 'Week 3', target: 700,  label: '1400 → 700' },
        { week: 'Week 4', target: 200,  label: '700 → <200' },
    ];

    const currentWarnings = report?.total_warnings ?? 3021;

    return (
        <div className="card" style={{ padding: 24, marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h3 style={{ fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ display: 'inline-block', width: 10, height: 10, background: warnStatus.color }} />
                        UI Governance Health
                    </h3>
                    <p >
                        Design debt burndown · ESLint UI Gate tracking · Snapshot regression status
                    </p>
                </div>
                {report?.timestamp && (
                    <span >
                        Last scan: {new Date(report.timestamp).toLocaleString()}
                    </span>
                )}
            </div>

            {/* Metric Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
                {metrics.map(m => (
                    <div key={m.label} style={{
                        border: `1px solid ${m.color}33`,
                        borderLeft: `3px solid ${m.color}`,
                        padding: '16px 20px',
                    }}>
                        <div style={{ textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>{m.label}</div>
                        <div style={{ fontWeight: 900, color: m.color }}>
                            {m.value}<span style={{ fontWeight: 500, marginLeft: 3, }}>{m.unit}</span>
                        </div>
                        <div style={{ marginTop: 4 }}>{m.sub}</div>
                    </div>
                ))}
            </div>

            {/* Debt Burndown Progress */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 12, }}>Design Debt Burndown Plan</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {weeklyTargets.map(wt => {
                        const achieved = currentWarnings <= wt.target;
                        const progressPct = Math.min(100, Math.max(0, ((3021 - currentWarnings) / (3021 - wt.target)) * 100));
                        return (
                            <div key={wt.week} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 60, fontWeight: 600 }}>{wt.week}</div>
                                <div style={{ flex: 1, height: 6, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${progressPct}%`,
                                        background: achieved ? 'var(--success)' : 'var(--accent-primary)',
                                        transition: 'width 0.6s ease',
                                    }} />
                                </div>
                                <div style={{ width: 80, color: achieved ? 'var(--success)' : 'var(--text-muted)', textAlign: 'right', fontWeight: 600 }}>
                                    {wt.label}
                                </div>
                                <div style={{ width: 20 }}>{achieved ? '<Icon name="CheckCircle" />' : '<Icon name="Clock" />'}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── Metric Card ────────────────────────────────────────────
function MetricCard({ label, value, unit = '', status = 'ok', sub = null }) {
    const colors = { ok: '#10b981', warn: '#f59e0b', critical: '#ef4444', neutral: '#6366f1' };
    return (
        <div style={{ border: `1px solid ${colors[status]}33`, borderLeft: `3px solid ${colors[status]}`, padding: '20px 24px' }}>
            <div style={{ textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>{label}</div>
            <div style={{ fontWeight: 900, color: colors[status] }}>
                {value}<span style={{ fontWeight: 500, marginLeft: 4, }}>{unit}</span>
            </div>
            {sub && <div style={{ marginTop: 6 }}>{sub}</div>}
        </div>
    );
}

// ─── SLO Row ─────────────────────────────────────────────────
function SloRow({ name, target, current, unit = '%' }) {
    const met = current >= target;
    const pct = Math.min(100, (current / target) * 100);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, }}>{name}</div>
                <div >Target: {target}{unit}</div>
            </div>
            <div style={{ width: 120, height: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: met ? 'var(--text-primary)' : 'var(--text-primary)', transition: 'width 0.5s' }} />
            </div>
            <div style={{ fontWeight: 800, color: met ? 'var(--text-primary)' : 'var(--text-primary)', minWidth: 70, textAlign: 'right' }}>
                {current}{unit} {met ? '<Icon name="CheckCircle" />' : '🔴'}
            </div>
        </div>
    );
}

// ─── Event Feed ──────────────────────────────────────────────
function EventFeed({ events }) {
    const typeColors = {
        bridge_timeout: '#ef4444', memory_pressure: '#f59e0b', long_task: '#f97316',
        circuit_breaker_open: '#ef4444', recovery_success: '#10b981', recovery_corrupted: '#ef4444',
        lifecycle_boot_step_failure: '#ef4444',
        unhandled_rejection: '#f59e0b', schema_violation: '#ef4444',
        circuit_breaker_close: '#10b981', hydration_error: '#f97316',
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
            {events.length === 0 && (
                <div style={{ padding: 32, textAlign: 'center', }}>No events in last 24h <Icon name="CheckCircle" /></div>
            )}
            {events.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', borderLeft: `3px solid ${typeColors[e.event_type] || 'var(--text-primary)'}` }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                            <span style={{ fontWeight: 700, color: typeColors[e.event_type] || 'var(--text-primary)' }}>{e.event_type}</span>
                            <span >{new Date(e.created_at).toLocaleTimeString()}</span>
                        </div>
                        {e.failure_reason && <div style={{ fontFamily: 'monospace' }}>{e.failure_reason}</div>}
                        {e.route && <div style={{ marginTop: 2 }}>{e.route}</div>}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function RuntimeDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(null);
    const intervalRef = useRef(null);

    const load = async () => {
        try {
            const res = await fetch('/api/admin/runtime-health');
            if (res.ok) {
                setData(await res.json());
                setLastRefresh(new Date());
            }
        } finally { setLoading(false); }
    };

    useEffect(() => {
        load();
        intervalRef.current = setInterval(load, 30000); // Auto-refresh every 30s
        return () => clearInterval(intervalRef.current);
    }, []);

    if (loading) return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
    );

    const m = data || {};

    // Compute status thresholds (from stability covenant)
    const bridgeStatus   = (m.bridge_timeout_rate ?? 0) > 1   ? 'critical' : (m.bridge_timeout_rate ?? 0) > 0.5 ? 'warn' : 'ok';
    const recoveryStatus = (m.recovery_failure_rate ?? 0) > 2  ? 'critical' : (m.recovery_failure_rate ?? 0) > 1  ? 'warn' : 'ok';
    const memoryStatus   = (m.memory_pressure_count ?? 0) > 10 ? 'critical' : (m.memory_pressure_count ?? 0) > 3  ? 'warn' : 'ok';
    const anrStatus      = (m.long_task_count ?? 0) > 50       ? 'critical' : (m.long_task_count ?? 0) > 20       ? 'warn' : 'ok';

    const overallHealthy = bridgeStatus === 'ok' && recoveryStatus === 'ok' && memoryStatus === 'ok';

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontWeight: 900, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ width: 12, height: 12, background: overallHealthy ? 'var(--text-primary)' : 'var(--text-primary)', display: 'inline-block', boxShadow: `0 0 8px ${overallHealthy ? 'var(--text-primary)' : 'var(--text-primary)'}`, animation: 'pulse 2s infinite' }} />
                        Runtime Dashboard
                    </h1>
                    <p >
                        Platform nerve center — real-time production health · Last 24h
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {lastRefresh && <span >Refreshed {lastRefresh.toLocaleTimeString()}</span>}
                    <Button onClick={load} className="btn btn-secondary" style={{ padding: '6px 16px' }}>↻ Refresh</Button>
                </div>
            </div>

            {/* Stability Covenant Banner */}
            {!overallHealthy && (
                <div style={{ border: '1px solid rgba(239,68,68,0.4)', padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span ><Icon name="Star" size={16} /></span>
                    <div>
                        <strong >Stability Covenant Breach</strong>
                        <p style={{ marginTop: 2 }}>Feature development is frozen. All engineering effort must redirect to stability. See docs/stability-covenant.md.</p>
                    </div>
                </div>
            )}

            {/* Key Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                <MetricCard label="Active Test Sessions" value={m.active_sessions ?? 0} status="neutral" sub="Right now, live" />
                <MetricCard label="Bridge Timeout Rate" value={(m.bridge_timeout_rate ?? 0).toFixed(2)} unit="%" status={bridgeStatus} sub="Covenant limit: 1%" />
                <MetricCard label="Recovery Failure Rate" value={(m.recovery_failure_rate ?? 0).toFixed(2)} unit="%" status={recoveryStatus} sub="Covenant limit: 2%" />
                <MetricCard label="Memory Pressure Events" value={m.memory_pressure_count ?? 0} status={memoryStatus} sub="Heap > 120MB hits" />
                <MetricCard label="ANR Precursors" value={m.long_task_count ?? 0} status={anrStatus} sub="Long tasks > 200ms" />
                <MetricCard label="Offline Replay Failures" value={m.offline_replay_failures ?? 0} status={(m.offline_replay_failures ?? 0) > 0 ? 'critical' : 'ok'} sub="Should always be 0" />
                <MetricCard label="Fraud Signals (24h)" value={m.fraud_signals_count ?? 0} status={(m.fraud_signals_count ?? 0) > 10 ? 'warn' : 'ok'} sub="Pending review" />
                <MetricCard label="Circuit Breaker Opens" value={m.circuit_breaker_opens ?? 0} status={(m.circuit_breaker_opens ?? 0) > 0 ? 'warn' : 'ok'} sub="External service failures" />
            </div>

            {/* SLO Tracking */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontWeight: 800, marginBottom: 16, }}><Icon name="Star" size={16} />️ SLO Tracker</h3>
                    <SloRow name="Crash-free Sessions"    target={99.7} current={m.crash_free_rate ?? 99.9} />
                    <SloRow name="Test Recovery Success"  target={99.0} current={m.recovery_success_rate ?? 100} />
                    <SloRow name="Submission Integrity"   target={100}  current={m.submission_integrity_rate ?? 100} />
                    <SloRow name="API Uptime"             target={99.9} current={m.api_uptime ?? 99.95} />
                </div>

                {/* Boot Health */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontWeight: 800, marginBottom: 16, }}><Icon name="Zap" /> Boot Health (24h)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {['auth_restore', 'bridge_init', 'capability_negotiate', 'lifecycle_init', 'recovery_check', 'telemetry_flush'].map(step => {
                            const failures = m.boot_failures?.[step] ?? 0;
                            return (
                                <div key={step} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span style={{ fontFamily: 'monospace', }}>{step}</span>
                                    <span style={{ fontWeight: 700, color: failures === 0 ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                                        {failures === 0 ? '<Icon name="CheckCircle" /> Healthy' : `🔴 ${failures} failures`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Event Feed */}
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontWeight: 800, }}><Icon name="Star" size={16} /> Live Event Feed (Last 24h)</h3>
                    <span >{m.recent_events?.length ?? 0} events</span>
                </div>
                <EventFeed events={m.recent_events ?? []} />
            </div>

            {/* Feature Flag Status */}
            <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 800, marginBottom: 16, }}><Icon name="Star" size={16} /> Feature Flag Status</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                    {(m.feature_flags ?? []).map(ff => (
                        <div key={ff.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: `1px solid ${ff.enabled ? 'var(--bg-glass)' : 'var(--bg-glass)'}` }}>
                            <span style={{ width: 8, height: 8, background: ff.enabled ? 'var(--text-primary)' : 'var(--text-primary)', flexShrink: 0 }} />
                            <span style={{ fontFamily: 'monospace', color: ff.enabled ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                {ff.key.replace('ff_', '')}
                            </span>
                            {ff.rollout_pct < 100 && ff.enabled && (
                                <span style={{ marginLeft: 'auto' }}>{ff.rollout_pct}%</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* UI Governance Health — Wave 7 Design Debt Observability */}
            <UIGovernanceHealth />
        </div>
    );
}
