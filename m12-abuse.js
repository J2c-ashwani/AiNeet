require('dotenv').config({ path: '.env.local' });

async function runAbuseTest() {
    console.log('--- MODULE 12: ABUSE TESTING ---');
    console.log('Testing Rate Limiting & DDOS Protection...\n');

    let successCount = 0;
    let blockCount = 0;

    // Simulate an attacker trying to brute-force the password reset API
    console.log('[1] Executing Rapid Password Reset Requests (Limit is 3/hr)...');
    for (let i = 1; i <= 5; i++) {
        const res = await fetch('https://ai-neet.vercel.app/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'attacker@example.com' })
        });

        if (res.status === 429) {
            console.log(`Attempt ${i}: 🛑 BLOCKED (429 Too Many Requests)`);
            blockCount++;
        } else if (res.status === 200) {
            console.log(`Attempt ${i}: ✅ ALLOWED (200 OK)`);
            successCount++;
        } else {
            console.log(`Attempt ${i}: ⚠️ UNEXPECTED STATUS (${res.status})`);
        }
    }

    if (blockCount >= 2 && successCount <= 3) {
        console.log('\n✅ RATE LIMITING PASSED: System correctly identified and blocked the automated abuse pattern.');
    } else {
        console.log('\n❌ RATE LIMITING FAILED: System allowed too many requests.');
    }
}

runAbuseTest();
