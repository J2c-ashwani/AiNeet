const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Ashwani%407903@db.lfwnrehqjiwpfoylhmby.supabase.co:5432/postgres',
});

async function run() {
  try {
    await client.connect();
    
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
