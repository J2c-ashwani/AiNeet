const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function auditAccess() {
    const client = await pool.connect();
    try {
        console.log('🛡️ Starting Subscription Access Validation...\n');

        // 1. Ghost Premium States: Users marked 'pro' without an active subscription
        console.log('-> Checking for Ghost Premium States...');
        const ghostRes = await client.query(`
            SELECT u.id, u.email, u.subscription_tier
            FROM users u
            LEFT JOIN subscriptions s ON u.id = s.user_id AND s.billing_status = 'active' AND s.expires_at > NOW()
            WHERE u.subscription_tier IN ('pro', 'premium') AND s.id IS NULL
        `);
        if (ghostRes.rows.length > 0) {
            console.error(`   ❌ Found ${ghostRes.rows.length} users with Ghost Premium Status (Tier is pro/premium but no active sub)!`);
            // We should potentially downgrade them here if auto-repair was enabled.
        } else {
            console.log('   ✅ Clean: No ghost premium users found.');
        }

        // 2. Paid but blocked users: Active subscription but user tier is 'free'
        console.log('\n-> Checking for Paid but Blocked Users...');
        const blockedRes = await client.query(`
            SELECT u.id, u.email, s.plan_tier, s.expires_at
            FROM subscriptions s
            JOIN users u ON s.user_id = u.id
            WHERE s.billing_status = 'active' AND s.expires_at > NOW()
              AND (u.subscription_tier = 'free' OR u.subscription_tier IS NULL)
        `);
        if (blockedRes.rows.length > 0) {
            console.error(`   🚨 CRITICAL: Found ${blockedRes.rows.length} users who paid but are blocked (Tier is free)!`);
            console.table(blockedRes.rows);
        } else {
            console.log('   ✅ Clean: All actively subscribed users have correct access tiers.');
        }

        // 3. Expired users who did not lose access
        console.log('\n-> Checking for Expired Users with Lingering Access...');
        const lingeringRes = await client.query(`
            SELECT u.id, u.email, s.expires_at
            FROM subscriptions s
            JOIN users u ON s.user_id = u.id
            WHERE s.billing_status = 'expired' OR s.expires_at < NOW()
            -- Make sure they don't have ANOTHER active subscription
            AND NOT EXISTS (
                SELECT 1 FROM subscriptions s2 
                WHERE s2.user_id = u.id AND s2.billing_status = 'active' AND s2.expires_at > NOW()
            )
            AND u.subscription_tier IN ('pro', 'premium')
        `);
        if (lingeringRes.rows.length > 0) {
            console.error(`   ⚠️ Found ${lingeringRes.rows.length} users whose subscriptions expired but they still have premium tier!`);
        } else {
            console.log('   ✅ Clean: Expired users properly lost access.');
        }

        console.log('\n✅ Access Audit completed.');
    } catch (e) {
        console.error('Access Audit Error:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

auditAccess();
