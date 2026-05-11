const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function auditRevision() {
    const client = await pool.connect();
    try {
        console.log('🧠 Starting Revision System Audit...\n');

        // 1. Mistakes logged without corresponding revision cards
        console.log('-> Checking for mistakes without revision cards...');
        const orphanMistakes = await client.query(`
            SELECT m.user_id, m.question_id, m.mistake_count
            FROM mistake_log m
            LEFT JOIN revision_schedule r ON m.user_id = r.user_id AND m.question_id = r.question_id
            WHERE r.id IS NULL
        `);
        if (orphanMistakes.rows.length > 0) {
            console.error(`   ❌ Found ${orphanMistakes.rows.length} mistake logs with no corresponding revision cards!`);
        } else {
            console.log('   ✅ Clean: All mistakes have revision cards.');
        }

        // 2. Revision cards pointing to non-existent questions
        console.log('\n-> Checking for revision cards with invalid questions...');
        const invalidCards = await client.query(`
            SELECT r.id, r.user_id, r.question_id
            FROM revision_schedule r
            LEFT JOIN questions q ON r.question_id::text = q.id::text
            WHERE q.id IS NULL
        `);
        if (invalidCards.rows.length > 0) {
            console.error(`   ❌ Found ${invalidCards.rows.length} revision cards pointing to non-existent questions!`);
        } else {
            console.log('   ✅ Clean: All revision cards point to valid questions.');
        }

        // 3. Impossible intervals
        console.log('\n-> Checking for impossible SM-2 calculations...');
        const badIntervals = await client.query(`
            SELECT id, easiness_factor, interval, repetitions
            FROM revision_schedule
            WHERE easiness_factor < 1.3 OR interval < 0 OR repetitions < 0
        `);
        if (badIntervals.rows.length > 0) {
            console.error(`   ❌ Found ${badIntervals.rows.length} cards with impossible SM-2 values!`);
        } else {
            console.log('   ✅ Clean: All SM-2 values are within mathematically valid bounds.');
        }

        // 4. Duplicate cards
        console.log('\n-> Checking for duplicate revision cards...');
        const duplicateCards = await client.query(`
            SELECT user_id, question_id, count(*)
            FROM revision_schedule
            GROUP BY user_id, question_id
            HAVING count(*) > 1
        `);
        if (duplicateCards.rows.length > 0) {
            console.error(`   ❌ Found ${duplicateCards.rows.length} duplicated revision cards for the same user-question pair!`);
        } else {
            console.log('   ✅ Clean: No duplicate revision cards.');
        }

        console.log('\n✅ Revision Audit completed.');

    } catch (e) {
        console.error('Revision Audit Error:', e);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

auditRevision();
