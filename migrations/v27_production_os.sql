-- Wave 6: Production Operating System — Runtime Survivability + Security Foundations

-- ============================================================
-- 1. Server-Authoritative Test Timer
-- ============================================================
ALTER TABLE tests ADD COLUMN IF NOT EXISTS grace_window_seconds INT DEFAULT 30;

-- ============================================================
-- 2. Test Session Recovery Tracking (test_attempts = active session table)
-- ============================================================
ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS last_snapshot_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS recovery_count INT DEFAULT 0;
ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS session_status TEXT DEFAULT 'active';
-- session_status: 'active', 'suspended', 'interrupted', 'completed', 'corrupted'

-- ============================================================
-- 3. Nonce Table (Replay Attack Prevention)
-- ============================================================
CREATE TABLE IF NOT EXISTS used_nonces (
    nonce TEXT PRIMARY KEY,
    user_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 minutes')
);
CREATE INDEX IF NOT EXISTS idx_nonces_expires ON used_nonces(expires_at);

-- ============================================================
-- 4. Device Profiles (Soft Fingerprinting)
-- ============================================================
CREATE TABLE IF NOT EXISTS device_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES users(id),
    device_hash TEXT NOT NULL,
    app_version TEXT,
    install_id TEXT,
    webview_version TEXT,
    platform TEXT,
    screen_resolution TEXT,
    timezone TEXT,
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, device_hash)
);

-- ============================================================
-- 5. Fraud Signals (Behavior-Based Anomaly Detection)
-- ============================================================
CREATE TABLE IF NOT EXISTS fraud_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES users(id),
    signal_type TEXT NOT NULL,
    -- 'impossible_speed', 'synchronized_submit', 'xp_farming_loop',
    -- 'automation_timing', 'loop_exploit', 'offline_tamper'
    severity TEXT DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    evidence JSONB,
    reviewed_by TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    action_taken TEXT DEFAULT 'none',
    -- 'none', 'shadow_flagged', 'restricted', 'escalated', 'cleared'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_user ON fraud_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_type ON fraud_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_severity ON fraud_signals(severity, created_at);

-- ============================================================
-- 6. Remote Feature Flags
-- ============================================================
CREATE TABLE IF NOT EXISTS feature_flags (
    key TEXT PRIMARY KEY,
    enabled BOOLEAN DEFAULT true,
    rollout_pct INT DEFAULT 100, -- 0-100, for staged rollouts
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default flags
INSERT INTO feature_flags (key, enabled, rollout_pct, description) VALUES
    ('ff_adaptive_engine',    true,  100, 'Adaptive question recommendation engine'),
    ('ff_omr_enabled',        true,  100, 'OMR sheet grading pipeline'),
    ('ff_notifications',      true,  100, 'Push notification delivery'),
    ('ff_battleground',       true,  100, 'Real-time multiplayer battleground'),
    ('ff_ai_explanations',    true,  100, 'AI-generated question explanations'),
    ('ff_parent_reports',     true,  100, 'Weekly parent progress reports'),
    ('ff_fraud_signals',      true,  100, 'Behavior-based fraud detection')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 7. Teacher Review Queue (Human Academic Governance)
-- ============================================================
CREATE TABLE IF NOT EXISTS teacher_review_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id INT REFERENCES questions(id),
    trigger_type TEXT NOT NULL,
    -- 'auto_sample', 'high_report_count', 'quarantine_escalation', 'manual'
    report_count INT DEFAULT 0,
    reviewer_id TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'in_review', 'resolved'
    verdict TEXT, -- 'correct_as_is', 'needs_correction', 'remove'
    reviewer_notes TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_review_queue_status ON teacher_review_queue(status, created_at);
