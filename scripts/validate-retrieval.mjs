/**
 * NCERT RAG Retrieval Integrity Validator
 * Phase 1 validation: verify embeddings are semantically correct post-ingestion.
 *
 * Run after each subject ingestion:
 *   node scripts/validate-retrieval.mjs --subject chemistry
 *   node scripts/validate-retrieval.mjs --subject biology
 *   node scripts/validate-retrieval.mjs --subject physics
 */

import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

// ─── Config ──────────────────────────────────────────────────────────────────

const SUBJECT = process.argv.find((a, i) => process.argv[i - 1] === '--subject') || 'chemistry';
const EMBED_MODEL = 'gemini-embedding-001';
const EMBED_DIMS = 3072;

const VALIDATION_QUERIES = {
    chemistry: [
        { query: 'SN1 vs SN2 nucleophilic substitution mechanism',          expectedChapter: 'Haloalkanes and Haloarenes',                       forbiddenChapter: 'Hydrogen' },
        { query: 'sp3 sp2 hybridization carbon orbital',                    expectedChapter: 'Organic Chemistry: Some Basic Principles',          forbiddenChapter: 'Hydrogen' },
        { query: 'balancing redox reactions oxidation number method',       expectedChapter: 'Redox Reactions',                                   forbiddenChapter: null },
        { query: 'electrochemical cell EMF Nernst equation',                expectedChapter: 'Electrochemistry',                                  forbiddenChapter: 'Hydrogen' },
        { query: 'haloalkane haloarene preparation reactions',              expectedChapter: 'Haloalkanes and Haloarenes',                         forbiddenChapter: null },
        { query: 'crystal field theory coordination compounds color',       expectedChapter: 'Coordination Compounds',                            forbiddenChapter: null },
        { query: 'rate constant Arrhenius activation energy',               expectedChapter: 'Chemical Kinetics',                                 forbiddenChapter: null },
        { query: 'Raoults law vapour pressure colligative properties',      expectedChapter: 'Solutions',                                         forbiddenChapter: null },
        { query: 'alkene alkane alkyne hydrocarbons reactions',             expectedChapter: 'Hydrocarbons',                                      forbiddenChapter: 'Hydrogen' },
        { query: 'amino acids proteins biomolecules structure',             expectedChapter: 'Biomolecules',                                      forbiddenChapter: null },
    ],
    biology: [
        { query: 'pollination double fertilization flowering plants',       expectedChapter: 'Sexual Reproduction in Flowering Plants',           forbiddenChapter: 'Reproduction in Organisms' },
        { query: 'Mendels laws of inheritance punnett square',              expectedChapter: 'Principles of Inheritance and Variation',           forbiddenChapter: null },
        { query: 'DNA replication transcription translation central dogma', expectedChapter: 'Molecular Basis of Inheritance',                    forbiddenChapter: null },
        { query: 'Calvin cycle photosynthesis C3 C4 plants',               expectedChapter: 'Photosynthesis in Higher Plants',                   forbiddenChapter: null },
        { query: 'Bt crops transgenic plants biotechnology applications',   expectedChapter: 'Biotechnology and its Applications',                forbiddenChapter: 'Strategies for Enhancement in Food Production' },
        { query: 'biodiversity hotspots conservation in situ ex situ',     expectedChapter: 'Biodiversity and Conservation',                     forbiddenChapter: 'Environmental Issues' },
        { query: 'ecosystem food chain trophic levels energy flow',        expectedChapter: 'Ecosystem',                                         forbiddenChapter: null },
    ],
    physics: [
        { query: 'Gauss law electric field charge distribution',            expectedChapter: 'Electric Charges and Fields',                       forbiddenChapter: null },
        { query: 'Faraday law electromagnetic induction flux',              expectedChapter: 'Electromagnetic Induction',                         forbiddenChapter: null },
        { query: 'Bohr model hydrogen atom energy levels',                  expectedChapter: 'Atoms',                                            forbiddenChapter: null },
        { query: 'logic gates semiconductor p-n junction diode',            expectedChapter: 'Semiconductor Electronics',                         forbiddenChapter: null },
        { query: 'projectile motion laws of motion Newton',                 expectedChapter: 'Motion in a Plane',                                forbiddenChapter: null },
        { query: 'simple harmonic motion spring pendulum frequency',        expectedChapter: 'Oscillations',                                     forbiddenChapter: null },
    ],
};

// ─── DB Setup ─────────────────────────────────────────────────────────────────

function looksLikePlaceholder(value) {
    if (!value) return true;
    const v = value.toUpperCase();
    return (
        v.includes('[YOUR-') ||
        v.includes('<YOUR_') ||
        v.includes('YOUR_') ||
        v.includes('*****') ||
        v.includes('REDACTED')
    );
}

function loadEnv() {
    dotenv.config({ path: '.env', override: false });
    const local = dotenv.config({ path: '.env.local', override: false }).parsed || {};

    for (const [key, value] of Object.entries(local)) {
        if (!process.env[key] || looksLikePlaceholder(process.env[key])) {
            process.env[key] = value;
        }
    }
}

function requireEnv(name) {
    const value = process.env[name];
    if (looksLikePlaceholder(value)) {
        throw new Error(`${name} is missing or still contains a placeholder. Set it in .env.local before running retrieval validation.`);
    }
    return value;
}

function getGeminiApiKey() {
    const key = Object.keys(process.env)
        .filter((name) => name === 'GEMINI_API_KEY' || name.startsWith('GEMINI_API_KEY_'))
        .sort()
        .map((name) => process.env[name])
        .find((value) => !looksLikePlaceholder(value));

    if (!key) {
        throw new Error('GEMINI_API_KEY is missing. Set GEMINI_API_KEY or GEMINI_API_KEY_1 in .env.local before running retrieval validation.');
    }

    return key;
}

function buildDbUrl(raw) {
    let url;
    try {
        url = new URL(raw);
    } catch {
        throw new Error('DATABASE_URL is not a valid postgres URL. Use the real Supabase connection string, not a redacted or placeholder value.');
    }

    if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
        throw new Error('DATABASE_URL must start with postgres:// or postgresql://.');
    }

    if (url.hostname.endsWith('.pooler.supabase.com')) {
        if (url.port === '5432') url.port = '6543';
        url.searchParams.set('pgbouncer', 'true');
    }

    return url.toString();
}

loadEnv();

const dbUrl = buildDbUrl(requireEnv('DATABASE_URL'));
const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false }, family: 4 });

// ─── Embedding helper ─────────────────────────────────────────────────────────

async function getEmbedding(text) {
    const apiKey = getGeminiApiKey();
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: `models/${EMBED_MODEL}`, content: { parts: [{ text }] } }),
        }
    );
    if (!res.ok) {
        let errorMsg = `Embedding API error: ${res.status}`;
        try {
            const errData = await res.json();
            if (errData.error && errData.error.message) {
                errorMsg += ` - ${errData.error.message}`;
            }
        } catch (e) {}
        throw new Error(errorMsg);
    }
    const data = await res.json();
    const values = data.embedding.values;
    if (!Array.isArray(values) || values.length !== EMBED_DIMS) {
        throw new Error(`Unexpected embedding dimension: expected ${EMBED_DIMS}, got ${values?.length || 0}`);
    }
    return values;
}

// ─── Retrieval ────────────────────────────────────────────────────────────────

async function retrieveTopChunk(queryEmbedding, subject) {
    const vector = `[${queryEmbedding.join(',')}]`;
    const result = await pool.query(
        `SELECT chapter_title, chunk_index, book_code, substring(chunk_text from 1 for 180) AS content_preview,
                (embedding <=> $1::vector) AS distance
         FROM ncert_embeddings
         WHERE subject = $2
           AND is_current_syllabus = TRUE
           AND deleted_from_current_syllabus = FALSE
           AND corpus_status = 'active'
         ORDER BY embedding <=> $1::vector
         LIMIT 1`,
        [vector, subject]
    );
    return result.rows[0] || null;
}

// ─── Summary Stats ────────────────────────────────────────────────────────────

async function getCorpusStats(subject) {
    const res = await pool.query(
        `SELECT chapter_title, book_code, COUNT(*) as chunk_count
         FROM ncert_embeddings
         WHERE subject = $1
           AND is_current_syllabus = TRUE
           AND deleted_from_current_syllabus = FALSE
           AND corpus_status = 'active'
         GROUP BY chapter_title, book_code
         ORDER BY book_code, chapter_title`,
        [subject]
    );
    return res.rows;
}

async function validateCorpusGovernance(subject) {
    const requiredColumns = [
        'syllabus_version',
        'ncert_edition',
        'is_current_syllabus',
        'deleted_from_current_syllabus',
        'corpus_status',
        'source_checksum',
    ];
    const columnRes = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'ncert_embeddings'
          AND column_name = ANY($1::text[])
    `, [requiredColumns]);
    const found = new Set(columnRes.rows.map(row => row.column_name));
    const missing = requiredColumns.filter(col => !found.has(col));
    if (missing.length > 0) {
        throw new Error(`RAG governance columns missing: ${missing.join(', ')}`);
    }

    const staleRes = await pool.query(`
        SELECT COUNT(*)::int AS count
        FROM ncert_embeddings
        WHERE subject = $1
          AND (is_current_syllabus = FALSE OR deleted_from_current_syllabus = TRUE OR corpus_status <> 'active')
    `, [subject]);

    const dimRes = await pool.query(`
        SELECT COUNT(*)::int AS count
        FROM ncert_embeddings
        WHERE subject = $1
          AND embedding IS NOT NULL
          AND vector_dims(embedding) <> $2
    `, [subject, EMBED_DIMS]);

    return {
        staleRows: staleRes.rows[0].count,
        wrongDimensionRows: dimRes.rows[0].count,
    };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('\n' + '═'.repeat(64));
    console.log(`🔍 RAG RETRIEVAL INTEGRITY VALIDATOR — ${SUBJECT.toUpperCase()}`);
    console.log('═'.repeat(64));

    console.log('\n🛡️  CORPUS GOVERNANCE\n');
    const governance = await validateCorpusGovernance(SUBJECT);
    console.log(`  Active filter excludes stale/deleted rows: ${governance.staleRows} non-active rows found for subject`);
    console.log(`  Embedding dimension mismatches: ${governance.wrongDimensionRows}`);
    if (governance.wrongDimensionRows > 0) {
        console.log('\n  ❌ CORPUS INTEGRITY: CORRUPTED — EMBEDDING DIMENSION MISMATCH\n');
        process.exit(1);
    }

    // 1. Corpus Stats
    console.log('\n📊 CORPUS STATS\n');
    const stats = await getCorpusStats(SUBJECT);
    if (stats.length === 0) {
        console.log('  ⚠️  No embeddings found for subject. Run ingestion first.');
        process.exit(1);
    }
    let totalChunks = 0;
    for (const row of stats) {
        console.log(`  [${row.book_code}] ${row.chapter_title.padEnd(50)} ${row.chunk_count} chunks`);
        totalChunks += parseInt(row.chunk_count);
    }
    console.log(`\n  Total chapters: ${stats.length}   Total chunks: ${totalChunks}`);

    // 2. Semantic Retrieval Tests
    const queries = VALIDATION_QUERIES[SUBJECT];
    if (!queries) {
        console.log(`\n⚠️  No validation queries defined for subject: ${SUBJECT}`);
        process.exit(0);
    }

    console.log('\n\n🧪 SEMANTIC RETRIEVAL TESTS\n');

    let passed = 0, failed = 0, warned = 0;
    const failures = [];

    for (const test of queries) {
        process.stdout.write(`  Query: "${test.query.substring(0, 55)}..."\n`);
        try {
            const embedding = await getEmbedding(test.query);
            const chunk = await retrieveTopChunk(embedding, SUBJECT);

            if (!chunk) {
                console.log(`    ❌ FAIL — No chunk returned\n`);
                failed++;
                failures.push({ query: test.query, reason: 'No chunk returned' });
                continue;
            }

            const retrieved = chunk.chapter_title;
            const distance = parseFloat(chunk.distance).toFixed(4);
            const isExpected = retrieved.toLowerCase().includes(test.expectedChapter.toLowerCase().substring(0, Math.max(20, test.expectedChapter.length)));
            const isForbidden = test.forbiddenChapter &&
                retrieved.toLowerCase().includes(test.forbiddenChapter.toLowerCase().substring(0, Math.max(20, test.forbiddenChapter.length)));

            if (isForbidden) {
                console.log(`    ❌ CORRUPTION DETECTED — Got: "${retrieved}" (forbidden: "${test.forbiddenChapter}") distance=${distance}\n`);
                failed++;
                failures.push({ query: test.query, reason: `Forbidden chapter "${test.forbiddenChapter}" returned`, got: retrieved });
            } else if (isExpected) {
                console.log(`    ✅ PASS — "${retrieved}" distance=${distance}\n`);
                passed++;
            } else {
                console.log(`    ⚠️  WARN — Expected "${test.expectedChapter}", got "${retrieved}" distance=${distance}\n`);
                warned++;
            }

            // Rate limit buffer
            await new Promise(r => setTimeout(r, 500));
        } catch (e) {
            console.log(`    ❌ ERROR — ${e.message}\n`);
            failed++;
            failures.push({ query: test.query, reason: e.message });
        }
    }

    // 3. Final Report
    console.log('═'.repeat(64));
    console.log('📋 VALIDATION REPORT');
    console.log('═'.repeat(64));
    console.log(`  ✅ Passed:  ${passed}`);
    console.log(`  ⚠️  Warned:  ${warned}`);
    console.log(`  ❌ Failed:  ${failed}`);
    console.log(`  Total:    ${queries.length}`);

    if (failures.length > 0) {
        console.log('\n  FAILURES:');
        failures.forEach(f => console.log(`    • "${f.query.substring(0, 50)}" → ${f.reason}`));
    }

    const verdict = failed === 0 ? '✅ CORPUS INTEGRITY: CLEAN' : '❌ CORPUS INTEGRITY: CORRUPTED — DO NOT USE IN PRODUCTION';
    console.log(`\n  ${verdict}`);
    console.log('═'.repeat(64) + '\n');

    await pool.end();
    process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
