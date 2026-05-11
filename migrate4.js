const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Ashwani%407903@db.lfwnrehqjiwpfoylhmby.supabase.co:5432/postgres',
});

async function run() {
  try {
    await client.connect();
    
    // Fix omr_scans constraint
    await client.query(`
      ALTER TABLE omr_scans DROP CONSTRAINT IF EXISTS omr_scans_test_id_fkey;
      ALTER TABLE omr_scans ADD CONSTRAINT omr_scans_test_id_fkey FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE;
    `);
    console.log('Fixed omr_scans_test_id_fkey to point to tests');

    // Add missing columns to test_attempts
    await client.query(`
      ALTER TABLE test_attempts 
      ADD COLUMN IF NOT EXISTS total_score INTEGER,
      ADD COLUMN IF NOT EXISTS correct_answers INTEGER,
      ADD COLUMN IF NOT EXISTS incorrect_answers INTEGER;
    `);
    console.log('Added total_score, correct_answers, incorrect_answers to test_attempts');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

run();
