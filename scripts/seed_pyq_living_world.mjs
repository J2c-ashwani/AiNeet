/**
 * Seed REAL NEET PYQs — Chapter: The Living World (11th Biology)
 * Usage: node scripts/seed_pyq_living_world.mjs
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function query(sql, params = []) { const { rows } = await pool.query(sql, params); return rows; }

const CHAPTER_NAME = 'The Living World';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Diversity in the Living World',
    'Taxonomic Categories',
    'Taxonomical Aids',
];

const ANSWER_KEY = {
    1: 'B', 2: 'A', 4: 'C', 5: 'C', 6: 'D', 7: 'B', 8: 'D'
};

const QUESTIONS = [
    // Diversity in the Living World (Q1-2)
    {
        qNo: 1, topic: 'Diversity in the Living World', year: '2019',
        text: 'Select the correctly written scientific name of Mango which was first described by Carolus Linnaeus.',
        A: 'Mangifera indica Car. Linn.', B: 'Mangifera indica Linn.', C: 'Mangifera indica', D: 'Mangifera Indica'
    },
    {
        qNo: 2, topic: 'Diversity in the Living World', year: '2016',
        text: 'Study the four statements (A–D) given below and select the two correct ones out of them:\nA. Definition of biological species was given by Ernst Mayr.\nB. Photoperiod does not affect reproduction in plants.\nC. Binomial nomenclature system was given by R.H. Whittaker.\nD. In unicellular organisms, reproduction is synonymous with growth.\nThe two correct statements are',
        A: 'A and D', B: 'A and B', C: 'B and C', D: 'C and D'
    },
    // Taxonomic Categories (Q4-5) - Note Q3 omitted due to no correct option
    {
        qNo: 4, topic: 'Taxonomic Categories', year: '2021',
        text: 'Which one of the following belongs to the family Muscidae?',
        A: 'Grasshopper', B: 'Cockroach', C: 'Housefly', D: 'Fire fly'
    },
    {
        qNo: 5, topic: 'Taxonomic Categories', year: '2016',
        text: 'Match Column–I with Column–II for housefly classification:\nColumn-I (A. Family, B. Order, C. Class, D. Phylum)\nColumn-II (i. Diptera, ii. Arthropoda, iii. Muscidae, iv. Insecta)',
        A: 'A-iv B-iii C-ii D-i', B: 'A-iv B-ii C-i D-iii', C: 'A-iii B-i C-iv D-ii', D: 'A-iii B-ii C-iv D-i'
    },
    // Taxonomical Aids (Q6-8)
    {
        qNo: 6, topic: 'Taxonomical Aids', year: '2018',
        text: 'Match the items given in Column-I with those in Column-II:\nA. Herbarium (i) It is a place having a collection of preserved plants and animals.\nB. Key (ii) A list that enumerates methodically all the species found in an area with brief description aiding identification\nC. Museum (iii) Is a place where dried and pressed plant specimens mounted on sheets are kept.\nD. Catalogue (iv) A booklet containing a list of characters and their alternates which are helpful in identification of various taxa.',
        A: 'A-i B-iv C-iii D-ii', B: 'A-iii B-ii C-i D-iv', C: 'A-ii B-iv C-iii D-i', D: 'A-iii B-iv C-i D-ii'
    },
    {
        qNo: 7, topic: 'Taxonomical Aids', year: '2016',
        text: 'The label of a herbarium sheet does not carry information on:',
        A: 'Local names', B: 'Height of the plant', C: 'Date of collection', D: 'Name of collector'
    },
    {
        qNo: 8, topic: 'Taxonomical Aids', year: '2013',
        text: 'Which one of the following is not a correct statement?',
        A: 'Key is a taxonomic aid for identification of specimens.', B: 'Herbarium houses dried, pressed and preserved plant specimens.', C: 'Botanical gardens have collection of living plants for reference.', D: 'A museum has collection of photographs of plants and animals.'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME);

    // The Living World represents Chapter 1 in NCERT
    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME.split(' ').slice(0, 2).join('%')}%`, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 1]);
    }
    const chapterId = chapter.id;
    console.log(`  Chapter: ${CHAPTER_NAME} (id=${chapterId})`);

    const topicMap = {};
    for (const topicName of TOPICS) {
        let [topic] = await query('SELECT id FROM topics WHERE name = $1 AND chapter_id = $2', [topicName, chapterId]);
        if (!topic) {
            [topic] = await query('INSERT INTO topics (chapter_id, name, weightage) VALUES ($1, $2, $3) RETURNING id', [chapterId, topicName, 1]);
        }
        topicMap[topicName] = topic.id;
        console.log(`  Topic: ${topicName} (id=${topic.id})`);
    }

    const deleted = await query('DELETE FROM questions WHERE chapter_id = $1 AND is_pyq = 1 RETURNING id', [chapterId]);
    console.log(`  🗑️  Deleted ${deleted.length} old PYQs`);

    let inserted = 0;
    for (const q of QUESTIONS) {
        const correctAnswer = ANSWER_KEY[q.qNo];
        const topicId = topicMap[q.topic];
        if (!topicId) { console.error(`  ❌ Topic not found for Q${q.qNo}: "${q.topic}"`); continue; }

        await query(`INSERT INTO questions (topic_id, chapter_id, subject_id, text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, is_pyq, exam_name, year_asked, tags, verification_status, quality_score) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
            [topicId, chapterId, subjectId, q.text, q.A, q.B, q.C, q.D, correctAnswer, 'medium', null, 1, 'NEET', q.year, 'pyq,neet,real', 'verified', 10.0]);
        inserted++;
    }

    console.log(`\n✅ Inserted ${inserted} real NEET PYQs for "${CHAPTER_NAME}"`);

    const topicCounts = await query(`SELECT t.name, COUNT(*) as count FROM questions q JOIN topics t ON q.topic_id = t.id WHERE q.chapter_id = $1 AND q.is_pyq = 1 GROUP BY t.name ORDER BY count DESC`, [chapterId]);
    console.log('\n📋 By topic:');
    for (const tc of topicCounts) console.log(`   ${tc.name}: ${tc.count} questions`);

    await pool.end();
}

run().catch(err => { console.error(err); pool.end(); process.exit(1); });
