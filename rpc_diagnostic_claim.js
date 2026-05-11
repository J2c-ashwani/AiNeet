const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Ashwani%407903@db.lfwnrehqjiwpfoylhmby.supabase.co:5432/postgres',
});

async function run() {
  try {
    await client.connect();
    
    await client.query(`
      CREATE OR REPLACE FUNCTION diagnostic_claim_transaction(
        p_test_id TEXT,
        p_attempt_id UUID,
        p_user_id UUID,
        p_config_json JSONB,
        p_total_questions INTEGER,
        p_total_marks NUMERIC,
        p_score NUMERIC,
        p_correct INTEGER,
        p_incorrect INTEGER,
        p_accuracy NUMERIC,
        p_answers JSONB
      ) RETURNS void AS $$
      BEGIN
        -- 1. Insert Test
        INSERT INTO tests (id, user_id, type, config_json, total_questions, total_marks)
        VALUES (p_test_id, p_user_id, 'diagnostic_claim', p_config_json, p_total_questions, p_total_marks);

        -- 2. Insert Attempt Record
        INSERT INTO test_attempts (id, test_id, user_id, total_score, correct_answers, incorrect_answers, accuracy_rate)
        VALUES (p_attempt_id, p_test_id, p_user_id, p_score, p_correct, p_incorrect, p_accuracy);

        -- 3. Insert Answers
        IF p_answers IS NOT NULL AND jsonb_array_length(p_answers) > 0 THEN
          INSERT INTO test_answers (test_attempt_id, question_id, user_answer_option, time_spent_seconds)
          SELECT p_attempt_id, (value->>'question_id')::TEXT, (value->>'user_answer_option')::TEXT, (value->>'time_spent_seconds')::INTEGER
          FROM jsonb_array_elements(p_answers);
        END IF;

      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('Created diagnostic_claim_transaction RPC');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

run();
