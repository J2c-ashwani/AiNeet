#!/usr/bin/env node
/**
 * Verifies a restored staging database, not production reachability.
 *
 * This script intentionally fails when STAGING_DATABASE_URL is missing. A backup
 * that has never been restored into a separate database is not launch evidence.
 */

const { Pool } = require('pg');
const path = require('path');

const ROOT = path.join(__dirname, '..');
require('dotenv').config({ path: path.join(ROOT, '.env') });
require('dotenv').config({ path: path.join(ROOT, '.env.local'), override: true });

const PROD_DB_URL = process.env.DATABASE_URL;
const STAGING_DB_URL = process.env.STAGING_DATABASE_URL;
const RESTORE_DRILL_ID = process.env.BACKUP_RESTORE_DRILL_ID;

const results = { passed: [], failed: [] };

function fail(message) {
    results.failed.push(message);
    console.log(`  ❌ ${message}`);
}

function pass(message) {
    results.passed.push(message);
    console.log(`  ✅ ${message}`);
}

function normalizedUrl(value) {
    return String(value || '').replace(/:[^:@/]+@/, ':<redacted>@');
}

function assertConfig() {
    if (!PROD_DB_URL) fail('DATABASE_URL is required for production baseline comparison');
    if (!STAGING_DB_URL) fail('STAGING_DATABASE_URL is required for restore verification');
    if (PROD_DB_URL && STAGING_DB_URL && PROD_DB_URL === STAGING_DB_URL) {
        fail('STAGING_DATABASE_URL must point to a separate restored database, not production');
    }
    if (!RESTORE_DRILL_ID) {
        fail('BACKUP_RESTORE_DRILL_ID is required to identify the restore drill being certified');
    }
}

async function queryCount(pool, table) {
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
    return rows[0].count;
}

async function check(pool, name, fn) {
    try {
        await fn(pool);
        pass(name);
    } catch (error) {
        fail(`${name}: ${error.message}`);
    }
}

async function main() {
    console.log('\n🔍 BACKUP RESTORE VERIFICATION\n' + '─'.repeat(40));
    assertConfig();
    if (results.failed.length > 0) return finish();

    console.log(`  Production baseline: ${normalizedUrl(PROD_DB_URL)}`);
    console.log(`  Restored staging:    ${normalizedUrl(STAGING_DB_URL)}`);
    console.log(`  Restore drill id:    ${RESTORE_DRILL_ID}`);

    const prodPool = new Pool({ connectionString: PROD_DB_URL, ssl: { rejectUnauthorized: false } });
    const stagingPool = new Pool({ connectionString: STAGING_DB_URL, ssl: { rejectUnauthorized: false } });

    try {
        await check(stagingPool, 'Restored staging DB reachable', pool => pool.query('SELECT 1'));

        const criticalTables = [
            'users',
            'questions',
            'tests',
            'feature_flags',
            'fraud_signals',
            'mobile_runtime_events',
            'teacher_review_queue',
        ];

        for (const table of criticalTables) {
            await check(stagingPool, `Restored table exists: ${table}`, pool => pool.query(`SELECT 1 FROM ${table} LIMIT 1`));
        }

        await check(stagingPool, 'No orphan test_answers in restored DB', async pool => {
            const { rows } = await pool.query(`
                SELECT COUNT(*)::int AS count
                FROM test_answers ta
                LEFT JOIN tests t ON ta.test_id = t.id
                WHERE t.id IS NULL
            `);
            if (rows[0].count > 0) throw new Error(`${rows[0].count} orphan rows`);
        });

        await check(stagingPool, 'Critical RPC functions restored', async pool => {
            const { rows } = await pool.query(`
                SELECT proname
                FROM pg_proc
                WHERE proname IN (
                    'submit_test_transaction',
                    'subscription_verify_transaction',
                    'subscription_activation_transaction',
                    'hybrid_ncert_search'
                )
            `);
            const found = new Set(rows.map(r => r.proname));
            const missing = ['submit_test_transaction', 'subscription_verify_transaction', 'subscription_activation_transaction', 'hybrid_ncert_search']
                .filter(name => !found.has(name));
            if (missing.length) throw new Error(`missing ${missing.join(', ')}`);
        });

        await check(stagingPool, 'pgvector extension restored', async pool => {
            const { rows } = await pool.query("SELECT 1 FROM pg_extension WHERE extname = 'vector'");
            if (rows.length === 0) throw new Error('vector extension missing');
        });

        await check(stagingPool, 'RAG active corpus columns restored (ncert_chunks)', async pool => {
            const { rows } = await pool.query(`
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'ncert_chunks'
                  AND column_name IN ('syllabus_version', 'ncert_edition', 'is_current_syllabus', 'deleted_from_current_syllabus', 'corpus_status', 'source_checksum')
            `);
            if (rows.length < 6) throw new Error(`ncert_chunks: only ${rows.length}/6 governance columns present — is this ncert_embeddings instead?`);
        });

        await check(stagingPool, 'Restored row counts are plausible against production', async staging => {
            const prodUsers = await queryCount(prodPool, 'users');
            const stagingUsers = await queryCount(staging, 'users');
            const prodQuestions = await queryCount(prodPool, 'questions');
            const stagingQuestions = await queryCount(staging, 'questions');

            if (prodUsers > 0 && stagingUsers === 0) throw new Error('users restored as zero rows');
            if (prodQuestions >= 100 && stagingQuestions < 100) throw new Error(`questions restored with only ${stagingQuestions} rows`);
        });
        await check(stagingPool, 'RLS enabled on critical tables', async pool => {
            const { rows } = await pool.query(`
                SELECT c.relname
                FROM pg_class c
                JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE n.nspname = 'public'
                  AND c.relname IN ('users', 'tests', 'test_answers', 'subscriptions', 'fraud_signals')
                  AND c.relrowsecurity = false
            `);
            if (rows.length > 0) throw new Error(`RLS disabled on: ${rows.map(r => r.relname).join(', ')}`);
        });

        await check(stagingPool, 'RLS policies restored for critical tables', async pool => {
            const { rows } = await pool.query(`
                SELECT schemaname, tablename, policyname
                FROM pg_policies
                WHERE tablename IN ('users', 'tests', 'test_answers', 'subscriptions')
            `);
            if (rows.length === 0) throw new Error('No RLS policies found — backup may be incomplete');
        });

        await check(stagingPool, 'Vector indexes restored on ncert_chunks', async pool => {
            const { rows } = await pool.query(`
                SELECT indexname
                FROM pg_indexes
                WHERE tablename = 'ncert_chunks'
                  AND indexdef ILIKE '%vector%'
            `);
            if (rows.length === 0) throw new Error('No vector indexes found on ncert_chunks — pgvector index missing from restore');
        });

    } finally {
        await Promise.allSettled([prodPool.end(), stagingPool.end()]);
    }

    finish();
}

function finish() {
    console.log('\n' + '─'.repeat(40));
    console.log(`✅ Passed: ${results.passed.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);

    if (results.failed.length > 0) {
        console.log('\nBlocking restore failures:');
        results.failed.forEach(item => console.log(`  ❌ ${item}`));
        process.exit(1);
    }

    console.log('\n✅ RESTORE DRILL VERIFIED\n');
    process.exit(0);
}

main().catch(error => {
    console.error('Verification script crashed:', error.message);
    process.exit(1);
});
