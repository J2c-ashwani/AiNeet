/**
 * Seed REAL NEET PYQ questions from extracted PDF data.
 * 
 * Usage: node scripts/seed_real_pyqs.mjs
 * 
 * This script:
 * 1. Creates the chapter if it doesn't exist
 * 2. Creates topics matching the PDF sections
 * 3. Deletes any old mock PYQs for these chapters
 * 4. Inserts real questions with correct answers from the answer key
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function query(sql, params = []) {
    const { rows } = await pool.query(sql, params);
    return rows;
}

// ═══════════════════════════════════════════════
// CHAPTER: Structural Organisation in Animals
// Source: 11th Biology (Zoology) PYQ PDF
// ═══════════════════════════════════════════════

const CHAPTER_NAME = 'Structural Organisation in Animals';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 11;

// Topic sections from the PDF
const TOPICS = [
    'Epithelial & Connective Tissue',
    'Muscle Tissue & Neural Tissue',
    'Earthworm',
    'Cockroach',
    'Frog',
];

// Answer key from the PDF (1-indexed)
const ANSWER_KEY = {
    1: 'C', 2: 'A', 3: 'B', 4: 'A', 5: 'B',
    6: 'A', 7: 'D', 8: 'A', 9: 'D', 10: 'D',
    11: 'B', 12: 'D', 13: 'C', 14: 'A', 15: 'B',
    16: 'D', 17: 'C', 18: 'D', 19: 'B', 20: 'C',
    21: 'D', 22: 'A', 23: 'B', 24: 'C', 25: 'B',
    26: 'A', 27: 'A', 28: 'B', 29: 'D', 30: 'D',
    31: 'D',
};

// All 31 questions manually parsed from the extracted PDF text
// Each has: qNo, topic, year, text, options {A, B, C, D}
const QUESTIONS = [
    {
        qNo: 1, topic: 'Epithelial & Connective Tissue', year: '2022',
        text: 'Which of the following is present between the adjacent bones of the vertebral column?',
        A: 'Smooth muscle', B: 'Intercalated discs', C: 'Cartilage', D: 'Areolar tissue'
    },
    {
        qNo: 2, topic: 'Epithelial & Connective Tissue', year: '2022',
        text: 'Which of the following is not a connective tissue?',
        A: 'Neuroglia', B: 'Blood', C: 'Adipose tissue', D: 'Cartilage'
    },
    {
        qNo: 3, topic: 'Epithelial & Connective Tissue', year: '2022',
        text: 'Match List-I with List-II.\n(A) Bronchioles → (i) Dense Regular Connective Tissue\n(B) Goblet cell → (ii) Loose Connective Tissue\n(C) Tendons → (iii) Glandular Tissue\n(D) Adipose Tissue → (iv) Ciliated Epithelium\nChoose the correct answer from the options given below.',
        A: 'A-iii B-iv C-ii D-i', B: 'A-iv B-iii C-i D-ii', C: 'A-i B-ii C-iii D-iv', D: 'A-ii B-i C-iv D-iii'
    },
    {
        qNo: 4, topic: 'Epithelial & Connective Tissue', year: '2021',
        text: 'Identify the types of cell junctions that help to stop the leakage of the substances across a tissue and facilitation of communication with neighbouring cells via rapid transfer of ions and molecules.',
        A: 'Tight junctions and Gap junctions, respectively.', B: 'Adhering junctions and Tight junctions, respectively.', C: 'Adhering junctions and Gap junctions, respectively.', D: 'Gap junctions and Adhering junctions, respectively.'
    },
    {
        qNo: 5, topic: 'Epithelial & Connective Tissue', year: '2020',
        text: 'Cuboidal epithelium with brush border of microvilli is found in:',
        A: 'Ducts of salivary glands', B: 'Proximal convoluted tubule of nephron', C: 'Eustachian tube', D: 'Lining of intestine'
    },
    {
        qNo: 6, topic: 'Epithelial & Connective Tissue', year: '2020',
        text: 'Goblet cells of alimentary canal are modified from:',
        A: 'Columnar epithelial cells', B: 'Chondrocytes', C: 'Compound epithelial cells', D: 'Squamous epithelial cells'
    },
    {
        qNo: 7, topic: 'Epithelial & Connective Tissue', year: '2019',
        text: 'The ciliated epithelial cells are required to move particles or mucus in a specific direction. In humans, these cells are mainly present in',
        A: 'Bile duct and bronchioles', B: 'Fallopian tubes and pancreatic duct', C: 'Eustachian tube and salivary duct', D: 'Bronchioles and fallopian tubes'
    },
    {
        qNo: 8, topic: 'Epithelial & Connective Tissue', year: '2015',
        text: 'The function of the gap junction is to:',
        A: 'Facilitate communication between adjoining cells by connecting the cytoplasm for rapid transfer of ions, small molecules and some large molecules', B: 'Separate two cells from each other', C: 'Stop substance from leaking across a tissue', D: 'Performing cementing to keep neighboring cells together.'
    },
    {
        qNo: 9, topic: 'Epithelial & Connective Tissue', year: '2014',
        text: 'Choose the correctly matched pair:',
        A: 'Cartilage - Loose connective tissue', B: 'Tendon - Specialised connective tissue', C: 'Adipose tissue - Dense connective tissue', D: 'Areolar tissue - Loose connective tissue'
    },
    {
        qNo: 10, topic: 'Epithelial & Connective Tissue', year: '2014',
        text: 'Choose the correctly matched pair:',
        A: 'Inner surface of bronchioles - Squamous epithelium', B: 'Inner lining of salivary ducts - Ciliated epithelium', C: 'Moist surface of Buccal cavity - Glandular epithelium', D: 'Tubular parts of nephrons - Cuboidal epithelium'
    },
    {
        qNo: 11, topic: 'Muscle Tissue & Neural Tissue', year: '2021',
        text: 'Which of the following statements wrongly represents the nature of smooth muscle?',
        A: 'They are involuntary muscles', B: 'Communication among the cells is performed by intercalated discs', C: 'These muscles are present in the wall of blood vessels', D: 'These muscle have no striations'
    },
    {
        qNo: 12, topic: 'Muscle Tissue & Neural Tissue', year: '2020',
        text: 'Select the incorrectly matched pair from following:',
        A: 'Neurons - Nerve cells', B: 'Fibroblast - Areolar tissue', C: 'Osteocytes - Bone cells', D: 'Chondrocytes - Smooth muscle cells'
    },
    {
        qNo: 13, topic: 'Muscle Tissue & Neural Tissue', year: '2016',
        text: 'Smooth muscles are:',
        A: 'Involuntary, cylindrical, striated', B: 'Voluntary, spindle–shaped, uninucleate', C: 'Involuntary, fusiform, non-striated', D: 'Voluntary, multinucleate, cylindrical'
    },
    {
        qNo: 14, topic: 'Muscle Tissue & Neural Tissue', year: '2016',
        text: 'Which type of tissue correctly matches with its location?\na. Smooth muscle → Wall of intestine\nb. Areolar tissue → Tendons\nc. Transitional epithelium → Tip of nose\nd. Cuboidal epithelium → Lining of stomach',
        A: 'Smooth muscle → Wall of intestine', B: 'Areolar tissue → Tendons', C: 'Transitional epithelium → Tip of nose', D: 'Cuboidal epithelium → Lining of stomach'
    },
    {
        qNo: 15, topic: 'Muscle Tissue & Neural Tissue', year: '2015',
        text: 'Which of the following is not a function of the skeletal system?',
        A: 'Storage of minerals', B: 'Production of body heat', C: 'Locomotion', D: 'Production of erythrocytes'
    },
    {
        qNo: 16, topic: 'Earthworm', year: '2021',
        text: 'Following are the statements about prostomium of earthworm.\nA. It serves as a covering for mouth.\nB. It helps to open cracks in the soil into which it can crawl.\nC. It is one of the sensory structures.\nD. It is the first body segment.\nChoose the correct answer from the options given below.',
        A: 'A, B and D are correct', B: 'A, B, C and D are correct', C: 'B and C are correct', D: 'A, B and C are correct'
    },
    {
        qNo: 17, topic: 'Cockroach', year: '2022',
        text: 'Tegmina in cockroach, arises from',
        A: 'Prothorax and Mesothorax', B: 'Prothorax', C: 'Mesothorax', D: 'Metathorax'
    },
    {
        qNo: 18, topic: 'Cockroach', year: '2021',
        text: 'Which of the following characteristics is incorrect with respect to cockroach?',
        A: 'Hypopharynx lies within the cavity enclosed by the mouth parts.', B: 'In females, 7th - 9th sterna together form a genital pouch.', C: '10th abdominal segment in both sexes, bears a pair of anal cerci.', D: 'A ring of gastric caeca is present at the junction of midgut and hind gut.'
    },
    {
        qNo: 19, topic: 'Cockroach', year: '2020',
        text: 'If the head of cockroach is removed, it may live for few days because:',
        A: 'The cockroach does not have nervous system.', B: 'The head holds a small proportion of a nervous system while the rest is situated along the ventral part of its body.', C: 'The head holds a 1/3rd of a nervous system while the rest is situated along the dorsal part of its body.', D: 'The supra-oesophageal ganglia of the cockroach are situated in ventral part of abdomen.'
    },
    {
        qNo: 20, topic: 'Cockroach', year: '2020',
        text: 'In cockroach, identify the parts of the foregut in correct sequence:',
        A: 'Mouth → Crop → Pharynx → Oesophagus → Gizzard', B: 'Mouth → Gizzard → Crop → Pharynx → Oesophagus', C: 'Mouth → Pharynx → Oesophagus → Crop → Gizzard', D: 'Mouth → Oesophagus → Pharynx → Crop → Gizzard'
    },
    {
        qNo: 21, topic: 'Cockroach', year: '2020',
        text: 'Match the following columns with reference to cockroach and select the correct option:\n1. Grinding of the food particles → (i) Hepatic caecal\n2. Secrete gastric juice → (ii) 10th segment\n3. 10 pairs → (iii) Proventriculus\n4. Anal cerci → (iv) Spiracles\n                      (v) Alary muscles',
        A: '(iv) (iii) (v) (ii)', B: '(i) (iv) (iii) (ii)', C: '(ii) (iii) (i) (iv)', D: '(iii) (i) (iv) (ii)'
    },
    {
        qNo: 22, topic: 'Cockroach', year: '2019',
        text: 'Select the correct sequence of organs in the alimentary canal of cockroach starting from mouth',
        A: 'Pharynx → Oesophagus → Crop → Gizzard → Ileum → Colon → Rectum', B: 'Pharynx → Oesophagus → Gizzard → Crop → Ileum → Colon → Rectum', C: 'Pharynx → Oesophagus → Gizzard → Ileum → Crop → Colon → Rectum', D: 'Pharynx → Oesophagus → Ileum → Crop → Gizzard → Colon → Rectum'
    },
    {
        qNo: 23, topic: 'Cockroach', year: '2018',
        text: 'Which of the following features is used to identify a male cockroach from a female cockroach?',
        A: 'Presence of a boat shaped sternum on the 9th abdominal segment', B: 'Presence of caudal styles', C: 'Forewings with darker tegmina', D: 'Presence of anal cerci'
    },
    {
        qNo: 24, topic: 'Cockroach', year: '2016',
        text: 'In male cockroaches, sperms are stored in which part of the reproductive system?',
        A: 'Testes', B: 'Vas deferens', C: 'Seminal vesicles', D: 'Mushroom glands'
    },
    {
        qNo: 25, topic: 'Cockroach', year: '2016',
        text: 'Which of the following features is not present in Periplaneta americana?',
        A: 'Schizocoelom as body cavity', B: 'Indeterminate and radial cleavage during embryonic development', C: 'Exoskeleton composed of N-acetyl glucosamine', D: 'Metamerically segmented body'
    },
    {
        qNo: 26, topic: 'Cockroach', year: '2015',
        text: 'The terga, sterna and pleura of cockroach body are joined by:',
        A: 'Arthrodial membrane', B: 'Cartilage', C: 'Cementing glue', D: 'Muscular tissue'
    },
    {
        qNo: 27, topic: 'Cockroach', year: '2015',
        text: 'The body cells in cockroach discharge their nitrogenous waste in the haemolymph mainly in the form of:',
        A: 'Potassium urate', B: 'Urea', C: 'Calcium carbonate', D: 'Ammonia'
    },
    {
        qNo: 28, topic: 'Cockroach', year: '2013',
        text: 'Select the correct option with respect to cockroaches:',
        A: 'Malpighian tubules convert nitrogenous wastes into urea', B: 'Males bear short anal styles not present in females', C: 'Nervous system comprises of a dorsal nerve cord and ten pairs of ganglia', D: 'The forewings are tegmina which are used in flight'
    },
    {
        qNo: 29, topic: 'Cockroach', year: '2013',
        text: 'What external changes are visible after the last moult of a cockroach nymph?',
        A: 'Labium develops', B: 'Mandibles become harder', C: 'Anal cerci develop', D: 'Both fore wings and hind wings develop'
    },
    {
        qNo: 30, topic: 'Frog', year: '2017',
        text: 'Select the correct route for the passage of sperms in male frogs:',
        A: "Testes → Bidder's canal → Kidney → Vasa efferentia → Urinogenital duct → Cloaca", B: "Testes → Vasa efferentia → Kidney → Seminal Vesicle → Urinogenital duct → Cloaca", C: "Testes → Vasa efferentia → Bidder's canal → Ureter → Cloaca", D: "Testes → Vasa efferentia → Kidney → Bidder's canal → Urinogenital duct → Cloaca"
    },
    {
        qNo: 31, topic: 'Frog', year: '2017',
        text: "Frog's heart when taken out of the body continues to beat for some time. Select the best option from the following statements:\nA. Frog is a poikilotherm\nB. Frog does not have any coronary circulation\nC. Heart is \"myogenic\" in nature\nD. Heart is autoexcitable",
        A: 'Only (A)', B: 'Only (D)', C: '(A) & (B)', D: '(C) & (D)'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME);

    // 1. Get or create subject
    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found:', SUBJECT_NAME); process.exit(1); }
    const subjectId = subject.id;
    console.log(`  Subject: ${SUBJECT_NAME} (id=${subjectId})`);

    // 2. Get or create chapter
    let [chapter] = await query('SELECT id FROM chapters WHERE name = $1 AND subject_id = $2', [CHAPTER_NAME, subjectId]);
    if (!chapter) {
        console.log(`  Creating chapter: ${CHAPTER_NAME}`);
        [chapter] = await query(
            'INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id',
            [subjectId, CHAPTER_NAME, CLASS_LEVEL, 7] // order_index 7 for ch7 in NCERT
        );
    }
    const chapterId = chapter.id;
    console.log(`  Chapter: ${CHAPTER_NAME} (id=${chapterId})`);

    // 3. Create topics and build topic map
    const topicMap = {};
    for (const topicName of TOPICS) {
        let [topic] = await query('SELECT id FROM topics WHERE name = $1 AND chapter_id = $2', [topicName, chapterId]);
        if (!topic) {
            [topic] = await query(
                'INSERT INTO topics (chapter_id, name, weightage) VALUES ($1, $2, $3) RETURNING id',
                [chapterId, topicName, 1]
            );
        }
        topicMap[topicName] = topic.id;
        console.log(`  Topic: ${topicName} (id=${topic.id})`);
    }

    // 4. Delete old mock PYQs for this chapter
    const deleted = await query('DELETE FROM questions WHERE chapter_id = $1 AND is_pyq = 1 RETURNING id', [chapterId]);
    console.log(`  🗑️  Deleted ${deleted.length} old mock PYQs for this chapter`);

    // 5. Insert real questions
    let inserted = 0;
    for (const q of QUESTIONS) {
        const correctAnswer = ANSWER_KEY[q.qNo];
        const topicId = topicMap[q.topic];

        if (!topicId) {
            console.error(`  ❌ Topic not found for Q${q.qNo}: "${q.topic}"`);
            continue;
        }

        await query(`
            INSERT INTO questions (
                topic_id, chapter_id, subject_id,
                text, option_a, option_b, option_c, option_d,
                correct_option, difficulty, explanation,
                is_pyq, exam_name, year_asked, tags,
                verification_status, quality_score
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        `, [
            topicId, chapterId, subjectId,
            q.text, q.A, q.B, q.C, q.D,
            correctAnswer, 'medium', null,  // explanation can be added later
            1, 'NEET', q.year, 'pyq,neet,real',
            'verified', 10.0
        ]);
        inserted++;
    }

    console.log(`\n✅ Inserted ${inserted} real NEET PYQs for "${CHAPTER_NAME}"`);

    // 6. Verify
    const [count] = await query('SELECT COUNT(*) as count FROM questions WHERE chapter_id = $1 AND is_pyq = 1', [chapterId]);
    console.log(`📊 Total PYQs for this chapter: ${count.count}`);

    // Show summary by topic
    const topicCounts = await query(`
        SELECT t.name, COUNT(*) as count 
        FROM questions q JOIN topics t ON q.topic_id = t.id 
        WHERE q.chapter_id = $1 AND q.is_pyq = 1 
        GROUP BY t.name ORDER BY count DESC
    `, [chapterId]);
    console.log('\n📋 By topic:');
    for (const tc of topicCounts) {
        console.log(`   ${tc.name}: ${tc.count} questions`);
    }

    await pool.end();
}

run().catch(err => { console.error(err); pool.end(); process.exit(1); });
