/**
 * Seed REAL NEET PYQs — Chapter: Respiration in Plants (11th Biology)
 * Usage: node scripts/seed_pyq_respiration_plants.mjs
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

const CHAPTER_NAME = 'Respiration in Plants';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Glycolysis & Fermentation',
    'Aerobic Respiration',
    'Respiratory Balance Sheet & Amphibolic Pathway',
    'Respiratory Quotient'
];

const ANSWER_KEY = {
    1: 'D', 2: 'A', 3: 'B', 4: 'A', 5: 'A', 6: 'A', 7: 'C', 8: 'B', 9: 'D', 10: 'D',
    11: 'B', 12: 'A', 13: 'B', 14: 'C', 15: 'B'
};

const QUESTIONS = [
    // Glycolysis & Fermentation (Q1-4)
    {
        qNo: 1, topic: 'Glycolysis & Fermentation', year: '2022',
        text: 'What is the net gain of ATP when each molecule of glucose is converted to two molecules of pyruvic acid?',
        A: 'Eight', B: 'Four', C: 'Six', D: 'Two'
    },
    {
        qNo: 2, topic: 'Glycolysis & Fermentation', year: '2022',
        text: 'What amount of energy is released from glucose during lactic acid fermentation?',
        A: 'Less than 7%', B: 'Approximately 15%', C: 'More than 18%', D: 'About 10%'
    },
    {
        qNo: 3, topic: 'Glycolysis & Fermentation', year: '2019',
        text: 'Conversion of glucose to glucose-6-phosphate, the first irreversible reaction of glycolysis, is catalysed by',
        A: 'Aldolase', B: 'Hexokinase', C: 'Enolase', D: 'Phosphofructokinase'
    },
    {
        qNo: 4, topic: 'Glycolysis & Fermentation', year: '2014',
        text: 'In which one of the following processes CO2 is not released?',
        A: 'Lactate fermentation', B: 'Aerobic respiration in plants', C: 'Aerobic respiration in animals', D: 'Alcoholic fermentation'
    },
    // Aerobic Respiration (Q5-12)
    {
        qNo: 5, topic: 'Aerobic Respiration', year: '2021',
        text: 'Which of the following statements is incorrect?',
        A: 'In ETC (Electron Transport Chain), one molecule of NADH + H+ gives rise to 2 ATP molecules, and one FADH2 gives rise to 3 ATP molecules.', B: 'ATP is synthesized through complex V.', C: 'Oxidation - reduction reactions produce proton gradient in respiration.', D: 'During aerobic respiration, role of oxygen is limited to the terminal stage.'
    },
    {
        qNo: 6, topic: 'Aerobic Respiration', year: '2020',
        text: 'The number of substrate level phosphorylations in one turn of citric acid cycle is:',
        A: 'One', B: 'Two', C: 'Three', D: 'Zero'
    },
    {
        qNo: 7, topic: 'Aerobic Respiration', year: '2020',
        text: 'Pyruvate dehydrogenase activity during aerobic respiration requires:',
        A: 'Iron', B: 'Cobalt', C: 'Magnesium', D: 'Calcium'
    },
    {
        qNo: 8, topic: 'Aerobic Respiration', year: '2018',
        text: 'What is the role of NAD+ in cellular respiration?',
        A: 'It functions as an enzyme', B: 'It functions as an electron carrier', C: 'It is a nucleotide source for ATP synthesis', D: 'It is the final electron acceptor for anaerobic respiration'
    },
    {
        qNo: 9, topic: 'Aerobic Respiration', year: '2018',
        text: 'Which of these statements is incorrect?',
        A: 'Enzymes of TCA cycle are present in mitochondrial matrix.', B: 'Glycolysis occurs in cytosol.', C: 'Glycolysis operates as long as it is supplied with NAD+ that can pick up hydrogen atoms.', D: 'Oxidative phosphorylation takes place in outer mitochondrial membrane.'
    },
    {
        qNo: 10, topic: 'Aerobic Respiration', year: '2017',
        text: 'Which statement is wrong for Krebs’ cycle?',
        A: 'There are three points in the cycle where NAD+ is reduced to NADH + H+', B: 'There is one point in the cycle where FAD+ is reduced to FADH2', C: 'During conversion of succinyl CoA to succinic acid, a molecule of GTP is synthesised', D: 'The cycle starts with condensation of acetyl group (acetyl CoA) with pyruvic acid to yield citric acid'
    },
    {
        qNo: 11, topic: 'Aerobic Respiration', year: '2016',
        text: 'Oxidative phosphorylation is:',
        A: 'Addition of phosphate group to ATP.', B: 'Formation of ATP by energy released from electrons removed during substrate oxidation.', C: 'Formation of ATP by transfer of phosphate group from a substrate to ADP', D: 'Oxidation of phosphate group in ATP'
    },
    {
        qNo: 12, topic: 'Aerobic Respiration', year: '2015',
        text: 'Cytochromes are found in:',
        A: 'Cristae of mitochondria', B: 'Lysosomes', C: 'Matrix of mitochondria', D: 'Outer wall of mitochondria'
    },
    // Respiratory Balance Sheet & Amphibolic Pathway (Q13-14)
    {
        qNo: 13, topic: 'Respiratory Balance Sheet & Amphibolic Pathway', year: '2016',
        text: 'Which of the following biomolecules is common to respiration-mediated breakdown of fats, carbohydrates and proteins?',
        A: 'Pyruvic acid', B: 'Acetyl CoA', C: 'Glucose-6-phosphate', D: 'Fructose 1,6-bisphosphate'
    },
    {
        qNo: 14, topic: 'Respiratory Balance Sheet & Amphibolic Pathway', year: '2013',
        text: 'The three boxes in this diagram represent the three major biosynthetic pathways in aerobic respiration. Arrows represent net reactants or products:\n(Image based question: Pathway A -> Pathway B -> Pathway C. Arrows numbered 4, 8, and 12 can all be ___)',
        A: 'FAD+ or FADH2', B: 'NADH', C: 'ATP', D: 'H2O'
    },
    // Respiratory Quotient (Q15)
    {
        qNo: 15, topic: 'Respiratory Quotient', year: '2019',
        text: 'Respiratory Quotient (RQ) value of tripalmitin is',
        A: '0.9', B: '0.7', C: '0.07', D: '0.09'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME);

    // Respiration in Plants is Chapter 14 in NCERT Biology Class 11
    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME.split(' ').slice(0, 2).join('%')}%`, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 13]);
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
