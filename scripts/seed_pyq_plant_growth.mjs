/**
 * Seed REAL NEET PYQs — Chapter: Plant Growth and Development (11th Biology)
 * Usage: node scripts/seed_pyq_plant_growth.mjs
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

const CHAPTER_NAME = 'Plant Growth and Development';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Growth',
    'Differentiation, Dedifferentiation, Redifferentiation and Development',
    'Plant Growth Regulators',
    'Photoperiodism, Vernalisation, Seed Dormancy'
];

const ANSWER_KEY = {
    1: 'D', 2: 'C', 3: 'A', 4: 'B', 5: 'D', 6: 'C', 7: 'B', 8: 'A', 9: 'B', 10: 'D',
    11: 'A', 12: 'C', 13: 'D', 14: 'C', 15: 'B', 16: 'D', 17: 'B', 18: 'B', 19: 'A', 20: 'C',
    21: 'D', 22: 'B', 23: 'D', 24: 'D'
};

const QUESTIONS = [
    // Growth (Q1-2)
    {
        qNo: 1, topic: 'Growth', year: '2020',
        text: 'The process of growth is maximum during:',
        A: 'Lag phase', B: 'Senescence', C: 'Dormancy', D: 'Log phase'
    },
    {
        qNo: 2, topic: 'Growth', year: '2015',
        text: 'Typical growth curve in plants is:',
        A: 'Stair-steps shaped', B: 'Parabolic', C: 'Sigmoid', D: 'Linear'
    },
    // Differentiation, Dedifferentiation, Redifferentiation and Development (Q3-4)
    {
        qNo: 3, topic: 'Differentiation, Dedifferentiation, Redifferentiation and Development', year: '2022',
        text: 'Which one of the following plants does not show plasticity?',
        A: 'Maize', B: 'Cotton', C: 'Coriander', D: 'Buttercup'
    },
    {
        qNo: 4, topic: 'Differentiation, Dedifferentiation, Redifferentiation and Development', year: '2021',
        text: 'Plants follow different pathways in response to environment or phase of life to form different kinds of structures. This ability is called:',
        A: 'Flexibility', B: 'Plasticity', C: 'Maturity', D: 'Elasticity'
    },
    // Plant Growth Regulators (Q5-19)
    {
        qNo: 5, topic: 'Plant Growth Regulators', year: '2022',
        text: 'Production of Cucumber has increased manifold in recent years. Application of which of the following phytohormones has resulted in this increased yield as the hormone is known to produce female flowers in the plants:',
        A: 'Cytokinin', B: 'ABA', C: 'Gibberellin', D: 'Ethylene'
    },
    {
        qNo: 6, topic: 'Plant Growth Regulators', year: '2022',
        text: 'The gaseous plant growth regulator is used in plants to:',
        A: 'Kill dicotyledonous weeds in the fields', B: 'Speed up the malting process', C: 'Promote root growth and root hair formation to increase the absorption surface', D: 'Help overcome apical dominance'
    },
    {
        qNo: 7, topic: 'Plant Growth Regulators', year: '2021',
        text: 'The plant hormone used to destroy weeds in a field is:',
        A: 'NAA', B: '2, 4-D', C: 'IBA', D: 'IAA'
    },
    {
        qNo: 8, topic: 'Plant Growth Regulators', year: '2020',
        text: 'Name the plant growth regulator which upon spraying on sugarcane crop, increases the length of stem, thus increasing the yield of sugarcane crop.',
        A: 'Gibberellin', B: 'Ethylene', C: 'Abscisic acid', D: 'Cytokinin'
    },
    {
        qNo: 9, topic: 'Plant Growth Regulators', year: '2020',
        text: 'Match the following concerning the activity/function and the phytohormone involved.\n1. Fruit ripener -> (i) Abscisic acid\n2. Herbicide -> (ii) GA3\n3. Bolting agent -> (iii) 2, 4-D\n4. Stress hormone -> (iv) Ethephon\nSelect the correct option from following:',
        A: '1-iii 2-iv 3-ii 4-i', B: '1-iv 2-iii 3-ii 4-i', C: '1-iv 2-ii 3-i 4-iii', D: '1-ii 2-iii 3-iv 4-i'
    },
    {
        qNo: 10, topic: 'Plant Growth Regulators', year: '2020',
        text: 'Who coined the term \'Kinetin\'?',
        A: 'Darwin', B: 'Went', C: 'Kurosawa', D: 'Skoog and Miller'
    },
    {
        qNo: 11, topic: 'Plant Growth Regulators', year: '2019',
        text: 'It takes very long time for pineapple plants to produce flowers. Which combination of hormones can be applied to artificially induce flowering in pineapple plants throughout the year to increase yield?',
        A: 'Auxin and Ethylene', B: 'Gibberellin and Cytokinin', C: 'Gibberellin and Abscisic acid', D: 'Cytokinin and Abscisic acid'
    },
    {
        qNo: 12, topic: 'Plant Growth Regulators', year: '2017',
        text: 'Fruit and leaf drop at early stages can be prevented by the application of:',
        A: 'Cytokinins', B: 'Ethylene', C: 'Auxins', D: 'Gibberellic acid'
    },
    {
        qNo: 13, topic: 'Plant Growth Regulators', year: '2016',
        text: 'You are given a tissue with its potential for differentiation in an artificial culture. Which of the following pairs of hormones would you add to the medium to secure shoots as well as roots?',
        A: 'Auxin and Abscisic acid', B: 'Gibberellin and Abscisic acid', C: 'IAA and Gibberellin', D: 'Auxin and Cytokinin'
    },
    {
        qNo: 14, topic: 'Plant Growth Regulators', year: '2016',
        text: 'The Avena curvature is used for bioassay of:',
        A: 'ABA', B: 'GA', C: 'IAA', D: 'Ethylene'
    },
    {
        qNo: 15, topic: 'Plant Growth Regulators', year: '2015',
        text: 'What causes a green plant exposed to the light on only one side, to bend toward the source of light as it grows?',
        A: 'Light stimulates plant cells on the lighted side to grow faster.', B: 'Auxin accumulates on the shaded side, stimulating greater cell elongation there.', C: 'Green plants need light to perform photosynthesis.', D: 'Green plants seek light because they are phototropic.'
    },
    {
        qNo: 16, topic: 'Plant Growth Regulators', year: '2015',
        text: 'Auxin can be bioassay by:',
        A: 'Hydroponics', B: 'Potometer', C: 'Lettuce hypocotyl elongation', D: 'Avena coleoptile curvature'
    },
    {
        qNo: 17, topic: 'Plant Growth Regulators', year: '2014',
        text: 'Dr. F. Went noted that if coleoptile tips were removed and placed on agar for one hour, the agar would produce a bending when placed on one side of freshly cut coleoptile stumps. Of what significance is this experiment?',
        A: 'It demonstrated polar movement of auxins', B: 'It made possible the isolation and exact identification of auxin', C: 'It is the basis for quantitative determination of small amounts of growth-promoting substances', D: 'It supports the hypothesis that IAA is auxin'
    },
    {
        qNo: 18, topic: 'Plant Growth Regulators', year: '2014',
        text: 'Which one of the following growth regulators is known as ‘stress hormone’?',
        A: 'Indole acetic acid', B: 'Abscisic acid', C: 'Ethylene', D: 'GA3'
    },
    {
        qNo: 19, topic: 'Plant Growth Regulators', year: '2013',
        text: 'During seed germination its stored food is mobilised by:',
        A: 'Gibberellin', B: 'Ethylene', C: 'Cytokinin', D: 'ABA'
    },
    // Photoperiodism, Vernalisation, Seed Dormancy (Q20-24)
    {
        qNo: 20, topic: 'Photoperiodism, Vernalisation, Seed Dormancy', year: '2021',
        text: 'The site of perception of light in plants during photoperiodism is:',
        A: 'Stem', B: 'Axillary bud', C: 'Leaf', D: 'Shoot apex'
    },
    {
        qNo: 21, topic: 'Photoperiodism, Vernalisation, Seed Dormancy', year: '2020',
        text: 'Which of the following is not an inhibitory substance governing seed dormancy?',
        A: 'Abscisic acid', B: 'Phenolic acid', C: 'Para-ascorbic acid', D: 'Gibberellic acid'
    },
    {
        qNo: 22, topic: 'Photoperiodism, Vernalisation, Seed Dormancy', year: '2020',
        text: 'Inhibitory substances in dormant seeds cannot be removed by subjecting seeds to:',
        A: 'Nitrate', B: 'Ascorbic acid', C: 'Chilling conditions', D: 'Gibberellic acid'
    },
    {
        qNo: 23, topic: 'Photoperiodism, Vernalisation, Seed Dormancy', year: '2019',
        text: 'What is the site of perception of photoperiod necessary for induction of flowering in plants?',
        A: 'Lateral buds', B: 'Pulvinus', C: 'Shoot apex', D: 'Leaves'
    },
    {
        qNo: 24, topic: 'Photoperiodism, Vernalisation, Seed Dormancy', year: '2014',
        text: 'A few normal seedlings of tomato were kept in a dark room. After a few days they were found to have become white-colored like albinos. Which of the following terms will you use to describe them?',
        A: 'Defoliated', B: 'Mutated', C: 'Embolised', D: 'Etiolated'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME);

    // Plant Growth and Development is Chapter 15 in NCERT Biology Class 11
    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME.split(' ').slice(0, 2).join('%')}%`, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 14]);
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
        let correctAnswer = ANSWER_KEY[q.qNo];
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
