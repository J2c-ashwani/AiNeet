const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function auditParentConnect() {
    const client = await pool.connect();
    try {
        console.log('👨‍👩‍👧‍👦 Starting Parent Connect Reliability Audit...\n');

        // 1. Premium users without parents attached
        console.log('-> Checking for Premium users without Parent Connect setup...');
        const premiumNoParent = await client.query(`
            SELECT id FROM users 
            WHERE subscription_tier = 'premium' 
            AND (parent_email IS NULL OR parent_email = '')
        `);
        if (premiumNoParent.rows.length > 0) {
            console.warn(`   ⚠️ Found ${premiumNoParent.rows.length} premium users missing parent details.`);
        } else {
            console.log('   ✅ All premium users have parent details attached.');
        }

        // 2. Reports generated but never delivered (after max retries)
        console.log('\n-> Checking for chronically failed reports...');
        const failedReports = await client.query(`
            SELECT id, email_delivery_status, whatsapp_delivery_status, retry_count
            FROM parent_report_logs
            WHERE retry_count >= 3
            AND (email_delivery_status = 'failed' OR whatsapp_delivery_status = 'failed')
        `);
        if (failedReports.rows.length > 0) {
            console.error(`   ❌ Found ${failedReports.rows.length} reports that failed delivery permanently.`);
        } else {
            console.log('   ✅ No permanently failed deliveries detected.');
        }

        // 3. Duplicate Sends
        console.log('\n-> Checking for duplicate sends...');
        const duplicateSends = await client.query(`
            SELECT user_id, report_week_start, COUNT(*)
            FROM weekly_parent_reports
            GROUP BY user_id, report_week_start
            HAVING COUNT(*) > 1
        `);
        if (duplicateSends.rows.length > 0) {
            console.error(`   ❌ Found ${duplicateSends.rows.length} duplicate weekly reports for the same week!`);
        } else {
            console.log('   ✅ Clean: No duplicate reports generated.');
        }

        // 4. Stale parent links (Parents attached but student inactive for 14+ days)
        console.log('\n-> Checking for stale parent configurations...');
        const staleLinks = await client.query(`
            SELECT u.id, u.parent_email
            FROM users u
            LEFT JOIN tests t ON t.user_id = u.id AND t.started_at > NOW() - INTERVAL '14 days'
            WHERE u.parent_consent_given_at IS NOT NULL
            GROUP BY u.id, u.parent_email
            HAVING COUNT(t.id) = 0
        `);
        if (staleLinks.rows.length > 0) {
            console.warn(`   ⚠️ Found ${staleLinks.rows.length} users with parents attached but no recent activity.`);
        } else {
            console.log('   ✅ All users with parents attached are actively testing.');
        }

        // 5. Corrupted Analytics Payload
        console.log('\n-> Checking for corrupted snapshot payloads...');
        const corruptedPayloads = await client.query(`
            SELECT id, snapshot_payload
            FROM weekly_parent_reports
            WHERE (snapshot_payload->>'testCount')::int <= 0
               OR snapshot_payload->>'accuracy' IS NULL
        `);
        if (corruptedPayloads.rows.length > 0) {
            console.error(`   ❌ Found ${corruptedPayloads.rows.length} reports with empty/corrupted analytics payloads!`);
        } else {
            console.log('   ✅ Clean: All reports have valid analytics payloads.');
        }

        // 6. Cron Execution Health
        console.log('\n-> Checking Cron Stability...');
        const cronFails = await client.query(`
            SELECT id, started_at, error_payload 
            FROM cron_execution_logs 
            WHERE status = 'failed'
            ORDER BY started_at DESC LIMIT 5
        `);
        if (cronFails.rows.length > 0) {
            console.error(`   ❌ Found recent cron failures!`);
            cronFails.rows.forEach(r => console.error(`      - ${r.started_at}: ${JSON.stringify(r.error_payload)}`));
        } else {
            console.log('   ✅ Clean: Cron is executing successfully.');
        }

        console.log('\n✅ Parent Connect Audit completed.');

    } catch (e) {
        console.error('Parent Connect Audit Error:', e);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

auditParentConnect();
