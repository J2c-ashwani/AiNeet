/**
 * Seed REAL NEET PYQs — Chapter: Chemical Coordination and Integration (11th Biology)
 * Usage: node scripts/seed_pyq_chemical_coord.mjs
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

const CHAPTER_NAME = 'Chemical Coordination and Integration';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Hypothalamus, Pituitary Gland & Pineal Gland',
    'Thyroid, Parathyroid & Thymus',
    'Adrenal Gland & Pancreas',
    'Testis, Ovary & Hormones of Heart, Kidney & GI Tract',
    'Mechanism of Hormone Action',
];

const ANSWER_KEY = {
    1: 'A', 2: 'B', 3: 'B', 4: 'D', 5: 'D', 6: 'C', 7: 'C', 8: 'D', 9: 'C', 10: 'B',
    11: 'B', 12: 'B', 13: 'A', 14: 'D', 15: 'C', 16: 'D', 17: 'A', 18: 'A', 19: 'D', 20: 'C',
    21: 'C', 22: 'D', 23: 'A', 24: 'D', 25: 'A', 26: 'A', 27: 'B', 28: 'A', 29: 'C', 30: 'A',
};

const QUESTIONS = [
    // Hypothalamus, Pituitary Gland & Pineal Gland (Q1-5)
    {
        qNo: 1, topic: 'Hypothalamus, Pituitary Gland & Pineal Gland', year: '2020',
        text: 'Hormones stored and released from neurohypophysis are:',
        A: 'Oxytocin and Vasopressin', B: 'Follicle stimulating hormone and Leutinizing hormone', C: 'Prolactin and Vasopressin', D: 'Thyroid stimulating hormone and oxytocin'
    },
    {
        qNo: 2, topic: 'Hypothalamus, Pituitary Gland & Pineal Gland', year: '2017',
        text: 'Hypersecretion of growth hormone in adults does not cause further increase in height, because',
        A: 'Growth hormone becomes inactive in adults', B: 'Epiphyseal plates close after adolescence', C: 'Bones loose their sensitivity to growth hormone in adults', D: 'Muscle fibres do not grow in size after birth'
    },
    {
        qNo: 3, topic: 'Hypothalamus, Pituitary Gland & Pineal Gland', year: '2017',
        text: 'GnRH, a hypothalamic hormone, needed in reproduction, acts on',
        A: 'Anterior pituitary gland and stimulates secretion of LH and oxytocin', B: 'Anterior pituitary gland and stimulates secretion of LH and FSH', C: 'Posterior pituitary gland and stimulates secretion of oxytocin and FSH', D: 'Posterior pituitary gland and stimulates secretion of LH and relaxin'
    },
    {
        qNo: 4, topic: 'Hypothalamus, Pituitary Gland & Pineal Gland', year: '2016',
        text: "The posterior pituitary gland is not a 'true' endocrine gland because:",
        A: 'It is under the regulation of hypothalamus', B: 'It secretes enzymes', C: 'It is provided with a duct', D: 'It only stores and releases hormones'
    },
    {
        qNo: 5, topic: 'Hypothalamus, Pituitary Gland & Pineal Gland', year: '2015',
        text: 'Which one of the following hormones though synthesised elsewhere is stored and released by the master gland?',
        A: 'Luteinising hormone', B: 'Prolactin', C: 'Melanocyte stimulating hormone', D: 'Antidiuretic hormone'
    },
    // Thyroid, Parathyroid & Thymus (Q6-10)
    {
        qNo: 6, topic: 'Thyroid, Parathyroid & Thymus', year: '2022',
        text: 'Which of the following are not the effects of Parathyroid hormone?\nA. Stimulates the process of bone resorption\nB. Decrease Ca²⁺ level in blood\nC. Reabsorption of Ca²⁺ by renal tubules\nD. Decrease the absorption of Ca²⁺ from digested food\nE. Increases metabolism of carbohydrates\nChoose the most appropriate answer.',
        A: 'B and C only', B: 'A and C only', C: 'B, D and E only', D: 'A and E only'
    },
    {
        qNo: 7, topic: 'Thyroid, Parathyroid & Thymus', year: '2018',
        text: 'Which of the following hormones can play a significant role in osteoporosis?',
        A: 'Aldosterone and Prolactin', B: 'Progesterone and Aldosterone', C: 'Estrogen and Parathyroid hormone', D: 'Parathyroid hormone and Prolactin'
    },
    {
        qNo: 8, topic: 'Thyroid, Parathyroid & Thymus', year: '2017',
        text: 'Thymosin is responsible for:',
        A: 'Decreased production of T-lymphocytes', B: 'Inhibiting the production of antibodies', C: 'Decreasing the blood calcium level in old individuals', D: 'Increased production of T-lymphocytes'
    },
    {
        qNo: 9, topic: 'Thyroid, Parathyroid & Thymus', year: '2014',
        text: 'Identify the hormone with its correct matching of source and function:',
        A: 'Atrial natriuretic factor: Ventricular wall, increases the blood pressure', B: 'Oxytocin: Posterior pituitary, growth and maintenance of mammary glands', C: 'Melatonin: Pineal gland, regulates the normal rhythm of sleep wake cycle', D: 'Progesterone: Corpus-luteum, stimulation of growth and activities of female secondary sex organs'
    },
    {
        qNo: 10, topic: 'Thyroid, Parathyroid & Thymus', year: '2013',
        text: 'A pregnant female delivers a baby who suffers from stunted growth, mental retardation, low intelligence quotient and abnormal skin. This is the result of:',
        A: 'Over-secretion of pars distalis', B: 'Deficiency of iodine in diet', C: 'Low secretion of growth hormone', D: 'Cancer of the thyroid gland'
    },
    // Adrenal Gland & Pancreas (Q11-19)
    {
        qNo: 11, topic: 'Adrenal Gland & Pancreas', year: '2020',
        text: 'Presence of which of the following conditions in urine are indicative of Diabetes Mellitus?',
        A: 'Uremia and Renal Calculi', B: 'Ketonuria and Glycosuria', C: 'Renal calculi and Hyperglycaemia', D: 'Uremia and Ketonuria'
    },
    {
        qNo: 12, topic: 'Adrenal Gland & Pancreas', year: '2020',
        text: "Match the following columns and select the correct option:\n1. Pituitary gland → (i) Grave's disease\n2. Thyroid gland → (ii) Diabetes mellitus\n3. Adrenal gland → (iii) Diabetes insipidus\n4. Pancreas → (iv) Addison's disease",
        A: '(iii) (ii) (i) (iv)', B: '(iii) (i) (iv) (ii)', C: '(ii) (i) (iv) (iii)', D: '(iv) (iii) (i) (ii)'
    },
    {
        qNo: 13, topic: 'Adrenal Gland & Pancreas', year: '2020',
        text: 'Which of the following would help in prevention of diuresis?',
        A: 'Reabsorption of Na⁺ and water from renal tubules due to aldosterone', B: 'Atrial natriuretic factor causes vasoconstriction', C: 'Decrease in secretion of renin by JG cells', D: 'More water reabsorption due to undersecretion of ADH'
    },
    {
        qNo: 14, topic: 'Adrenal Gland & Pancreas', year: '2020',
        text: 'Select the correct statement',
        A: 'Glucagon is associated with hypoglycemia.', B: 'Insulin acts on pancreatic cells and adipocytes.', C: 'Insulin is associated with hyperglycemia.', D: 'Glucocorticoids stimulate gluconeogenesis.'
    },
    {
        qNo: 15, topic: 'Adrenal Gland & Pancreas', year: '2019',
        text: "Match the following hormones with the respective disease:\nA. Insulin → i. Addison's disease\nB. Thyroxin → ii. Diabetes insipidus\nC. Corticoids → iii. Acromegaly\nD. Growth Hormone → iv. Goitre\n                       v. Diabetes mellitus\nSelect the correct option.",
        A: '(v) (i) (ii) (iii)', B: '(ii) (iv) (iii) (i)', C: '(v) (iv) (i) (iii)', D: '(ii) (iv) (i) (iii)'
    },
    {
        qNo: 16, topic: 'Adrenal Gland & Pancreas', year: '2016',
        text: "Graves' disease is caused due to:",
        A: 'Hyposecretion of adrenal gland', B: 'Hypersecretion of adrenal gland', C: 'Hyposecretion of thyroid gland', D: 'Hypersecretion of thyroid gland'
    },
    {
        qNo: 17, topic: 'Adrenal Gland & Pancreas', year: '2015',
        text: 'A chemical signal that has both endocrine and neural roles is:',
        A: 'Epinephrine', B: 'Cortisol', C: 'Melatonin', D: 'Calcitonin'
    },
    {
        qNo: 18, topic: 'Adrenal Gland & Pancreas', year: '2015',
        text: 'Which one of the following hormones is not involved in sugar metabolism?',
        A: 'Aldosterone', B: 'Insulin', C: 'Glucagon', D: 'Cortisone'
    },
    {
        qNo: 19, topic: 'Adrenal Gland & Pancreas', year: '2014',
        text: 'Fight-or-flight reactions cause activation of:',
        A: 'The pancreas leading to a reduction in the blood sugar levels', B: 'The parathyroid glands, leading to increased metabolic rate', C: 'The kidney, leading to suppression of renin angiotensin-aldosterone pathway', D: 'The adrenal medulla, leading to increased secretion of epinephrine and norepinephrine'
    },
    // Testis, Ovary & Hormones of Heart, Kidney & GI Tract (Q20-25)
    {
        qNo: 20, topic: 'Testis, Ovary & Hormones of Heart, Kidney & GI Tract', year: '2021',
        text: 'Erythropoietin hormone which stimulates R.B.C. formation is produced by:',
        A: 'The cells of rostral adenohypophysis', B: 'The cells of bone marrow', C: 'Juxtaglomerular cells of the kidney', D: 'Alpha cells of pancreas.'
    },
    {
        qNo: 21, topic: 'Testis, Ovary & Hormones of Heart, Kidney & GI Tract', year: '2020',
        text: 'Match the following columns and select the correct option:\n1. Ovary → (i) Human chorionic Gonadotropin\n2. Placenta → (ii) Estrogen & Progesterone\n3. Corpus luteum → (iii) Androgens\n4. Leydig cells → (iv) Progesterone only',
        A: '(i) (ii) (iii) (iv)', B: '(i) (iii) (ii) (iv)', C: '(ii) (i) (iv) (iii)', D: '(iv) (iii) (ii) (i)'
    },
    {
        qNo: 22, topic: 'Testis, Ovary & Hormones of Heart, Kidney & GI Tract', year: '2016',
        text: 'Which of the following pairs of hormones are not antagonistic (having opposite effects) to each other?',
        A: 'Parathormone - Calcitonin', B: 'Insulin - Glucagon', C: 'Aldosterone - Atrial Natriuretic Factor', D: 'Relaxin - Inhibin'
    },
    {
        qNo: 23, topic: 'Testis, Ovary & Hormones of Heart, Kidney & GI Tract', year: '2016',
        text: 'Which hormones do stimulate the production of pancreatic juice and bicarbonate?',
        A: 'Cholecystokinin and secretin', B: 'Insulin and glucagon', C: 'Angiotensin and epinephrine', D: 'Gastrin and insulin'
    },
    {
        qNo: 24, topic: 'Testis, Ovary & Hormones of Heart, Kidney & GI Tract', year: '2013',
        text: 'Which of the following statement is correct in relation to the endocrine system?',
        A: 'Releasing and inhibitory hormones are produced by the pituitary gland', B: 'Adenohypophysis is under direct neural regulation of the hypothalamus', C: 'Organs in the body like gastrointestinal tract, heart, kidney and liver do not produce any hormones', D: 'Non-nutrient chemicals produced by the body in trace amount that act as intercellular messenger are known as hormones'
    },
    {
        qNo: 25, topic: 'Testis, Ovary & Hormones of Heart, Kidney & GI Tract', year: '2013',
        text: 'Which one of the following is not the function of placenta?',
        A: 'Secretes oxytocin during parturition', B: 'Facilitates supply of oxygen and nutrients to embryo', C: 'Secretes estrogen', D: 'Facilitates removal of carbon dioxide and waste material from embryo'
    },
    // Mechanism of Hormone Action (Q26-30)
    {
        qNo: 26, topic: 'Mechanism of Hormone Action', year: '2020',
        text: 'Match the following columns and select the correct option:\n1. Pituitary hormone → (i) Steroid\n2. Epinephrine → (ii) Neuropeptides\n3. Endorphins → (iii) Peptides, proteins\n4. Cortisol → (iv) Biogenic amines',
        A: '(iii) (iv) (ii) (i)', B: '(iv) (iii) (i) (ii)', C: '(iii) (iv) (i) (ii)', D: '(iv) (i) (ii) (iii)'
    },
    {
        qNo: 27, topic: 'Mechanism of Hormone Action', year: '2019',
        text: 'How does steroid hormone influence the cellular activities?',
        A: 'Changing the permeability of the cell membrane', B: 'Binding to DNA and forming a gene-hormone complex', C: 'Activating cyclic AMP located on the cell membrane', D: 'Using aquaporin channels as second messenger'
    },
    {
        qNo: 28, topic: 'Mechanism of Hormone Action', year: '2018',
        text: 'Which of the following is an amino acid derived hormone?',
        A: 'Epinephrine', B: 'Ecdysone', C: 'Estradiol', D: 'Estriol'
    },
    {
        qNo: 29, topic: 'Mechanism of Hormone Action', year: '2016',
        text: 'Name a peptide hormone which acts mainly on hepatocytes, adipocytes and enhances cellular glucose uptake and utilisation.',
        A: 'Secretin', B: 'Gastrin', C: 'Insulin', D: 'Glucagon'
    },
    {
        qNo: 30, topic: 'Mechanism of Hormone Action', year: '2016',
        text: 'The amino acid Tryptophan is the precursor for the synthesis of:',
        A: 'Melatonin and Serotonin', B: 'Thyroxine and Triiodothyronine', C: 'Estrogen and Progesterone', D: 'Cortisol and Cortisone'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME);

    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME.split(' ').slice(0, 2).join('%')}%`, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 15]);
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
