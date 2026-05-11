const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Ashwani%407903@db.lfwnrehqjiwpfoylhmby.supabase.co:5432/postgres',
});

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
