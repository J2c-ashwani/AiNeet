-- Add Consent & Verification Fields to users table
ALTER TABLE users ADD COLUMN parent_email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN parent_phone_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN parent_consent_given_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN parent_consent_version TEXT;

-- Immutable Weekly Snapshots table
CREATE TABLE weekly_parent_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id),
    report_week_start DATE NOT NULL,
    report_week_end DATE NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    snapshot_payload JSONB NOT NULL -- metrics, weak topics, streak, test counts, etc.
);

-- Delivery Telemetry table
CREATE TABLE parent_report_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES weekly_parent_reports(id),
    email_delivery_status TEXT DEFAULT 'pending', -- 'pending', 'delivered', 'failed'
    whatsapp_delivery_status TEXT DEFAULT 'pending',
    push_delivery_status TEXT DEFAULT 'pending',
    retry_count INT DEFAULT 0,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    email_delivered_at TIMESTAMP WITH TIME ZONE,
    whatsapp_delivered_at TIMESTAMP WITH TIME ZONE,
    provider_responses JSONB,
    failure_reasons JSONB
);

-- Cron Observability table
CREATE TABLE cron_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL, -- 'running', 'success', 'failed'
    items_attempted INT DEFAULT 0,
    items_successful INT DEFAULT 0,
    items_failed INT DEFAULT 0,
    total_runtime_ms INT,
    error_payload JSONB
);
