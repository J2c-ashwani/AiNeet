const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const API_URL = 'http://localhost:3000';
const CASHFREE_SECRET = process.env.CASHFREE_SECRET_KEY || 'dummy';

async function sendCashfreeWebhook(payload, customTimestamp = null) {
    const rawBody = JSON.stringify(payload);
    const timestamp = customTimestamp || Date.now().toString();
    const signature = crypto.createHmac('sha256', CASHFREE_SECRET).update(timestamp + rawBody).digest('base64');

    const res = await fetch(`${API_URL}/api/webhooks/cashfree`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-webhook-signature': signature,
            'x-webhook-timestamp': timestamp
        },
        body: rawBody
    });

    return { status: res.status, data: await res.json() };
}

async function runChaos() {
    console.log('🌪️ Starting Chaos Testing for Payments...\n');

    const testOrderId = `order_${Date.now()}`;
    const webhookPayload = {
        type: 'PAYMENT_SUCCESS_WEBHOOK',
        data: {
            order: { order_id: testOrderId }
        }
    };

    // Note: Since this orderId doesn't exist in the payments table, the webhook will 
    // actually fail at "Fetch payment intent" step, returning 404 Order not found.
    // However, the idempotency lock happens *before* fetching the payment!
    // So if we send it twice, the second one should be caught by the idempotency lock.

    console.log(`-> 1. Simulating Concurrent Webhook Replay Attack (Order: ${testOrderId})`);
    
    const sharedTimestamp = Date.now().toString();
    const req1 = sendCashfreeWebhook(webhookPayload, sharedTimestamp);
    const req2 = sendCashfreeWebhook(webhookPayload, sharedTimestamp); // Concurrent

    const [res1, res2] = await Promise.all([req1, req2]);

    console.log('   Response 1:', res1.status, res1.data);
    console.log('   Response 2:', res2.status, res2.data);

    // One of them should be 404 (because order doesn't exist in DB)
    // The other should be 200 { success: true, message: 'Duplicate event safely ignored' } 
    // because it hit the idempotency lock.
    
    let idempotencyHit = res1.data.message === 'Duplicate event safely ignored' || res2.data.message === 'Duplicate event safely ignored';
    
    if (idempotencyHit) {
        console.log('   ✅ Idempotency lock successfully caught concurrent replay attack!');
    } else {
        console.error('   ❌ Idempotency lock FAILED or behavior was unexpected.');
    }

    console.log('\n-> 2. Simulating Invalid Signature');
    const badRes = await fetch(`${API_URL}/api/webhooks/cashfree`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-webhook-signature': 'bad_signature',
            'x-webhook-timestamp': Date.now().toString()
        },
        body: JSON.stringify(webhookPayload)
    });
    
    if (badRes.status === 401) {
        console.log('   ✅ Invalid signature correctly rejected with 401.');
    } else {
        console.error(`   ❌ Invalid signature returned unexpected status: ${badRes.status}`);
    }

    console.log('\n✅ Chaos Testing completed.');
}

runChaos().catch(console.error);
