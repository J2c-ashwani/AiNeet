#!/usr/bin/env node
/**
 * scripts/load-test/neet-season-simulation.js
 *
 * Synthetic load simulation for NEET season traffic scenarios.
 * Validates that the platform survives real-scale events BEFORE they happen.
 *
 * Run: node scripts/load-test/neet-season-simulation.js
 *
 * NOTE: Run against STAGING, never production.
 * Set LOAD_TEST_BASE_URL to your staging URL.
 */

const BASE_URL      = process.env.LOAD_TEST_BASE_URL || 'http://localhost:3000';
const TEST_USER_JWT = process.env.LOAD_TEST_JWT || '';
const CONCURRENCY   = parseInt(process.env.LOAD_TEST_CONCURRENCY || '50');
const AI_CONCURRENCY = parseInt(process.env.LOAD_TEST_AI_CONCURRENCY || Math.max(2, Math.floor(CONCURRENCY / 5)).toString());
const CRON_SECRET = process.env.CRON_SECRET || '';

const results = { passed: [], failed: [], latencies: [] };

// ─── HTTP Helper ─────────────────────────────────────────────
async function req(method, path, body = null, timeoutMs = 10000, extraHeaders = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const start = Date.now();
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(TEST_USER_JWT ? { Authorization: `Bearer ${TEST_USER_JWT}` } : {}),
                ...extraHeaders,
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: ctrl.signal
        });
        const latency = Date.now() - start;
        results.latencies.push(latency);
        const ok = res.status > 0 && res.status < 500;
        return { status: res.status, latency, ok };
    } catch (e) {
        return { status: 0, latency: timeoutMs, ok: false, error: e.message };
    } finally {
        clearTimeout(timer);
    }
}

// ─── Concurrency Runner ───────────────────────────────────────
async function concurrent(name, count, fn) {
    console.log(`\n▶ ${name} (${count} concurrent requests)`);
    const tasks = Array.from({ length: count }, fn);
    const responses = await Promise.all(tasks);
    const ok      = responses.filter(r => r.ok).length;
    const failed  = responses.filter(r => !r.ok).length;
    const avgMs   = Math.round(responses.reduce((s, r) => s + r.latency, 0) / responses.length);
    const p99     = responses.map(r => r.latency).sort((a, b) => a - b)[Math.floor(responses.length * 0.99)] || 0;
    const passed  = ok / count >= 0.99; // 99% success threshold

    console.log(`  ✅ ${ok}/${count} succeeded | Avg ${avgMs}ms | P99 ${p99}ms`);
    if (!passed) {
        console.log(`  ❌ FAIL: ${failed} requests failed`);
        console.log(`    ⚠️ Sample failures for ${name}:`);
        responses.filter(r => !r.ok).slice(0, 3).forEach((r, idx) => {
            console.log(`      [${idx + 1}] Status: ${r.status} | Latency: ${r.latency}ms | Error: ${r.error || 'None'}`);
        });
    }

    if (passed) results.passed.push(name);
    else results.failed.push({ name, ok, failed, avgMs, p99 });

    return { ok, failed, avgMs, p99, passed };
}

// ─── Scenarios ────────────────────────────────────────────────
async function runAllScenarios() {
    if (!TEST_USER_JWT) {
        console.error('LOAD_TEST_JWT is required for authenticated enterprise load certification.');
        process.exit(1);
    }

    if (/aineetcoach\.com|vercel\.app/i.test(BASE_URL) && process.env.LOAD_TEST_ALLOW_PRODUCTION !== 'true') {
        console.error('Refusing to run load test against production-like URL without LOAD_TEST_ALLOW_PRODUCTION=true.');
        process.exit(1);
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('    🏋️  NEET SEASON LOAD SIMULATION');
    console.log(`    Target: ${BASE_URL}`);
    console.log(`    Concurrency: ${CONCURRENCY}`);
    console.log('═══════════════════════════════════════════════════');

    // Scenario 1: Concurrent performance reads (result-day spike)
    await concurrent('Performance reads (result-day spike)', CONCURRENCY * 2, () =>
        req('GET', '/api/performance')
    );

    // Scenario 2: Auth/session validation
    await concurrent('Auth validation', CONCURRENCY, () =>
        req('GET', '/api/auth/me')
    );

    // Scenario 3: Dashboard-state APIs
    await concurrent('Dashboard-state APIs', CONCURRENCY, (_, i) => {
        const paths = ['/api/coach/daily', '/api/revision/due', '/api/subscription/status'];
        return req('GET', paths[i % paths.length]);
    });

    // Scenario 4: Concurrent test submissions
    await concurrent('Test submissions', Math.max(2, Math.floor(CONCURRENCY / 4)), () =>
        req('POST', '/api/tests/submit', {
            testId: 'load-test-session',
            answers: [{ questionId: 1, selectedOption: 'A' }],
            timeSpent: 3600
        })
    );

    // Scenario 5: RAG explanation burst. Keep this smaller to avoid certifying quota burn as platform failure.
    await concurrent('RAG explanation burst', AI_CONCURRENCY, () =>
        req('POST', '/api/ncert/explain', {
            bookId: 'load-test',
            text: 'Explain oxidation and reduction using NCERT chemistry language.'
        }, 20000)
    );

    // Scenario 6: Test generation reads/questions pipeline
    await concurrent('Test generation', Math.max(2, Math.floor(CONCURRENCY / 4)), () =>
        req('POST', '/api/tests/generate', {
            subjects: [],
            chapters: [],
            topics: [],
            difficulty: 'all',
            questionCount: 5,
            type: 'custom'
        }, 20000)
    );

    // Scenario 7: OMR catalog reads
    await concurrent('OMR catalog reads', CONCURRENCY, () =>
        req('GET', '/api/omr/tests')
    );

    // Scenario 8: Payment entitlement/status reads
    await concurrent('Payment entitlement reads', CONCURRENCY, () =>
        req('GET', '/api/subscription/status')
    );

    // Scenario 8b: Payment verification (failure & robustness check under load)
    await concurrent('Payment verification traffic', Math.max(2, Math.floor(CONCURRENCY / 5)), () =>
        req('POST', '/api/subscription/verify', {
            orderId: 'mock_load_test_order_' + Date.now(),
            planId: 'premium'
        })
    );

    // Scenario 8c: Leaderboard traffic
    await concurrent('Leaderboard traffic reads', CONCURRENCY, () =>
        req('GET', '/api/leaderboard')
    );

    // Scenario 8d: Concurrent logins
    await concurrent('Concurrent logins', Math.max(2, Math.floor(CONCURRENCY / 5)), () =>
        req('POST', '/api/auth/login', {
            email: process.env.QA_USER_EMAIL || 'qa@neetcoach.in',
            password: process.env.QA_USER_PASSWORD || 'password123'
        })
    );

    // Scenario 9: Telemetry batch ingest storm
    await concurrent('Telemetry batch ingest', CONCURRENCY, () =>
        req('POST', '/api/telemetry/mobile-events', {
            events: Array.from({ length: 10 }, (_, i) => ({
                event_type: 'load_test',
                failure_reason: `batch-${i}`,
                route: '/test'
            }))
        })
    );

    if (CRON_SECRET) {
        // Scenario 10: Cron survivability check
        await concurrent('Cron keepalive', Math.max(2, Math.floor(CONCURRENCY / 10)), () =>
            req('GET', '/api/cron/keepalive', null, 10000, { Authorization: `Bearer ${CRON_SECRET}` })
        );
    }

    // Scenario 11: Reconnect storm (everyone comes back online simultaneously)
    await concurrent('Reconnect storm (offline replay)', CONCURRENCY * 3, () =>
        req('GET', '/api/performance')
    );

    // ─── Results ─────────────────────────────────────────────
    const allLatencies = results.latencies.sort((a, b) => a - b);
    const p50 = allLatencies[Math.floor(allLatencies.length * 0.50)] || 0;
    const p95 = allLatencies[Math.floor(allLatencies.length * 0.95)] || 0;
    const p99 = allLatencies[Math.floor(allLatencies.length * 0.99)] || 0;

    console.log('\n═══════════════════════════════════════════════════');
    console.log('    📊 AGGREGATE LATENCY');
    console.log(`    P50: ${p50}ms | P95: ${p95}ms | P99: ${p99}ms`);
    console.log('\n    RESULTS');
    console.log(`    ✅ Passed: ${results.passed.length}`);
    console.log(`    ❌ Failed: ${results.failed.length}`);

    if (results.failed.length > 0) {
        console.log('\n    Failed scenarios:');
        results.failed.forEach(f => console.log(`    ❌ ${f.name}: ${f.ok} ok, ${f.failed} failed, P99 ${f.p99}ms`));
    }

    if (p99 > 3000) {
        console.log('\n    ⚠️  P99 latency > 3000ms — infra may not be ready for NEET season');
    }

    console.log('═══════════════════════════════════════════════════\n');
    process.exit(results.failed.length > 0 ? 1 : 0);
}

runAllScenarios().catch(e => { console.error(e); process.exit(1); });
