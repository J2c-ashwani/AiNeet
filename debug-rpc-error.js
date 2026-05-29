import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function debug() {
  try {
    console.log('Connecting to database...');
    
    // 1. Get QA user details
    const { rows: users } = await pool.query("SELECT id, email, name FROM users WHERE email = 'qa@neetcoach.in'");
    if (users.length === 0) {
      console.error('QA User qa@neetcoach.in not found in database.');
      return;
    }
    const qaUser = users[0];
    console.log('QA User ID:', qaUser.id);

    // 2. Get last generated test for this user
    const { rows: tests } = await pool.query(
      "SELECT id, config_json, total_questions, completed_at FROM tests WHERE user_id = $1 ORDER BY started_at DESC LIMIT 1",
      [qaUser.id]
    );
    if (tests.length === 0) {
      console.error('No tests found for QA User.');
      return;
    }
    const test = tests[0];
    console.log('Last Test ID:', test.id);

    // 3. Let's try to call submit_test_transaction manually to see the exact SQL/Postgres error
    console.log('Attempting dry-run of submit_test_transaction RPC with NON-EMPTY mistake and performance payload...');
    
    // Construct dummy answer payload matching route.js structure
    const answersPayload = JSON.stringify([
      {
        question_id: 8789,
        selected_option: 'A',
        is_correct: 1,
        time_spent_seconds: 5
      }
    ]);

    // Construct mistake payload (needs a valid question_id that exists in the database, e.g. 8789)
    const mistakePayload = JSON.stringify([
      {
        question_id: 8789,
        selected_option: 'B',
        correct_option: 'A',
        mistake_type: 'calculation'
      }
    ]);

    // Construct performance payload (needs a topic_id that exists in database, e.g. 'coordination_compounds')
    const performancePayload = JSON.stringify([
      {
        topic_id: 'coordination_compounds',
        total_attempted: 1,
        total_correct: 0,
        avg_time_seconds: 15,
        accuracy: 0
      }
    ]);

    // Call submit_test_transaction within a transaction block so we roll it back
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      console.log('Calling submit_test_transaction RPC via SQL...');
      await client.query(
        `SELECT submit_test_transaction(
          $1::TEXT,
          $2::TEXT,
          $3::NUMERIC,
          $4::INTEGER,
          $5::INTEGER,
          $6::INTEGER,
          $7::TIMESTAMPTZ,
          $8::INTEGER,
          $9::JSONB,
          $10::JSONB,
          $11::JSONB
        )`,
        [
          test.id,
          qaUser.id,
          4.0, // score
          1,   // correct
          0,   // incorrect
          0,   // unanswered
          new Date().toISOString(), // completed_at
          5,   // time_taken
          answersPayload,
          mistakePayload,
          performancePayload
        ]
      );
      
      console.log('RPC execution succeeded inside dry-run!');
      await client.query('ROLLBACK');
    } catch (rpcErr) {
      console.error('RPC execution failed with PostgreSQL exception:');
      console.error(rpcErr);
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }

  } catch (err) {
    console.error('Error debugging:', err);
  } finally {
    await pool.end();
  }
}

debug();
