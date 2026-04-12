import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    const client = await pool.connect();
    try {
        console.log('🏫 Architecting B2B Educator Scaling Engine...');

        await client.query('BEGIN');

        // 1. Core Profile Evolution
        console.log('-> Adding role to users...');
        await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student';
        `);

        // 2. Strict Linkage Schema
        console.log('-> Creating classrooms boundaries...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS classrooms (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                teacher_id TEXT NOT NULL,
                name TEXT NOT NULL,
                join_code VARCHAR(8) UNIQUE NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS classroom_students (
                classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
                student_id TEXT NOT NULL,
                joined_via_code TEXT,
                joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(classroom_id, student_id)
            );
        `);

        await client.query(`CREATE INDEX IF NOT EXISTS idx_class_join_code ON classrooms(join_code);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_class_stud_class ON classroom_students(classroom_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_class_stud_stud ON classroom_students(student_id);`);

        // 3. The Analytics Aggregation Engine (Supabase RPC)
        console.log('-> Compiling Native JSON Aggregation RPC...');
        await client.query(`
            CREATE OR REPLACE FUNCTION get_classroom_analytics(target_class_id UUID, days_limit INTEGER DEFAULT 7)
            RETURNS JSON AS $$
            DECLARE
              payload JSON;
            BEGIN
              WITH ClassStudents AS (
                  SELECT student_id FROM classroom_students WHERE classroom_id = target_class_id
              ),
              MacroAccuracy AS (
                  SELECT 
                     ROUND(COALESCE(AVG(accuracy), 0)::numeric, 1) as avg_accuracy,
                     COUNT(*) as total_tests
                  FROM user_performance p
                  JOIN ClassStudents cs ON p.user_id = cs.student_id
                  WHERE p.last_attempted >= NOW() - (days_limit || ' days')::INTERVAL
              ),
              WeakTopics AS (
                  SELECT 
                      t.name as topic_name,
                      ROUND(AVG(p.accuracy)::numeric, 1) as avg_accuracy,
                      SUM(p.total_attempted) as total_attempts
                  FROM user_performance p
                  JOIN ClassStudents cs ON p.user_id = cs.student_id
                  JOIN topics t ON p.topic_id::varchar = t.id::varchar
                  WHERE p.last_attempted >= NOW() - (days_limit || ' days')::INTERVAL
                  GROUP BY t.id, t.name
                  HAVING SUM(p.total_attempted) > 10
                  ORDER BY avg_accuracy ASC
                  LIMIT 3
              ),
              Leaderboard AS (
                  SELECT 
                      u.id,
                      u.name,
                      u.xp,
                      u.trust_score
                  FROM users u
                  JOIN ClassStudents cs ON u.id = cs.student_id
                  ORDER BY u.xp DESC
                  LIMIT 50
              )
              SELECT json_build_object(
                  'macro', (SELECT row_to_json(m) FROM MacroAccuracy m),
                  'weakTopics', (SELECT COALESCE(json_agg(w), '[]'::json) FROM WeakTopics w),
                  'leaderboard', (SELECT COALESCE(json_agg(l), '[]'::json) FROM Leaderboard l)
              ) INTO payload;

              RETURN payload;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
        `);

        await client.query('COMMIT');
        console.log('✅ Phase 3 B2B Migration Complete.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration Error:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
