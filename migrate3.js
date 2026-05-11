const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Ashwani%407903@db.lfwnrehqjiwpfoylhmby.supabase.co:5432/postgres',
});

async function run() {
  try {
    await client.connect();
    
    // Let's get the columns for test_attempts
    const res1 = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'test_attempts';
    `);
    console.log('test_attempts columns:', res1.rows.map(r => r.column_name));

    // Let's get the foreign keys for omr_scans
    const res2 = await client.query(`
      SELECT
          tc.table_schema, 
          tc.constraint_name, 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_schema AS foreign_table_schema,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='omr_scans';
    `);
    console.log('omr_scans FKs:', res2.rows);

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

run();
