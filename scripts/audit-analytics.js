const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function auditAnalytics() {
    const client = await pool.connect();
    try {
        console.log('📊 Starting Analytics Truthfulness Audit...\n');

        // 1. Impossible scores
        console.log('-> Checking for impossible scores (Score > Total Marks or Accuracy < 0)...');
        const impossibleScores = await client.query(`
            SELECT id, user_id, score, total_marks
            FROM tests
            WHERE score > total_marks OR score < -180 
            -- Note: lowest possible score is -1/4th of total marks in NEET (-180 for 720 test)
        `);
        if (impossibleScores.rows.length > 0) {
            console.error(`   ❌ Found ${impossibleScores.rows.length} tests with impossible scores!`);
        } else {
            console.log('   ✅ Clean: All scores are mathematically possible.');
        }

        // 2. Aggregate mismatches (Does the sum of correct answers match the performance rows?)
        console.log('\n-> Checking for aggregate performance mismatches...');
        const aggregateMismatches = await client.query(`
            WITH computed_perf AS (
                SELECT 
                    t.user_id,
                    q.topic_id,
                    COUNT(ta.id) as computed_attempted,
                    SUM(CASE WHEN ta.is_correct = 1 THEN 1 ELSE 0 END) as computed_correct
                FROM test_answers ta
                JOIN tests t ON ta.test_id = t.id
                JOIN questions q ON ta.question_id = q.id
                WHERE t.completed_at IS NOT NULL
                GROUP BY t.user_id, q.topic_id
            )
            SELECT up.user_id, up.topic_id, up.total_attempted, up.total_correct,
                   cp.computed_attempted, cp.computed_correct
            FROM user_performance up
            JOIN computed_perf cp ON up.user_id = cp.user_id AND up.topic_id = cp.topic_id
            WHERE up.total_attempted != cp.computed_attempted
               OR up.total_correct != cp.computed_correct
        `);
        if (aggregateMismatches.rows.length > 0) {
            console.warn(`   ⚠️ Found ${aggregateMismatches.rows.length} performance aggregate rows out of sync with raw attempt data!`);
        } else {
            console.log('   ✅ Clean: All performance aggregates match raw test data perfectly.');
        }

        console.log('\n✅ Analytics Audit completed.');

    } catch (e) {
        console.error('Analytics Audit Error:', e);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

auditAnalytics();
