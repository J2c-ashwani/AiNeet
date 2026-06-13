import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
    const filePath = '/Users/ashwanikumar/.gemini/antigravity/scratch/neet-coach/scripts/migrations/005_enable_rls_public_tables.sql';
    try {
        console.log(`Reading SQL file from: ${filePath}`);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        console.log('Executing the complete SQL migration file against the database in a secure transaction...');
        await pool.query(sql);
        console.log('Migration executed successfully! 100% of the SQL script has been applied.');
        
        console.log('\nRunning the verification query...');
        const { rows } = await pool.query(`
            SELECT
                n.nspname AS schema_name,
                c.relname AS table_name
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
              AND c.relkind IN ('r', 'p')
              AND c.relrowsecurity = FALSE
            ORDER BY c.relname;
        `);
        console.log(`Number of tables without RLS: ${rows.length}`);
        if (rows.length > 0) {
            console.log('Tables without RLS:', rows.map(r => r.table_name));
        } else {
            console.log('🎉 SUCCESS! Every single table has RLS enabled! 0 tables without RLS.');
        }
    } catch (err) {
        console.error('Error executing SQL file:', err);
    } finally {
        await pool.end();
    }
}

run();
