const { Client } = require('pg');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env.local') });
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required. Refusing to create RPCs without an explicit connection string.');
  process.exit(1);
}

const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    await client.connect();
    
    await client.query(`
      CREATE OR REPLACE FUNCTION subscription_activation_transaction(
        p_user_id UUID,
        p_plan_tier TEXT,
        p_billing_source TEXT,
        p_billing_provider TEXT,
        p_billing_status TEXT,
        p_external_subscription_id TEXT,
        p_external_customer_id TEXT,
        p_provider_event_id TEXT,
        p_provider_event_type TEXT,
        p_provider_payload JSONB,
        p_started_at TIMESTAMPTZ,
        p_expires_at TIMESTAMPTZ,
        p_provider_order_id TEXT
      ) RETURNS void AS $$
      BEGIN
        -- 1. Insert Subscription Record (Enforces idempotency on provider_event_id)
        INSERT INTO subscriptions (
          user_id, plan_tier, billing_source, billing_provider, billing_status,
          external_subscription_id, external_customer_id, provider_event_id, 
          provider_event_type, provider_payload, started_at, expires_at
        ) VALUES (
          p_user_id, p_plan_tier, p_billing_source, p_billing_provider, p_billing_status,
          p_external_subscription_id, p_external_customer_id, p_provider_event_id,
          p_provider_event_type, p_provider_payload, p_started_at, p_expires_at
        );

        -- 2. Update Legacy Payment Status
        UPDATE payments SET status = 'completed' WHERE provider_order_id = p_provider_order_id;

        -- 3. Update User Access Tier
        UPDATE users SET 
          subscription_tier = p_plan_tier,
          subscription_status = 'active',
          subscription_expiry = p_expires_at
        WHERE id = p_user_id;

      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('Created subscription_activation_transaction RPC');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

run();
