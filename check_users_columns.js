import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Querying columns of users table...');
        const { rows } = await pool.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'"
        );
        console.log('users columns:', rows.map(r => r.column_name));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

run();
