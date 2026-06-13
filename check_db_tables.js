import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Querying database tables in public schema...');
        const { rows } = await pool.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        );
        console.log('Tables:', rows.map(r => r.table_name));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

run();
