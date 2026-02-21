const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Setup a minimal DB connection that works like lib/db.js
const { Pool } = require('pg');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const isPostgres = !!process.env.DATABASE_URL;

let queryFn;
let pool;
let sqliteDb;

if (isPostgres) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    queryFn = async (sql, params = []) => {
        // Convert ? to $1, $2, etc.
        let i = 1;
        const pgSql = sql.replace(/\?/g, () => `$${i++}`);
        const { rows } = await pool.query(pgSql, params);
        return rows;
    };
} else {
    sqliteDb = new Database(path.join(__dirname, '../neet-coach.db'));
    queryFn = async (sql, params = []) => {
        return sqliteDb.prepare(sql).all(params);
    };
}

async function run() {
    console.log(`📚 Generating Mock PYQs into ${isPostgres ? 'PostgreSQL' : 'SQLite'}...`);

    const topics = await queryFn(`
        SELECT t.id as topic_id, t.name as topic_name, 
               c.id as chapter_id, c.name as chapter_name,
               s.id as subject_id, s.name as subject_name
        FROM topics t
        JOIN chapters c ON t.chapter_id = c.id
        JOIN subjects s ON c.subject_id = s.id
    `);

    const years = ['2021', '2022', '2023', '2024'];
    const difficulties = ['easy', 'medium', 'hard'];

    let insertedCount = 0;

    const sql = `
        INSERT INTO questions (
            topic_id, chapter_id, subject_id, 
            text, option_a, option_b, option_c, option_d, 
            correct_option, difficulty, explanation, 
            is_pyq, year_asked, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `;

    for (const topic of topics) {
        const questionsPerYear = topic.subject_name.toLowerCase() === 'biology' ? 2 : 1;

        for (const year of years) {
            for (let i = 0; i < questionsPerYear; i++) {
                const diff = difficulties[Math.floor(Math.random() * difficulties.length)];
                const options = ['A', 'B', 'C', 'D'];
                const correctOpt = options[Math.floor(Math.random() * options.length)];

                if (Math.random() < 0.1) continue;

                await queryFn(sql, [
                    topic.topic_id,
                    topic.chapter_id,
                    topic.subject_id,
                    `[NEET ${year}] Which of the following is true regarding ${topic.topic_name.toLowerCase()}?`,
                    'Statement A is correct',
                    'Statement B is correct',
                    'Statement C is correct',
                    'Statement D is correct',
                    correctOpt,
                    diff,
                    `Explanation for ${topic.topic_name} from NEET ${year} paper.`,
                    year,
                    'pyq,mock'
                ]);
                insertedCount++;
            }
        }
    }

    const { count } = (await queryFn('SELECT COUNT(*) as count FROM questions WHERE is_pyq = 1'))[0];

    console.log(`✅ Successfully generated ${insertedCount} mock PYQs for 2021-2024.`);
    console.log(`📊 Total PYQs in database: ${count}`);

    if (isPostgres) await pool.end();
    else sqliteDb.close();
}

run().catch(console.error);
