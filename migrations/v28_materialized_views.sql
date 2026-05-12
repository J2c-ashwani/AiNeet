-- Wave 6 (Final): Materialized Views, Job Queue, Query Hardening

-- ============================================================
-- 1. Job Queue Table
-- ============================================================
CREATE TABLE IF NOT EXISTS job_queue (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type        TEXT NOT NULL,
    payload         JSONB NOT NULL DEFAULT '{}',
    status          TEXT NOT NULL DEFAULT 'pending',
    -- pending | running | completed | dead | cancelled
    priority        INT DEFAULT 0,
    retries         INT DEFAULT 0,
    max_retries     INT DEFAULT 3,
    idempotency_key TEXT UNIQUE,
    run_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at      TIMESTAMP WITH TIME ZONE,
    completed_at    TIMESTAMP WITH TIME ZONE,
    dead_at         TIMESTAMP WITH TIME ZONE,
    duration_ms     INT,
    result          JSONB,
    last_error      TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_job_queue_claim
    ON job_queue(job_type, status, run_at)
    WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_job_queue_dead ON job_queue(job_type, dead_at) WHERE status = 'dead';

-- ============================================================
-- 2. Leaderboard Materialized Snapshot
-- (Refreshed every 5 minutes by a worker — not on every read)
-- ============================================================
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rank_type    TEXT NOT NULL, -- 'global', 'weekly', 'subject'
    subject      TEXT,
    user_id      TEXT REFERENCES users(id),
    rank         INT NOT NULL,
    score        NUMERIC NOT NULL,
    display_name TEXT,
    avatar_url   TEXT,
    snapshot_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lb_snapshot_type ON leaderboard_snapshots(rank_type, rank);
CREATE INDEX IF NOT EXISTS idx_lb_snapshot_user ON leaderboard_snapshots(user_id);

-- ============================================================
-- 3. Analytics Aggregates (pre-computed, not live-recalculated)
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       TEXT REFERENCES users(id),
    snapshot_date DATE NOT NULL,
    total_xp      INT DEFAULT 0,
    tests_taken   INT DEFAULT 0,
    avg_accuracy  NUMERIC,
    weak_subjects JSONB,
    strong_subjects JSONB,
    study_streak  INT DEFAULT 0,
    computed_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, snapshot_date)
);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshot_user ON analytics_snapshots(user_id, snapshot_date);

-- ============================================================
-- 4. Missing index: test_answers.test_id (flagged in audit)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_test_answers_test_id ON test_answers(test_id);

-- ============================================================
-- 5. Slow Query Log Table
-- ============================================================
CREATE TABLE IF NOT EXISTS slow_query_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_hash  TEXT,
    duration_ms INT NOT NULL,
    query_hint  TEXT, -- sanitized hint (no user data)
    logged_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_slow_query_time ON slow_query_log(duration_ms DESC, logged_at);
