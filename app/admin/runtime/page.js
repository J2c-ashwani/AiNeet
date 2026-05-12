'use client';
import { useState, useEffect, useRef } from 'react';

// ─── Metric Card ────────────────────────────────────────────
function MetricCard({ label, value, unit = '', status = 'ok', sub = null }) {
    const colors = { ok: '#10b981', warn: '#f59e0b', critical: '#ef4444', neutral: '#6366f1' };
    return (
        <div style={{ background: 'var(--bg-elevated)', border: `1px solid ${colors[status]}33`, borderLeft: `3px solid ${colors[status]}`, borderRadius: 14, padding: '20px 24px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: colors[status] }}>
                {value}<span style={{ fontSize: '0.9rem', fontWeight: 500, marginLeft: 4, color: 'var(--text-muted)' }}>{unit}</span>
            </div>
            {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
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
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Target: {target}{unit}</div>
            </div>
            <div style={{ width: 120, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: met ? '#10b981' : '#ef4444', borderRadius: 4, transition: 'width 0.5s' }} />
            </div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: met ? '#10b981' : '#ef4444', minWidth: 70, textAlign: 'right' }}>
                {current}{unit} {met ? '✅' : '🔴'}
            </div>
        </div>
    );
}

// ─── Event Feed ──────────────────────────────────────────────
function EventFeed({ events }) {
    const typeColors = {
        bridge_timeout: '#ef4444', memory_pressure: '#f59e0b', long_task: '#f97316',
        circuit_breaker_open: '#ef4444', recovery_success: '#10b981', recovery_corrupted: '#ef4444',
        lifecycle_background: '#6366f1', boot_step_failure: '#ef4444',
        unhandled_rejection: '#f59e0b', schema_violation: '#ef4444',
        circuit_breaker_close: '#10b981', hydration_error: '#f97316',
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
            {events.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No events in last 24h ✅</div>
            )}
            {events.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, borderLeft: `3px solid ${typeColors[e.event_type] || '#6b7280'}` }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: typeColors[e.event_type] || '#94a3b8' }}>{e.event_type}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(e.created_at).toLocaleTimeString()}</span>
                        </div>
                        {e.failure_reason && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{e.failure_reason}</div>}
                        {e.route && <div style={{ fontSize: '0.72rem', color: '#6366f1', marginTop: 2 }}>{e.route}</div>}
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
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: overallHealthy ? '#10b981' : '#ef4444', display: 'inline-block', boxShadow: `0 0 8px ${overallHealthy ? '#10b981' : '#ef4444'}`, animation: 'pulse 2s infinite' }} />
                        Runtime Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Platform nerve center — real-time production health · Last 24h
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {lastRefresh && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Refreshed {lastRefresh.toLocaleTimeString()}</span>}
                    <button onClick={load} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '6px 16px' }}>↻ Refresh</button>
                </div>
            </div>

            {/* Stability Covenant Banner */}
            {!overallHealthy && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '1.5rem' }}>🔴</span>
                    <div>
                        <strong style={{ color: '#ef4444' }}>Stability Covenant Breach</strong>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>Feature development is frozen. All engineering effort must redirect to stability. See docs/stability-covenant.md.</p>
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
                    <h3 style={{ fontWeight: 800, marginBottom: 16, fontSize: '1rem' }}>⚖️ SLO Tracker</h3>
                    <SloRow name="Crash-free Sessions"    target={99.7} current={m.crash_free_rate ?? 99.9} />
                    <SloRow name="Test Recovery Success"  target={99.0} current={m.recovery_success_rate ?? 100} />
                    <SloRow name="Submission Integrity"   target={100}  current={m.submission_integrity_rate ?? 100} />
                    <SloRow name="API Uptime"             target={99.9} current={m.api_uptime ?? 99.95} />
                </div>

                {/* Boot Health */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontWeight: 800, marginBottom: 16, fontSize: '1rem' }}>🚀 Boot Health (24h)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {['auth_restore', 'bridge_init', 'capability_negotiate', 'lifecycle_init', 'recovery_check', 'telemetry_flush'].map(step => {
                            const failures = m.boot_failures?.[step] ?? 0;
                            return (
                                <div key={step} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{step}</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: failures === 0 ? '#10b981' : '#ef4444' }}>
                                        {failures === 0 ? '✅ Healthy' : `🔴 ${failures} failures`}
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
                    <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>📡 Live Event Feed (Last 24h)</h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.recent_events?.length ?? 0} events</span>
                </div>
                <EventFeed events={m.recent_events ?? []} />
            </div>

            {/* Feature Flag Status */}
            <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 800, marginBottom: 16, fontSize: '1rem' }}>🚩 Feature Flag Status</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                    {(m.feature_flags ?? []).map(ff => (
                        <div key={ff.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: `1px solid ${ff.enabled ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: ff.enabled ? '#10b981' : '#ef4444', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: ff.enabled ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                {ff.key.replace('ff_', '')}
                            </span>
                            {ff.rollout_pct < 100 && ff.enabled && (
                                <span style={{ fontSize: '0.7rem', color: '#f59e0b', marginLeft: 'auto' }}>{ff.rollout_pct}%</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
