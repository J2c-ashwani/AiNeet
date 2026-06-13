import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Querying user_usage...');
        const { rows } = await pool.query(
            "SELECT * FROM user_usage WHERE user_id = '649ddd13-4bb6-423b-b8a2-c4a45e30cb09' AND month = '2026-05'"
        );
        console.log('Rows found:', rows);
    } catch (err) {
        console.error('Error querying:', err);
    } finally {
        await pool.end();
    }
}

run();
