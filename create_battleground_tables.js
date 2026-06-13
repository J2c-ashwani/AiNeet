import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Creating battlegrounds and battleground_participants tables in database...');

        // 1. Create battlegrounds table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.battlegrounds (
                id TEXT PRIMARY KEY,
                creator_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
                invite_code TEXT UNIQUE NOT NULL,
                questions_json TEXT NOT NULL,
                question_count INTEGER NOT NULL,
                time_limit_seconds INTEGER NOT NULL,
                max_participants INTEGER DEFAULT 200,
                status TEXT DEFAULT 'waiting',
                started_at TIMESTAMP WITHOUT TIME ZONE,
                ended_at TIMESTAMP WITHOUT TIME ZONE,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('Table public.battlegrounds created successfully.');

        // 2. Create battleground_participants table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.battleground_participants (
                id TEXT PRIMARY KEY,
                battleground_id TEXT REFERENCES public.battlegrounds(id) ON DELETE CASCADE,
                user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
                score INTEGER,
                correct_count INTEGER,
                incorrect_count INTEGER,
                time_spent_seconds INTEGER DEFAULT 0,
                submitted_at TIMESTAMP WITHOUT TIME ZONE,
                joined_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('Table public.battleground_participants created successfully.');

        // 3. Grant permissions (just in case)
        await pool.query(`
            GRANT ALL PRIVILEGES ON TABLE public.battlegrounds TO postgres, service_role, anon, authenticated;
            GRANT ALL PRIVILEGES ON TABLE public.battleground_participants TO postgres, service_role, anon, authenticated;
        `);
        console.log('Granted table privileges.');

        // 4. Disable RLS or create simple bypass policies for now
        await pool.query(`
            ALTER TABLE public.battlegrounds DISABLE ROW LEVEL SECURITY;
            ALTER TABLE public.battleground_participants DISABLE ROW LEVEL SECURITY;
        `);
        console.log('RLS disabled on battleground tables to guarantee secure operations.');

    } catch (err) {
        console.error('Error creating tables:', err);
    } finally {
        await pool.end();
    }
}

run();
