-- RAG corpus governance hardening
-- Adds current-syllabus invariants and makes hybrid retrieval ignore stale/deleted chunks.

ALTER TABLE ncert_embeddings
    ADD COLUMN IF NOT EXISTS syllabus_version TEXT NOT NULL DEFAULT 'neet-current',
    ADD COLUMN IF NOT EXISTS ncert_edition TEXT NOT NULL DEFAULT 'current',
    ADD COLUMN IF NOT EXISTS ingestion_batch_id UUID,
    ADD COLUMN IF NOT EXISTS source_checksum TEXT,
    ADD COLUMN IF NOT EXISTS is_current_syllabus BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS deleted_from_current_syllabus BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS corpus_status TEXT NOT NULL DEFAULT 'active';

ALTER TABLE ncert_embeddings
    DROP CONSTRAINT IF EXISTS ncert_embeddings_corpus_status_check;

ALTER TABLE ncert_embeddings
    ADD CONSTRAINT ncert_embeddings_corpus_status_check
    CHECK (corpus_status IN ('active', 'staged', 'deprecated', 'quarantined'));

CREATE INDEX IF NOT EXISTS idx_ncert_active_syllabus
    ON ncert_embeddings (subject, class_level, chapter_number, syllabus_version)
    WHERE is_current_syllabus = TRUE
      AND deleted_from_current_syllabus = FALSE
      AND corpus_status = 'active';

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
