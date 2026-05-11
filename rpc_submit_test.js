const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Ashwani%407903@db.lfwnrehqjiwpfoylhmby.supabase.co:5432/postgres',
});

async function run() {
  try {
    await client.connect();
    
    await client.query(`
      CREATE OR REPLACE FUNCTION submit_test_transaction(
        p_test_id TEXT,
        p_user_id UUID,
        p_type TEXT,
        p_score NUMERIC,
        p_correct_count INTEGER,
        p_incorrect_count INTEGER,
        p_unanswered_count INTEGER,
        p_completed_at TIMESTAMPTZ,
        p_config_json JSONB,
        p_total_questions INTEGER,
        p_total_marks NUMERIC,
        p_answers JSONB,
        p_mistakes JSONB,
        p_performances JSONB,
        p_achievements JSONB,
        p_xp_added INTEGER
      ) RETURNS void AS $$
      DECLARE
        answer RECORD;
        mistake RECORD;
        perf RECORD;
        badge RECORD;
      BEGIN
        -- 1. Insert canonical test record
        INSERT INTO tests (id, user_id, type, score, correct_count, incorrect_count, unanswered_count, completed_at, config_json, total_questions, total_marks)
        VALUES (p_test_id, p_user_id, p_type, p_score, p_correct_count, p_incorrect_count, p_unanswered_count, p_completed_at, p_config_json, p_total_questions, p_total_marks);

        -- 2. Insert test answers
        IF p_answers IS NOT NULL AND jsonb_array_length(p_answers) > 0 THEN
          INSERT INTO test_answers (test_id, user_id, question_id, selected_option, is_correct, time_spent_seconds)
          SELECT p_test_id, p_user_id, (value->>'question_id')::TEXT, (value->>'selected_option')::TEXT, (value->>'is_correct')::INTEGER, (value->>'time_spent_seconds')::INTEGER
          FROM jsonb_array_elements(p_answers);
        END IF;

        -- 3. Insert mistake logs
        IF p_mistakes IS NOT NULL AND jsonb_array_length(p_mistakes) > 0 THEN
          INSERT INTO mistake_log (user_id, question_id, test_id, selected_option, correct_option, mistake_type, mistake_notes)
          SELECT p_user_id, (value->>'question_id')::TEXT, p_test_id, (value->>'selected_option')::TEXT, (value->>'correct_option')::TEXT, (value->>'mistake_type')::TEXT, (value->>'mistake_notes')::TEXT
          FROM jsonb_array_elements(p_mistakes);
        END IF;

        -- 4. Upsert user performance
        IF p_performances IS NOT NULL AND jsonb_array_length(p_performances) > 0 THEN
          FOR perf IN SELECT * FROM jsonb_array_elements(p_performances)
          LOOP
            INSERT INTO user_performance (user_id, subject, chapter, questions_attempted, correct_answers, incorrect_answers, total_time_spent_seconds, last_attempted_at)
            VALUES (
              p_user_id, 
              perf.value->>'subject', 
              perf.value->>'chapter', 
              (perf.value->>'questions_attempted')::INTEGER, 
              (perf.value->>'correct_answers')::INTEGER, 
              (perf.value->>'incorrect_answers')::INTEGER, 
              (perf.value->>'total_time_spent_seconds')::INTEGER, 
              p_completed_at
            )
            ON CONFLICT (user_id, subject, chapter) 
            DO UPDATE SET 
              questions_attempted = user_performance.questions_attempted + EXCLUDED.questions_attempted,
              correct_answers = user_performance.correct_answers + EXCLUDED.correct_answers,
              incorrect_answers = user_performance.incorrect_answers + EXCLUDED.incorrect_answers,
              total_time_spent_seconds = user_performance.total_time_spent_seconds + EXCLUDED.total_time_spent_seconds,
              last_attempted_at = EXCLUDED.last_attempted_at;
          END LOOP;
        END IF;

        -- 5. Insert achievements
        IF p_achievements IS NOT NULL AND jsonb_array_length(p_achievements) > 0 THEN
          INSERT INTO user_achievements (user_id, badge_type, badge_name, description)
          SELECT p_user_id, (value->>'badge_type')::TEXT, (value->>'badge_name')::TEXT, (value->>'description')::TEXT
          FROM jsonb_array_elements(p_achievements)
          ON CONFLICT (user_id, badge_type) DO NOTHING;
        END IF;

        -- 6. Grant XP
        IF p_xp_added > 0 THEN
          UPDATE users SET xp = COALESCE(xp, 0) + p_xp_added WHERE id = p_user_id;
        END IF;

      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('Created submit_test_transaction RPC');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

run();
