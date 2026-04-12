import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    const client = await pool.connect();
    try {
        console.log('🛡️ Architecting Referral Anti-Abuse & Reward Schema...');

        // 1. Add Explicit Abuse & Reward Tracking Columns
        console.log('-> Adding reward and device constraint columns to users table...');
        await client.query(`
            ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS device_hash TEXT,
                ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP WITH TIME ZONE,
                ADD COLUMN IF NOT EXISTS referral_reward_claimed BOOLEAN DEFAULT FALSE,
                ADD COLUMN IF NOT EXISTS referral_attempts INTEGER DEFAULT 0,
                ADD COLUMN IF NOT EXISTS fraud_risk_score INTEGER DEFAULT 0;
        `);

        // Index for device hashing anti-abuse lookups during registration
        await client.query(`CREATE INDEX IF NOT EXISTS idx_users_device_hash ON users(device_hash);`);

        // 2. Atomic Idempotency Lock for Referral Claims
        // This function guarantees a user can only claim their "New User Referral" reward ONCE,
        // returning TRUE if they successfully flipped it from FALSE to TRUE.
        console.log('-> Deploying atomic referral lock RPC...');
        await client.query(`
            CREATE OR REPLACE FUNCTION claim_referral_reward(target_user_id TEXT)
            RETURNS BOOLEAN AS $$
            DECLARE
              updated_rows INTEGER;
            BEGIN
              UPDATE users 
              SET referral_reward_claimed = TRUE 
              WHERE id = target_user_id AND referral_reward_claimed = FALSE;
              
              GET DIAGNOSTICS updated_rows = ROW_COUNT;
              
              IF updated_rows > 0 THEN
                  RETURN TRUE;
              ELSE
                  RETURN FALSE;
              END IF;
            END;
            $$ LANGUAGE plpgsql;
        `);
        
        console.log('✅ Phase 2 Referral Migration Complete.');
    } catch (e) {
        console.error('Migration Error:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
