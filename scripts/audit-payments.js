const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function audit() {
    const client = await pool.connect();
    try {
        console.log('🔍 Starting Revenue Protection Audit...\n');

        // 1. Completed payment but inactive subscription
        console.log('-> Checking for paid users without active subscriptions...');
        const res1 = await client.query(`
            SELECT p.id, p.user_id, p.amount, p.provider_order_id, p.created_at
            FROM payments p
            LEFT JOIN subscriptions s ON p.user_id = s.user_id 
                AND (s.external_subscription_id = p.provider_order_id OR s.provider_event_id LIKE '%' || p.provider_order_id || '%')
            WHERE p.status = 'completed' AND (s.id IS NULL OR s.billing_status != 'active')
        `);
        if (res1.rows.length > 0) {
            console.error(`   ❌ Found ${res1.rows.length} completed payments lacking an active subscription!`);
            console.table(res1.rows);
        } else {
            console.log('   ✅ Clean: All completed payments have active subscriptions.');
        }

        // 2. Active subscription but missing payment
        console.log('\n-> Checking for active subscriptions without matching payments...');
        const res2 = await client.query(`
            SELECT s.id, s.user_id, s.plan_tier, s.external_subscription_id
            FROM subscriptions s
            LEFT JOIN payments p ON s.user_id = p.user_id AND p.status = 'completed'
            WHERE s.billing_status = 'active' AND p.id IS NULL AND s.billing_source = 'web'
        `);
        if (res2.rows.length > 0) {
            console.error(`   ❌ Found ${res2.rows.length} active web subscriptions without a completed payment!`);
            console.table(res2.rows);
        } else {
            console.log('   ✅ Clean: All active subscriptions trace to a valid payment.');
        }

        // 3. Duplicate transaction IDs
        console.log('\n-> Checking for duplicate external subscription IDs...');
        const res3 = await client.query(`
            SELECT external_subscription_id, count(*) as c
            FROM subscriptions
            WHERE external_subscription_id IS NOT NULL AND external_subscription_id != ''
            GROUP BY external_subscription_id
            HAVING count(*) > 1
        `);
        if (res3.rows.length > 0) {
            console.error(`   ❌ Found ${res3.rows.length} duplicated transaction IDs!`);
            console.table(res3.rows);
        } else {
            console.log('   ✅ Clean: No duplicate transactions.');
        }

        // 4. Stale pending payments (> 24h)
        console.log('\n-> Checking for stale pending payments...');
        const res4 = await client.query(`
            SELECT id, user_id, amount, created_at
            FROM payments
            WHERE status = 'pending' AND created_at < NOW() - INTERVAL '24 hours'
        `);
        if (res4.rows.length > 0) {
            console.warn(`   ⚠️ Found ${res4.rows.length} stale pending payments (> 24h old).`);
        } else {
            console.log('   ✅ Clean: No stale pending payments.');
        }

        console.log('\n✅ Audit completed.');

    } catch (e) {
        console.error('Audit Error:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

audit();
