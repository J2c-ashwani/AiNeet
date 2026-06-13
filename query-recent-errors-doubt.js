import pg from 'pg';

const pool = new pg.Pool({
  user: 'postgres',
  password: 'Ashwani@7903',
  host: 'db.lfwnrehqjiwpfoylhmby.supabase.co',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Connecting to database to fetch latest error logs...');
    const { rows: errors } = await pool.query(
      "SELECT * FROM error_logs ORDER BY created_at DESC LIMIT 5"
    );
    console.log('Latest error logs:');
    console.log(JSON.stringify(errors, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

run();
