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
        console.log('🚀 Initiating OMR Offline-to-Online Identity Schema...');
        await client.query('BEGIN');

        console.log('-> Creating offline_tests (The B2B Key Matrix)...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS offline_tests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                test_name VARCHAR(255) NOT NULL,
                provider VARCHAR(100) NOT NULL, -- e.g., 'Allen', 'Aakash', 'NEET_PYQ'
                total_questions INTEGER DEFAULT 200,
                answer_key JSONB NOT NULL, -- e.g. {"1": "A", "2": "C"}
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        console.log('-> Seeding initial mock data for Verification Flow...');
        // Let's seed a mock "NEET 2024 PYQ" and "Aakash Minor 1" to allow the UI to function immediately
        await client.query(`
            INSERT INTO offline_tests (id, test_name, provider, total_questions, answer_key)
            VALUES 
                ('a9c8b9d8-8888-4444-9999-aaaaaaaaaaaa', 'NEET 2024 Official Paper', 'NEET_PYQ', 20, 
                '{"1":"A", "2":"B", "3":"C", "4":"D", "5":"A", "6":"B", "7":"A", "8":"B", "9":"C", "10":"D", "11":"A", "12":"B", "13":"C", "14":"D", "15":"A", "16":"B", "17":"C", "18":"D", "19":"D", "20":"D"}'),
                ('b7d6a5c4-7777-3333-8888-bbbbbbbbbbbb', 'Allen Major Score 1', 'Allen', 20, 
                '{"1":"C", "2":"A", "3":"B", "4":"A", "5":"C", "6":"B", "7":"D", "8":"A", "9":"D", "10":"B", "11":"C", "12":"A", "13":"B", "14":"A", "15":"C", "16":"B", "17":"D", "18":"A", "19":"B", "20":"A"}')
            ON CONFLICT DO NOTHING;
        `);

        console.log('-> Creating omr_scans (Scan History Timeline)...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS omr_scans (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                test_id UUID REFERENCES offline_tests(id) ON DELETE CASCADE,
                accuracy_percentage NUMERIC(5,2),
                raw_extracted_answers JSONB,
                verified_answers JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        
        console.log('-> Expanding mistake_log for Proprietary Data Moat...');
        // We will Alter it safely. If the columns exist, it will throw an error, so we catch it dynamically or just use IF NOT EXISTS workaround.
        // Doing raw SQL safe alters:
        await client.query(`
            DO $$ 
            BEGIN 
                BEGIN
                    ALTER TABLE mistake_log ADD COLUMN subtopic_id INTEGER REFERENCES topics(id);
                EXCEPTION WHEN duplicate_column THEN END;
                
                BEGIN
                    ALTER TABLE mistake_log ADD COLUMN mistake_type VARCHAR(50) DEFAULT 'unclassified'; -- concept/calculation/misread
                EXCEPTION WHEN duplicate_column THEN END;
                
                BEGIN
                    ALTER TABLE mistake_log ADD COLUMN confidence_score INTEGER DEFAULT 0;
                EXCEPTION WHEN duplicate_column THEN END;
            END $$;
        `);

        await client.query(`CREATE INDEX IF NOT EXISTS idx_omr_user ON omr_scans(user_id);`);

        await client.query('COMMIT');
        console.log('✅ Monopoly Stack Database Layer Complete.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration Error:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
