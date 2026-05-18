const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function auditNotifications() {
    const client = await pool.connect();
    try {
        console.log('🔔 Starting Notification Reliability Audit...\n');

        // 1. Duplicate Sends
        console.log('-> Checking for duplicate sends (same user_id + dedupe_key)...');
        const duplicates = await client.query(`
            SELECT user_id, dedupe_key, COUNT(*)
            FROM notifications_log
            GROUP BY user_id, dedupe_key
            HAVING COUNT(*) > 1
        `);
        if (duplicates.rows.length > 0) {
            console.error(`   ❌ Found ${duplicates.rows.length} duplicate sends violating idempotency!`);
        } else {
            console.log('   ✅ Clean: Idempotency is strict. No duplicates.');
        }

        // 2. Quiet Hours Violation
        console.log('\n-> Checking for quiet hours violations (10:30 PM to 6:30 AM server time proxy)...');
        // We'll check local time using the DB's timezone capabilities or just fetch recent ones and verify
        const recentNudges = await client.query(`
            SELECT n.id, n.user_id, n.sent_at, u.timezone
            FROM notifications_log n
            JOIN users u ON n.user_id = u.id
            WHERE sent_at > NOW() - INTERVAL '7 days'
        `);
        let quietHoursViolations = 0;
        recentNudges.rows.forEach(r => {
            if (!r.sent_at) return;
            const tz = r.timezone || 'Asia/Kolkata';
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: tz,
                hour: 'numeric',
                minute: 'numeric',
                hour12: false
            });
            const parts = formatter.formatToParts(new Date(r.sent_at));
            const hr = parseInt(parts.find(p => p.type === 'hour').value, 10);
            const mn = parseInt(parts.find(p => p.type === 'minute').value, 10);
            if (hr > 22 || (hr === 22 && mn >= 30) || hr < 6 || (hr === 6 && mn < 30)) {
                quietHoursViolations++;
            }
        });
        if (quietHoursViolations > 0) {
            console.error(`   ❌ Found ${quietHoursViolations} notifications sent during quiet hours!`);
        } else {
            console.log('   ✅ Clean: Quiet hours are respected locally.');
        }

        // 3. Rate Limiting Violation (>2 daily)
        console.log('\n-> Checking for rate limit violations (> 2 daily per user)...');
        const rateLimitViolations = await client.query(`
            SELECT user_id, DATE(created_at AT TIME ZONE 'UTC') as d, COUNT(*)
            FROM notifications_log
            GROUP BY user_id, DATE(created_at AT TIME ZONE 'UTC')
            HAVING COUNT(*) > 2
        `);
        if (rateLimitViolations.rows.length > 0) {
            console.error(`   ❌ Found ${rateLimitViolations.rows.length} users receiving >2 notifications in a single day!`);
        } else {
            console.log('   ✅ Clean: Rate limiting active.');
        }

        // 4. Token Reuse Across Users
        console.log('\n-> Checking for token conflict (shared FCM tokens across users)...');
        const tokenConflicts = await client.query(`
            SELECT fcm_token, COUNT(id)
            FROM user_devices
            WHERE fcm_token IS NOT NULL
              AND is_active = TRUE
              AND fcm_token_invalidated_at IS NULL
            GROUP BY fcm_token
            HAVING COUNT(id) > 1
        `);
        if (tokenConflicts.rows.length > 0) {
            console.warn(`   ⚠️ Found ${tokenConflicts.rows.length} FCM tokens shared across multiple users.`);
        } else {
            console.log('   ✅ All FCM tokens are unique to users.');
        }

        // 5. Delivery Failure Spikes
        console.log('\n-> Checking delivery failure rates...');
        const failures = await client.query(`
            SELECT 
                COUNT(*) FILTER (WHERE delivery_status = 'failed') as failed_count,
                COUNT(*) FILTER (WHERE delivery_status = 'sent') as sent_count
            FROM notifications_log
            WHERE created_at > NOW() - INTERVAL '24 hours'
        `);
        const total = parseInt(failures.rows[0].failed_count) + parseInt(failures.rows[0].sent_count);
        if (total > 0) {
            const failRate = parseInt(failures.rows[0].failed_count) / total;
            if (failRate > 0.1) {
                console.error(`   ❌ High failure spike detected! ${Math.round(failRate*100)}% failure rate in the last 24h.`);
            } else {
                console.log(`   ✅ Failure rate is nominal (${Math.round(failRate*100)}%).`);
            }
        } else {
            console.log('   ℹ️ No sends in the last 24h to measure failure rate.');
        }

        console.log('\n✅ Notification Audit completed.');

    } catch (e) {
        console.error('Notification Audit Error:', e);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

auditNotifications();
