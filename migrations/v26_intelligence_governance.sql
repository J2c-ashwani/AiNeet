-- Wave 5: Intelligence Governance Expansion Migrations

-- 1. Question Lineage and Decay
ALTER TABLE questions ADD COLUMN parent_question_id INT REFERENCES questions(id);
ALTER TABLE questions ADD COLUMN generation_source TEXT; -- 'human', 'ai', 'pyq_import', 'variant_generation'
ALTER TABLE questions ADD COLUMN generation_model TEXT;
ALTER TABLE questions ADD COLUMN prompt_version TEXT;
ALTER TABLE questions ADD COLUMN confidence_last_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE questions ADD COLUMN verification_expiry_at TIMESTAMP WITH TIME ZONE;

-- (The verification_status enum is text, so 'quarantined' is natively supported without altering an ENUM type)

-- 2. Decision Hashing
ALTER TABLE recommendation_explanations ADD COLUMN decision_hash TEXT;

-- 3. Model Benchmarks
CREATE TABLE model_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_version TEXT NOT NULL,
    prompt_version TEXT NOT NULL,
    hallucination_rate REAL,
    duplicate_rate REAL,
    avg_explanation_quality REAL,
    syllabus_violation_rate REAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Rollout Blast-Radius Limiter
CREATE TABLE rollout_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_version TEXT NOT NULL,
    exposure_percentage INT NOT NULL DEFAULT 1,
    anomaly_rate REAL,
    rollback_status TEXT DEFAULT 'active', -- 'active', 'rolled_back', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
