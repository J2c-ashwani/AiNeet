require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testNetworkDrop() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY // Service key to verify DB state reliably
    );

    const email = `network_drop_${Date.now()}@example.com`;
    const { data: user } = await supabase.auth.admin.createUser({ email, password: 'Pass123!', email_confirm: true });
    
    await new Promise(r => setTimeout(r, 2000)); // wait for trigger
    const userId = user.user.id;

    await supabase.from('users').insert({
        id: userId,
        email: email,
        name: 'Network Tester',
        password_hash: 'mock'
    });

    // We must generate a test and subject to submit
    const { data: testSession } = await supabase.from('test_attempts').insert({
        user_id: userId,
        status: 'in_progress',
        configuration: { subjects: ['biology'], mode: 'mock', length: 10 }
    }).select().single();

    console.log(`[NETWORK FAULT TEST] Created pending test session: ${testSession.id}`);
    
    // Simulate frontend payload
    const payloadBuffer = JSON.stringify({
        testId: testSession.id,
        answers: { "q1": "A", "q2": "B" },
        timeSpent: 120
    });

    console.log(`[NETWORK FAULT TEST] Initiating /api/tests/submit and severing connection in 50ms...`);

    const controller = new AbortController();
    
    // Sever the connection exactly 50 milliseconds into the HTTP request transfer!
    setTimeout(() => {
        console.log(`\n💥 [NETWORK FAULT TEST] SEVERING CONNECTION MID-REQUEST! Aborting...`);
        controller.abort();
    }, 50);

    try {
        await fetch('http://localhost:3000/api/tests/submit', {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: payloadBuffer
        });
        console.log("Request finished? Very fast server...");
    } catch (err) {
        if (err.name === 'AbortError') {
            console.log(`[NETWORK FAULT TEST] Client forcefully disconnected (AbortError trapped).`);
        } else {
            console.log("Fetch err:", err);
        }
    }

    // Wait to see what the server did
    await new Promise(r => setTimeout(r, 2000));

    // Audit State
    const { data: auditedTest } = await supabase.from('test_attempts').select('status, score, xp_awarded').eq('id', testSession.id).single();
    
    console.log(`\n[NETWORK FAULT TEST SUMMARY]`);
    console.log(`Database State for Faulted Test:`, auditedTest);

    if (auditedTest.status === 'completed' || auditedTest.xp_awarded > 0) {
        console.error('❌ FATAL VULNERABILITY! Database inherited partial state even though network died. Transaction rollback missing!');
    } else if (auditedTest.status === 'in_progress') {
        console.log('✅ SYSTEM SECURE! Database successfully aborted the transaction leaving no orphaned/duplicate corruption.');
    } else {
        console.warn('Unknown state:', auditedTest);
    }
}

testNetworkDrop();
