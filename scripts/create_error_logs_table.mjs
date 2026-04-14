import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function createErrorLogsTable() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS error_logs (
                id SERIAL PRIMARY KEY,
                user_id TEXT,
                route TEXT NOT NULL,
                method TEXT DEFAULT 'UNKNOWN',
                error_message TEXT NOT NULL,
                error_stack TEXT,
                severity TEXT DEFAULT 'error',
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_error_logs_created ON error_logs (created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_error_logs_route ON error_logs (route);
            
            ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
            REVOKE ALL ON error_logs FROM anon;
            REVOKE ALL ON error_logs FROM authenticated;
        `);
        
        console.log('✅ error_logs table created with RLS enabled.');
    } catch (error) {
        console.error('Failed:', error.message);
    } finally {
        await client.end();
    }
}

createErrorLogsTable();
