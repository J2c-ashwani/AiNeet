const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Ashwani%407903@db.lfwnrehqjiwpfoylhmby.supabase.co:5432/postgres',
});

async function run() {
  try {
    await client.connect();
    
    await client.query(`
      ALTER TABLE omr_scans DROP CONSTRAINT IF EXISTS omr_scans_test_id_fkey;
    `);
    
    await client.query(`
      ALTER TABLE omr_scans ALTER COLUMN test_id TYPE UUID USING test_id::uuid;
    `);
    
    await client.query(`
      ALTER TABLE omr_scans ADD CONSTRAINT omr_scans_test_id_fkey FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE;
    `);
    console.log('Successfully changed type and added constraint for omr_scans');

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
