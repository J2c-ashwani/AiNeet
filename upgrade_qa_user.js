import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Upgrading QA user to premium subscription tier...');
        const result = await pool.query(
            "UPDATE users SET subscription_tier = 'pro' WHERE email = 'qa@neetcoach.in'"
        );
        console.log('Update result:', result.rowCount, 'row updated.');
    } catch (err) {
        console.error('Error upgrading:', err);
    } finally {
        await pool.end();
    }
}

run();
