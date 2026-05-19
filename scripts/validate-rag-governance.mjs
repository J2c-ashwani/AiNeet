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
            WHERE table_name = 'ncert_chunks'
        `);
        const columns = new Set(columnRows.map(row => row.column_name));
        for (const column of requiredColumns) {
            columns.has(column)
                ? pass(`ncert_chunks.${column} exists`)
                : fail(`ncert_chunks.${column} is missing`);
        }

        const { rows: indexRows } = await pool.query(
            "SELECT to_regclass('public.idx_ncert_active_syllabus') AS index_name"
        );
        indexRows[0]?.index_name
            ? pass('idx_ncert_active_syllabus exists')
            : fail('idx_ncert_active_syllabus is missing');

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
            [
                'is_current_syllabus = true',
                'deleted_from_current_syllabus = false',
                "corpus_status = 'active'",
            ].forEach(fragment => {
                fnDefinition.includes(fragment)
                    ? pass(`hybrid search filters ${fragment}`)
                    : fail(`hybrid search does not filter ${fragment}`);
            });
        }

        const { rows: activeRows } = await pool.query(`
            SELECT COUNT(*)::int AS count
            FROM ncert_chunks
            WHERE corpus_status = 'active'
              AND (
                is_current_syllabus IS DISTINCT FROM true
                OR deleted_from_current_syllabus IS DISTINCT FROM false
              )
        `);
        Number(activeRows[0]?.count || 0) === 0
            ? pass('No active chunks are marked deleted/outside current syllabus')
            : fail(`${activeRows[0].count} active chunks violate syllabus flags`);

        const { rows: missingMetadataRows } = await pool.query(`
            SELECT COUNT(*)::int AS count
            FROM ncert_chunks
            WHERE corpus_status = 'active'
              AND (
                syllabus_version IS NULL
                OR ncert_edition IS NULL
                OR ingestion_batch_id IS NULL
                OR source_checksum IS NULL
              )
        `);
        Number(missingMetadataRows[0]?.count || 0) === 0
            ? pass('Active chunks have governance metadata')
            : fail(`${missingMetadataRows[0].count} active chunks are missing governance metadata`);

        try {
            const { rows: dimsRows } = await pool.query(`
                SELECT vector_dims(embedding)::int AS dimensions, COUNT(*)::int AS count
                FROM ncert_chunks
                WHERE embedding IS NOT NULL
                GROUP BY vector_dims(embedding)
                ORDER BY dimensions
            `);
            if (dimsRows.length === 0) {
                warn('No embeddings found in ncert_chunks');
            } else {
                const unexpected = dimsRows.filter(row => Number(row.dimensions) !== expectedEmbeddingDimensions);
                unexpected.length === 0
                    ? pass(`All embeddings use ${expectedEmbeddingDimensions} dimensions`)
                    : fail(`Unexpected embedding dimensions: ${unexpected.map(row => `${row.dimensions} (${row.count})`).join(', ')}`);
            }
        } catch (error) {
            fail(`Embedding dimension check failed: ${error.message}`);
        }

        const { rows: subjectRows } = await pool.query(`
            SELECT subject, COUNT(*)::int AS count
            FROM ncert_chunks
            WHERE corpus_status = 'active'
              AND is_current_syllabus = true
              AND deleted_from_current_syllabus = false
            GROUP BY subject
            ORDER BY subject
        `);
        if (subjectRows.length === 0) {
            fail('No active current-syllabus chunks found');
        } else {
            subjectRows.forEach(row => pass(`${row.subject || 'unknown'} active chunks: ${row.count}`));
        }
    } catch (error) {
        fail(error.message);
    } finally {
        finish(pool);
    }
}

main();
