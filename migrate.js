const { Client } = require('pg');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env.local') });
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required. Refusing to run a migration without an explicit connection string.');
  process.exit(1);
}

const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    await client.connect();
    
    // Add fcm columns to users
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS fcm_token TEXT,
      ADD COLUMN IF NOT EXISTS fcm_token_updated_at TIMESTAMPTZ;
    `);
    console.log('Added FCM columns to users');

    // Add status column to test_attempts
    await client.query(`
      ALTER TABLE test_attempts 
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
    `);
    console.log('Added status column to test_attempts');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

run();
