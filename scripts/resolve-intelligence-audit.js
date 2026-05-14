const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function resolveIssues() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        console.log('Starting resolution of P0 AI integrity violations...');

        // 1. Delete questions with duplicate options
        const dupOptionsRes = await client.query(`
            DELETE FROM questions 
            WHERE 
                option_a = option_b OR option_a = option_c OR option_a = option_d OR
                option_b = option_c OR option_b = option_d OR option_c = option_d
            RETURNING id;
        `);
        console.log(`✅ Deleted ${dupOptionsRes.rowCount} questions with duplicate options.`);

        // 2. Delete questions with empty or generic reasoning
        const genericExplRes = await client.query(`
            DELETE FROM questions
            WHERE explanation IS NULL 
               OR LENGTH(explanation) < 10 
               OR explanation ILIKE '%this is correct because%'
               OR explanation ILIKE '%the correct answer is%'
               OR explanation = option_a OR explanation = option_b OR explanation = option_c OR explanation = option_d
            RETURNING id;
        `);
        console.log(`✅ Deleted ${genericExplRes.rowCount} questions with generic/missing explanations.`);

        // 3. Delete exact text duplicates (keep one)
        // PostgreSQL specific: delete duplicate rows but keep the one with the MIN(id)
        const dupTextsRes = await client.query(`
            DELETE FROM questions q
            USING (
                SELECT MIN(id) as min_id, topic_id, text
                FROM questions
                GROUP BY topic_id, text
                HAVING COUNT(*) > 1
            ) dup
            WHERE q.topic_id = dup.topic_id 
              AND q.text = dup.text 
              AND q.id > dup.min_id;
        `);
        console.log(`✅ Deleted ${dupTextsRes.rowCount} identically generated duplicate questions.`);

        await client.query('COMMIT');
        console.log('🎉 All P0 AI integrity violations resolved successfully!');

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error resolving issues:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

resolveIssues();
