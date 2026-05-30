import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Running the exact Verification Query from your script...');
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
        console.log('\n--- Verification Query Result ---');
        console.log(`Number of tables without RLS: ${rows.length}`);
        if (rows.length > 0) {
            console.log('Tables without RLS:');
            console.log(rows.map(r => r.table_name));
        } else {
            console.log('🎉 SUCCESS! Every single table has RLS enabled! 0 tables without RLS.');
        }
    } catch (err) {
        console.error('Error running verification query:', err);
    } finally {
        await pool.end();
    }
}

run();
