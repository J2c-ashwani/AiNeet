/**
 * Seed REAL NEET PYQs — Chapter: Locomotion and Movement (11th Biology)
 * Usage: node scripts/seed_pyq_locomotion.mjs
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

const CHAPTER_NAME = 'Locomotion and Movement';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Types of Movement & Muscle',
    'Skeletal System',
    'Joints',
    'Disorders of Muscular & Skeletal System',
];

const ANSWER_KEY = {
    1: 'D', 2: 'A', 3: 'C', 4: 'A', 5: 'B', 6: 'D', 7: 'C', 8: 'C', 9: 'D', 10: 'A',
    11: 'B', 12: 'C', 13: 'B', 14: 'A', 15: 'B', 16: 'A', 17: 'C', 18: 'D', 19: 'A', 20: 'D',
    21: 'C',
};

const QUESTIONS = [
    // Types of Movement & Muscle (Q1-6)
    {
        qNo: 1, topic: 'Types of Movement & Muscle', year: '2021',
        text: "During muscular contraction which of the following events occur?\nA. 'H' zone disappears\nB. 'A' band widens\nC. 'I' band reduces in width\nD. Myosin hydrolyzes ATP, releasing the ADP and Pi\nE. Z-lines attached to actins are pulled inwards\nChoose the correct answer from the options given below.",
        A: 'A, B, C, D only', B: 'B, C, D, E only', C: 'B, D, E, A only', D: 'A, C, D, E only'
    },
    {
        qNo: 2, topic: 'Types of Movement & Muscle', year: '2018',
        text: 'Calcium is important in skeletal muscle contraction because it:',
        A: 'Binds to troponin to remove the masking of active sites on actin for myosin.', B: 'Activates the myosin ATPase by binding to it.', C: 'Detaches the myosin head from the actin filament.', D: 'Prevents the formation of bonds between the myosin cross bridges and the actin filament.'
    },
    {
        qNo: 3, topic: 'Types of Movement & Muscle', year: '2016',
        text: 'Name the ion responsible for unmasking of active sites for myosin for cross-bridge activity during muscle contraction:',
        A: 'Sodium', B: 'Potassium', C: 'Calcium', D: 'Magnesium'
    },
    {
        qNo: 4, topic: 'Types of Movement & Muscle', year: '2015',
        text: 'Sliding filament theory can be best explained as:',
        A: 'Actin and myosin filaments do not shorten but rather slide past each other', B: 'When myofilaments slide past each other, myosin filaments shorten while actin filaments do not shorten', C: 'When myofilaments slide past each other, actin filaments shorten while myosin filament do not shorten', D: 'Actin and myosin filaments shorten and slide past each other'
    },
    {
        qNo: 5, topic: 'Types of Movement & Muscle', year: '2014',
        text: 'Stimulation of a muscle fibre by a motor neuron occurs at:',
        A: 'The sarcoplasmic reticulum', B: 'The neuromuscular junction', C: 'The transverse tubules', D: 'The myofibril'
    },
    {
        qNo: 6, topic: 'Types of Movement & Muscle', year: '2013',
        text: 'The H-Zone in the skeletal muscle fibre is due to:',
        A: 'Extension of myosin filaments in the central portion of the A-band', B: 'The absence of myofibrils in the central portion of A-band', C: 'The central gap between myosin filaments in the A-band', D: 'The central gap between actin filaments extending through myosin filaments in the A-band'
    },
    // Skeletal System (Q7-11)
    {
        qNo: 7, topic: 'Skeletal System', year: '2021',
        text: 'Match List-I with List-II:\nA. Scapula → i. Cartilaginous joints\nB. Cranium → ii. Flat bone\nC. Sternum → iii. Fibrous joints\nD. Vertebral column → iv. Triangular flat bone\nChoose the correct answer.',
        A: 'A-ii B-iii C-iv D-i', B: 'A-iv B-ii C-iii D-i', C: 'A-iv B-iii C-ii D-i', D: 'A-i B-iii C-ii D-iv'
    },
    {
        qNo: 8, topic: 'Skeletal System', year: '2020',
        text: 'Match the following columns and select the correct option:\n1. Floating ribs → i. Located between second and seventh ribs\n2. Acromion → ii. Head of the humerus\n3. Scapula → iii. Clavicle\n4. Glenoid cavity → iv. Do not connect with the sternum',
        A: '(i) (iii) (ii) (iv)', B: '(iii) (ii) (iv) (i)', C: '(iv) (iii) (i) (ii)', D: '(ii) (iv) (i) (iii)'
    },
    {
        qNo: 9, topic: 'Skeletal System', year: '2019',
        text: 'Select the correct option.',
        A: '8th, 9th and 10th pairs of ribs articulate directly with the sternum.', B: '11th and 12th pairs of ribs are connected to the sternum with the help of hyaline cartilage.', C: 'Each rib is a flat thin bone and all the ribs are connected dorsally to the thoracic vertebrae and ventrally to the sternum.', D: 'There are seven pairs of vertebrosternal, three pairs of vertebrochondral and two pairs of vertebral ribs.'
    },
    {
        qNo: 10, topic: 'Skeletal System', year: '2017',
        text: "Out of 'X' pairs of ribs in humans only 'Y' pairs are true ribs. Select the option that correctly represents values of X and Y and provides their explanation:",
        A: 'X = 12, Y = 7 True ribs are attached dorsally to vertebral column and ventrally to the sternum', B: 'X = 12, Y = 5 True ribs are attached dorsally to vertebral column and sternum on the two ends', C: 'X = 24, Y = 7 True ribs are dorsally attached to vertebral column but are free on ventral side', D: 'X = 24, Y = 12 True ribs are dorsally attached to vertebral column but are free on ventral side'
    },
    {
        qNo: 11, topic: 'Skeletal System', year: '2015',
        text: 'Glenoid cavity articulates:',
        A: 'Clavicle with scapula', B: 'Humerus with scapula', C: 'Clavicle with acromion', D: 'Scapula with acromion'
    },
    // Joints (Q12, 18-20)
    {
        qNo: 12, topic: 'Joints', year: '2017',
        text: 'The pivot joint between atlas and axis is a type of:',
        A: 'Fibrous joint', B: 'Cartilaginous joint', C: 'Synovial joint', D: 'Saddle joint'
    },
    {
        qNo: 18, topic: 'Joints', year: '2015',
        text: 'Which of the following joints would allow no movement?',
        A: 'Cartilaginous joint', B: 'Synovial joint', C: 'Ball and Socket joint', D: 'Fibrous joint'
    },
    {
        qNo: 19, topic: 'Joints', year: '2014',
        text: 'Select the correct matching of the type of the joint with the example in human skeletal system:',
        A: 'Gliding joint — Between carpals', B: 'Cartilaginous joint — Between frontal and parietal', C: 'Pivot joint — Between third and fourth cervical vertebrae', D: 'Hinge joint — Between humerus and pectoral girdle'
    },
    {
        qNo: 20, topic: 'Joints', year: '2013',
        text: 'The characteristics and an example of a synovial joint in humans is:',
        A: 'Lymph filled between two bones, limited movement — Gliding joint between carpals', B: 'Fluid cartilage between two bones, limited movements — Knee joints', C: 'Fluid filled between two joints, provides cushion — Skull bones', D: 'Fluid filled synovial cavity between two bones — Joint between atlas and axis'
    },
    // Disorders of Muscular & Skeletal System (Q13-17, 21)
    {
        qNo: 13, topic: 'Disorders of Muscular & Skeletal System', year: '2021',
        text: 'Chronic auto immune disorder affecting neuromuscular junction leading to fatigue, weakening and paralysis of skeletal muscle is called as:',
        A: 'Muscular dystrophy', B: 'Myasthenia gravis', C: 'Gout', D: 'Arthritis'
    },
    {
        qNo: 14, topic: 'Disorders of Muscular & Skeletal System', year: '2020',
        text: 'Match the following columns and select the correct option:\n1. Gout → i. Decreased levels of estrogen\n2. Osteoporosis → ii. Low Ca++ ions in the blood\n3. Tetany → iii. Accumulation of uric acid crystals\n4. Muscular dystrophy → iv. Auto immune disorder\n                            v. Genetic disorder',
        A: '(iii) (i) (ii) (v)', B: '(iv) (v) (i) (ii)', C: '(i) (ii) (iii) (iv)', D: '(ii) (i) (iii) (iv)'
    },
    {
        qNo: 15, topic: 'Disorders of Muscular & Skeletal System', year: '2019',
        text: 'Which of the following muscular disorder is inherited?',
        A: 'Tetany', B: 'Muscular dystrophy', C: 'Myasthenia gravis', D: 'Botulism'
    },
    {
        qNo: 16, topic: 'Disorders of Muscular & Skeletal System', year: '2016',
        text: 'Osteoporosis, an age-related disease of skeletal system, may occur due to:',
        A: 'Decreased level of estrogen', B: 'Accumulation of uric acid leading to inflammation of joints.', C: 'Immune disorder affecting neuromuscular junction leading to fatigue.', D: 'High concentration of Ca++ and Na+.'
    },
    {
        qNo: 17, topic: 'Disorders of Muscular & Skeletal System', year: '2016',
        text: 'Lack of relaxation between successive stimuli in sustained muscle contraction is known as:',
        A: 'Spasm', B: 'Fatigue', C: 'Tetanus', D: 'Tonus'
    },
    {
        qNo: 21, topic: 'Disorders of Muscular & Skeletal System', year: '2013',
        text: 'Select the correct statement with respect to locomotion in humans:',
        A: 'The joint between adjacent vertebrae is a fibrous joint', B: 'A decreased level of progesterone causes osteoporosis in old people', C: 'Accumulation of uric acid crystals in joints causes their inflammation', D: 'The vertebral column has 10 thoracic vertebrae.'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME);

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
