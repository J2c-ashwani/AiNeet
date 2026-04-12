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
        console.log('🛡️  Injecting Trust Score into users table...');
        await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 100;
        `);

        console.log('⚡ Deploying Atomic RPC Incrementers...');
        
        // 1. Increment Referrals safely
        await client.query(`
            CREATE OR REPLACE FUNCTION increment_referrals(target_user_id TEXT)
            RETURNS void AS $$
            BEGIN
              UPDATE users 
              SET referrals_count = COALESCE(referrals_count, 0) + 1 
              WHERE id = target_user_id;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // 1b. Increment XP safely
        await client.query(`
            CREATE OR REPLACE FUNCTION increment_user_xp_atomic(target_user_id TEXT, amount INTEGER)
            RETURNS void AS $$
            BEGIN
              UPDATE users 
              SET xp = COALESCE(xp, 0) + amount 
              WHERE id = target_user_id;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // 2. Safely decrement trust score (with a floor of 0)
        await client.query(`
            CREATE OR REPLACE FUNCTION decrement_trust_score(target_user_id TEXT, penalty INTEGER)
            RETURNS void AS $$
            BEGIN
              UPDATE users 
              SET trust_score = GREATEST(COALESCE(trust_score, 100) - penalty, 0)
              WHERE id = target_user_id;
            END;
            $$ LANGUAGE plpgsql;
        `);

        console.log('✅ Layer 9 RPC Migration Complete.');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
