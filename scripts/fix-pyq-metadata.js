const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL.replace(':5432/', ':6543/') + '?pgbouncer=true',
    ssl: { rejectUnauthorized: false },
    family: 4
});

async function run() {
    const client = await pool.connect();
    try {
        console.log('🔍 Scanning database for demoted PYQs to restore...');

        // Find all questions that might be PYQs but don't have metadata
        const { rows } = await client.query(`
            SELECT id, text FROM questions 
            WHERE (is_pyq = 0 OR is_pyq = 1) 
              AND (exam_name IS NULL OR year_asked IS NULL)
              AND text ILIKE '%(20%' 
        `);

        console.log(`Found ${rows.length} candidate questions to inspect.`);

        let restored = 0;

        for (const row of rows) {
            let examName = 'NEET'; // Default
            let yearAsked = null;

            // Extract Year (e.g., "(2022)")
            const yearMatch = row.text.match(/\b(19\d{2}|20\d{2})\b/);
            if (yearMatch) {
                yearAsked = yearMatch[1];
            }

            // Extract Exam (e.g., "AIPMT", "AIIMS")
            if (row.text.match(/AIPMT/i)) examName = 'AIPMT';
            else if (row.text.match(/AIIMS/i)) examName = 'AIIMS';
            else if (row.text.match(/JIPMER/i)) examName = 'JIPMER';
            else if (row.text.match(/NEET/i)) examName = 'NEET';

            if (yearAsked) {
                // Remove the "(2022)" and "Chapter & Topicwise NEET PYQ's P W 2" from the text
                let cleanText = row.text
                    .replace(/\(\d{4}\)/, '')
                    .replace(/Chapter & Topicwise NEET PYQ['’]s P W \d+/i, '')
                    .replace(/C H A P T E R.*?(?=Chapter &)/i, '')
                    .trim();

                await client.query(`
                    UPDATE questions
                    SET is_pyq = 1,
                        exam_name = $1,
                        year_asked = $2,
                        text = $3
                    WHERE id = $4
                `, [examName, yearAsked, cleanText, row.id]);
                restored++;
            }
        }

        console.log(`✅ Successfully restored and cleaned metadata for ${restored} PYQs!`);

    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
