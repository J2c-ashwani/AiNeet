/**
 * Seed REAL NEET PYQs — Chapter: Microbes in Human Welfare (12th Biology)
 * Usage: node scripts/seed_pyq_microbes_welfare.mjs
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

const CHAPTER_NAME = 'Microbes in Human Welfare';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 12;

const TOPICS = [
    'Microbes in Household & Industrial Product',
    'Microbes in Sewage Treatment',
    'Microbes as Biocontrol Agents'
];

const ANSWER_KEY = {
    1: 'B', 2: 'D', 3: 'A', 4: 'D', 5: 'C', 6: 'B', 7: 'B', 8: 'C', 9: 'D', 10: 'D',
    11: 'D', 12: 'D', 13: 'B', 14: 'C', 15: 'C', 16: 'B', 17: 'C', 18: 'A', 19: 'B'
};

const QUESTIONS = [
    // Microbes in Household & Industrial Product (Q1-13)
    {
        qNo: 1, topic: 'Microbes in Household & Industrial Product', year: '2022',
        text: 'Identify the microorganism which is responsible for the production of an immunosuppressive molecule cyclosporin A:',
        A: 'Streptococcus cerevisiae', B: 'Trichoderma polysporum', C: 'Clostridium butylicum', D: 'Aspergillus niger'
    },
    {
        qNo: 2, topic: 'Microbes in Household & Industrial Product', year: '2021',
        text: 'Match List-I with List-II.\nList-I (A. Aspergillus niger, B. Acetobacter aceti, C. Clostridium butylicum, D. Lactobacillus)\nList-II (i. Acetic Acid, ii. Lactic Acid, iii. Citric Acid, iv. Butyric acid)\nChoose the correct answer from the options given below.',
        A: 'A-i B-ii C-iii D-iv', B: 'A-ii B-iii C-i D-iv', C: 'A-iv B-ii C-i D-iii', D: 'A-iii B-i C-iv D-ii'
    },
    {
        qNo: 3, topic: 'Microbes in Household & Industrial Product', year: '2020',
        text: 'Match the following columns and select the correct option.\nColumn-I (1. Clostridium butylicum, 2. Trichoderma polysporum, 3. Monascus purpureus, 4. Aspergillus niger)\nColumn-II (i. Cyclosporin-A, ii. Butyric acid, iii. Citric acid, iv. Blood cholesterol lowering agent)',
        A: '(ii) (i) (iv) (iii)', B: '(i) (ii) (iv) (iii)', C: '(iv) (iii) (ii) (i)', D: '(iii) (iv) (ii) (i)'
    },
    {
        qNo: 4, topic: 'Microbes in Household & Industrial Product', year: '2020',
        text: 'For the commercial and industrial production of Citric Acid, which of the following microbes is used?',
        A: 'Lactobacillus sp', B: 'Saccharomyces cerevisiae', C: 'Clostridium butylicum', D: 'Aspergillus niger'
    },
    {
        qNo: 5, topic: 'Microbes in Household & Industrial Product', year: '2020',
        text: 'Cyclosporin A, used as immuno-suppression agent, is produced from:',
        A: 'Saccharomyces cerevisiae', B: 'Penicillium notatum', C: 'Trichoderma polysporum', D: 'Monascus purpureus'
    },
    {
        qNo: 6, topic: 'Microbes in Household & Industrial Product', year: '2019',
        text: 'Match the following organisms with the products they produce\nA. Lactobacillus -> i. Cheese\nB. Saccharomyces cerevisiae -> ii. Curd\nC. Aspergillus niger -> iii. Citric Acid\nD. Acetobacter aceti -> iv. Bread\n-> v. Acetic Acid\nSelect the correct option.',
        A: '(ii) (iv) (v) (iii)', B: '(ii) (iv) (iii) (v)', C: '(iii) (iv) (v) (i)', D: '(ii) (i) (iii) (v)'
    },
    {
        qNo: 7, topic: 'Microbes in Household & Industrial Product', year: '2019',
        text: 'Which of the following is a commercial blood cholesterol lowering agent?',
        A: 'Cyclosporin A', B: 'Statin', C: 'Streptokinase', D: 'Lipases'
    },
    {
        qNo: 8, topic: 'Microbes in Household & Industrial Product', year: '2018',
        text: 'Conversion of milk to curd improves its nutritional value by increasing the amount of:',
        A: 'Vitamin D', B: 'Vitamin A', C: 'Vitamin B12', D: 'Vitamin E'
    },
    {
        qNo: 9, topic: 'Microbes in Household & Industrial Product', year: '2017',
        text: 'Which of the following is correctly matched for the product produced by them?',
        A: 'Acetobacter aceti : Antibiotics', B: 'Methanobacterium : Lactic acid', C: 'Penicillium notatum : Acetic acid', D: 'Saccharomyces cerevisiae : Ethanol'
    },
    {
        qNo: 10, topic: 'Microbes in Household & Industrial Product', year: '2016',
        text: 'Match Column-I with Column-II and select the correct option using the codes given below\nColumn-I (A. Citric acid, B. Cyclosporin A, C. Statins, D. Butyric acid)\nColumn-II (i. Trichoderma, ii. Clostridium, iii. Aspergillus, iv. Monascus)',
        A: 'A-i B-iv C-ii D-iii', B: 'A-iii B-iv C-i D-ii', C: 'A-iii B-i C-ii D-iv', D: 'A-iii B-i C-iv D-ii'
    },
    {
        qNo: 11, topic: 'Microbes in Household & Industrial Product', year: '2016',
        text: 'Which of the following is wrongly matched in the given table?\nMicrobe | Product | Application',
        A: 'Trichoderma | Cyclosporin A | Immunosuppressive drug', B: 'Monascus | Statins | Lowering of blood cholesterol', C: 'Streptococcus | Streptokinase | Removal of clot from blood vessel', D: 'Clostridium butylicum | Lipase | Removal of oil stains'
    },
    {
        qNo: 12, topic: 'Microbes in Household & Industrial Product', year: '2015',
        text: 'Match the following list of microbes and their importance:\nA. Saccharomyces cerevisiae -> i. Production of immunosuppressive agents\nB. Monascus purpureus -> ii. Ripening of Swiss cheese\nC. Trichoderma polysporum -> iii. Commercial production of ethanol\nD. Propionibacterium sharmanii -> iv. Production of blood cholesterol lowering agents',
        A: 'A-iv B-iii C-ii D-i', B: 'A-iv B-ii C-i D-iii', C: 'A-iii B-i C-iv D-ii', D: 'A-iii B-iv C-i D-ii'
    },
    {
        qNo: 13, topic: 'Microbes in Household & Industrial Product', year: '2013',
        text: 'A good producer of citric acid is:',
        A: 'Saccharomyces', B: 'Aspergillus', C: 'Pseudomonas', D: 'Clostridium'
    },
    // Microbes in Sewage Treatment (Q14-16)
    {
        qNo: 14, topic: 'Microbes in Sewage Treatment', year: '2020',
        text: 'Which of the following is put into Anaerobic sludge digester for further sewage treatment?',
        A: 'Floating debris', B: 'Effluents of primary treatment', C: 'Activated sludge', D: 'Primary sludge'
    },
    {
        qNo: 15, topic: 'Microbes in Sewage Treatment', year: '2017',
        text: 'Which of the following in sewage treatment removes suspended solids?',
        A: 'Tertiary treatment', B: 'Secondary treatment', C: 'Primary treatment', D: 'Sludge treatment'
    },
    {
        qNo: 16, topic: 'Microbes in Sewage Treatment', year: '2013',
        text: 'During sewage treatment, biogases are produced which include:',
        A: 'Hydrogen sulphide, nitrogen, methane', B: 'Methane, hydrogen sulphide, carbon dioxide', C: 'Methane, oxygen, hydrogen sulphide', D: 'Hydrogen sulphide, methane, sulphur dioxide'
    },
    // Microbes as Biocontrol Agents (Q17-19)
    {
        qNo: 17, topic: 'Microbes as Biocontrol Agents', year: '2020',
        text: 'Match the following columns and select the correct option:\nColumn-I (1. Dragonflies, 2. Bacillus thuringiensis, 3. Glomus, 4. Baculoviruses)\nColumn-II (i. Biocontrol agents of several plant pathogens, ii. Get rid of Aphids and mosquitoes, iii. Narrow spectrum insecticidal applications, iv. Biocontrol agents of lepidopteran plant pests, v. Absorb phosphorus from soil)',
        A: '(ii) (i) (iii) (iv)', B: '(ii) (iii) (iv) (v)', C: '(ii) (iv) (v) (iii)', D: '(iii) (v) (iv) (i)'
    },
    {
        qNo: 18, topic: 'Microbes as Biocontrol Agents', year: '2019',
        text: 'Which of the following can be used as a biocontrol agent in the treatment of plant disease?',
        A: 'Trichoderma', B: 'Chlorella', C: 'Anabaena', D: 'Lactobacillus'
    },
    {
        qNo: 19, topic: 'Microbes as Biocontrol Agents', year: '2019',
        text: 'Select the correct group of biocontrol agents.',
        A: 'Bacillus thuringiensis, Tobacco mosaic virus, Aphids', B: 'Trichoderma, Baculovirus, Bacillus thuringiensis', C: 'Oscillatoria, Rhizobium, Trichoderma', D: 'Nostoc, Azospirillium, Nucleopolyhedrovirus'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME, '(Class 12)');

    // Microbes in Human Welfare is Chapter 10 in NCERT Biology Class 12
    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME.split(' ').slice(0, 2).join('%')}%`, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 10]);
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
