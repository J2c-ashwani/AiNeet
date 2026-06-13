import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Querying columns of battleground_rooms...');
        const { rows: roomCols } = await pool.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'battleground_rooms'"
        );
        console.log('battleground_rooms columns:', roomCols);

        console.log('\nQuerying columns of battleground_players...');
        const { rows: playerCols } = await pool.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'battleground_players'"
        );
        console.log('battleground_players columns:', playerCols);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

run();
