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
        p_score NUMERIC,
        p_correct_count INTEGER,
        p_incorrect_count INTEGER,
        p_unanswered_count INTEGER,
        p_completed_at TIMESTAMPTZ,
        p_time_taken_seconds INTEGER,
        p_answers JSONB,
        p_mistakes JSONB,
        p_performances JSONB,
        p_achievements JSONB,
        p_xp_added INTEGER,
        p_new_streak INTEGER,
        p_new_trust NUMERIC
      ) RETURNS void AS $$
      DECLARE
        perf RECORD;
      BEGIN
        -- 1. Update canonical test record
        UPDATE tests SET 
          score = p_score, 
          correct_count = p_correct_count, 
          incorrect_count = p_incorrect_count, 
          unanswered_count = p_unanswered_count, 
          time_taken_seconds = p_time_taken_seconds,
          completed_at = p_completed_at
        WHERE id = p_test_id AND user_id = p_user_id;

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
          FROM jsonb_array_elements(p_mistakes)
          ON CONFLICT (user_id, question_id) 
          DO UPDATE SET 
            mistake_count = mistake_log.mistake_count + 1,
            last_mistake_at = p_completed_at;
        END IF;

        -- 4. Upsert user performance
        IF p_performances IS NOT NULL AND jsonb_array_length(p_performances) > 0 THEN
          FOR perf IN SELECT * FROM jsonb_array_elements(p_performances)
          LOOP
            INSERT INTO user_performance (user_id, topic_id, total_attempted, total_correct, avg_time_seconds, accuracy, last_attempted)
            VALUES (
              p_user_id, 
              (perf.value->>'topic_id')::TEXT, 
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

        -- 5. Insert achievements
        IF p_achievements IS NOT NULL AND jsonb_array_length(p_achievements) > 0 THEN
          INSERT INTO user_achievements (user_id, badge_type, badge_name, description)
          SELECT p_user_id, (value->>'badge_type')::TEXT, (value->>'badge_name')::TEXT, (value->>'description')::TEXT
          FROM jsonb_array_elements(p_achievements)
          ON CONFLICT (user_id, badge_type) DO NOTHING;
        END IF;

        -- 6. Update user metadata
        UPDATE users SET 
          xp = COALESCE(xp, 0) + p_xp_added,
          streak = COALESCE(p_new_streak, streak),
          trust_score = COALESCE(p_new_trust, trust_score),
          last_active_date = p_completed_at
        WHERE id = p_user_id;

      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('Created updated submit_test_transaction RPC');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

run();
