/**
 * Phase 1.3 — Auth Attack Simulation Script
 * Tests: missing token, forged token, expired session, direct API call
 */

const BASE = 'https://ai-neet.vercel.app';

const tests = [];

async function runTest(name, url, options = {}) {
    try {
        const start = Date.now();
        const res = await fetch(url, { 
            ...options, 
            headers: { 'Content-Type': 'application/json', ...options.headers },
            redirect: 'manual'
        });
        const elapsed = Date.now() - start;
        const body = await res.text();
        let json;
        try { json = JSON.parse(body); } catch { json = body.substring(0, 200); }
        
        const result = {
            test: name,
            status: res.status,
            elapsed_ms: elapsed,
            is_500: res.status === 500,
            is_structured_json: typeof json === 'object',
            response_preview: typeof json === 'object' ? json : body.substring(0, 100)
        };
        tests.push(result);
        console.log(`[${res.status === 500 ? 'FAIL' : 'PASS'}] ${name} → ${res.status} (${elapsed}ms)`);
        return result;
    } catch (err) {
        const result = { test: name, status: 'NETWORK_ERROR', error: err.message, is_500: true };
        tests.push(result);
        console.log(`[FAIL] ${name} → NETWORK_ERROR: ${err.message}`);
        return result;
    }
}

async function main() {
    console.log('═══ PHASE 1.3: AUTH ATTACK SIMULATION ═══\n');

    // Attack 1: Missing Token — No cookie at all
    await runTest('Missing Token → /api/auth/me', `${BASE}/api/auth/me`);
    await runTest('Missing Token → /api/tests/generate', `${BASE}/api/tests/generate`, { method: 'POST', body: '{}' });
    await runTest('Missing Token → /api/doubt', `${BASE}/api/doubt`, { method: 'POST', body: '{}' });
    await runTest('Missing Token → /api/performance', `${BASE}/api/performance`);
    await runTest('Missing Token → /api/leaderboard', `${BASE}/api/leaderboard`);
    await runTest('Missing Token → /api/admin/stats', `${BASE}/api/admin/stats`);
    await runTest('Missing Token → /api/admin/users', `${BASE}/api/admin/users`);
    await runTest('Missing Token → /api/subscription/create', `${BASE}/api/subscription/create`, { method: 'POST', body: '{}' });

    // Attack 2: Forged Token — Fake auth cookie
    const forgedCookie = 'sb-auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkhhY2tlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    await runTest('Forged JWT → /api/auth/me', `${BASE}/api/auth/me`, { headers: { Cookie: forgedCookie } });
    await runTest('Forged JWT → /api/tests/generate', `${BASE}/api/tests/generate`, { method: 'POST', body: '{}', headers: { Cookie: forgedCookie } });

    // Attack 3: Direct API with malformed JSON
    await runTest('Malformed JSON → /api/tests/submit', `${BASE}/api/tests/submit`, { method: 'POST', body: 'NOT_JSON_AT_ALL' });
    await runTest('Malformed JSON → /api/auth/register', `${BASE}/api/auth/register`, { method: 'POST', body: '{invalid json' });

    // Attack 4: Empty body attacks
    await runTest('Empty Body → /api/auth/login', `${BASE}/api/auth/login`, { method: 'POST', body: '{}' });
    await runTest('Empty Body → /api/auth/register', `${BASE}/api/auth/register`, { method: 'POST', body: '{}' });

    // Attack 5: XSS/Injection payloads
    await runTest('XSS in Login Email', `${BASE}/api/auth/login`, { method: 'POST', body: JSON.stringify({ email: '<script>alert(1)</script>', password: 'test' }) });
    await runTest('SQL Injection in Register', `${BASE}/api/auth/register`, { method: 'POST', body: JSON.stringify({ name: "'; DROP TABLE users;--", email: 'test@test.com', password: 'test123' }) });

    console.log('\n═══ RESULTS SUMMARY ═══');
    const failures = tests.filter(t => t.is_500);
    console.log(`Total Tests: ${tests.length}`);
    console.log(`Passed: ${tests.length - failures.length}`);
    console.log(`500 Errors (FAILURES): ${failures.length}`);
    
    if (failures.length > 0) {
        console.log('\n🔴 FAILED TESTS:');
        failures.forEach(f => console.log(`  - ${f.test}: ${f.status}`));
    } else {
        console.log('\n✅ ALL ATTACKS PROPERLY HANDLED — ZERO 500 ERRORS');
    }

    // Output full JSON for report
    console.log('\n--- FULL_JSON_START ---');
    console.log(JSON.stringify(tests, null, 2));
    console.log('--- FULL_JSON_END ---');
}

main();
