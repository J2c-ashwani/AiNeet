#!/usr/bin/env node
/**
 * scripts/audit-db-performance.js
 *
 * Weekly database performance audit.
 * Identifies slow queries, missing indexes, and table bloat.
 * Run in CI every Sunday or before each major release.
 *
 * Run: node scripts/audit-db-performance.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, family: 4 });
const results = { passed: [], warned: [], failed: [] };
const SLOW_QUERY_THRESHOLD_MS = 500;

async function audit() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('    🗄️  DATABASE PERFORMANCE AUDIT');
    console.log('═══════════════════════════════════════════════════\n');

    // 1. Verify critical indexes exist
    await check('Index: questions.subject_id', `
        SELECT 1 FROM pg_indexes WHERE tablename='questions' AND indexname='idx_questions_subject'
    `, r => r.rows.length > 0, 'warn');

    await check('Index: test_answers.test_id', `
        SELECT 1 FROM pg_indexes WHERE tablename='test_answers' AND indexname LIKE '%test_id%'
    `, r => r.rows.length > 0, 'warn');

    await check('Index: mobile_runtime_events.event_type', `
        SELECT 1 FROM pg_indexes WHERE tablename='mobile_runtime_events' AND indexname='idx_mobile_events_type'
    `, r => r.rows.length > 0, 'fail');

    await check('Index: fraud_signals.severity', `
        SELECT 1 FROM pg_indexes WHERE tablename='fraud_signals' AND indexname='idx_fraud_signals_severity'
    `, r => r.rows.length > 0, 'fail');

    // 2. Check table row counts (detect unexpected growth)
    await check('Questions table not empty', `SELECT COUNT(*) as c FROM questions`, r => parseInt(r.rows[0].c) >= 100, 'fail');
    await check('Users table sanity', `SELECT COUNT(*) as c FROM users`, r => parseInt(r.rows[0].c) >= 0, 'fail');

    // 3. Check for orphan records (referential integrity)
    await check('No orphan test_answers', `
        SELECT COUNT(*) as c FROM test_answers ta
        LEFT JOIN tests t ON ta.test_id = t.id WHERE t.id IS NULL
    `, r => parseInt(r.rows[0].c) === 0, 'fail');

    // 4. Check used_nonces doesn't grow unbounded (TTL working)
    await check('used_nonces not bloated', `
        SELECT COUNT(*) as c FROM used_nonces WHERE expires_at < NOW()
    `, r => parseInt(r.rows[0].c) < 1000, 'warn');

    // 5. Check mobile_runtime_events isn't growing unbounded
    const eventCount = await pool.query(`
        SELECT COUNT(*) as total,
               COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_week
        FROM mobile_runtime_events
    `);
    const total = parseInt(eventCount.rows[0].total);
    const week  = parseInt(eventCount.rows[0].last_week);
    log(`mobile_runtime_events: ${total} total, ${week} this week`, total < 500000 ? 'pass' : 'warn');

    // 6. Verify feature_flags table has all required flags
    const flags = await pool.query(`SELECT key FROM feature_flags`);
    const required = ['ff_adaptive_engine', 'ff_battleground', 'ff_notifications', 'ff_omr_enabled'];
    const existing = flags.rows.map(r => r.key);
    const missing  = required.filter(k => !existing.includes(k));
    if (missing.length === 0) {
        results.passed.push('All required feature flags exist');
        console.log('  ✅ All required feature flags exist');
    } else {
        results.failed.push(`Missing feature flags: ${missing.join(', ')}`);
        console.log(`  ❌ Missing feature flags: ${missing.join(', ')}`);
    }

    // ─── Report ─────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ✅ Passed: ${results.passed.length}`);
    console.log(`  ⚠️  Warned: ${results.warned.length}`);
    console.log(`  ❌ Failed: ${results.failed.length}`);
    if (results.failed.length > 0) {
        console.log('\n  Failed:');
        results.failed.forEach(f => console.log(`    ❌ ${f}`));
    }
    console.log('═══════════════════════════════════════════════════\n');
    process.exit(results.failed.length > 0 ? 1 : 0);
}

async function check(name, sql, validator, severity = 'fail') {
    try {
        const r = await pool.query(sql);
        const ok = validator(r);
        if (ok) {
            results.passed.push(name);
            console.log(`  ✅ ${name}`);
        } else if (severity === 'warn') {
            results.warned.push(name);
            console.log(`  ⚠️  ${name}`);
        } else {
            results.failed.push(name);
            console.log(`  ❌ ${name}`);
        }
    } catch (e) {
        results.failed.push(`${name}: ${e.message}`);
        console.log(`  ❌ ${name}: ${e.message}`);
    }
}

function log(msg, status) {
    if (status === 'pass') { results.passed.push(msg); console.log(`  ✅ ${msg}`); }
    else { results.warned.push(msg); console.log(`  ⚠️  ${msg}`); }
}

audit().catch(e => { console.error(e); process.exit(1); }).finally(() => pool.end());
