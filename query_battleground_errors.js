import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Querying latest 15 errors in error_logs...');
        const { rows } = await pool.query(
            "SELECT * FROM error_logs ORDER BY created_at DESC LIMIT 15"
        );
        for (const row of rows) {
            console.log(`[${row.created_at}] Route: ${row.route}, Method: ${row.method}, Msg: ${row.error_message}`);
            if (row.error_stack) console.log(`Stack: ${row.error_stack.substring(0, 300)}...`);
            console.log(`Metadata: ${JSON.stringify(row.metadata)}\n`);
        }
    } catch (err) {
        console.error('Error querying:', err);
    } finally {
        await pool.end();
    }
}

run();
