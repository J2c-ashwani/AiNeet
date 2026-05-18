-- Mobile Enterprise Hardening
-- - Device-scoped FCM token registry with token rotation/invalidation
-- - Private storage bucket for OMR scan retry/audit objects

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata';
ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token_updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token_invalidated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_failure_count INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'android',
    app_version TEXT,
    fcm_token TEXT NOT NULL,
    push_permission TEXT NOT NULL DEFAULT 'granted',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    webview_version TEXT,
    android_version TEXT,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fcm_token_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fcm_token_invalidated_at TIMESTAMP WITH TIME ZONE,
    notification_failure_count INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, device_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_devices_active_fcm_token
    ON user_devices(fcm_token)
    WHERE is_active = TRUE AND fcm_token_invalidated_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_devices_user_active
    ON user_devices(user_id, is_active, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_devices_token_lookup
    ON user_devices(fcm_token);

ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    CREATE POLICY "Users can read own devices"
        ON user_devices FOR SELECT
        USING (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY "Users can register own devices"
        ON user_devices FOR INSERT
        WITH CHECK (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY "Users can update own devices"
        ON user_devices FOR UPDATE
        USING (auth.uid()::text = user_id)
        WITH CHECK (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE notifications_log ADD COLUMN IF NOT EXISTS device_info JSONB;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'omr-scans',
    'omr-scans',
    false,
    15728640,
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif',
        'application/pdf'
    ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types,
    updated_at = NOW();
