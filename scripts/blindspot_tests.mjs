/**
 * Blind Spot 2: Cold Start Reality Test
 * Blind Spot 4: Session Expiry Test
 * Blind Spot 5: AI Abuse Rate Limit Test
 */

const BASE = 'https://ai-neet.vercel.app';

async function measure(name, url, options = {}) {
    const start = Date.now();
    try {
        const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
        const elapsed = Date.now() - start;
        const status = res.status;
        console.log(`[${status}] ${name} → ${elapsed}ms`);
        return { name, status, elapsed };
    } catch (err) {
        console.log(`[ERR] ${name} → ${err.message}`);
        return { name, status: 'ERROR', elapsed: Date.now() - start };
    }
}

async function main() {
    console.log('═══ BLIND SPOT TEST SUITE ═══\n');

    // --- Test 1: Cold Start ---
    console.log('--- COLD START TEST ---');
    const coldResults = [];
    coldResults.push(await measure('Cold: /api/auth/me', `${BASE}/api/auth/me`));
    coldResults.push(await measure('Cold: /api/leaderboard', `${BASE}/api/leaderboard`));
    coldResults.push(await measure('Cold: /api/syllabus', `${BASE}/api/syllabus`));
    
    console.log('\n--- WARM FOLLOW-UP (same endpoints, should be faster) ---');
    coldResults.push(await measure('Warm: /api/auth/me', `${BASE}/api/auth/me`));
    coldResults.push(await measure('Warm: /api/leaderboard', `${BASE}/api/leaderboard`));

    // --- Test 2: Session Expiry ---
    console.log('\n--- SESSION EXPIRY TEST ---');
    // Simulate expired/invalid session cookie
    const expiredCookie = 'sb-lfwnrehqjiwpfoylhmby-auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmd25yZWhxaml3cGZveWxobWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMDAwMX0.invalid';
    await measure('Expired Token → /api/auth/me', `${BASE}/api/auth/me`, { headers: { Cookie: expiredCookie } });
    await measure('Expired Token → /api/tests/generate', `${BASE}/api/tests/generate`, { method: 'POST', body: '{}', headers: { Cookie: expiredCookie } });
    await measure('Expired Token → /api/doubt', `${BASE}/api/doubt`, { method: 'POST', body: JSON.stringify({ message: 'test' }), headers: { Cookie: expiredCookie } });
    await measure('Expired Token → /api/performance', `${BASE}/api/performance`, { headers: { Cookie: expiredCookie } });

    // --- Test 3: AI Abuse / Rate Limit ---
    console.log('\n--- AI RATE LIMIT ABUSE TEST (20 rapid requests) ---');
    const promises = [];
    for (let i = 0; i < 20; i++) {
        promises.push(measure(`Rapid doubt #${i+1}`, `${BASE}/api/doubt`, {
            method: 'POST',
            body: JSON.stringify({ message: `What is mitosis? Query ${i}` })
        }));
    }
    const results = await Promise.all(promises);
    const status429 = results.filter(r => r.status === 429).length;
    const status401 = results.filter(r => r.status === 401).length;
    console.log(`\nRate limit results: ${status429} throttled (429), ${status401} rejected (401), ${results.length - status429 - status401} other`);

    // --- Summary ---
    console.log('\n═══ RESULTS ═══');
    const coldMax = Math.max(...coldResults.filter(r => r.name.startsWith('Cold')).map(r => r.elapsed));
    const warmMax = Math.max(...coldResults.filter(r => r.name.startsWith('Warm')).map(r => r.elapsed));
    console.log(`Cold start max: ${coldMax}ms`);
    console.log(`Warm max: ${warmMax}ms`);
    console.log(`Cold→Warm improvement: ${Math.round((1 - warmMax/coldMax) * 100)}%`);
}

main();
