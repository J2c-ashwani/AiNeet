const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    family: 4, // force IPv4 — GitHub Actions ENETUNREACH on IPv6 Supabase hosts
});

async function auditIntelligence() {
    const client = await pool.connect();
    let issuesFound = 0;

    try {
        console.log('🧠 Starting Wave 5 Intelligence Reliability Audit...\n');

        // 1. Duplicate Options (Option A == Option B, etc.)
        console.log('-> Checking for AI hallucinated duplicate options...');
        const dupOptions = await client.query(`
            SELECT id, text 
            FROM questions 
            WHERE 
                option_a = option_b OR option_a = option_c OR option_a = option_d OR
                option_b = option_c OR option_b = option_d OR option_c = option_d
            LIMIT 100
        `);
        if (dupOptions.rows.length > 0) {
            console.error(`   ❌ Found ${dupOptions.rows.length} questions with identical options (LLM corruption).`);
            issuesFound += dupOptions.rows.length;
        } else {
            console.log('   ✅ No option duplication detected.');
        }

        // 2. Empty or generic reasoning
        console.log('\n-> Checking for empty or generic AI reasoning...');
        const genericExpl = await client.query(`
            SELECT id FROM questions
            WHERE explanation IS NULL 
               OR LENGTH(explanation) < 10 
               OR explanation ILIKE '%this is correct because%'
               OR explanation ILIKE '%the correct answer is%'
               OR explanation = option_a OR explanation = option_b OR explanation = option_c OR explanation = option_d
            LIMIT 100
        `);
        if (genericExpl.rows.length > 0) {
            console.warn(`   ⚠️ Found ${genericExpl.rows.length} questions with dangerously generic or missing explanations.`);
            issuesFound += genericExpl.rows.length;
        } else {
            console.log('   ✅ Explanations pass length and uniqueness heuristic.');
        }

        // 3. Explanation contradicts correct_option
        // We do a simple heuristic: if correct_option = 'C' but explanation explicitly says "Option B is correct"
        console.log('\n-> Checking for contradiction between explanation and correct option...');
        const contradiction = await client.query(`
            SELECT id FROM questions
            WHERE (correct_option = 'A' AND explanation ILIKE '%option b is correct%')
               OR (correct_option = 'B' AND explanation ILIKE '%option a is correct%')
               OR (correct_option = 'C' AND explanation ILIKE '%option d is correct%')
               OR (correct_option = 'D' AND explanation ILIKE '%option c is correct%')
            LIMIT 100
        `);
        if (contradiction.rows.length > 0) {
            console.error(`   ❌ Found ${contradiction.rows.length} explanations that contradict the correct_option key!`);
            issuesFound += contradiction.rows.length;
        } else {
            console.log('   ✅ No overt correct_option contradictions found in explanations.');
        }

        // 4. Missing PYQ Metadata
        console.log('\n-> Checking PYQ authenticity metadata...');
        const invalidPyqs = await client.query(`
            SELECT id FROM questions
            WHERE is_pyq = 1 AND (year_asked IS NULL OR exam_name IS NULL)
        `);
        if (invalidPyqs.rows.length > 0) {
            console.error(`   ❌ Found ${invalidPyqs.rows.length} PYQs missing mandatory exam_name or year_asked.`);
            issuesFound += invalidPyqs.rows.length;
        } else {
            console.log('   ✅ All PYQs have valid metadata.');
        }

        // 5. Calibration Drift
        console.log('\n-> Checking for difficulty calibration drift (Elo > 1800 or < 600)...');
        const drift = await client.query(`
            SELECT qd.question_id, qd.difficulty_score, qd.attempts 
            FROM question_difficulty_dynamic qd
            WHERE (qd.difficulty_score > 1800 OR qd.difficulty_score < 600)
              AND qd.attempts < 50
        `);
        if (drift.rows.length > 0) {
            console.warn(`   ⚠️ Found ${drift.rows.length} questions with massive Elo drift on low attempts.`);
            issuesFound += drift.rows.length;
        } else {
            console.log('   ✅ Difficulty calibration bounds are stable.');
        }

        // 6. Text Similarity (Duplicate questions in same topic)
        console.log('\n-> Checking for identical AI question generation in same topic...');
        const dupTexts = await client.query(`
            SELECT topic_id, text, COUNT(*)
            FROM questions
            GROUP BY topic_id, text
            HAVING COUNT(*) > 1
        `);
        if (dupTexts.rows.length > 0) {
            console.error(`   ❌ Found ${dupTexts.rows.length} completely identical question texts generated in the same topic.`);
            issuesFound += dupTexts.rows.length;
        } else {
            console.log('   ✅ No exact text duplicates found within topics.');
        }

        console.log(`\nAudit finished with ${issuesFound} issues flagged.`);

        if (issuesFound > 0) {
            console.log('Please resolve these P0 AI integrity violations before scaling.');
            process.exit(1);
        } else {
            console.log('✅ Intelligence Reliability Audit Passed.');
            process.exit(0);
        }

    } catch (e) {
        console.error('Intelligence Audit Error:', e);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

auditIntelligence();
