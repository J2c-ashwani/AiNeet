-- ═══════════════════════════════════════════════════════════════
-- NCERT Academic Intelligence Infrastructure — Enterprise Migration
-- MD-Approved Architecture (10 Modifications)
-- Run once on your Supabase DB via psql or SQL editor
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─────────────────────────────────────────────────────────────────
-- TABLE: ncert_embeddings
-- Core vector store with structured curriculum intelligence
-- (MD Mod 1: structured fields, MD Mod 2: word-count constraint)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ncert_embeddings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Deterministic Curriculum Metadata (MD Mod 1 & 3)
    subject             TEXT NOT NULL CHECK (subject IN ('physics', 'chemistry', 'biology')),
    class_level         INT  NOT NULL CHECK (class_level IN (11, 12)),
    book_code           TEXT NOT NULL,
    chapter_number      INT  NOT NULL,
    chapter_title       TEXT NOT NULL,
    topic_slug          TEXT,
    concept_tags        TEXT[] DEFAULT '{}',
    ncert_keywords      TEXT[] DEFAULT '{}',
    board_classification TEXT DEFAULT 'NEET',
    difficulty_hint     TEXT DEFAULT 'medium' CHECK (difficulty_hint IN ('easy', 'medium', 'hard')),
    syllabus_version    TEXT NOT NULL DEFAULT 'neet-current',
    ncert_edition       TEXT NOT NULL DEFAULT 'current',
    ingestion_batch_id  UUID,
    source_checksum     TEXT,
    is_current_syllabus BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_from_current_syllabus BOOLEAN NOT NULL DEFAULT FALSE,
    corpus_status       TEXT NOT NULL DEFAULT 'active'
        CHECK (corpus_status IN ('active', 'staged', 'deprecated', 'quarantined')),

    -- Chunk Content (MD Mod 2: target 220-350 words)
    chunk_index         INT  NOT NULL,
    chunk_text          TEXT NOT NULL,
    chunk_word_count    INT,
    source_url          TEXT NOT NULL,
    page_number         INT,

    -- Vector — Google gemini-embedding-001 (3072 dims)
    embedding           vector(3072),

    -- BM25 full-text search (MD Mod 9: Hybrid retrieval)
    fts_document        tsvector,

    -- Versioning (MD Mod 8)
    embedding_model     TEXT DEFAULT 'gemini-embedding-001',
    chunking_version    TEXT DEFAULT 'v1.0',
    pipeline_version    TEXT DEFAULT 'v1.0',

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (book_code, chapter_number, chunk_index)
);

-- ─────────────────────────────────────────────────────────────────
-- INDICES: Hybrid Retrieval
-- ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ncert_embedding_vector
    ON ncert_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_ncert_fts ON ncert_embeddings USING GIN (fts_document);
CREATE INDEX IF NOT EXISTS idx_ncert_subject ON ncert_embeddings (subject);
CREATE INDEX IF NOT EXISTS idx_ncert_chapter ON ncert_embeddings (subject, class_level, chapter_number);
CREATE INDEX IF NOT EXISTS idx_ncert_topic   ON ncert_embeddings (topic_slug);
CREATE INDEX IF NOT EXISTS idx_ncert_tags    ON ncert_embeddings USING GIN (concept_tags);
CREATE INDEX IF NOT EXISTS idx_ncert_active_syllabus
    ON ncert_embeddings (subject, class_level, chapter_number, syllabus_version)
    WHERE is_current_syllabus = TRUE
      AND deleted_from_current_syllabus = FALSE
      AND corpus_status = 'active';

-- ─────────────────────────────────────────────────────────────────
-- TABLE: rag_explanations
-- Citation persistence + confidence scoring (MD Mod 4 & 6 & 8)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rag_explanations (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id             INT  NOT NULL REFERENCES questions(id) ON DELETE CASCADE,

    explanation_text        TEXT NOT NULL,
    confidence_score        FLOAT NOT NULL DEFAULT 0,

    -- Citation Persistence (MD Mod 4)
    source_chunk_ids        UUID[] NOT NULL DEFAULT '{}',
    ncert_chapter           TEXT,
    ncert_topic             TEXT,
    top_similarity          FLOAT,

    -- Confidence Gate (MD Mod 6: threshold 0.72)
    passed_confidence_gate  BOOLEAN DEFAULT FALSE,
    grounding_mode          TEXT DEFAULT 'strict'
        CHECK (grounding_mode IN ('strict', 'fallback', 'insufficient')),

    -- Versioning (MD Mod 8)
    prompt_version          TEXT DEFAULT 'v1.0',
    retrieval_version       TEXT DEFAULT 'v1.0',
    generation_model        TEXT DEFAULT 'gemini-1.5-flash',
    embedding_model         TEXT DEFAULT 'gemini-embedding-001',
    drift_score             FLOAT,
    comprehension_score     FLOAT,

    -- Teacher Review Sampling (MD Mod 5)
    sampled_for_review      BOOLEAN DEFAULT FALSE,
    review_status           TEXT DEFAULT 'pending'
        CHECK (review_status IN ('pending', 'approved', 'rejected', 'skipped')),
    reviewed_by             TEXT,
    reviewed_at             TIMESTAMPTZ,
    reviewer_notes          TEXT,

    created_at              TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (question_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rag_question_unique ON rag_explanations (question_id);
CREATE INDEX IF NOT EXISTS idx_rag_review_queue ON rag_explanations (sampled_for_review, review_status)
    WHERE sampled_for_review = TRUE;
CREATE INDEX IF NOT EXISTS idx_rag_confidence   ON rag_explanations (confidence_score);

-- ─────────────────────────────────────────────────────────────────
-- TABLE: rag_teacher_review_queue (MD Mod 5)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rag_teacher_review_queue (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    explanation_id  UUID NOT NULL REFERENCES rag_explanations(id) ON DELETE CASCADE,
    question_id     INT  NOT NULL,
    sampled_at      TIMESTAMPTZ DEFAULT NOW(),
    sample_reason   TEXT DEFAULT 'daily_random',
    priority        INT  DEFAULT 2,
    status          TEXT DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
    assigned_to     TEXT,
    completed_at    TIMESTAMPTZ,
    UNIQUE (explanation_id)
);

-- ─────────────────────────────────────────────────────────────────
-- FUNCTION: hybrid_ncert_search
-- BM25 + Vector combined ranking (MD Mod 9)
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION hybrid_ncert_search(
    query_embedding  vector(3072),
    query_text       TEXT,
    filter_subject   TEXT    DEFAULT NULL,
    filter_chapter   INT     DEFAULT NULL,
    filter_class     INT     DEFAULT NULL,
    top_k            INT     DEFAULT 5,
    vector_weight    FLOAT   DEFAULT 0.7,
    bm25_weight      FLOAT   DEFAULT 0.3
)
RETURNS TABLE (
    id              UUID,
    chunk_text      TEXT,
    chapter_title   TEXT,
    topic_slug      TEXT,
    ncert_keywords  TEXT[],
    concept_tags    TEXT[],
    source_url      TEXT,
    page_number     INT,
    vector_score    FLOAT,
    bm25_score      FLOAT,
    hybrid_score    FLOAT
)
LANGUAGE SQL STABLE AS $$
    WITH vector_results AS (
        SELECT
            e.id, e.chunk_text, e.chapter_title, e.topic_slug,
            e.ncert_keywords, e.concept_tags, e.source_url, e.page_number,
            1 - (e.embedding <=> query_embedding) AS vscore
        FROM ncert_embeddings e
        WHERE
            (filter_subject IS NULL OR e.subject = filter_subject) AND
            (filter_chapter IS NULL OR e.chapter_number = filter_chapter) AND
            (filter_class   IS NULL OR e.class_level = filter_class) AND
            e.is_current_syllabus = TRUE AND
            e.deleted_from_current_syllabus = FALSE AND
            e.corpus_status = 'active' AND
            e.embedding IS NOT NULL
        ORDER BY e.embedding <=> query_embedding
        LIMIT top_k * 3
    ),
    bm25_results AS (
        SELECT
            e.id,
            ts_rank_cd(e.fts_document, plainto_tsquery('english', query_text)) AS bscore
        FROM ncert_embeddings e
        WHERE
            (filter_subject IS NULL OR e.subject = filter_subject) AND
            e.is_current_syllabus = TRUE AND
            e.deleted_from_current_syllabus = FALSE AND
            e.corpus_status = 'active' AND
            e.fts_document @@ plainto_tsquery('english', query_text)
        ORDER BY bscore DESC
        LIMIT top_k * 3
    )
    SELECT
        v.id, v.chunk_text, v.chapter_title, v.topic_slug,
        v.ncert_keywords, v.concept_tags, v.source_url, v.page_number,
        v.vscore                                           AS vector_score,
        COALESCE(b.bscore, 0)                             AS bm25_score,
        (v.vscore * vector_weight) + (COALESCE(b.bscore, 0) * bm25_weight) AS hybrid_score
    FROM vector_results v
    LEFT JOIN bm25_results b ON b.id = v.id
    ORDER BY hybrid_score DESC
    LIMIT top_k;
$$;

-- ─────────────────────────────────────────────────────────────────
-- FUNCTION: sample_explanations_for_review (MD Mod 5 — 2-5% daily)
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sample_explanations_for_review(
    sample_pct FLOAT DEFAULT 0.03
)
RETURNS INT LANGUAGE PLPGSQL AS $$
DECLARE inserted INT;
BEGIN
    WITH eligible AS (
        SELECT id, question_id FROM rag_explanations
        WHERE created_at >= NOW() - INTERVAL '24 hours'
          AND sampled_for_review = FALSE
          AND passed_confidence_gate = TRUE
        ORDER BY RANDOM()
        LIMIT GREATEST(2, (
            SELECT CEIL(COUNT(*) * sample_pct) FROM rag_explanations
            WHERE created_at >= NOW() - INTERVAL '24 hours'
        ))
    ),
    upd AS (
        UPDATE rag_explanations SET sampled_for_review = TRUE
        WHERE id IN (SELECT id FROM eligible)
        RETURNING id, question_id
    )
    INSERT INTO rag_teacher_review_queue (explanation_id, question_id, sample_reason)
    SELECT id, question_id, 'daily_random' FROM upd;

    GET DIAGNOSTICS inserted = ROW_COUNT;

    -- Always enqueue low-confidence as priority 1
    INSERT INTO rag_teacher_review_queue (explanation_id, question_id, sample_reason, priority)
    SELECT e.id, e.question_id, 'low_confidence', 1
    FROM rag_explanations e
    WHERE e.confidence_score < 0.72
      AND e.sampled_for_review = FALSE
      AND e.created_at >= NOW() - INTERVAL '24 hours'
    ON CONFLICT (explanation_id) DO NOTHING;

    UPDATE rag_explanations SET sampled_for_review = TRUE
    WHERE confidence_score < 0.72 AND created_at >= NOW() - INTERVAL '24 hours';

    RETURN inserted;
END;
$$;

-- ─────────────────────────────────────────────────────────────────
-- Trigger: auto-update updated_at
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_ncert_updated_at ON ncert_embeddings;
CREATE TRIGGER trg_ncert_updated_at
BEFORE UPDATE ON ncert_embeddings
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

SELECT 'NCERT RAG Enterprise Schema v1.0 deployed.' AS status;
