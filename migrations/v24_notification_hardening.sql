-- Notification Hardening Migration

-- 1. Token Decay and Timezone fields on users
ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'Asia/Kolkata';
ALTER TABLE users ADD COLUMN fcm_token_invalidated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN notification_failure_count INT DEFAULT 0;

-- 2. Notifications Log Table
CREATE TABLE notifications_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id),
    notification_type TEXT NOT NULL,
    dedupe_key TEXT NOT NULL,
    route TEXT,
    entity_id TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivery_status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed, opened, action_completed, expired
    provider_response JSONB,
    click_opened_at TIMESTAMP WITH TIME ZONE,
    action_completed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    device_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, dedupe_key)
);

-- Index for querying recent notifications for rate limiting
CREATE INDEX idx_notifications_log_user_created ON notifications_log(user_id, created_at);
