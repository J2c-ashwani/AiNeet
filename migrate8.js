const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Ashwani%407903@db.lfwnrehqjiwpfoylhmby.supabase.co:5432/postgres',
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
