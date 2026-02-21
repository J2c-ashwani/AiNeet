/**
 * Seed REAL NEET PYQs — Chapter: Body Fluids and Circulation (11th Biology)
 * Usage: node scripts/seed_pyq_body_fluids.mjs
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

const CHAPTER_NAME = 'Body Fluids and Circulation';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Blood and Lymph',
    'Circulatory Pathways',
    'Double Circulation & Regulation of Cardiac Activity',
    'Disorders of Circulatory System',
];

const ANSWER_KEY = {
    1: 'A', 2: 'D', 3: 'C', 4: 'D', 5: 'A',
    6: 'D', 7: 'A', 8: 'A', 9: 'B', 10: 'B',
    11: 'B', 12: 'C', 13: 'B', 14: 'A', 15: 'D',
    16: 'B', 17: 'C', 18: 'A', 19: 'A', 20: 'A',
    21: 'B', 22: 'B', 23: 'B', 24: 'A', 25: 'D',
    26: 'C',
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Blood and Lymph', year: '2022',
        text: 'Given below are two statements:\nStatement I: The coagulum is formed of network of threads called thrombins\nStatement II: Spleen is the graveyard of erythrocytes\nIn the light of the above statements, choose the most appropriate answer from the options given below.',
        A: 'Statement I is incorrect but Statement II is correct', B: 'Both Statement I and Statement II are correct', C: 'Both Statement I and Statement II are incorrect', D: 'Statement I is correct but Statement II is incorrect'
    },
    {
        qNo: 2, topic: 'Blood and Lymph', year: '2021',
        text: 'Which enzyme is responsible for the conversion of inactive fibrinogens to fibrins?',
        A: 'Renin', B: 'Epinephrine', C: 'Thrombokinase', D: 'Thrombin'
    },
    {
        qNo: 3, topic: 'Blood and Lymph', year: '2021',
        text: 'Persons with \'AB\' blood group are called as "Universal recipients". This is due to:',
        A: 'Absence of antigens A and B in plasma', B: 'Presence of antibodies, anti-A and anti-B, on RBCs', C: 'Absence of antibodies, anti-A and anti-B, in plasma', D: 'Absence of antigens A and B on the surface of RBCs'
    },
    {
        qNo: 4, topic: 'Blood and Lymph', year: '2020',
        text: 'Match the following columns and select the correct option:\n1. Eosinophils → (i) Immune response\n2. Basophils → (ii) Phagocytosis\n3. Neutrophils → (iii) Release histaminase, destructive enzymes\n4. Lymphocytes → (iv) Release granules containing histamine',
        A: '(iv) (i) (ii) (iii)', B: '(i) (ii) (iv) (iii)', C: '(ii) (i) (iii) (iv)', D: '(iii) (iv) (ii) (i)'
    },
    {
        qNo: 5, topic: 'Blood and Lymph', year: '2020',
        text: 'Which of the following conditions cause erythroblastosis foetalis?',
        A: 'Mother Rh–ve and foetus Rh+ve', B: 'Both mother and foetus Rh–ve', C: 'Both mother and foetus Rh+ve', D: 'Mother Rh+ve and foetus Rh–ve'
    },
    {
        qNo: 6, topic: 'Blood and Lymph', year: '2018',
        text: 'Match the items given in Column-I with those in Column-II and select the correct option:\nA. Fibrinogen → i. Osmotic balance\nB. Globulin → ii. Blood clotting\nC. Albumin → iii. Defence mechanism',
        A: 'A-iii B-ii C-i', B: 'A-i B-ii C-iii', C: 'A-i B-iii C-ii', D: 'A-ii B-iii C-i'
    },
    {
        qNo: 7, topic: 'Blood and Lymph', year: '2017',
        text: 'Adult human RBCs are enucleate. Which of the following statement(s) is/are most appropriate explanation for this feature?\nA. They do not need to reproduce\nB. They are somatic cells\nC. They do not metabolise\nD. All their internal space is available for oxygen transport',
        A: 'Only (D)', B: 'Only (A)', C: '(A), (C) and (D)', D: '(B) and (C)'
    },
    {
        qNo: 8, topic: 'Blood and Lymph', year: '2016',
        text: 'Serum differs from blood in:',
        A: 'Lacking clotting factors', B: 'Lacking antibodies', C: 'Lacking globulins', D: 'Lacking albumins'
    },
    {
        qNo: 9, topic: 'Blood and Lymph', year: '2016',
        text: 'Name the blood cells, whose reduction in number can cause clotting disorder, leading to excessive loss of blood from the body.',
        A: 'Neutrophils', B: 'Thrombocytes', C: 'Erythrocytes', D: 'Leukocytes'
    },
    {
        qNo: 10, topic: 'Blood and Lymph', year: '2015',
        text: 'Which one of the following is correct?',
        A: 'Lymph = Plasma + RBC + WBC', B: 'Blood = Plasma + RBC + WBC + Platelets', C: 'Plasma = Blood – Lymphocytes', D: 'Serum = Blood + Fibrinogen'
    },
    {
        qNo: 11, topic: 'Blood and Lymph', year: '2015',
        text: 'Erythropoiesis starts in:',
        A: 'Spleen', B: 'Red bone marrow', C: 'Kidney', D: 'Liver'
    },
    {
        qNo: 12, topic: 'Blood and Lymph', year: '2015',
        text: 'If you suspect major deficiency of antibodies in a person, to which of the following would you look for confirmatory evidences?',
        A: 'Serum albumins', B: 'Haemocytes', C: 'Serum globulins', D: 'Fibrinogen in plasma'
    },
    {
        qNo: 13, topic: 'Blood and Lymph', year: '2014',
        text: 'Person with blood group AB is considered as universal recipient because he has:',
        A: 'Both A and B antigens in the plasma but no antibodies', B: 'Both A and B antigens on RBC but no antibodies in the plasma', C: 'Both A and B antibodies in the plasma', D: 'No antigen on RBC and no antibody in the plasma'
    },
    {
        qNo: 14, topic: 'Blood and Lymph', year: '2013',
        text: 'The most abundant intracellular cation is:',
        A: 'K+', B: 'Na+', C: 'Ca++', D: 'H+'
    },
    {
        qNo: 15, topic: 'Circulatory Pathways', year: '2022',
        text: 'Which one of the following statements is correct?',
        A: 'Increased ventricular pressure causes closing of the semilunar valves', B: 'The atrio-ventricular node (AVN) generates an action potential to stimulate atrial contraction', C: 'The tricuspid and the bicuspid valves open due to the pressure exerted by the simultaneous contraction of the atria', D: 'Blood moves freely from atrium to the ventricle during joint diastole.'
    },
    {
        qNo: 16, topic: 'Circulatory Pathways', year: '2020',
        text: 'The QRS complex in a standard ECG represents:',
        A: 'Depolarisation of auricles', B: 'Depolarisation of ventricles', C: 'Repolarisation of ventricles', D: 'Repolarisation of auricles'
    },
    {
        qNo: 17, topic: 'Circulatory Pathways', year: '2019',
        text: 'What would be the heart rate of a person if the cardiac output is 5 L, blood volume in the ventricles at the end of diastole is 100 mL and at the end of ventricular systole is 50 mL?',
        A: '50 beats per minute', B: '75 beats per minute', C: '100 beats per minute', D: '125 beats per minute'
    },
    {
        qNo: 18, topic: 'Circulatory Pathways', year: '2019',
        text: 'Match the Column-I with Column-II:\nA. P-wave → i. Depolarisation of ventricles\nB. QRS complex → ii. Repolarisation of ventricle\nC. T-wave → iii. Coronary ischemia\nD. Reduction in the size of T-wave → iv. Depolarisation of atria\n                                        v. Repolarisation of atria\nSelect the correct option.',
        A: 'A-iv B-i C-ii D-iii', B: 'A-iv B-i C-ii D-v', C: 'A-ii B-i C-v D-iii', D: 'A-ii B-iii C-v D-iv'
    },
    {
        qNo: 19, topic: 'Circulatory Pathways', year: '2018',
        text: 'Match the items given in Column-I with those in Column-II and select the correct option:\nA. Tricuspid valve → i. Between left atrium and left ventricle\nB. Bicuspid valve → ii. Between right ventricle and pulmonary artery\nC. Semilunar valve → iii. Between right atrium and right ventricle',
        A: 'A-iii B-i C-ii', B: 'A-i B-iii C-ii', C: 'A-i B-ii C-iii', D: 'A-ii B-i C-iii'
    },
    {
        qNo: 20, topic: 'Circulatory Pathways', year: '2015',
        text: 'Blood pressure in the mammalian aorta is maximum during:',
        A: 'Systole of the left ventricle', B: 'Diastole of the right atrium', C: 'Systole of the left atrium', D: 'Diastole of the right ventricle'
    },
    {
        qNo: 21, topic: 'Circulatory Pathways', year: '2015',
        text: 'Which one of the following animals has two separate circulatory pathways?',
        A: 'Lizard', B: 'Whale', C: 'Shark', D: 'Frog'
    },
    {
        qNo: 22, topic: 'Circulatory Pathways', year: '2015',
        text: 'Doctors use stethoscope to hear the sounds produced during each cardiac cycle. The second sound is heard when:',
        A: 'Ventricular walls vibrate due to pushing in of blood from atria', B: 'Semilunar valves close down after the blood flows into vessels from ventricles', C: 'AV node receives signal from SA Node', D: 'AV valves open up'
    },
    {
        qNo: 23, topic: 'Circulatory Pathways', year: '2013',
        text: 'The diagram given here is the standard ECG of a normal person. The P-wave represents the:',
        A: 'End of systole', B: 'Contraction of both the atria', C: 'Initiation of the ventricular contraction', D: 'Beginning of the systole'
    },
    {
        qNo: 24, topic: 'Double Circulation & Regulation of Cardiac Activity', year: '2020',
        text: 'Which of the following is associated with decrease in cardiac output?',
        A: 'Parasympathetic neural signals', B: 'Pneumotaxic centre', C: 'Adrenal medullary hormones', D: 'Sympathetic nerves'
    },
    {
        qNo: 25, topic: 'Double Circulation & Regulation of Cardiac Activity', year: '2017',
        text: 'The hepatic portal vein drains blood to liver from',
        A: 'Heart', B: 'Stomach', C: 'Kidneys', D: 'Intestine'
    },
    {
        qNo: 26, topic: 'Disorders of Circulatory System', year: '2016',
        text: 'Blood pressure in the pulmonary artery is:',
        A: 'Same as that in the aorta', B: 'More than that in the carotid', C: 'More than that in the pulmonary vein', D: 'Less than that in the vena cava'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME);

    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME.split(' ').slice(0, 2).join('%')}%`, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 11]);
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
