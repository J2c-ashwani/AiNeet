import { ApiError, RATE_LIMITS, withApiRoute } from '@/lib/api-handler';
import { getDb } from '@/lib/core/db';
import { allOrThrow } from '@/lib/async';

export const dynamic = 'force-dynamic';

function assertDbResult(name, result) {
    if (result.error) {
        throw new ApiError(`Runtime health query failed: ${name}`, 500, 'RUNTIME_HEALTH_QUERY_FAILED');
    }
    return result;
}

export const GET = withApiRoute(async () => {
    const supabase = await getDb();
    const since24h = new Date(Date.now() - 86400000).toISOString();

    const [
        eventsRes,
        bootFailRes,
        recoveryRes,
        fraudRes,
        flagsRes,
        activeRes,
        circuitRes,
    ] = await allOrThrow([
        supabase.from('mobile_runtime_events')
            .select('event_type, failure_reason, route, created_at')
            .gte('created_at', since24h)
            .order('created_at', { ascending: false })
            .limit(50),
        supabase.from('mobile_runtime_events')
            .select('failure_reason')
            .eq('event_type', 'boot_step_failure')
            .gte('created_at', since24h),
        supabase.from('mobile_runtime_events')
            .select('event_type')
            .in('event_type', ['recovery_success', 'recovery_corrupted', 'recovery_expired'])
            .gte('created_at', since24h),
        supabase.from('fraud_signals')
            .select('*', { count: 'exact', head: true })
            .eq('action_taken', 'none')
            .gte('created_at', since24h),
        supabase.from('feature_flags')
            .select('key, enabled, rollout_pct')
            .order('key'),
        supabase.from('test_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('session_status', 'active'),
        supabase.from('mobile_runtime_events')
            .select('event_type')
            .in('event_type', ['circuit_breaker_open', 'circuit_breaker_close'])
            .gte('created_at', since24h),
    ]);

    assertDbResult('recent_events', eventsRes);
    assertDbResult('boot_failures', bootFailRes);
    assertDbResult('recovery_events', recoveryRes);
    assertDbResult('fraud_signals', fraudRes);
    assertDbResult('feature_flags', flagsRes);
    assertDbResult('active_test_sessions', activeRes);
    assertDbResult('circuit_events', circuitRes);

    const events = eventsRes.data || [];
    const bridgeTimeouts = events.filter(e => e.event_type === 'bridge_timeout').length;
    const totalEvents = events.length || 1;
    const memoryPressure = events.filter(e => e.event_type === 'memory_pressure').length;
    const longTasks = events.filter(e => e.event_type === 'long_task').length;
    const offlineFailures = events.filter(e => e.event_type === 'offline_replay_failure').length;
    const circuitOpens = (circuitRes.data || []).filter(e => e.event_type === 'circuit_breaker_open').length;

    const recoveryEvents = recoveryRes.data || [];
    const recoverySucc = recoveryEvents.filter(e => e.event_type === 'recovery_success').length;
    const recoveryFail = recoveryEvents.filter(e => e.event_type !== 'recovery_success').length;
    const totalRecoveries = recoverySucc + recoveryFail;
    const recoverySuccessRate = totalRecoveries > 0 ? Number(((recoverySucc / totalRecoveries) * 100).toFixed(1)) : 100;
    const recoveryFailureRate = totalRecoveries > 0 ? Number(((recoveryFail / totalRecoveries) * 100).toFixed(2)) : 0;

    const bootFailures = {};
    (bootFailRes.data || []).forEach(e => {
        const step = e.failure_reason?.split(':')[0] || 'unknown';
        bootFailures[step] = (bootFailures[step] || 0) + 1;
    });

    return {
        active_sessions: activeRes.count || 0,
        bridge_timeout_rate: Number(((bridgeTimeouts / totalEvents) * 100).toFixed(3)),
        recovery_failure_rate: recoveryFailureRate,
        recovery_success_rate: recoverySuccessRate,
        memory_pressure_count: memoryPressure,
        long_task_count: longTasks,
        offline_replay_failures: offlineFailures,
        fraud_signals_count: fraudRes.count || 0,
        circuit_breaker_opens: circuitOpens,
        crash_free_rate: null,
        submission_integrity_rate: null,
        api_uptime: null,
        unavailable_metrics: [
            'crash_free_rate',
            'submission_integrity_rate',
            'api_uptime',
        ],
        boot_failures: bootFailures,
        recent_events: events.slice(0, 30),
        feature_flags: flagsRes.data || [],
    };
}, {
    auth: 'admin',
    rateLimit: { ...RATE_LIMITS.STANDARD, failBehavior: 'closed', key: 'admin-runtime-health' },
});
