-- Migration for V3 Enterprise Scaling

-- 1. Add Daily Token Tracking to users table
ALTER TABLE users ADD COLUMN daily_ai_tokens_input INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN daily_ai_tokens_output INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_token_reset_date DATE DEFAULT CURRENT_DATE;

-- 2. Create the generic token increment RPC
-- This allows the Edge Functions to easily log token consumption
CREATE OR REPLACE FUNCTION increment_token_usage(
  target_user_id UUID,
  tokens_in INTEGER,
  tokens_out INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First, check if the reset date is older than today, reset it if so
  UPDATE users
  SET 
    daily_ai_tokens_input = CASE WHEN last_token_reset_date < CURRENT_DATE THEN 0 ELSE daily_ai_tokens_input END,
    daily_ai_tokens_output = CASE WHEN last_token_reset_date < CURRENT_DATE THEN 0 ELSE daily_ai_tokens_output END,
    last_token_reset_date = CURRENT_DATE
  WHERE id = target_user_id;

  -- Then increment the values
  UPDATE users
  SET 
    daily_ai_tokens_input = daily_ai_tokens_input + tokens_in,
    daily_ai_tokens_output = daily_ai_tokens_output + tokens_out
  WHERE id = target_user_id;
END;
$$;

-- 3. Webhook Idempotency
-- Ensure that the same Cashfree Order ID cannot be processed twice
ALTER TABLE payments ADD CONSTRAINT unique_cashfree_order_id UNIQUE (provider_order_id);
