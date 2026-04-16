require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

async function runTest() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const secretKey = process.env.CASHFREE_SECRET_KEY || 'TEST_SECRET';
    const fakeOrderId = 'order_' + Date.now();
    
    // 1. First, create a fake user
    const { data: user, error: userErr } = await supabase.auth.admin.createUser({
        email: `webhook_test_${Date.now()}@example.com`,
        password: 'TestPass123!',
        email_confirm: true
    });
    
    if (userErr) {
        console.error('Failed to create test user:', userErr);
        return;
    }
    const userId = user.user.id;

    // Force creation of public.users record
    const { error: finalUserErr } = await supabase.from('users').insert({
        id: userId,
        email: `webhook_test_${Date.now()}@example.com`,
        name: 'Webhook Test User',
        password_hash: 'mock'
    });
    if (finalUserErr) console.log("User insert warn:", finalUserErr);

    // 2. Insert a 'pending' payment record
    const { error: dbErr } = await supabase.from('payments').insert({
        id: crypto.randomUUID(),
        user_id: userId,
        provider_order_id: fakeOrderId,
        status: 'pending',
        amount: 4999, // 1 Year Premium
        currency: 'INR'
    });

    if (dbErr) {
        console.error('Failed to insert pending payment:', dbErr);
        return;
    }

    console.log(`[Test] Inserted pending order: ${fakeOrderId} for user ${userId}`);

    // 3. Construct Webhook Payload
    const payloadObject = {
        type: 'PAYMENT_SUCCESS_WEBHOOK',
        data: {
            order: { order_id: fakeOrderId, order_amount: 4999 },
            payment: { cf_payment_id: 123456789 }
        }
    };
    
    const rawBody = JSON.stringify(payloadObject);
    const timestamp = Date.now().toString();
    const signature = crypto.createHmac('sha256', secretKey).update(timestamp + rawBody).digest('base64');

    const headers = {
        'Content-Type': 'application/json',
        'x-webhook-timestamp': timestamp,
        'x-webhook-signature': signature
    };

    // 4. FIRE 5 CONCURRENT REQUESTS (Replay Attack)
    console.log('[Test] Firing 5 concurrent Webhook requests to simulate Replay Attack / Double Billing...');
    
    const requests = Array(5).fill(0).map(() => 
        fetch('http://localhost:3000/api/webhooks/cashfree', {
            method: 'POST',
            headers: headers,
            body: rawBody
        }).then(r => r.json())
    );

    const results = await Promise.all(requests);
    console.log('[Test] Webhook Results:', results);

    // 5. Audit the Database state directly!
    const { data: finalPayment } = await supabase.from('payments').select('status, provider_payment_id').eq('provider_order_id', fakeOrderId).single();
    const { data: finalUser } = await supabase.from('users').select('subscription_tier, subscription_status, subscription_expiry').eq('id', userId).single();

    console.log('\n[AUDIT] === DATABASE STATE ===');
    console.log('Payment Status:', finalPayment);
    console.log('User Status:', finalUser);
}

runTest();
