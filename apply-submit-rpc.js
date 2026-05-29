import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Connecting to database to apply submit_test_transaction RPC...');

    // 1. Drop existing overloaded functions to avoid type conflicts
    console.log('Dropping existing submit_test_transaction definitions...');
    await pool.query('DROP FUNCTION IF EXISTS submit_test_transaction(text, uuid, numeric, integer, integer, integer, timestamp with time zone, integer, jsonb, jsonb, jsonb)');
    await pool.query('DROP FUNCTION IF EXISTS submit_test_transaction(text, text, numeric, integer, integer, integer, timestamp with time zone, integer, jsonb, jsonb, jsonb)');

    // 2. Create the fixed stored procedure using a loop for mistake logs to avoid ON CONFLICT errors
    console.log('Creating fixed 11-argument submit_test_transaction RPC...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION submit_test_transaction(
        p_test_id TEXT,
        p_user_id TEXT,
        p_score NUMERIC,
        p_correct_count INTEGER,
        p_incorrect_count INTEGER,
        p_unanswered_count INTEGER,
        p_completed_at TIMESTAMPTZ,
        p_time_taken_seconds INTEGER,
        p_answers JSONB,
        p_mistakes JSONB,
        p_performances JSONB
      ) RETURNS void AS $$
      DECLARE
        perf RECORD;
        mistake RECORD;
      BEGIN
        -- 1. Update canonical test record (TEXT = TEXT comparison)
        UPDATE tests SET 
          score = p_score, 
          correct_count = p_correct_count, 
          incorrect_count = p_incorrect_count, 
          unanswered_count = p_unanswered_count, 
          time_taken_seconds = p_time_taken_seconds,
          completed_at = p_completed_at
        WHERE id = p_test_id AND user_id = p_user_id;

        -- 2. Insert test answers (cast p_user_id to UUID, question_id to INTEGER)
        IF p_answers IS NOT NULL AND jsonb_array_length(p_answers) > 0 THEN
          INSERT INTO test_answers (test_id, user_id, question_id, selected_option, is_correct, time_spent_seconds)
          SELECT p_test_id, p_user_id::UUID, (value->>'question_id')::INTEGER, (value->>'selected_option')::TEXT, (value->>'is_correct')::INTEGER, (value->>'time_spent_seconds')::INTEGER
          FROM jsonb_array_elements(p_answers);
        END IF;

        -- 3. Insert/Update mistake logs using explicit exists check to bypass unique constraint issues
        IF p_mistakes IS NOT NULL AND jsonb_array_length(p_mistakes) > 0 THEN
          FOR mistake IN SELECT * FROM jsonb_array_elements(p_mistakes)
          LOOP
            IF EXISTS (
              SELECT 1 FROM mistake_log 
              WHERE user_id = p_user_id AND question_id = (mistake.value->>'question_id')::INTEGER
            ) THEN
              UPDATE mistake_log 
              SET 
                mistake_count = COALESCE(mistake_count, 0) + 1, 
                logged_at = p_completed_at,
                test_id = p_test_id,
                selected_option = (mistake.value->>'selected_option')::TEXT,
                correct_option = (mistake.value->>'correct_option')::TEXT
              WHERE user_id = p_user_id AND question_id = (mistake.value->>'question_id')::INTEGER;
            ELSE
              INSERT INTO mistake_log (user_id, question_id, test_id, selected_option, correct_option, mistake_type, mistake_count, logged_at)
              VALUES (
                p_user_id, 
                (mistake.value->>'question_id')::INTEGER, 
                p_test_id, 
                (mistake.value->>'selected_option')::TEXT, 
                (mistake.value->>'correct_option')::TEXT, 
                (mistake.value->>'mistake_type')::TEXT, 
                1,
                p_completed_at
              );
            END IF;
          END LOOP;
        END IF;

        -- 4. Upsert user performance (user_performance_user_id_topic_id_key is unique, so ON CONFLICT works)
        IF p_performances IS NOT NULL AND jsonb_array_length(p_performances) > 0 THEN
          FOR perf IN SELECT * FROM jsonb_array_elements(p_performances)
          LOOP
            INSERT INTO user_performance (user_id, topic_id, total_attempted, total_correct, avg_time_seconds, accuracy, last_attempted)
            VALUES (
              p_user_id, 
              (perf.value->>'topic_id')::INTEGER, 
              (perf.value->>'total_attempted')::INTEGER, 
              (perf.value->>'total_correct')::INTEGER, 
              (perf.value->>'avg_time_seconds')::NUMERIC, 
              (perf.value->>'accuracy')::NUMERIC, 
              p_completed_at
            )
            ON CONFLICT (user_id, topic_id) 
            DO UPDATE SET 
              total_attempted = EXCLUDED.total_attempted,
              total_correct = EXCLUDED.total_correct,
              avg_time_seconds = EXCLUDED.avg_time_seconds,
              accuracy = EXCLUDED.accuracy,
              last_attempted = EXCLUDED.last_attempted;
          END LOOP;
        END IF;

      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('Successfully created and applied fixed submit_test_transaction RPC!');

  } catch (err) {
    console.error('Error applying RPC:', err);
  } finally {
    await pool.end();
  }
}

run();
