-- Enterprise launch controls for public rollout.
-- Safe to run repeatedly. Existing enabled/disabled decisions are preserved.

CREATE TABLE IF NOT EXISTS feature_flags (
    key TEXT PRIMARY KEY,
    enabled BOOLEAN DEFAULT true,
    rollout_pct INT DEFAULT 100,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO feature_flags (key, enabled, rollout_pct, description) VALUES
    ('ff_ai_generation',      true, 100, 'AI question generation and doubt-solving kill switch'),
    ('ff_rag_explanations',   true, 100, 'NCERT RAG explanation and retrieval kill switch'),
    ('ff_omr_enabled',        true, 100, 'OMR scan and grading kill switch'),
    ('ff_battleground',       true, 100, 'Battleground and AI battle kill switch'),
    ('ff_payments',           true, 100, 'Cashfree and Google Play payment kill switch'),
    ('ff_notifications',      true, 100, 'Push notification and report delivery kill switch'),
    ('ff_referrals',          true, 100, 'Referral reward kill switch'),
    ('ff_leaderboard',        true, 100, 'Leaderboard kill switch'),
    ('ff_ai_explanations',    true, 100, 'Legacy AI explanation alias retained for compatibility')
ON CONFLICT (key) DO UPDATE
SET description = EXCLUDED.description,
    updated_at = NOW();
