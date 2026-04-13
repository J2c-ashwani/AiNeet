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
        
        // Ensure policies for the core tables using text casting
        
        // --- USERS TABLE ---
        await client.query(`
            DROP POLICY IF EXISTS "Users can read own data" ON users;
            CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid()::text = id::text);

            DROP POLICY IF EXISTS "Users can update own data" ON users;
            CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);
        `);

        // --- PAYMENTS TABLE ---
        await client.query(`
            DROP POLICY IF EXISTS "Users can read own payments" ON payments;
            CREATE POLICY "Users can read own payments" ON payments FOR SELECT USING (auth.uid()::text = user_id::text);
        `);

        // --- TESTS & QUESTIONS ---
        await client.query(`
            DROP POLICY IF EXISTS "Users can test own attempts" ON tests;
            CREATE POLICY "Users can test own attempts" ON tests FOR SELECT USING (auth.uid()::text = user_id::text);
            CREATE POLICY "Users can insert own attempts" ON tests FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
            
            DROP POLICY IF EXISTS "Authenticated users can read questions" ON questions;
            CREATE POLICY "Authenticated users can read questions" ON questions FOR SELECT TO authenticated USING (true);
        `);

        console.log('\n✅ Enterprise RLS Lockdown Policies officially deployed.');

    } catch (error) {
        console.error('Lockdown failed:', error);
    } finally {
        await client.end();
    }
}

executeLockdown();
