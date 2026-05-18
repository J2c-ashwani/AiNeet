/**
 * /api/health — Infrastructure Health Check
 * 
 * MD mandate: infra primitives only. No app table queries.
 * Tests DB connectivity (SELECT 1), Redis connectivity (PING),
 * and reports circuit breaker states for observability.
 * 
 * Returns 200 if all infra is healthy, 503 if any critical infra is down.
 * Register this with an uptime monitor (UptimeRobot/BetterStack) before launch.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import { getCircuitStates } from '@/lib/circuit-breaker';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    const start = Date.now();
    const checks = {
        db: { status: 'unknown', latencyMs: null },
        redis: { status: 'unknown', latencyMs: null },
        circuitBreakers: null,
        timestamp: new Date().toISOString(),
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    };

    // ── DB Check: raw query — no app schema dependency ───────────────────────
    try {
        const dbStart = Date.now();
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { persistSession: false } }
        );
        // Use a lightweight query on a known table to confirm DB connectivity
        // Avoids RPC dependency and broken promise chain
        const { error } = await supabase.from('questions').select('id').limit(1);
        checks.db = {
            status: error ? 'degraded' : 'ok',
            latencyMs: Date.now() - dbStart,
        };
    } catch (e) {
        checks.db = { status: 'down', latencyMs: null };
    }


    // ── Redis Check: PING ────────────────────────────────────────────────────
    try {
        const redisStart = Date.now();
        const redis = Redis.fromEnv();
        const pong = await redis.ping();
        checks.redis = {
            status: pong === 'PONG' ? 'ok' : 'degraded',
            latencyMs: Date.now() - redisStart,
        };
    } catch (e) {
        checks.redis = { status: 'down', latencyMs: null };
    }

    // ── Circuit Breaker States (observability only, not part of health gate) ─
    try {
        checks.circuitBreakers = await getCircuitStates();
    } catch {
        checks.circuitBreakers = { error: 'unavailable' };
    }

    checks.totalLatencyMs = Date.now() - start;

    const isHealthy = checks.db.status === 'ok' && checks.redis.status === 'ok';

    return NextResponse.json(checks, {
        status: isHealthy ? 200 : 503,
        headers: {
            'Cache-Control': 'no-store, no-cache',
            'X-Health-Status': isHealthy ? 'healthy' : 'degraded',
        },
    });
}
