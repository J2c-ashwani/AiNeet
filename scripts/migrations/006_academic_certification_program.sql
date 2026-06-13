-- Academic Certification Program evidence schema.
-- Purpose: store reproducible, timestamped academic QA evidence for every
-- certification cycle. These tables are intentionally internal-only: RLS is
-- enabled and no public policies are created.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
    IF to_regclass('public.educational_quality_audits') IS NOT NULL THEN
        ALTER TABLE educational_quality_audits
            DROP CONSTRAINT IF EXISTS educational_quality_audits_audit_type_check;

        ALTER TABLE educational_quality_audits
            ADD CONSTRAINT educational_quality_audits_audit_type_check
            CHECK (audit_type IN (
                'rag_retrieval',
                'teacher_review',
                'model_benchmark',
                'question_bank',
                'syllabus_compliance',
                'question_quality',
                'answer_quality',
                'doubt_solver',
                'mock_test',
                'rag_certification',
                'faculty_review',
                'student_outcome',
                'academic_governance',
                'neet_benchmark',
                'external_board',
                'gold_standard_bank',
                'adversarial_academic',
                'public_certification_report'
            ));
    END IF;
END $$;

DO $$
BEGIN
    IF to_regclass('public.academic_certification_level_results') IS NOT NULL THEN
        ALTER TABLE academic_certification_level_results
            DROP CONSTRAINT IF EXISTS academic_certification_level_results_level_number_check;

        ALTER TABLE academic_certification_level_results
            ADD CONSTRAINT academic_certification_level_results_level_number_check
            CHECK (level_number BETWEEN 1 AND 10);
    END IF;

    IF to_regclass('public.academic_certification_evidence_items') IS NOT NULL THEN
        ALTER TABLE academic_certification_evidence_items
            DROP CONSTRAINT IF EXISTS academic_certification_evidence_items_level_number_check;

        ALTER TABLE academic_certification_evidence_items
            ADD CONSTRAINT academic_certification_evidence_items_level_number_check
            CHECK (level_number BETWEEN 1 AND 10);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS academic_certification_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_code TEXT NOT NULL UNIQUE,
    certification_version TEXT NOT NULL DEFAULT 'academic-cert-v1',
    academic_corpus_version TEXT,
    official_syllabus_version TEXT NOT NULL,
    official_syllabus_source_url TEXT,
    syllabus_source_checksum TEXT,
    status TEXT NOT NULL DEFAULT 'running'
        CHECK (status IN ('running', 'passed', 'failed', 'superseded')),
    final_score NUMERIC(5,2),
    certification_level TEXT
        CHECK (certification_level IN ('none', 'bronze', 'silver', 'gold', 'platinum')),
    verdict TEXT,
    report_path TEXT,
    evidence_hash TEXT,
    generated_by TEXT DEFAULT 'academic-certification-runner',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academic_cert_cycles_status_time
    ON academic_certification_cycles (status, completed_at DESC);

CREATE TABLE IF NOT EXISTS academic_certification_level_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES academic_certification_cycles(id) ON DELETE CASCADE,
    level_number INT NOT NULL CHECK (level_number BETWEEN 1 AND 10),
    level_key TEXT NOT NULL,
    level_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pass', 'fail', 'informational')),
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    weight NUMERIC(5,2) NOT NULL CHECK (weight > 0),
    sample_size INT NOT NULL DEFAULT 0,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    pass_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    findings JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (cycle_id, level_number)
);

CREATE INDEX IF NOT EXISTS idx_academic_cert_level_cycle
    ON academic_certification_level_results (cycle_id, level_number);

CREATE TABLE IF NOT EXISTS academic_certification_evidence_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES academic_certification_cycles(id) ON DELETE CASCADE,
    level_number INT NOT NULL CHECK (level_number BETWEEN 1 AND 10),
    evidence_type TEXT NOT NULL,
    subject TEXT CHECK (subject IS NULL OR subject IN ('physics', 'chemistry', 'biology', 'all')),
    content_type TEXT,
    content_id TEXT,
    source_table TEXT,
    source_id TEXT,
    reviewer_role TEXT,
    evaluator TEXT,
    input_hash TEXT,
    output_hash TEXT,
    status TEXT NOT NULL DEFAULT 'recorded'
        CHECK (status IN ('recorded', 'approved', 'rejected', 'quarantined')),
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    raw_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academic_cert_evidence_cycle_level
    ON academic_certification_evidence_items (cycle_id, level_number, evidence_type);

CREATE TABLE IF NOT EXISTS academic_faculty_review_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES academic_certification_cycles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL CHECK (subject IN ('physics', 'chemistry', 'biology')),
    content_type TEXT NOT NULL CHECK (content_type IN ('question', 'answer', 'doubt_response', 'mock_test', 'rag_chunk')),
    content_id TEXT NOT NULL,
    reviewer_name TEXT NOT NULL,
    reviewer_role TEXT NOT NULL,
    accuracy_score NUMERIC(4,2) CHECK (accuracy_score BETWEEN 1 AND 10),
    relevance_score NUMERIC(4,2) CHECK (relevance_score BETWEEN 1 AND 10),
    difficulty_score NUMERIC(4,2) CHECK (difficulty_score BETWEEN 1 AND 10),
    exam_usefulness_score NUMERIC(4,2) CHECK (exam_usefulness_score BETWEEN 1 AND 10),
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academic_faculty_review_cycle_subject
    ON academic_faculty_review_items (cycle_id, subject, approved);

CREATE TABLE IF NOT EXISTS academic_student_outcome_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES academic_certification_cycles(id) ON DELETE CASCADE,
    cohort_name TEXT NOT NULL,
    sample_size INT NOT NULL CHECK (sample_size >= 0),
    diagnostic_avg NUMERIC(6,2),
    followup_avg NUMERIC(6,2),
    accuracy_improvement_pct NUMERIC(6,2),
    weak_topic_recovery_pct NUMERIC(6,2),
    time_efficiency_improvement_pct NUMERIC(6,2),
    retention_pct NUMERIC(6,2),
    completion_rate_pct NUMERIC(6,2),
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academic_outcomes_cycle
    ON academic_student_outcome_snapshots (cycle_id, cohort_name);

CREATE TABLE IF NOT EXISTS academic_external_review_board_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    subject TEXT NOT NULL CHECK (subject IN ('physics', 'chemistry', 'biology')),
    affiliation TEXT,
    years_neet_experience INT CHECK (years_neet_experience IS NULL OR years_neet_experience >= 0),
    credential_summary TEXT,
    independence_attestation BOOLEAN NOT NULL DEFAULT FALSE,
    conflict_of_interest_statement TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    onboarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academic_external_board_subject
    ON academic_external_review_board_members (subject, active);

CREATE TABLE IF NOT EXISTS academic_external_review_signoffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES academic_certification_cycles(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES academic_external_review_board_members(id),
    reviewer_name TEXT NOT NULL,
    subject TEXT NOT NULL CHECK (subject IN ('physics', 'chemistry', 'biology')),
    approval_status TEXT NOT NULL CHECK (approval_status IN ('approved', 'approved_with_observations', 'rejected')),
    reviewed_sample_size INT NOT NULL DEFAULT 0 CHECK (reviewed_sample_size >= 0),
    average_rating NUMERIC(4,2) CHECK (average_rating BETWEEN 1 AND 10),
    signed_report_url TEXT,
    signature_hash TEXT,
    observations TEXT,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academic_external_signoffs_cycle
    ON academic_external_review_signoffs (cycle_id, subject, approval_status);

CREATE TABLE IF NOT EXISTS certified_question_repository (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL CHECK (subject IN ('physics', 'chemistry', 'biology')),
    class_level INT CHECK (class_level IN (11, 12)),
    chapter_title TEXT NOT NULL,
    topic_slug TEXT,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    bloom_level TEXT,
    neet_style_tags TEXT[] NOT NULL DEFAULT '{}',
    source_type TEXT NOT NULL CHECK (source_type IN ('faculty_verified', 'official_pyq', 'ncert_derived', 'benchmark_seed')),
    source_reference TEXT,
    source_checksum TEXT,
    reviewer_name TEXT,
    reviewer_subject TEXT CHECK (reviewer_subject IS NULL OR reviewer_subject IN ('physics', 'chemistry', 'biology')),
    verification_status TEXT NOT NULL DEFAULT 'verified'
        CHECK (verification_status IN ('verified', 'retired', 'quarantined')),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certified_question_repository_subject
    ON certified_question_repository (subject, chapter_title, verification_status);

CREATE TABLE IF NOT EXISTS neet_benchmark_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_year INT NOT NULL,
    paper_type TEXT NOT NULL CHECK (paper_type IN ('neet_official', 'nta_sample', 'official_answer_key')),
    source_url TEXT,
    source_checksum TEXT,
    total_questions INT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (paper_year, paper_type)
);

CREATE TABLE IF NOT EXISTS neet_benchmark_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID NOT NULL REFERENCES neet_benchmark_papers(id) ON DELETE CASCADE,
    question_number INT,
    subject TEXT NOT NULL CHECK (subject IN ('physics', 'chemistry', 'biology')),
    chapter_title TEXT,
    topic_slug TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    bloom_level TEXT,
    style_tags TEXT[] NOT NULL DEFAULT '{}',
    answer_key TEXT CHECK (answer_key IS NULL OR answer_key IN ('A', 'B', 'C', 'D')),
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_neet_benchmark_questions_subject
    ON neet_benchmark_questions (subject, chapter_title, difficulty);

CREATE TABLE IF NOT EXISTS neet_benchmark_certification_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES academic_certification_cycles(id) ON DELETE CASCADE,
    benchmark_window_years INT NOT NULL DEFAULT 10,
    official_paper_count INT NOT NULL DEFAULT 0,
    nta_sample_paper_count INT NOT NULL DEFAULT 0,
    generated_mock_count INT NOT NULL DEFAULT 0,
    pattern_similarity_pct NUMERIC(5,2),
    bloom_similarity_pct NUMERIC(5,2),
    topic_distribution_similarity_pct NUMERIC(5,2),
    difficulty_distribution_similarity_pct NUMERIC(5,2),
    question_style_similarity_pct NUMERIC(5,2),
    alignment_pct NUMERIC(5,2),
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_neet_benchmark_cert_cycle
    ON neet_benchmark_certification_runs (cycle_id, alignment_pct);

CREATE TABLE IF NOT EXISTS academic_adversarial_evaluation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES academic_certification_cycles(id) ON DELETE CASCADE,
    subject TEXT CHECK (subject IS NULL OR subject IN ('physics', 'chemistry', 'biology')),
    scenario_type TEXT NOT NULL CHECK (scenario_type IN (
        'wrong_premise',
        'mixed_concept',
        'misleading_wording',
        'trick_question',
        'ambiguous_question',
        'out_of_syllabus_probe',
        'unsafe_study_advice'
    )),
    prompt_text TEXT NOT NULL,
    expected_behavior TEXT NOT NULL,
    model_response TEXT,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    misconception_detected BOOLEAN,
    false_premise_detected BOOLEAN,
    ambiguity_handled BOOLEAN,
    safety_preserved BOOLEAN,
    evaluator TEXT,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academic_adversarial_cycle
    ON academic_adversarial_evaluation_items (cycle_id, scenario_type, passed);

CREATE TABLE IF NOT EXISTS academic_public_certification_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES academic_certification_cycles(id) ON DELETE CASCADE,
    report_title TEXT NOT NULL,
    public_status TEXT NOT NULL DEFAULT 'draft'
        CHECK (public_status IN ('draft', 'approved_for_sharing', 'published', 'revoked')),
    markdown_path TEXT,
    pdf_path TEXT,
    public_url TEXT,
    evidence_summary_hash TEXT,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academic_public_reports_cycle
    ON academic_public_certification_reports (cycle_id, public_status);

ALTER TABLE academic_certification_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_certification_level_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_certification_evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_faculty_review_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_student_outcome_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_external_review_board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_external_review_signoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE certified_question_repository ENABLE ROW LEVEL SECURITY;
ALTER TABLE neet_benchmark_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE neet_benchmark_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE neet_benchmark_certification_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_adversarial_evaluation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_public_certification_reports ENABLE ROW LEVEL SECURITY;
