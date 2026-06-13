import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Adding battleground columns to users table...');
        
        // Check if battleground_creates_used exists
        const { rows: checkCols } = await pool.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('battleground_creates_used', 'battleground_joins_used')"
        );

        const columns = checkCols.map(c => c.column_name);

        if (!columns.includes('battleground_creates_used')) {
            console.log("Adding battleground_creates_used column...");
            await pool.query(
                "ALTER TABLE public.users ADD COLUMN battleground_creates_used INTEGER DEFAULT 0"
            );
        }

        if (!columns.includes('battleground_joins_used')) {
            console.log("Adding battleground_joins_used column...");
            await pool.query(
                "ALTER TABLE public.users ADD COLUMN battleground_joins_used INTEGER DEFAULT 0"
            );
        }

        console.log('Columns added successfully.');
    } catch (err) {
        console.error('Error modifying users table:', err);
    } finally {
        await pool.end();
    }
}

run();
