/**
 * Seed REAL NEET PYQs — Chapter: Excretory Products and their Elimination (11th Biology)
 * Usage: node scripts/seed_pyq_excretory.mjs
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

const CHAPTER_NAME = 'Excretory Products and their Elimination';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Excretory Organs & Human Excretory System',
    'Urine Formation & Function of Tubules',
    'Mechanism of Concentration, Regulation & Micturition',
    'Role of Other Organs & Excretory Disorders',
];

const ANSWER_KEY = {
    1: 'A', 2: 'C', 3: 'B', 4: 'A', 5: 'D',
    6: 'C', 7: 'C', 8: 'C', 9: 'B', 10: 'B',
    11: 'B', 12: 'A', 13: 'C', 14: 'B', 15: 'C',
    16: 'D',
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Excretory Organs & Human Excretory System', year: '2022',
        text: 'Nitrogenous waste is excreted in the form of pellet or paste by',
        A: 'Pavo', B: 'Ornithorhynchus', C: 'Salamandra', D: 'Hippocampus'
    },
    {
        qNo: 2, topic: 'Excretory Organs & Human Excretory System', year: '2016',
        text: 'In mammals, which blood vessel would normally carry largest amount of urea?',
        A: 'Renal Vein', B: 'Dorsal Aorta', C: 'Hepatic Vein', D: 'Hepatic Portal Vein'
    },
    {
        qNo: 3, topic: 'Excretory Organs & Human Excretory System', year: '2013',
        text: 'Figure shows human urinary system with structures labeled A to D. Select option which correctly identifies them and gives their characteristics and/or functions:',
        A: 'D-Cortex - Outer part of kidney and do not contain any part of nephrons.', B: 'A-Adrenal gland - Located at the anterior part of kidney. Secrete catecholamines which stimulate glycogen breakdown.', C: 'B-Pelvis - Broad funnel shaped space inner to hilum, directly connected to loops of Henle\'s.', D: 'C-Medulla - Inner zone of kidney and contains complete nephrons.'
    },
    {
        qNo: 4, topic: 'Urine Formation & Function of Tubules', year: '2017',
        text: 'Which of the following statements is correct?',
        A: 'The ascending limb of loop of Henle is impermeable to water', B: 'The descending limb of loop of Henle is impermeable to water', C: 'The ascending limb of loop of Henle is permeable to water', D: 'The descending limb of loop of Henle is permeable to electrolytes'
    },
    {
        qNo: 5, topic: 'Urine Formation & Function of Tubules', year: '2016',
        text: 'The part of nephron involved in active reabsorption of sodium is:',
        A: "Bowman's capsule", B: "Descending limb of Henle's loop", C: 'Distal convoluted tubule', D: 'Proximal convoluted tubule'
    },
    {
        qNo: 6, topic: 'Urine Formation & Function of Tubules', year: '2015',
        text: 'Removal of proximal convoluted tubule from the nephron will result in:',
        A: 'No change in quality and quantity of urine', B: 'No urine formation', C: 'More diluted urine', D: 'More concentrated urine'
    },
    {
        qNo: 7, topic: 'Mechanism of Concentration, Regulation & Micturition', year: '2020',
        text: 'Select the correct statement:',
        A: 'Angiotensin II is a powerful vasodilator.', B: 'Counter current pattern of blood flow is not observed in vasa recta.', C: 'Reduction in Glomerular Filtration Rate activates JG cells to release renin.', D: 'Atrial Natriuretic Factor increases the blood pressure.'
    },
    {
        qNo: 8, topic: 'Mechanism of Concentration, Regulation & Micturition', year: '2020',
        text: "The increase in osmolarity from outer to inner medullary interstitium is maintained due to:\n(i) Close proximity between Henle's loop and vasa recta\n(ii) Counter current mechanism\n(iii) Selective secretion of HCO₃⁻ and hydrogen ions in PCT\n(iv) Higher blood pressure in glomerular capillaries",
        A: '(iii) and (iv)', B: '(i), (ii) and (iii)', C: '(i) and (ii)', D: 'Only (ii)'
    },
    {
        qNo: 9, topic: 'Mechanism of Concentration, Regulation & Micturition', year: '2019',
        text: 'Which of the following factors is responsible for the formation of concentrated urine?',
        A: 'Low levels of antidiuretic hormone', B: 'Maintaining hyperosmolarity towards inner medullary interstitium in the kidneys.', C: 'Secretion of erythropoietin by Juxtaglomerular complex', D: 'Hydrostatic pressure during glomerular filtration'
    },
    {
        qNo: 10, topic: 'Mechanism of Concentration, Regulation & Micturition', year: '2018',
        text: 'Match the items given in Column-I with those Column-II and select the correct option:\nA. Ultrafiltration → i. Henle\'s loop\nB. Concentration of urine → ii. Ureter\nC. Transport of urine → iii. Urinary bladder\nD. Storage of urine → iv. Malpighian corpuscle\n                          v. Proximal convoluted tubule',
        A: 'A-iv B-v C-ii D-iii', B: 'A-iv B-i C-ii D-iii', C: 'A-v B-iv C-i D-ii', D: 'A-v B-iv C-i D-iii'
    },
    {
        qNo: 11, topic: 'Mechanism of Concentration, Regulation & Micturition', year: '2017',
        text: 'A decrease in blood pressure/volume will not cause the release of',
        A: 'Renin', B: 'Atrial Natriuretic Factor', C: 'Aldosterone', D: 'ADH'
    },
    {
        qNo: 12, topic: 'Mechanism of Concentration, Regulation & Micturition', year: '2015',
        text: 'Which of the following does not favour the formation of large quantities of dilute urine?',
        A: 'Renin', B: 'Atrial-natriuretic factor', C: 'Alcohol', D: 'Caffeine'
    },
    {
        qNo: 13, topic: 'Mechanism of Concentration, Regulation & Micturition', year: '2015',
        text: 'Human urine is usually acidic because:',
        A: 'Excreted plasma proteins are acidic', B: 'Potassium and sodium exchange generates acidity', C: 'Hydrogen ions are actively secreted into the filtrate.', D: 'The sodium transporter exchanges one hydrogen ion for each sodium ion, in peritubular capillaries.'
    },
    {
        qNo: 14, topic: 'Mechanism of Concentration, Regulation & Micturition', year: '2014',
        text: 'Which of the following causes an increase in sodium reabsorption in the distal convoluted tubule?',
        A: 'Decrease in antidiuretic hormone levels', B: 'Increase in aldosterone levels', C: 'Increase in antidiuretic hormone levels', D: 'Decrease in aldosterone levels'
    },
    {
        qNo: 15, topic: 'Role of Other Organs & Excretory Disorders', year: '2019',
        text: 'Use of an artificial kidney during hemodialysis may result in:\nA. Nitrogenous waste build-up in the body\nB. Non-elimination of excess potassium ions\nC. Reduced absorption of calcium ions from gastro-intestinal tract\nD. Reduced RBC production\nWhich of the following option is the most appropriate?',
        A: '(A) and (B) are correct', B: '(B) and (C) are correct', C: '(C) and (D) are correct', D: '(A) and (D) are correct'
    },
    {
        qNo: 16, topic: 'Role of Other Organs & Excretory Disorders', year: '2018',
        text: 'Match the items given in Column-I with those in Column-II:\nA. Glycosuria → i. Accumulation of uric acid in joints\nB. Gout → ii. Mass of crystallised salts within the kidney\nC. Renal calculi → iii. Inflammation in glomeruli\nD. Glomerular nephritis → iv. Presence of glucose in urine',
        A: 'A-iii B-ii C-iv D-i', B: 'A-i B-ii C-iii D-iv', C: 'A-ii B-iii C-i D-iv', D: 'A-iv B-i C-ii D-iii'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME);

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
