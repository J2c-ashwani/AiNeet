-- Unified Dual-Rail Subscription Schema
-- Preserves history, enforces strong typing, stores audit payloads, prevents duplicate events.

CREATE TYPE plan_tier_enum AS ENUM ('pro', 'premium');
CREATE TYPE billing_source_enum AS ENUM ('web', 'play');
CREATE TYPE billing_provider_enum AS ENUM ('cashfree', 'razorpay', 'google_play');
CREATE TYPE billing_status_enum AS ENUM ('pending', 'active', 'grace', 'canceled', 'expired');

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    
    plan_tier plan_tier_enum NOT NULL,
    billing_source billing_source_enum NOT NULL,
    billing_provider billing_provider_enum NOT NULL,
    billing_status billing_status_enum NOT NULL,
    
    external_subscription_id VARCHAR,
    external_customer_id VARCHAR,
    
    -- Audit & Idempotency
    provider_event_id VARCHAR UNIQUE, -- Prevents duplicate webhook processing
    provider_event_type VARCHAR,
    provider_payload JSONB,

    started_at TIMESTAMPTZ,
    renews_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    last_verified_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast entitlement resolution (getting the latest row for a user)
CREATE INDEX idx_subscriptions_user_active ON subscriptions(user_id, created_at DESC);
