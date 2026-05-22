const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    family: 4, // force IPv4 — GitHub Actions ENETUNREACH on IPv6 Supabase hosts
});

async function auditAcademics() {
    const client = await pool.connect();
    try {
        console.log('📚 Starting Academic Integrity Audit...\n');

        // 1. Completed tests with zero attached answers
        console.log('-> Checking for completed tests with 0 answers (Orphan Tests)...');
        const orphanTests = await client.query(`
            SELECT t.id, t.user_id, t.completed_at
            FROM tests t
            LEFT JOIN test_answers ta ON t.id = ta.test_id
            WHERE t.completed_at IS NOT NULL
            GROUP BY t.id, t.user_id, t.completed_at
            HAVING COUNT(ta.id) = 0
        `);
        if (orphanTests.rows.length > 0) {
            console.error(`   ❌ Found ${orphanTests.rows.length} completed tests with ZERO answers!`);
        } else {
            console.log('   ✅ Clean: All completed tests have answers.');
        }

        // 2. Test completions without associated analytics/performance rows
        console.log('\n-> Checking for missing performance aggregates...');
        const missingPerf = await client.query(`
            SELECT t.id, t.user_id
            FROM tests t
            LEFT JOIN test_answers ta ON t.id = ta.test_id
            LEFT JOIN user_performance up ON t.user_id = up.user_id AND up.topic_id IN (
                SELECT q.topic_id FROM questions q WHERE q.id = ta.question_id
            )
            WHERE t.completed_at IS NOT NULL AND up.id IS NULL
            GROUP BY t.id, t.user_id
        `);
        if (missingPerf.rows.length > 0) {
            console.error(`   ❌ Found ${missingPerf.rows.length} tests lacking corresponding performance updates!`);
        } else {
            console.log('   ✅ Clean: All tests successfully propagated to analytics.');
        }

        // 3. Orphan performance records not linked to any tests
        console.log('\n-> Checking for orphan performance records...');
        const orphanPerf = await client.query(`
            SELECT up.id, up.user_id, up.topic_id
            FROM user_performance up
            LEFT JOIN users u ON up.user_id = u.id
            WHERE up.total_attempted > 0 
            AND NOT EXISTS (
                SELECT 1 FROM test_answers ta
                JOIN tests t ON ta.test_id = t.id
                JOIN questions q ON ta.question_id = q.id
                WHERE t.user_id = up.user_id AND q.topic_id = up.topic_id
            )
        `);
        if (orphanPerf.rows.length > 0) {
            console.warn(`   ⚠️ Found ${orphanPerf.rows.length} performance records with no matching test history (Possible manual XP injection or corrupted deletion).`);
        } else {
            console.log('   ✅ Clean: No orphan performance records.');
        }

        // 4. XP Mismatch check (Negative XP or ridiculously high XP without test history)
        console.log('\n-> Checking for XP mismatch...');
        const xpMismatch = await client.query(`
            SELECT u.id, u.xp, (SELECT COALESCE(SUM(score), 0) FROM tests WHERE user_id = u.id) as total_test_score
            FROM users u
            WHERE u.xp < 0 OR u.xp > ((SELECT COALESCE(SUM(score), 0) FROM tests WHERE user_id = u.id) + 10000)
        `);
        if (xpMismatch.rows.length > 0) {
            console.warn(`   ⚠️ Found ${xpMismatch.rows.length} users with anomalous XP (Possible tampering or glitch).`);
        } else {
            console.log('   ✅ Clean: User XP values are within mathematically expected bounds.');
        }

        // 5. Ranking rows without source tests (e.g. battle_elo without battles)
        console.log('\n-> Checking for ranking rows without source activity...');
        const orphanRank = await client.query(`
            SELECT be.user_id
            FROM battle_elo be
            LEFT JOIN battleground_players bp ON be.user_id = bp.user_id
            GROUP BY be.user_id
            HAVING COUNT(bp.id) = 0
        `);
        if (orphanRank.rows.length > 0) {
            console.error(`   ❌ Found ${orphanRank.rows.length} battle_elo ranking rows with no battle history!`);
        } else {
            console.log('   ✅ Clean: All ranking rows have supporting battle source data.');
        }

        console.log('\n✅ Academic Audit completed.');

    } catch (e) {
        console.error('Academic Audit Error:', e);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

auditAcademics();
