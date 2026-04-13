import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function executeLockdown() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to Postgres database.');

        // 1. Fetch all custom tables in public schema
        const res = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
        `);
        const tables = res.rows.map(r => r.tablename);
        
        console.log(`Locking down ${tables.length} tables...`);

        // 2. Enable RLS and establish default Deny on all tables
        for (const table of tables) {
            await client.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
            await client.query(`REVOKE ALL ON "${table}" FROM anon;`);
            await client.query(`REVOKE ALL ON "${table}" FROM authenticated;`);
            
            // Re-grant basic usage to authenticated to allow Policies to evaluate
            // Wait, supabase needs the roles to even exist in Postgres
            await client.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON "${table}" TO authenticated;`);
            await client.query(`GRANT SELECT ON "${table}" TO anon;`);
            console.log(`🔒 Lockdown active on: ${table}`);
        }

        // 3. Selective granular MD Policies
        
        // --- USERS TABLE ---
        // Allow public to read minimal user info for Leaderboards (or drop if Leaderboard is API-driven)
        // Wait! Leaderboard is API-driven now! Frontend fetches /api/leaderboard and API uses Service Role.
        // So Anon needs ZERO select access to users.
        await client.query(`
            DROP POLICY IF EXISTS "Users can read own data" ON users;
            CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);

            DROP POLICY IF EXISTS "Users can update own data" ON users;
            CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
        `);

        // --- PAYMENTS TABLE ---
        await client.query(`
            DROP POLICY IF EXISTS "Users can read own payments" ON payments;
            CREATE POLICY "Users can read own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
            -- NO UPDATE POLICY FOR PAYMENTS. ONLY BACKEND CAN MUTATE IT!
        `);

        // --- TESTS & QUESTIONS ---
        await client.query(`
            DROP POLICY IF EXISTS "Users can test own attempts" ON tests;
            CREATE POLICY "Users can test own attempts" ON tests FOR SELECT USING (auth.uid() = user_id);
            CREATE POLICY "Users can insert own attempts" ON tests FOR INSERT WITH CHECK (auth.uid() = user_id);
            
            -- Questions should only be read by authenticated users, NO write access.
            DROP POLICY IF EXISTS "Authenticated users can read questions" ON questions;
            CREATE POLICY "Authenticated users can read questions" ON questions FOR SELECT TO authenticated USING (true);
        `);

        console.log('\n✅ Enterprise RLS Lockdown successfully deployed across the network.');

    } catch (error) {
        console.error('Lockdown failed:', error);
    } finally {
        await client.end();
    }
}

executeLockdown();
