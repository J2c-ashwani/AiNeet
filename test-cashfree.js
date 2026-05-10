require('dotenv').config({ path: '.env.local' });
const { v4: uuidv4 } = require('uuid');

async function testCashfree() {
    const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
    const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
    const CASHFREE_API_VERSION = '2023-08-01';

    const CASHFREE_BASE_URL = 'https://sandbox.cashfree.com/pg';

    const orderId = `neet_${uuidv4().replace(/-/g, '').slice(0, 20)}`;

    const orderPayload = {
        order_id: orderId,
        order_amount: 399,
        order_currency: 'INR',
        customer_details: {
            customer_id: `cust_${uuidv4().slice(0, 8)}`,
            customer_email: 'jhasalcreativepeople@gmail.com',
            customer_phone: '9999999999',
            customer_name: 'Rajajaa',
        },
        order_meta: {
            return_url: `https://ai-neet.vercel.app/profile?payment=success&order_id={order_id}`,
            payment_methods: 'cc,dc,upi,nb,app,paylater',
        },
        order_note: `NEET Coach premium Subscription`,
        order_tags: {
            plan_id: 'premium',
            source: 'neet-coach-app',
        },
    };

    console.log('Hitting Cashfree...');
    const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-version': CASHFREE_API_VERSION,
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY,
        },
        body: JSON.stringify(orderPayload),
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
}

testCashfree();
