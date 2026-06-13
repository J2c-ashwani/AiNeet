import pg from 'pg';

const pool = new pg.Pool({
  user: 'postgres',
  password: 'Ashwani@7903',
  host: 'db.lfwnrehqjiwpfoylhmby.supabase.co',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Connecting to database to apply RLS policies for user_usage...');

    // Enable RLS just in case (already true, but good practice)
    console.log('Enabling RLS on user_usage table...');
    await pool.query('ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY');

    // Drop existing policies if any to avoid duplication
    console.log('Dropping existing user_usage policies...');
    await pool.query('DROP POLICY IF EXISTS select_user_usage ON user_usage');
    await pool.query('DROP POLICY IF EXISTS insert_user_usage ON user_usage');
    await pool.query('DROP POLICY IF EXISTS update_user_usage ON user_usage');
    await pool.query('DROP POLICY IF EXISTS delete_user_usage ON user_usage');

    // Create RLS policies (since user_id is TEXT, we cast auth.uid()::TEXT)
    console.log('Creating SELECT policy...');
    await pool.query(`
      CREATE POLICY select_user_usage ON user_usage 
      FOR SELECT 
      TO authenticated 
      USING (auth.uid()::TEXT = user_id)
    `);

    console.log('Creating INSERT policy...');
    await pool.query(`
      CREATE POLICY insert_user_usage ON user_usage 
      FOR INSERT 
      TO authenticated 
      WITH CHECK (auth.uid()::TEXT = user_id)
    `);

    console.log('Creating UPDATE policy...');
    await pool.query(`
      CREATE POLICY update_user_usage ON user_usage 
      FOR UPDATE 
      TO authenticated 
      USING (auth.uid()::TEXT = user_id)
      WITH CHECK (auth.uid()::TEXT = user_id)
    `);

    console.log('Creating DELETE policy...');
    await pool.query(`
      CREATE POLICY delete_user_usage ON user_usage 
      FOR DELETE 
      TO authenticated 
      USING (auth.uid()::TEXT = user_id)
    `);

    console.log('RLS policies applied successfully to user_usage table!');

  } catch (err) {
    console.error('Error applying RLS:', err);
  } finally {
    await pool.end();
  }
}

run();
