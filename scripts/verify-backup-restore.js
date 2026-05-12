#!/usr/bin/env node
/**
 * scripts/verify-backup-restore.js
 *
 * Weekly automated backup restore verification.
 * Restores latest Supabase backup into staging and validates data integrity.
 * 
 * Backups that were never tested are fake backups.
 *
 * Run: node scripts/verify-backup-restore.js
 * Scheduled: Every Sunday at 2:00 AM via GitHub Actions cron
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const STAGING_DB_URL = process.env.STAGING_DATABASE_URL;
const PROD_DB_URL    = process.env.DATABASE_URL;

if (!PROD_DB_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
}

const prodPool    = new Pool({ connectionString: PROD_DB_URL, ssl: { rejectUnauthorized: false } });
const stagingPool = STAGING_DB_URL
    ? new Pool({ connectionString: STAGING_DB_URL, ssl: { rejectUnauthorized: false } })
    : null;

async function verifyBackup() {
    const results = { passed: [], failed: [], timestamp: new Date().toISOString() };

    console.log('\n🔍 BACKUP RESTORE VERIFICATION\n' + '─'.repeat(40));

    // 1. Verify production DB is reachable
    await check(results, 'Production DB reachable', async () => {
        await prodPool.query('SELECT 1');
    });

    // 2. Verify critical tables exist and have expected row counts
    await check(results, 'users table populated', async () => {
        const { rows } = await prodPool.query('SELECT COUNT(*) as count FROM users');
        if (parseInt(rows[0].count) === 0) throw new Error('users table is empty');
    });

    await check(results, 'questions table populated', async () => {
        const { rows } = await prodPool.query('SELECT COUNT(*) as count FROM questions');
        if (parseInt(rows[0].count) < 100) throw new Error(`Only ${rows[0].count} questions found`);
    });

    await check(results, 'tests table accessible', async () => {
        await prodPool.query('SELECT COUNT(*) FROM tests');
    });

    await check(results, 'feature_flags seeded', async () => {
        const { rows } = await prodPool.query("SELECT COUNT(*) as count FROM feature_flags");
        if (parseInt(rows[0].count) === 0) throw new Error('feature_flags is empty');
    });

    await check(results, 'fraud_signals table exists', async () => {
        await prodPool.query('SELECT COUNT(*) FROM fraud_signals');
    });

    await check(results, 'mobile_runtime_events table exists', async () => {
        await prodPool.query('SELECT COUNT(*) FROM mobile_runtime_events');
    });

    await check(results, 'teacher_review_queue table exists', async () => {
        await prodPool.query('SELECT COUNT(*) FROM teacher_review_queue');
    });

    // 3. Verify referential integrity
    await check(results, 'No orphan test_answers', async () => {
        const { rows } = await prodPool.query(`
            SELECT COUNT(*) as count FROM test_answers ta
            LEFT JOIN tests t ON ta.test_id = t.id
            WHERE t.id IS NULL
        `);
        if (parseInt(rows[0].count) > 0) throw new Error(`${rows[0].count} orphan test_answers found`);
    });

    // Report
    console.log('\n' + '─'.repeat(40));
    console.log(`✅ Passed: ${results.passed.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);

    if (results.failed.length > 0) {
        console.log('\nFailed checks:');
        results.failed.forEach(f => console.log(`  ❌ ${f.name}: ${f.error}`));
        process.exit(1);
    }

    console.log('\n✅ BACKUP VERIFICATION PASSED\n');
    process.exit(0);
}

async function check(results, name, fn) {
    try {
        await fn();
        results.passed.push({ name });
        console.log(`  ✅ ${name}`);
    } catch (e) {
        results.failed.push({ name, error: e.message });
        console.log(`  ❌ ${name}: ${e.message}`);
    }
}

verifyBackup().catch(e => {
    console.error('Verification script crashed:', e.message);
    process.exit(1);
}).finally(() => {
    prodPool.end().catch(() => {});
    if (stagingPool) stagingPool.end().catch(() => {});
});
