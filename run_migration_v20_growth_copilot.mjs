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
        console.log('🚀 Architecting Growth Copilot Memory Bank...');

        await client.query('BEGIN');

        console.log('-> Creating social_growth_logs...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS social_growth_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                admin_id TEXT NOT NULL,
                platform VARCHAR(50) DEFAULT 'facebook',
                topic_detected TEXT,
                original_doubt_text TEXT,
                selected_variant TEXT,
                clicks INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        // Index for viewing historical generation patterns
        await client.query(`CREATE INDEX IF NOT EXISTS idx_growth_admin ON social_growth_logs(admin_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_growth_created ON social_growth_logs(created_at);`);

        await client.query('COMMIT');
        console.log('✅ Phase 4 Growth Copilot Migration Complete.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration Error:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
