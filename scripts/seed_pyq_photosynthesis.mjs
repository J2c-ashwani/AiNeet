/**
 * Seed REAL NEET PYQs — Chapter: Photosynthesis in Higher Plants (11th Biology)
 * Usage: node scripts/seed_pyq_photosynthesis.mjs
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

const CHAPTER_NAME = 'Photosynthesis in Higher Plants';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Experiments of Photosynthesis',
    'Location & Pigments of Photosynthesis',
    'Light Reaction & Electron Transport',
    'Where are ATP & NADPH Used?',
    'C4 Pathway & Photorespiration',
    'Factors Affecting Photosynthesis'
];

const ANSWER_KEY = {
    1: 'B', 2: 'C', 3: 'B', 4: 'B', 5: 'D', 6: 'B', 7: 'C', 8: 'C', 9: 'D', 10: 'A',
    11: 'B', 12: 'C', 13: 'B', 14: 'A', 15: 'A', 16: 'A', 17: 'B', 18: 'A', 19: 'B', 20: 'C'
};

const QUESTIONS = [
    // Experiments of Photosynthesis (Q1)
    {
        qNo: 1, topic: 'Experiments of Photosynthesis', year: '2014',
        text: 'Anoxygenic photosynthesis is characteristic of:',
        A: 'Ulva', B: 'Rhodospirillum', C: 'Spirogyra', D: 'Chlamydomonas'
    },
    // Location & Pigments of Photosynthesis (Q2-7)
    {
        qNo: 2, topic: 'Location & Pigments of Photosynthesis', year: '2021',
        text: 'Which of the following statements is incorrect?',
        A: 'Stroma lamellae have PS I only and lack NADP reductase.', B: 'Grana lamellae have both PS I and PS II.', C: 'Cyclic photophosphorylation involves both PS I and PS II.', D: 'Both ATP and NADPH + H+ are synthesized during non-cyclic photophosphorylation.'
    },
    {
        qNo: 3, topic: 'Location & Pigments of Photosynthesis', year: '2016',
        text: 'Phytochrome is a:',
        A: 'Lipoprotein', B: 'Chromoprotein', C: 'Flavoprotein', D: 'Glycoprotein'
    },
    {
        qNo: 4, topic: 'Location & Pigments of Photosynthesis', year: '2016',
        text: 'In a chloroplast the highest number of protons are found in:',
        A: 'Stroma', B: 'Lumen of thylakoid', C: 'Inter membranal space', D: 'Antennae complex'
    },
    {
        qNo: 5, topic: 'Location & Pigments of Photosynthesis', year: '2016',
        text: 'Water soluble pigments found in plant cell vacuoles are:',
        A: 'Xanthophylls', B: 'Chlorophylls', C: 'Carotenoids', D: 'Anthocyanins'
    },
    {
        qNo: 6, topic: 'Location & Pigments of Photosynthesis', year: '2016',
        text: 'Emerson’s enhancement effect and Red drop have been instrumental in the discovery of:',
        A: 'Photophosphorylation and non-cyclic electron transport', B: 'Two photosystem operating simultaneously', C: 'Photophosphorylation and cyclic electron transport', D: 'Oxidative phosphorylation'
    },
    {
        qNo: 7, topic: 'Location & Pigments of Photosynthesis', year: '2015',
        text: 'In photosynthesis, the light-independent reactions take place at:',
        A: 'Photosystem-I', B: 'Photosystem-II', C: 'Stromal matrix', D: 'Thylakoid lumen'
    },
    // Light Reaction & Electron Transport (Q8-10)
    {
        qNo: 8, topic: 'Light Reaction & Electron Transport', year: '2022',
        text: 'Which one of the following is not true regarding the release of energy during ATP synthesis through chemiosmosis? It involves:',
        A: 'Reduction of NADP to NADPH on the stroma side of the membrane', B: 'Breakdown of proton gradient', C: 'Breakdown of electron gradient', D: 'Movement of protons across the membrane to the stroma'
    },
    {
        qNo: 9, topic: 'Light Reaction & Electron Transport', year: '2020',
        text: 'In light reaction, plastoquinone facilitates the transfer of electrons from:',
        A: 'Cytbf complex to PS-I', B: 'PS-I to NADP+', C: 'PS-I to ATP synthase', D: 'PS-II to Cytbf complex'
    },
    {
        qNo: 10, topic: 'Light Reaction & Electron Transport', year: '2020',
        text: 'During non-cyclic photophosphorylation, when electrons are lost from the reaction centre at PS II, what is the source which replaces these electrons?',
        A: 'Water', B: 'Carbon dioxide', C: 'Light', D: 'Oxygen'
    },
    // Where are ATP & NADPH Used? (Q11)
    {
        qNo: 11, topic: 'Where are ATP & NADPH Used?', year: '2018',
        text: 'Which of the following is not a product of light reaction of photosynthesis?',
        A: 'ATP', B: 'NADH', C: 'NADPH', D: 'Oxygen'
    },
    // C4 Pathway & Photorespiration (Q12-19)
    {
        qNo: 12, topic: 'C4 Pathway & Photorespiration', year: '2022',
        text: 'What is the role of large bundle shealth cells found around the vascular bundles in C4 plants?',
        A: 'To protect the vascular tissue from high light intensity', B: 'To provide the site for photorespiratory pathway', C: 'To increase the number of chloroplast for the operation of Calvin cycle', D: 'To enable the plant to tolerate high temperature'
    },
    {
        qNo: 13, topic: 'C4 Pathway & Photorespiration', year: '2022',
        text: 'Given below are two statements:\nStatement-I: The primary CO2 acceptor in C4 plants is phosphoenolpyruvate and is found in the mesophyll cells.\nStatement-II: Mesophyll cells of C4 plants lack RuBisCO enzyme\nIn the light of the above statements, choose the correct answer from the options given below.',
        A: 'Statement I is incorrect but Statement II is correct', B: 'Both Statement I and Statement II are correct', C: 'Both statement I and statement II are incorrect', D: 'Statement I is correct but Statement II is incorrect'
    },
    {
        qNo: 14, topic: 'C4 Pathway & Photorespiration', year: '2021',
        text: 'The first stable product of CO2 fixation in Sorghum is:',
        A: 'Oxaloacetic acid', B: 'Succinic acid', C: 'Phosphoglyceric acid', D: 'Pyruvic acid'
    },
    {
        qNo: 15, topic: 'C4 Pathway & Photorespiration', year: '2020',
        text: 'The oxygenation activity of RuBisCo enzyme in photorespiration leads to the formation of:',
        A: '1 molecule of 3-C compound', B: '1 molecule of 6-C compound', C: '1 molecule of 4-C compound and 1 molecule of 2-C compound', D: '2 molecules of 3-C compound'
    },
    {
        qNo: 16, topic: 'C4 Pathway & Photorespiration', year: '2020',
        text: 'Which of the following statements is incorrect?',
        A: 'In C4 plants, the site of RuBisCO activity is mesophyll cell', B: 'The substrate molecule for RuBisCO activity is a 5-carbon compound', C: 'RuBisCO action requires ATP and NADPH', D: 'RuBisCO is a bifunctional enzyme'
    },
    {
        qNo: 17, topic: 'C4 Pathway & Photorespiration', year: '2017',
        text: 'Phosphoenol pyruvate (PEP) is the primary CO2 acceptor in:',
        A: 'C3 plants', B: 'C4 plants', C: 'C2 plants', D: 'C3 and C4 plants'
    },
    {
        qNo: 18, topic: 'C4 Pathway & Photorespiration', year: '2016',
        text: 'The process which makes major difference between C3 and C4 plants is:',
        A: 'Photorespiration', B: 'Respiration', C: 'Glycolysis', D: 'Calvin cycle'
    },
    {
        qNo: 19, topic: 'C4 Pathway & Photorespiration', year: '2016',
        text: 'A plant in your garden avoids photorespiratory losses, has improved water use efficiency, shows high rates of photosynthesis at high temperatures and has improved efficiency of nitrogen utilisation. In which of the following physiological groups would you assign this plant?',
        A: 'C3', B: 'C4', C: 'CAM', D: 'Nitrogen fixer'
    },
    // Factors Affecting Photosynthesis (Q20)
    {
        qNo: 20, topic: 'Factors Affecting Photosynthesis', year: '2017',
        text: 'With reference to factors affecting the rate of photosynthesis, which of the following statements is not correct?',
        A: 'Light saturation for CO2 fixation occurs at 10% of full sunlight', B: 'Increasing atmospheric CO2 concentration upto 0.05% can enhance CO2 fixation rate', C: 'C3 plants responds to higher temperatures with enhanced photosynthesis while C4 plants have much lower temperature optimum', D: 'Tomato is a greenhouse crop which can be grown in CO2-enriched atmosphere for higher yield'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME);

    // Photosynthesis in Higher Plants is Chapter 13 in NCERT Biology Class 11
    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME.split(' ').slice(0, 2).join('%')}%`, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 12]);
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
