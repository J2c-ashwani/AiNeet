#!/usr/bin/env node
/**
 * scripts/backfill-rag-governance-metadata.js
 *
 * Backfills governance metadata on existing ncert_embeddings rows that were
 * ingested before the governance columns were added.
 *
 * Safe to run multiple times — uses WHERE column IS NULL so it only touches
 * rows that are missing values.
 *
 * Usage:
 *   node scripts/backfill-rag-governance-metadata.js
 */

const { Pool } = require('pg');
const path = require('path');
const ROOT = path.join(__dirname, '..');
require('dotenv').config({ path: path.join(ROOT, '.env') });
require('dotenv').config({ path: path.join(ROOT, '.env.local'), override: true });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

const BATCH_ID = `backfill-${new Date().toISOString().slice(0, 10)}`; // for display only
const SYLLABUS_VERSION = '2023-24'; // Current NEET syllabus year
const NCERT_EDITION   = '2023';    // NCERT edition in use

async function main() {
    console.log('\n📋 RAG GOVERNANCE METADATA BACKFILL');
    console.log('────────────────────────────────────');
    console.log(`  syllabus_version:  ${SYLLABUS_VERSION}`);
    console.log(`  ncert_edition:     ${NCERT_EDITION}`);
    console.log(`  ingestion_batch_id: ${BATCH_ID}`);

    // Count rows that need backfilling
    const { rows: before } = await pool.query(`
        SELECT COUNT(*)::int AS count
        FROM ncert_embeddings
        WHERE corpus_status = 'active'
          AND (
            syllabus_version IS NULL
            OR ncert_edition IS NULL
            OR ingestion_batch_id IS NULL
            OR source_checksum IS NULL
          )
    `);
    console.log(`\n  Rows needing backfill: ${before[0].count}`);

    if (before[0].count === 0) {
        console.log('  ✅ Nothing to backfill — all rows already have governance metadata');
        await pool.end();
        return;
    }

    // Backfill syllabus_version
    const { rowCount: v } = await pool.query(`
        UPDATE ncert_embeddings
        SET syllabus_version = $1
        WHERE syllabus_version IS NULL AND corpus_status = 'active'
    `, [SYLLABUS_VERSION]);
    console.log(`  ✅ syllabus_version set on ${v} rows`);

    // Backfill ncert_edition
    const { rowCount: e } = await pool.query(`
        UPDATE ncert_embeddings
        SET ncert_edition = $1
        WHERE ncert_edition IS NULL AND corpus_status = 'active'
    `, [NCERT_EDITION]);
    console.log(`  ✅ ncert_edition set on ${e} rows`);

    // Backfill ingestion_batch_id — UUID column, use gen_random_uuid() per row
    const { rowCount: b } = await pool.query(`
        UPDATE ncert_embeddings
        SET ingestion_batch_id = gen_random_uuid()
        WHERE ingestion_batch_id IS NULL AND corpus_status = 'active'
    `);
    console.log(`  ✅ ingestion_batch_id set on ${b} rows`);

    // Backfill source_checksum — use pgcrypto SHA256 if available, else md5
    const { rowCount: c } = await pool.query(`
        UPDATE ncert_embeddings
        SET source_checksum = md5(chunk_text)
        WHERE source_checksum IS NULL
          AND corpus_status = 'active'
          AND chunk_text IS NOT NULL
    `);
    console.log(`  ✅ source_checksum set on ${c} rows`);

    // Verify
    const { rows: after } = await pool.query(`
        SELECT COUNT(*)::int AS count
        FROM ncert_embeddings
        WHERE corpus_status = 'active'
          AND (
            syllabus_version IS NULL
            OR ncert_edition IS NULL
            OR ingestion_batch_id IS NULL
            OR source_checksum IS NULL
          )
    `);

    console.log('\n────────────────────────────────────');
    if (after[0].count === 0) {
        console.log('✅ BACKFILL COMPLETE — 0 rows missing governance metadata');
    } else {
        console.log(`⚠️  ${after[0].count} rows still missing metadata after backfill`);
    }

    await pool.end();
}

main().catch(async e => {
    console.error('❌ Backfill failed:', e.message);
    await pool.end();
    process.exit(1);
});
