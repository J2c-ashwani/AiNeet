#!/usr/bin/env node
/**
 * scripts/apply-rag-migration.cjs
 * Runs NCERT RAG enterprise schema via Supabase pgbouncer (IPv4 forced).
 */
require('dotenv').config({ path: '.env.local' });
const pg = require('pg');

const CONN = process.env.DATABASE_URL.replace(':5432/', ':6543/') + '?pgbouncer=true';
const pool = new pg.Pool({ connectionString: CONN, ssl: { rejectUnauthorized: false }, family: 4, max: 2 });

const STEPS = [
  ['Enable vector extension',    `CREATE EXTENSION IF NOT EXISTS vector`],
  ['Enable pg_trgm extension',   `CREATE EXTENSION IF NOT EXISTS pg_trgm`],
  ['Create ncert_embeddings', `
    CREATE TABLE IF NOT EXISTS ncert_embeddings (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      subject          TEXT NOT NULL CHECK (subject IN ('physics','chemistry','biology')),
      class_level      INT  NOT NULL CHECK (class_level IN (11,12)),
      book_code        TEXT NOT NULL,
      chapter_number   INT  NOT NULL,
      chapter_title    TEXT NOT NULL,
      topic_slug       TEXT,
      concept_tags     TEXT[] DEFAULT '{}',
      ncert_keywords   TEXT[] DEFAULT '{}',
      board_classification TEXT DEFAULT 'NEET',
      difficulty_hint  TEXT DEFAULT 'medium' CHECK (difficulty_hint IN ('easy','medium','hard')),
      chunk_index      INT  NOT NULL,
      chunk_text       TEXT NOT NULL,
      chunk_word_count INT,
      source_url       TEXT NOT NULL,
      page_number      INT,
      embedding        vector(768),
      fts_document     tsvector,
      embedding_model  TEXT DEFAULT 'text-embedding-004',
      chunking_version TEXT DEFAULT 'v1.0',
      pipeline_version TEXT DEFAULT 'v1.0',
      created_at       TIMESTAMPTZ DEFAULT NOW(),
      updated_at       TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (book_code, chapter_number, chunk_index)
    )`],
  ['Create rag_explanations', `
    CREATE TABLE IF NOT EXISTS rag_explanations (
      id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      question_id            INT  NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      explanation_text       TEXT NOT NULL,
      confidence_score       FLOAT NOT NULL DEFAULT 0,
      source_chunk_ids       UUID[] NOT NULL DEFAULT '{}',
      ncert_chapter          TEXT,
      ncert_topic            TEXT,
      top_similarity         FLOAT,
      passed_confidence_gate BOOLEAN DEFAULT FALSE,
      grounding_mode         TEXT DEFAULT 'strict' CHECK (grounding_mode IN ('strict','fallback','insufficient')),
      prompt_version         TEXT DEFAULT 'v1.0',
      retrieval_version      TEXT DEFAULT 'v1.0',
      generation_model       TEXT DEFAULT 'gemini-1.5-flash',
      embedding_model        TEXT DEFAULT 'text-embedding-004',
      sampled_for_review     BOOLEAN DEFAULT FALSE,
      review_status          TEXT DEFAULT 'pending' CHECK (review_status IN ('pending','approved','rejected','skipped')),
      reviewed_by            TEXT,
      reviewed_at            TIMESTAMPTZ,
      reviewer_notes         TEXT,
      created_at             TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (question_id)
    )`],
  ['Create rag_teacher_review_queue', `
    CREATE TABLE IF NOT EXISTS rag_teacher_review_queue (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      explanation_id UUID NOT NULL REFERENCES rag_explanations(id) ON DELETE CASCADE,
      question_id    INT  NOT NULL,
      sampled_at     TIMESTAMPTZ DEFAULT NOW(),
      sample_reason  TEXT DEFAULT 'daily_random',
      priority       INT DEFAULT 2,
      status         TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_review','approved','rejected')),
      assigned_to    TEXT,
      completed_at   TIMESTAMPTZ,
      UNIQUE (explanation_id)
    )`],
  ['Index: subject',         `CREATE INDEX IF NOT EXISTS idx_ncert_subject ON ncert_embeddings (subject)`],
  ['Index: chapter',         `CREATE INDEX IF NOT EXISTS idx_ncert_chapter ON ncert_embeddings (subject, class_level, chapter_number)`],
  ['Index: topic',           `CREATE INDEX IF NOT EXISTS idx_ncert_topic   ON ncert_embeddings (topic_slug)`],
  ['Index: concept_tags GIN',`CREATE INDEX IF NOT EXISTS idx_ncert_tags ON ncert_embeddings USING GIN (concept_tags)`],
  ['Index: FTS GIN',         `CREATE INDEX IF NOT EXISTS idx_ncert_fts  ON ncert_embeddings USING GIN (fts_document)`],
  ['Index: IVFFlat vector',  `CREATE INDEX IF NOT EXISTS idx_ncert_vec  ON ncert_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)`],
  ['Index: rag question',    `CREATE INDEX IF NOT EXISTS idx_rag_question ON rag_explanations (question_id)`],
  ['Index: rag review queue',`CREATE INDEX IF NOT EXISTS idx_rag_review   ON rag_explanations (sampled_for_review, review_status) WHERE sampled_for_review = TRUE`],
  ['Function: hybrid_ncert_search', `
    CREATE OR REPLACE FUNCTION hybrid_ncert_search(
      query_embedding vector(768), query_text TEXT,
      filter_subject TEXT DEFAULT NULL, filter_chapter INT DEFAULT NULL,
      filter_class INT DEFAULT NULL, top_k INT DEFAULT 5,
      vector_weight FLOAT DEFAULT 0.7, bm25_weight FLOAT DEFAULT 0.3
    )
    RETURNS TABLE (
      id UUID, chunk_text TEXT, chapter_title TEXT, topic_slug TEXT,
      ncert_keywords TEXT[], concept_tags TEXT[], source_url TEXT,
      page_number INT, vector_score FLOAT, bm25_score FLOAT, hybrid_score FLOAT
    )
    LANGUAGE SQL STABLE AS $func$
      WITH vr AS (
        SELECT e.id, e.chunk_text, e.chapter_title, e.topic_slug, e.ncert_keywords,
               e.concept_tags, e.source_url, e.page_number,
               1 - (e.embedding <=> query_embedding) AS vscore
        FROM ncert_embeddings e
        WHERE (filter_subject IS NULL OR e.subject = filter_subject)
          AND (filter_chapter IS NULL OR e.chapter_number = filter_chapter)
          AND (filter_class IS NULL OR e.class_level = filter_class)
          AND e.embedding IS NOT NULL
        ORDER BY e.embedding <=> query_embedding LIMIT top_k * 3
      ),
      br AS (
        SELECT e.id, ts_rank_cd(e.fts_document, plainto_tsquery('english', query_text)) AS bscore
        FROM ncert_embeddings e
        WHERE (filter_subject IS NULL OR e.subject = filter_subject)
          AND e.fts_document @@ plainto_tsquery('english', query_text)
        ORDER BY bscore DESC LIMIT top_k * 3
      )
      SELECT vr.id, vr.chunk_text, vr.chapter_title, vr.topic_slug, vr.ncert_keywords, vr.concept_tags,
             vr.source_url, vr.page_number, vr.vscore, COALESCE(br.bscore,0),
             (vr.vscore * vector_weight) + (COALESCE(br.bscore,0) * bm25_weight)
      FROM vr LEFT JOIN br ON br.id = vr.id
      ORDER BY (vr.vscore * vector_weight) + (COALESCE(br.bscore,0) * bm25_weight) DESC
      LIMIT top_k
    $func$`],
  ['Verify tables', `
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND table_name IN ('ncert_embeddings','rag_explanations','rag_teacher_review_queue')
    ORDER BY table_name`],
];

async function main() {
  console.log('\n🚀 NCERT RAG Enterprise Schema Migration');
  console.log('   Connection: Supabase PgBouncer (IPv4)\n');

  let passed = 0, failed = 0;
  for (const [label, sql] of STEPS) {
    try {
      const res = await pool.query(sql.trim());
      if (res.rows?.length > 0) {
        console.log(`  ✓ ${label} → [${res.rows.map(r => Object.values(r)[0]).join(', ')}]`);
      } else {
        console.log(`  ✓ ${label}`);
      }
      passed++;
    } catch(e) {
      if (e.message.includes('already exists')) {
        console.log(`  ⚠ ${label} (already exists — skipping)`);
        passed++;
      } else {
        console.log(`  ✗ ${label}`);
        console.log(`    → ${e.message.substring(0, 200)}`);
        failed++;
      }
    }
  }

  await pool.end();
  console.log('\n' + '═'.repeat(50));
  console.log(`  PASSED: ${passed}  FAILED: ${failed}`);
  if (failed === 0) {
    console.log('  🟢 All enterprise RAG tables deployed!\n');
  } else {
    console.log('  🔴 Some steps failed — review above\n');
    process.exit(1);
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
