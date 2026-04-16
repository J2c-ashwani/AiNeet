require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function runDdosTest() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const email = `ddos_test_${Date.now()}@example.com`;
    const { data: signUpData } = await supabase.auth.signUp({
        email, password: 'HackerPassword123!'
    });

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    
    if (!token) {
        console.error("Failed to acquire token");
        return;
    }

    console.log('[STRESS TEST] Firing 75 concurrent requests to /api/performance...');
    const MAX_REQUESTS = 75;
    let successCount = 0;
    let rateLimitedCount = 0;

    const requests = Array(MAX_REQUESTS).fill(0).map(() => 
        fetch('http://localhost:3000/api/performance', {
            headers: {
                'Cookie': `sb-auth-token=${token};` // Mocking how Next.js SSR Auth works
            }
        }).then(r => {
            if (r.status === 200) successCount++;
            if (r.status === 429) rateLimitedCount++;
            return r.status;
        })
    );

    const outputs = await Promise.all(requests);
    console.log(`\n[STRESS TEST SUMMARY]`);
    console.log(`Total Requests Sent: ${MAX_REQUESTS}`);
    console.log(`Successful (200 OK): ${successCount}`);
    console.log(`Rate Limited (429): ${rateLimitedCount}`);

    if (rateLimitedCount > 0 && successCount < MAX_REQUESTS) {
        console.log('✅ SYSTEM SECURE! Rate Limiter successfully intercepted the flood attack.');
    } else {
        console.error('❌ FATAL VULNERABILITY! Rate limiter failed or is absent. System is vulnerable to DB exhaustion / LLM budget bleeding.');
    }
}

runDdosTest();
