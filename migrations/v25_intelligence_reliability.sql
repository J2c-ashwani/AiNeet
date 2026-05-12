-- Wave 5: Intelligence Reliability Migrations

-- 1. Question Versioning
CREATE TABLE question_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id INT NOT NULL REFERENCES questions(id),
    version_number INT NOT NULL,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT, -- UUID of admin or 'ai_engine'
    change_reason TEXT
);

CREATE INDEX idx_question_versions_qid ON question_versions(question_id);

-- 2. Syllabus Boundaries
CREATE TABLE syllabus_boundaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id INT NOT NULL REFERENCES chapters(id),
    allowed_topics JSONB,
    banned_keywords JSONB,
    difficulty_ceiling INT DEFAULT 1800,
    source_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chapter_id)
);

-- 3. Recommendation Explainability
CREATE TABLE recommendation_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id),
    action_type TEXT NOT NULL, 
    recommended_topic_id INT REFERENCES topics(id),
    recommended_question_ids INT[],
    user_mastery_snapshot REAL,
    target_difficulty REAL,
    explanation_payload JSONB NOT NULL,
    model_version TEXT,
    engine_version TEXT,
    scoring_weights JSONB,
    mastery_snapshot_checksum TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. AI Cost & Token Observability
CREATE TABLE ai_generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model TEXT NOT NULL,
    tokens_in INT DEFAULT 0,
    tokens_out INT DEFAULT 0,
    latency_ms INT,
    retries INT DEFAULT 0,
    generation_cost REAL DEFAULT 0.0,
    prompt_version TEXT,
    success_status TEXT NOT NULL, -- 'success', 'failed'
    error_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AI Incident Response
CREATE TABLE ai_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_type TEXT NOT NULL, -- 'mass_hallucination', 'calibration_drift', 'duplicate_batch'
    severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    description TEXT,
    affected_entities JSONB, -- list of question IDs, user IDs, etc.
    status TEXT DEFAULT 'open', -- 'open', 'investigating', 'resolved'
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
