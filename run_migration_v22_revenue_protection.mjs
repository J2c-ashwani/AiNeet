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
        console.log('🚀 Initiating Revenue Protection Schema Update...');
        await client.query('BEGIN');

        console.log('-> Enforcing Unique Constraints on payments table...');
        try {
            await client.query(`ALTER TABLE payments ADD CONSTRAINT unique_provider_order_id UNIQUE (provider_order_id);`);
        } catch (e) {
            console.log('  [Info] Constraint unique_provider_order_id already exists or duplicates exist:', e.message);
        }

        console.log('-> Creating payment_events for Idempotency...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS payment_events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                provider VARCHAR(50) NOT NULL,
                external_event_id VARCHAR(255) UNIQUE NOT NULL,
                payload_hash VARCHAR(255),
                processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                status VARCHAR(50) NOT NULL
            );
        `);

        console.log('-> Creating payment_timeline for Forensic Auditing...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS payment_timeline (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                payment_id TEXT, -- soft reference to payments(id)
                user_id TEXT,    -- soft reference to users(id)
                provider VARCHAR(50),
                request_id VARCHAR(255),
                source_route VARCHAR(255),
                status VARCHAR(50) NOT NULL,
                metadata JSONB,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        console.log('-> Creating indexes for performance...');
        await client.query(`CREATE INDEX IF NOT EXISTS idx_payment_events_external_id ON payment_events(external_event_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_payment_timeline_user_id ON payment_timeline(user_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_payment_timeline_payment_id ON payment_timeline(payment_id);`);

        await client.query('COMMIT');
        console.log('✅ Revenue Protection Schema Update Complete.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration Error:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
