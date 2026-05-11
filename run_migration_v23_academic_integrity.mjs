import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Wave 2: Academic Integrity Migration...\n');
        await client.query('BEGIN');

        // 1. Academic Event Ledger
        console.log('-> Creating academic_events table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS academic_events (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                event_type VARCHAR NOT NULL,
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                test_id TEXT REFERENCES tests(id) ON DELETE CASCADE,
                question_id TEXT,
                timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                payload JSONB,
                route VARCHAR,
                device VARCHAR,
                network VARCHAR,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_academic_events_user ON academic_events(user_id, created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_academic_events_test ON academic_events(test_id);
            
            -- Prevent duplicate submit events for the same test
            CREATE UNIQUE INDEX IF NOT EXISTS unq_test_submitted_event 
                ON academic_events(test_id, event_type) 
                WHERE event_type = 'test_submitted';
        `);

        // 2. OMR Retry Queue
        console.log('-> Creating omr_retry_queue table...');
        await client.query(`
            DO $$ BEGIN
                CREATE TYPE omr_retry_state AS ENUM ('pending', 'retrying', 'exhausted', 'manually_reviewed');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;

            CREATE TABLE IF NOT EXISTS omr_retry_queue (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                scan_url TEXT NOT NULL,
                state omr_retry_state NOT NULL DEFAULT 'pending',
                retry_count INT DEFAULT 0,
                last_error TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_omr_retry_state ON omr_retry_queue(state);
        `);

        // 3. Test Autosaves (Versioning Support)
        console.log('-> Creating test_autosaves table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS test_autosaves (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                test_id TEXT REFERENCES tests(id) ON DELETE CASCADE,
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                version_number INT NOT NULL,
                answers JSONB NOT NULL,
                time_remaining_seconds INT NOT NULL,
                hash VARCHAR NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- Keep multiple versions uniquely identified
            CREATE UNIQUE INDEX IF NOT EXISTS unq_test_autosave_version 
                ON test_autosaves(test_id, version_number);

            CREATE INDEX IF NOT EXISTS idx_test_autosaves_test ON test_autosaves(test_id, version_number DESC);
        `);

        // 4. Timer Authoritativeness additions to tests
        console.log('-> Adding timer authority columns to tests...');
        await client.query(`
            ALTER TABLE tests ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
            ALTER TABLE tests ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
            -- Keep original time_limit_seconds for reference, but use expires_at as source of truth.
        `);

        // 5. Scan Audit Trail (Extending omr_scans or new table)
        // Check if omr_scans exists, if not create a forensic audit table
        console.log('-> Creating scan_audit_trail table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS scan_audit_trail (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                test_id TEXT REFERENCES tests(id) ON DELETE CASCADE,
                raw_image_url TEXT,
                extracted_payload JSONB,
                confidence_scores JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_scan_audit_user ON scan_audit_trail(user_id);
        `);

        await client.query('COMMIT');
        console.log('\n✅ Migration completed successfully!');

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
