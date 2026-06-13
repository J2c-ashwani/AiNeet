import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Querying distinct subscription tiers...');
        const { rows } = await pool.query(
            "SELECT DISTINCT subscription_tier FROM users"
        );
        console.log('Tiers:', rows);

        // Fetch check constraints
        const { rows: constraints } = await pool.query(`
            SELECT pg_get_constraintdef(c.oid) AS constraint_def
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            WHERE t.relname = 'users' AND c.contype = 'c'
        `);
        console.log('Constraints:', constraints);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

run();
