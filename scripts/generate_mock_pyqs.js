const Database = require('better-sqlite3');
const path = require('path');

// Run this as: node scripts/generate_mock_pyqs.js

// We need to import the CommonJS version of Blueprint data since this is a Node script.
// But NEET_BLUEPRINT is in an ES module (lib/ncert-data.js). 
// Let's just define the bare minimum we need here to generate them.

// To avoid parsing the ES module, I will read the DB topics and generate PYQs for them.
const dbPath = path.join(process.cwd(), 'neet-coach.db');
const db = new Database(dbPath);

console.log('📚 Generating realistic Mock PYQs based on syllabus for 2021-2024...');

// 1. Get all topics mapped to chapters and subjects
const topics = db.prepare(`
    SELECT t.id as topic_id, t.name as topic_name, 
           c.id as chapter_id, c.name as chapter_name,
           s.id as subject_id, s.name as subject_name
    FROM topics t
    JOIN chapters c ON t.chapter_id = c.id
    JOIN subjects s ON c.subject_id = s.id
`).all();

const years = ['2021', '2022', '2023', '2024'];
const difficulties = ['easy', 'medium', 'hard'];

let insertedCount = 0;

const insertStatement = db.prepare(`
    INSERT INTO questions (
        topic_id, chapter_id, subject_id, 
        text, option_a, option_b, option_c, option_d, 
        correct_option, difficulty, explanation, 
        is_pyq, year_asked, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
`);

db.transaction(() => {
    // For each topic, let's generate 1-3 questions per year
    for (const topic of topics) {
        // More questions for biology, slightly less for physics/chem to loosely match 90/45/45 ratio
        const questionsPerYear = topic.subject_name.toLowerCase() === 'biology' ? 2 : 1;

        for (const year of years) {
            for (let i = 0; i < questionsPerYear; i++) {
                const diff = difficulties[Math.floor(Math.random() * difficulties.length)];
                const options = ['A', 'B', 'C', 'D'];
                const correctOpt = options[Math.floor(Math.random() * options.length)];

                // Add a little randomness so it looks organic if we had a full set,
                // but we constrain it so there's always representational data.
                // 10% chance to skip to create natural variance in the blueprint
                if (Math.random() < 0.1) continue;

                insertStatement.run(
                    topic.topic_id,
                    topic.chapter_id,
                    topic.subject_id,
                    `[NEET ${year}] Which of the following is true regarding ${topic.topic_name.toLowerCase()}?`, // generic text
                    'Statement A is correct',
                    'Statement B is correct',
                    'Statement C is correct',
                    'Statement D is correct',
                    correctOpt,
                    diff,
                    `Explanation for ${topic.topic_name} from NEET ${year} paper.`,
                    year,
                    'pyq,mock'
                );
                insertedCount++;
            }
        }
    }
})();

const finalPyqCount = db.prepare('SELECT COUNT(*) as c FROM questions WHERE is_pyq = 1').get().c;

console.log(`✅ Successfully generated ${insertedCount} mock PYQs for 2021-2024.`);
console.log(`📊 Total PYQs in database: ${finalPyqCount}`);
db.close();
