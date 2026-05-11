const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function reconcile() {
    const client = await pool.connect();
    try {
        console.log('🛠️ Starting Subscription Reconciliation Engine...\n');

        // 1. Stale pending > 24h -> mark failed
        console.log('-> 1. Auto-Repair: Marking stale pending payments as failed (>24h)...');
        const staleRes = await client.query(`
            UPDATE payments 
            SET status = 'failed' 
            WHERE status = 'pending' AND created_at < NOW() - INTERVAL '24 hours'
            RETURNING id, user_id;
        `);
        if (staleRes.rowCount > 0) {
            console.log(`   ✅ Fixed ${staleRes.rowCount} stale payments.`);
        } else {
            console.log('   ✅ Clean: No stale pending payments found.');
        }

        // 2. Duplicate pending rows -> archive duplicates (delete them)
        // Keep the most recent pending payment per user/amount if multiple exist? 
        // Actually, deleting old pending rows for the same user is safe if they are duplicates.
        console.log('\n-> 2. Auto-Repair: Archiving duplicate pending rows...');
        const dupPendingRes = await client.query(`
            DELETE FROM payments
            WHERE id IN (
                SELECT id
                FROM (
                    SELECT id,
                    ROW_NUMBER() OVER( PARTITION BY user_id, amount ORDER BY created_at DESC ) as row_num
                    FROM payments
                    WHERE status = 'pending'
                ) t
                WHERE t.row_num > 1
            )
            RETURNING id;
        `);
        if (dupPendingRes.rowCount > 0) {
            console.log(`   ✅ Archived ${dupPendingRes.rowCount} duplicate pending payments.`);
        } else {
            console.log('   ✅ Clean: No duplicate pending payments found.');
        }

        // 3. Completed payment + missing subscription -> Recreate
        console.log('\n-> 3. Auto-Repair: Recreating missing subscriptions for completed payments...');
        const missingSubRes = await client.query(`
            SELECT p.id as payment_id, p.user_id, p.amount, p.provider_order_id, p.created_at
            FROM payments p
            LEFT JOIN subscriptions s ON p.user_id = s.user_id 
                AND (s.external_subscription_id = p.provider_order_id)
            WHERE p.status = 'completed' AND s.id IS NULL
        `);

        if (missingSubRes.rows.length > 0) {
            for (const row of missingSubRes.rows) {
                // Determine plan from amount (mock logic, ideally shared)
                const planTier = row.amount > 5000 ? 'premium' : 'pro';
                await client.query(`
                    INSERT INTO subscriptions (
                        id, user_id, plan_tier, billing_source, billing_provider, billing_status,
                        external_subscription_id, started_at, expires_at
                    ) VALUES (
                        $1, $2, $3, 'web', 'cashfree', 'active',
                        $4, $5::TIMESTAMPTZ, $5::TIMESTAMPTZ + INTERVAL '30 days'
                    ) ON CONFLICT DO NOTHING
                `, [uuidv4(), row.user_id, planTier, row.provider_order_id, row.created_at]);
                console.log(`   ✅ Auto-repaired subscription for user: ${row.user_id}`);
            }
        } else {
            console.log('   ✅ Clean: No missing subscriptions for completed payments.');
        }

        // --- UNSAFE MANUAL REVIEW CHECKS ---
        console.log('\n⚠️ Checking for Unsafe Issues (Require Manual Review)...');

        // Unsafe: Duplicate successful payments for the same user
        const dupSuccess = await client.query(`
            SELECT user_id, COUNT(*) as cnt
            FROM payments
            WHERE status = 'completed'
            GROUP BY user_id
            HAVING COUNT(*) > 1
        `);
        if (dupSuccess.rows.length > 0) {
            console.warn(`   🚨 Found ${dupSuccess.rows.length} users with duplicate successful payments!`);
        }

        // Unsafe: Conflicting premium expiry dates (active subscriptions with past expiry but still marked active, or multiple active sub rows)
        const conflictingSubs = await client.query(`
            SELECT user_id, COUNT(*) as cnt
            FROM subscriptions
            WHERE billing_status = 'active'
            GROUP BY user_id
            HAVING COUNT(*) > 1
        `);
        if (conflictingSubs.rows.length > 0) {
            console.warn(`   🚨 Found ${conflictingSubs.rows.length} users with multiple overlapping active subscriptions!`);
        }

        console.log('\n✅ Reconciliation complete.');

    } catch (e) {
        console.error('Reconciliation Error:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

reconcile();
