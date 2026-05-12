import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await getDb();
        const since24h = new Date(Date.now() - 86400000).toISOString();

        // Run all queries in parallel for speed
        const [
            eventsRes,
            bootFailRes,
            recoveryRes,
            fraudRes,
            flagsRes,
            activeRes,
            circuitRes,
        ] = await Promise.all([
            // Recent events feed
            supabase.from('mobile_runtime_events')
                .select('event_type, failure_reason, route, created_at')
                .gte('created_at', since24h)
                .order('created_at', { ascending: false })
                .limit(50),

            // Boot step failures
            supabase.from('mobile_runtime_events')
                .select('failure_reason')
                .eq('event_type', 'boot_step_failure')
                .gte('created_at', since24h),

            // Recovery events
            supabase.from('mobile_runtime_events')
                .select('event_type')
                .in('event_type', ['recovery_success', 'recovery_corrupted', 'recovery_expired'])
                .gte('created_at', since24h),

            // Fraud signals pending review
            supabase.from('fraud_signals')
                .select('*', { count: 'exact', head: true })
                .eq('action_taken', 'none')
                .gte('created_at', since24h),

            // Feature flags
            supabase.from('feature_flags')
                .select('key, enabled, rollout_pct')
                .order('key'),

            // Active test sessions
            supabase.from('test_attempts')
                .select('*', { count: 'exact', head: true })
                .eq('session_status', 'active'),

            // Circuit breaker events
            supabase.from('mobile_runtime_events')
                .select('event_type')
                .in('event_type', ['circuit_breaker_open', 'circuit_breaker_close'])
                .gte('created_at', since24h),
        ]);

        const events = eventsRes.data || [];

        // Compute derived metrics
        const bridgeTimeouts  = events.filter(e => e.event_type === 'bridge_timeout').length;
        const totalEvents     = events.length || 1;
        const memoryPressure  = events.filter(e => e.event_type === 'memory_pressure').length;
        const longTasks       = events.filter(e => e.event_type === 'long_task').length;
        const offlineFailures = events.filter(e => e.event_type === 'offline_replay_failure').length;
        const circuitOpens    = (circuitRes.data || []).filter(e => e.event_type === 'circuit_breaker_open').length;

        // Recovery rates
        const recoveryEvents = recoveryRes.data || [];
        const recoverySucc   = recoveryEvents.filter(e => e.event_type === 'recovery_success').length;
        const recoveryFail   = recoveryEvents.filter(e => e.event_type !== 'recovery_success').length;
        const totalRecoveries = recoverySucc + recoveryFail;
        const recoverySuccessRate  = totalRecoveries > 0 ? ((recoverySucc / totalRecoveries) * 100).toFixed(1) : 100;
        const recoveryFailureRate  = totalRecoveries > 0 ? ((recoveryFail / totalRecoveries) * 100).toFixed(2) : 0;

        // Boot failures by step name
        const bootFailures = {};
        (bootFailRes.data || []).forEach(e => {
            const step = e.failure_reason?.split(':')[0] || 'unknown';
            bootFailures[step] = (bootFailures[step] || 0) + 1;
        });

        return NextResponse.json({
            // Real-time counts
            active_sessions:        activeRes.count || 0,
            bridge_timeout_rate:    parseFloat(((bridgeTimeouts / totalEvents) * 100).toFixed(3)),
            recovery_failure_rate:  parseFloat(recoveryFailureRate),
            recovery_success_rate:  parseFloat(recoverySuccessRate),
            memory_pressure_count:  memoryPressure,
            long_task_count:        longTasks,
            offline_replay_failures: offlineFailures,
            fraud_signals_count:    fraudRes.count || 0,
            circuit_breaker_opens:  circuitOpens,

            // Mocked SLO values (replace with real Crashlytics API when available)
            crash_free_rate:        99.92,
            submission_integrity_rate: 100,
            api_uptime:             99.97,

            // Structured data
            boot_failures:   bootFailures,
            recent_events:   events.slice(0, 30),
            feature_flags:   flagsRes.data || [],
        });

    } catch (e) {
        console.error('[Runtime Health API]', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
