-- Evidence tables for scale expansion certification.
-- These tables do not replace Sentry/Vercel/Supabase dashboards; they store the
-- summarized proof needed for MD approval before each traffic ramp.

CREATE TABLE IF NOT EXISTS operational_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'mitigated', 'resolved')),
    title TEXT NOT NULL,
    root_cause TEXT,
    mitigation TEXT,
    prevention_item TEXT,
    evidence_url TEXT,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_operational_incidents_severity
    ON operational_incidents (severity, status, opened_at);

CREATE TABLE IF NOT EXISTS uptime_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('up', 'down', 'degraded')),
    latency_ms INT,
    status_code INT,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_uptime_checks_service_time
    ON uptime_checks (service, checked_at DESC);

CREATE TABLE IF NOT EXISTS infra_usage_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL CHECK (provider IN ('gemini', 'supabase', 'vercel', 'redis', 'cashfree')),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_infra_usage_provider_metric_time
    ON infra_usage_snapshots (provider, metric_name, captured_at DESC);

CREATE TABLE IF NOT EXISTS educational_quality_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_type TEXT NOT NULL CHECK (audit_type IN ('rag_retrieval', 'teacher_review', 'model_benchmark', 'question_bank')),
    subject TEXT,
    sample_size INT DEFAULT 0,
    pass_count INT DEFAULT 0,
    warn_count INT DEFAULT 0,
    fail_count INT DEFAULT 0,
    hallucination_count INT DEFAULT 0,
    syllabus_leakage_count INT DEFAULT 0,
    wrong_answer_count INT DEFAULT 0,
    evidence JSONB DEFAULT '{}'::jsonb,
    audited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_educational_quality_audits_type_time
    ON educational_quality_audits (audit_type, audited_at DESC);

CREATE TABLE IF NOT EXISTS scale_certification_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    window_days INT NOT NULL,
    verdict TEXT NOT NULL CHECK (verdict IN ('passed', 'failed')),
    summary JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
