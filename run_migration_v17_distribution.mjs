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
        console.log('🏛️ Architecting SEO Intelligence Layer & Attribution Tracking...');

        // 1. Add Explicit Attribution Columns to Users (No JSONB debt!)
        console.log('-> Adding explicit UTM columns to users table...');
        await client.query(`
            ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS utm_source TEXT,
                ADD COLUMN IF NOT EXISTS utm_medium TEXT,
                ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
                ADD COLUMN IF NOT EXISTS acquired_via TEXT;
        `);

        // 2. Create SEO Pages Table
        console.log('-> Creating seo_pages table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS seo_pages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                slug TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                meta_description TEXT,
                content_markdown TEXT NOT NULL,
                json_ld TEXT,
                source_question_id TEXT,
                impressions INTEGER DEFAULT 0,
                clicks INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        // Index for fast dynamic lookup
        await client.query(`CREATE INDEX IF NOT EXISTS idx_seo_pages_slug ON seo_pages(slug);`);

        // 3. Create User Sessions Table
        console.log('-> Creating user_sessions table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id TEXT NOT NULL,
                source TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        // We do not enforce foreign key on user_id strictly if it points to auth.users vs public.users,
        // but we index it for fast analytics queries.
        await client.query(`CREATE INDEX IF NOT EXISTS idx_user_sessions_userid ON user_sessions(user_id);`);

        console.log('✅ Phase 1 Migration Complete.');
    } catch (e) {
        console.error('Migration Error:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
