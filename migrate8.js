const { Client } = require('pg');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required. Refusing to run a production migration without an explicit connection string.');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    await client.connect();
    
    // Change omr_scans.test_id to TEXT
    await client.query(`
      ALTER TABLE omr_scans ALTER COLUMN test_id TYPE TEXT USING test_id::text;
    `);
    
    // Now add the constraint
    await client.query(`
      ALTER TABLE omr_scans ADD CONSTRAINT omr_scans_test_id_fkey FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE;
    `);
    console.log('Successfully changed type and added constraint for omr_scans');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

run();
