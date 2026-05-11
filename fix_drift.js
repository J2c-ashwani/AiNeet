const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await client.connect();
    
    await client.query(`
      ALTER TABLE test_answers ADD COLUMN IF NOT EXISTS user_id UUID;
      ALTER TABLE mistake_log ADD COLUMN IF NOT EXISTS mistake_count INTEGER DEFAULT 1;
    `);
    console.log('Fixed missing columns found by schema audit');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

run();
