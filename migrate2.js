const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Ashwani%407903@db.lfwnrehqjiwpfoylhmby.supabase.co:5432/postgres',
});

async function run() {
  try {
    await client.connect();
    
    // Add missing columns to test_attempts
    await client.query(`
      ALTER TABLE test_attempts 
      ADD COLUMN IF NOT EXISTS accuracy_rate NUMERIC;
    `);
    console.log('Added accuracy_rate to test_attempts');

    // Remove or alter the tests_type_check constraint
    await client.query(`
      ALTER TABLE tests DROP CONSTRAINT IF EXISTS tests_type_check;
    `);
    console.log('Dropped tests_type_check constraint');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

run();
