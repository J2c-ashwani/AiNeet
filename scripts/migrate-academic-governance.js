const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        console.log('🚀 Starting Academic Governance DB Migration...');

        // 1. Add schema additions to `questions` table
        // Note: quality_score already exists according to previous check.
        console.log('Adding governance columns to questions table...');
        await client.query(`
            ALTER TABLE questions
            ADD COLUMN IF NOT EXISTS explanation_version VARCHAR(20),
            ADD COLUMN IF NOT EXISTS explanation_source VARCHAR(100),
            ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255),
            ADD COLUMN IF NOT EXISTS health_score INTEGER DEFAULT 100,
            ADD COLUMN IF NOT EXISTS explanation_locked BOOLEAN DEFAULT FALSE;
        `);

        // 2. Create Rejection Log Table
        console.log('Creating question_rejections table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS question_rejections (
                id SERIAL PRIMARY KEY,
                topic_id INTEGER,
                rejection_gate VARCHAR(50),
                rejection_reason TEXT,
                raw_output JSONB,
                prompt_version VARCHAR(20),
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // 3. Create Student Issue Reporting Table
        console.log('Creating question_reports table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS question_reports (
                id SERIAL PRIMARY KEY,
                question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
                user_id UUID,
                category VARCHAR(50), -- wrong answer, unclear explanation, typo, misleading concept, out-of-syllabus
                student_comment TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                resolved_at TIMESTAMPTZ,
                resolved_by VARCHAR(255)
            );
        `);

        // 4. Create Teacher Review Queue View/Table state (just an index on questions for now)
        // Questions that need review: confidence < 0.92 AND NOT explanation_locked
        console.log('Creating index for teacher review queue...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_questions_review_queue 
            ON questions (confidence_score) 
            WHERE confidence_score >= 0.80 AND confidence_score < 0.92 AND explanation_locked = FALSE;
        `);

        await client.query('COMMIT');
        console.log('✅ Academic Governance DB Migration completed successfully!');

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
