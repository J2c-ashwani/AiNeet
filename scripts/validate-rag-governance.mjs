#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

const { Pool } = pg;
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const explicitEnv = { ...process.env };
dotenv.config({ path: path.join(ROOT, '.env') });
dotenv.config({ path: path.join(ROOT, '.env.local'), override: true });
Object.assign(process.env, explicitEnv);

const checks = { passed: [], failed: [], warnings: [] };
const expectedEmbeddingDimensions = Number(process.env.EXPECTED_EMBEDDING_DIMENSIONS || 3072);

// Real production RAG table (confirmed by live DB inspection 2026-05-22)
const RAG_TABLE = 'ncert_embeddings';

function pass(message) {
    checks.passed.push(message);
    console.log(`  PASS ${message}`);
}

function fail(message) {
    checks.failed.push(message);
    console.log(`  FAIL ${message}`);
}

function warn(message) {
    checks.warnings.push(message);
    console.log(`  WARN ${message}`);
}

function finish(pool) {
    console.log('\nRAG GOVERNANCE SUMMARY');
    console.log(`  Passed:   ${checks.passed.length}`);
    console.log(`  Warnings: ${checks.warnings.length}`);
    console.log(`  Failed:   ${checks.failed.length}`);

    if (checks.failed.length > 0) {
        console.log('\nBlocking failures:');
        checks.failed.forEach(item => console.log(`  - ${item}`));
    }

    pool?.end?.();
    process.exit(checks.failed.length === 0 ? 0 : 1);
}

async function main() {
    console.log('\nRAG GOVERNANCE VALIDATION');
    console.log('-------------------------');

    if (!process.env.DATABASE_URL) {
        fail('DATABASE_URL is required');
        return finish();
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        // ── 1. Confirm real RAG table exists ─────────────────────────────────
        const { rows: tableRows } = await pool.query(`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = $1
        `, [RAG_TABLE]);

        if (tableRows.length === 0) {
            fail(`RAG table '${RAG_TABLE}' does not exist`);
            return finish(pool);
        }
        pass(`RAG table '${RAG_TABLE}' exists`);

        // ── 2. Required governance columns ────────────────────────────────────
        const requiredColumns = [
            'syllabus_version',
            'ncert_edition',
            'ingestion_batch_id',
            'source_checksum',
            'is_current_syllabus',
            'deleted_from_current_syllabus',
            'corpus_status',
        ];

        const { rows: columnRows } = await pool.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = $1
        `, [RAG_TABLE]);
        const columns = new Set(columnRows.map(row => row.column_name));
        for (const column of requiredColumns) {
            columns.has(column)
                ? pass(`${RAG_TABLE}.${column} exists`)
                : fail(`${RAG_TABLE}.${column} is missing`);
        }

        // ── 3. Governance index ───────────────────────────────────────────────
        const { rows: indexRows } = await pool.query(
            "SELECT to_regclass('public.idx_ncert_active_syllabus') AS index_name"
        );
        indexRows[0]?.index_name
            ? pass('idx_ncert_active_syllabus exists')
            : warn('idx_ncert_active_syllabus is missing (query performance impact, not a data error)');

        // ── 4. hybrid_ncert_search function and its filters ───────────────────
        const { rows: fnRows } = await pool.query(`
            SELECT pg_get_functiondef(p.oid) AS definition
            FROM pg_proc p
            JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname = 'hybrid_ncert_search'
            ORDER BY p.oid DESC
            LIMIT 1
        `);
        const fnDefinition = fnRows[0]?.definition || '';
        if (!fnDefinition) {
            fail('hybrid_ncert_search function is missing');
        } else {
            pass('hybrid_ncert_search function exists');
            // Case-insensitive check — SQL allows TRUE/true/True
            const fnLower = fnDefinition.toLowerCase();
            [
                { fragment: 'is_current_syllabus', label: 'hybrid search filters is_current_syllabus' },
                { fragment: 'deleted_from_current_syllabus', label: 'hybrid search filters deleted_from_current_syllabus' },
                { fragment: "corpus_status = 'active'", label: "hybrid search filters corpus_status = 'active'" },
            ].forEach(({ fragment, label }) => {
                fnLower.includes(fragment.toLowerCase())
                    ? pass(label)
                    : fail(label);
            });
        }

        // ── 5. Data integrity — no active rows violating syllabus flags ───────
        const { rows: activeRows } = await pool.query(`
            SELECT COUNT(*)::int AS count
            FROM ${RAG_TABLE}
            WHERE corpus_status = 'active'
              AND (
                is_current_syllabus IS DISTINCT FROM true
                OR deleted_from_current_syllabus IS DISTINCT FROM false
              )
        `);
        Number(activeRows[0]?.count || 0) === 0
            ? pass('No active chunks are marked deleted/outside current syllabus')
            : fail(`${activeRows[0].count} active chunks violate syllabus flags`);

        // ── 6. Missing governance metadata ────────────────────────────────────
        const { rows: missingMetadataRows } = await pool.query(`
            SELECT COUNT(*)::int AS count
            FROM ${RAG_TABLE}
            WHERE corpus_status = 'active'
              AND (
                syllabus_version IS NULL
                OR ncert_edition IS NULL
                OR ingestion_batch_id IS NULL
                OR source_checksum IS NULL
              )
        `);
        Number(missingMetadataRows[0]?.count || 0) === 0
            ? pass('Active chunks have complete governance metadata')
            : fail(`${missingMetadataRows[0].count} active chunks are missing governance metadata`);

        // ── 7. Embedding dimension consistency ────────────────────────────────
        try {
            const { rows: dimsRows } = await pool.query(`
                SELECT vector_dims(embedding)::int AS dimensions, COUNT(*)::int AS count
                FROM ${RAG_TABLE}
                WHERE embedding IS NOT NULL
                GROUP BY vector_dims(embedding)
                ORDER BY dimensions
            `);
            if (dimsRows.length === 0) {
                warn('No embeddings found in ' + RAG_TABLE);
            } else {
                const unexpected = dimsRows.filter(row => Number(row.dimensions) !== expectedEmbeddingDimensions);
                unexpected.length === 0
                    ? pass(`All embeddings use ${expectedEmbeddingDimensions} dimensions`)
                    : fail(`Unexpected embedding dimensions: ${unexpected.map(row => `${row.dimensions} (${row.count})`).join(', ')}`);
            }
        } catch (error) {
            fail(`Embedding dimension check failed: ${error.message}`);
        }

        // ── 8. Subject coverage ───────────────────────────────────────────────
        const { rows: subjectRows } = await pool.query(`
            SELECT subject, COUNT(*)::int AS count
            FROM ${RAG_TABLE}
            WHERE corpus_status = 'active'
              AND is_current_syllabus = true
              AND deleted_from_current_syllabus = false
            GROUP BY subject
            ORDER BY subject
        `);
        const REQUIRED_SUBJECTS = ['physics', 'chemistry', 'biology'];
        const foundSubjects = new Set(subjectRows.map(r => r.subject?.toLowerCase()));

        if (subjectRows.length === 0) {
            fail('No active current-syllabus chunks found');
        } else {
            subjectRows.forEach(row => pass(`${row.subject || 'unknown'} active chunks: ${row.count}`));
            REQUIRED_SUBJECTS.forEach(subject => {
                if (!foundSubjects.has(subject)) {
                    fail(`${subject} has 0 active embeddings — ingestion required before launch`);
                }
            });
        }

    } catch (error) {
        fail(error.message);
    } finally {
        finish(pool);
    }
}

main();
