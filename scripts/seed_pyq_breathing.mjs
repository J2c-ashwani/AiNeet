/**
 * Seed REAL NEET PYQs — Chapter: Breathing and Exchange of Gases (11th Biology)
 * Usage: node scripts/seed_pyq_breathing.mjs
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

const CHAPTER_NAME = 'Breathing and Exchange of Gases';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Mechanism of Breathing',
    'Respiratory Volumes & Capacities',
    'Exchange and Transport of Gases',
    'Regulation & Disorders of Respiratory System',
];

const ANSWER_KEY = {
    1: 'D', 2: 'D', 3: 'C', 4: 'A', 5: 'B',
    6: 'A', 7: 'D', 8: 'D', 9: 'B', 10: 'D',
    11: 'C', 12: 'A', 13: 'B', 14: 'A', 15: 'B',
    16: 'A', 17: 'B', 18: 'B', 19: 'A', 20: 'A',
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Mechanism of Breathing', year: '2020',
        text: 'Select the correct events that occur during inspiration:\n1. Contraction of diaphragm\n2. Contraction of external inter-costal muscles\n3. Pulmonary volume decreases\n4. Intra pulmonary pressure increases',
        A: '(3) and (4)', B: '(1), (2) and (4)', C: 'Only (4)', D: '(1) and (2)'
    },
    {
        qNo: 2, topic: 'Mechanism of Breathing', year: '2016',
        text: 'Lungs do not collapse between breaths and some air always remains in the lungs which can never be expelled because:',
        A: 'There is a positive intrapleural pressure', B: 'Pressure in the lungs is higher than the atmospheric pressure.', C: 'There is a negative pressure in the lungs.', D: 'There is a negative intrapleural pressure pulling at the lung walls'
    },
    {
        qNo: 3, topic: 'Respiratory Volumes & Capacities', year: '2020',
        text: 'The Total Lung Capacity (TLC) is the total volume of air accommodated in the lungs at the end of a forced inspiration. This includes:',
        A: 'RV; ERV; IC and EC', B: 'RV; ERV; VC (Vital Capacity) and FRC (Functional Residual Capacity)', C: 'RV (Residual volume); ERV (Expiratory Reserve Volume); TV (Tidal Volume); and IRV (Inspiratory Reserve Volume)', D: 'RV; IC (Inspiratory Capacity); EC (Expiratory Capacity); and ERV'
    },
    {
        qNo: 4, topic: 'Respiratory Volumes & Capacities', year: '2019',
        text: 'Tidal Volume and Expiratory Reserve Volume of an athlete is 500 mL and 1000 mL, respectively. What will be his Expiratory Capacity if the Residual Volume is 1200 mL?',
        A: '1500 mL', B: '1700 mL', C: '2200 mL', D: '2700 mL'
    },
    {
        qNo: 5, topic: 'Respiratory Volumes & Capacities', year: '2018',
        text: 'Match the items given Column-I with those in Column-II and select the correct option given below:\nA. Tidal volume → i. 2500-3000 mL\nB. Inspiratory Reserve volume → ii. 1100-1200 mL\nC. Expiratory Reserve volume → iii. 500-550 mL\nD. Residual volume → iv. 1000-1100 mL',
        A: 'A-iii B-ii C-i D-iv', B: 'A-iii B-i C-iv D-ii', C: 'A-i B-iv C-ii D-iii', D: 'A-iv B-iii C-ii D-i'
    },
    {
        qNo: 6, topic: 'Respiratory Volumes & Capacities', year: '2017',
        text: 'Lungs are made up of air-filled sacs the alveoli. They do not collapse even after forceful expiration, because of:',
        A: 'Residual Volume', B: 'Inspiratory Reserve Volume', C: 'Tidal Volume', D: 'Expiratory Reserve Volume'
    },
    {
        qNo: 7, topic: 'Exchange and Transport of Gases', year: '2021',
        text: 'Select the favourable conditions required for the formation of oxyhaemoglobin at the alveoli.',
        A: 'Low pO₂, high pCO₂, more H⁺, higher temperature', B: 'High pO₂, high pCO₂, less H⁺, higher temperature', C: 'Low pO₂, low pCO₂, more H⁺, higher temperature', D: 'High pO₂, low pCO₂, less H⁺, lower temperature'
    },
    {
        qNo: 8, topic: 'Exchange and Transport of Gases', year: '2021',
        text: 'The partial pressures (in mm Hg) of oxygen (O₂) and carbon dioxide (CO₂) at alveoli (the site of diffusion) are:',
        A: 'pO₂ = 40 and pCO₂ = 45', B: 'pO₂ = 95 and pCO₂ = 40', C: 'pO₂ = 159 and pCO₂ = 0.3', D: 'pO₂ = 104 and pCO₂ = 40'
    },
    {
        qNo: 9, topic: 'Exchange and Transport of Gases', year: '2020',
        text: 'Identify the wrong statement with reference to transport of oxygen.',
        A: 'Partial pressure of CO₂ can interfere with O₂ binding with haemoglobin.', B: 'Higher H⁺ concentration in alveoli favours the formation of oxyhaemoglobin.', C: 'Low pCO₂ in alveoli favours the formation of oxyhaemoglobin.', D: 'Binding of oxygen with haemoglobin is mainly related to partial pressure of O₂.'
    },
    {
        qNo: 10, topic: 'Exchange and Transport of Gases', year: '2016',
        text: 'The partial pressure of oxygen in the alveoli of the lungs is:',
        A: 'Less than that in the blood', B: 'Less than that of carbon dioxide', C: 'Equal to that in the blood', D: 'More than that in the blood'
    },
    {
        qNo: 11, topic: 'Exchange and Transport of Gases', year: '2016',
        text: 'Reduction in pH of blood will:',
        A: 'Reduce the rate of heart beat', B: 'Reduce the blood supply to the brain', C: 'Decrease the affinity of hemoglobin with oxygen', D: 'Release bicarbonate ions by the liver'
    },
    {
        qNo: 12, topic: 'Exchange and Transport of Gases', year: '2015',
        text: 'When you hold your breath, which of the following gas changes in blood would first lead to the urge to breathe?',
        A: 'Rising CO₂ concentration', B: 'Rising CO₂ and falling O₂ concentration', C: 'Falling O₂ concentration', D: 'Falling CO₂ concentration'
    },
    {
        qNo: 13, topic: 'Exchange and Transport of Gases', year: '2014',
        text: 'Approximately seventy percent of carbon-dioxide absorbed by the blood will be transported to the lungs:',
        A: 'As carbamino-haemoglobin', B: 'As bicarbonate ions', C: 'In the form of dissolved gas molecules', D: 'By binding to R.B.C.'
    },
    {
        qNo: 14, topic: 'Regulation & Disorders of Respiratory System', year: '2020',
        text: 'Match the following columns and select the correct option:\n1. Pneumotaxic Centre → (i) Alveoli\n2. O₂ Dissociation curve → (ii) Pons region of brain\n3. Carbonic Anhydrase → (iii) Haemoglobin\n4. Primary site of exchange of gases → (iv) R.B.C.',
        A: '(ii) (iii) (iv) (i)', B: '(iii) (ii) (iv) (i)', C: '(iv) (i) (iii) (ii)', D: '(i) (iii) (ii) (iv)'
    },
    {
        qNo: 15, topic: 'Regulation & Disorders of Respiratory System', year: '2019',
        text: 'Due to increasing air-borne allergens and pollutants, many people in urban areas are suffering from respiratory disorder causing wheezing due to',
        A: 'Benign growth on mucous lining of nasal cavity', B: 'Inflammation of bronchi and bronchioles', C: 'Proliferation of fibrous tissues and damage of the alveolar walls', D: 'Reduction in the secretion of surfactants by pneumocytes.'
    },
    {
        qNo: 16, topic: 'Regulation & Disorders of Respiratory System', year: '2018',
        text: 'Which of the following options correctly represents the lung conditions in asthma and emphysema, respectively?',
        A: 'Inflammation of bronchioles; Decreased respiratory surface', B: 'Increased number of bronchioles; Increased respiratory surface', C: 'Increased respiratory surface; Inflammation of bronchioles', D: 'Decreased respiratory surface; Inflammation of bronchioles'
    },
    {
        qNo: 17, topic: 'Regulation & Disorders of Respiratory System', year: '2018',
        text: 'Which of the following is an occupational respiratory disorder?',
        A: 'Anthracis', B: 'Silicosis', C: 'Botulism', D: 'Emphysema'
    },
    {
        qNo: 18, topic: 'Regulation & Disorders of Respiratory System', year: '2016',
        text: 'Asthma may be attributed to:',
        A: 'Bacterial infection of the lungs', B: 'Allergic reaction of the mast cells in the lungs', C: 'Inflammation of the trachea', D: 'Accumulation of fluid in the lungs'
    },
    {
        qNo: 19, topic: 'Regulation & Disorders of Respiratory System', year: '2016',
        text: 'Name the chronic respiratory disorder caused mainly by cigarette smoking:',
        A: 'Emphysema', B: 'Asthma', C: 'Respiratory acidosis', D: 'Respiratory alkalosis'
    },
    {
        qNo: 20, topic: 'Regulation & Disorders of Respiratory System', year: '2015',
        text: 'Name the pulmonary disease in which alveolar surface area involved in gas exchange is drastically reduced due to damage in the alveolar walls.',
        A: 'Emphysema', B: 'Pneumonia', C: 'Asthma', D: 'Pleurisy'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME);

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
