/**
 * Seed REAL NEET PYQs — Chapter: Anatomy of Flowering Plants (11th Biology)
 * Usage: node scripts/seed_pyq_anatomy_plants.mjs
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

const CHAPTER_NAME = 'Anatomy of Flowering Plants';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Meristematic Tissues',
    'Permanent Tissues',
    'Tissue System',
    'Anatomy of Dicot & Monocot Plants',
    'Secondary Growth'
];

const ANSWER_KEY = {
    1: 'C', 3: 'B', 4: 'D', 5: 'D', 6: 'D', 7: 'C', 8: 'A', 9: 'C', 10: 'A',
    11: 'C', 12: 'B', 13: 'D', 14: 'B', 15: 'C', 16: 'B', 17: 'B', 18: 'D', 19: 'A', 20: 'C',
    21: 'A', 22: 'B', 23: 'D', 24: 'D', 25: 'A', 26: 'C', 27: 'C', 28: 'B', 29: 'D', 30: 'C',
    31: 'B', 32: 'D'
};

const QUESTIONS = [
    // Meristematic Tissues (Q1)
    {
        qNo: 1, topic: 'Meristematic Tissues', year: '2010',
        text: 'Which one of the following is not a lateral meristem?',
        A: 'Interfascicular cambium', B: 'Phellogen', C: 'Intercalary meristem', D: 'Intrafascicular cambium'
    },
    // Permanent Tissues (Q3-9) - skipping Q2 because the official answer key marks it as "none"
    {
        qNo: 3, topic: 'Permanent Tissues', year: '2022',
        text: 'In old trees the greater part of secondary xylem is dark brown and resistant to insect attack due to\nA. Secretion of secondary metabolities and their deposition in the lumen of vessels\nB. Deposition of organic compounds like tannins and resins in the central layers of stem\nC. Deposition of suberin and aromatic substances in the outer layer of stem\nD. Deposition of tannins, gum, resin and aromatic substances in the peripheral layers of stem\nE. Presence of parenchyma cells, functionally active xylem elements and essential oils.\nChoose the correct answer.',
        A: 'B and D only', B: 'A and B only', C: 'C and D only', D: 'D and E only'
    },
    {
        qNo: 4, topic: 'Permanent Tissues', year: '2021',
        text: 'Match List-I with List-II\nA. Cells with active cell division capacity → (i) Vascular tissues\nB. Tissue having all cells similar in structure and function → (ii) Meristematic tissue\nC. Tissue having different types of cells → (iii) Sclereids\nD. Dead cells with highly thickened walls and narrow lumen → (iv) Simple Tissue\nChoose the correct answer.',
        A: 'A-iv B-iii C-ii D-i', B: 'A-i B-ii C-iii D-iv', C: 'A-iii B-ii C-iv D-i', D: 'A-ii B-iv C-i D-iii'
    },
    {
        qNo: 5, topic: 'Permanent Tissues', year: '2020',
        text: 'The transverse section of a plant shows following anatomical features:\n1. Large number of scattered vascular bundles surrounded by bundle sheath.\n2. Large conspicuous parenchymatous ground tissue.\n3. Vascular bundles conjoint and closed.\n4. Phloem parenchyma absent.\nIdentify the category of plant and its part:',
        A: 'Monocotyledonous root', B: 'Dicotyledonous stem', C: 'Dicotyledonous root', D: 'Monocotyledonous stem'
    },
    {
        qNo: 6, topic: 'Permanent Tissues', year: '2019',
        text: 'Phloem in gymnosperms lacks',
        A: 'Albuminous cells and sieve cells', B: 'Sieve tubes only', C: 'Companion cells only', D: 'Both sieve tubes and companion cells'
    },
    {
        qNo: 7, topic: 'Permanent Tissues', year: '2017',
        text: 'Which of the following is made up of dead cells?',
        A: 'Xylem parenchyma', B: 'Collenchyma', C: 'Phellem', D: 'Phloem'
    },
    {
        qNo: 8, topic: 'Permanent Tissues', year: '2016',
        text: 'The balloon-shaped structures called tyloses:',
        A: 'Are extensions of xylem parenchyma cells into vessels', B: 'Are linked to the ascent of sap through xylem vessels', C: 'Originate in the lumen of vessels', D: 'Characterise the sapwood'
    },
    {
        qNo: 9, topic: 'Permanent Tissues', year: '2014',
        text: 'Tracheids differ from other tracheary elements in:',
        A: 'Being lignified', B: 'Having casparian strips', C: 'Being imperforate', D: 'Lacking nucleus'
    },
    // Tissue System (Q10-13)
    {
        qNo: 10, topic: 'Tissue System', year: '2018',
        text: 'Stomata in grass leaf are:',
        A: 'Dumb-bell shaped', B: 'Kidney shaped', C: 'Rectangular', D: 'Barrel shaped'
    },
    {
        qNo: 11, topic: 'Tissue System', year: '2016',
        text: 'Cortex is the region found between:',
        A: 'Endodermis and pith', B: 'Endodermis and vascular bundle', C: 'Epidermis and stele', D: 'Pericycle and endodermis'
    },
    {
        qNo: 12, topic: 'Tissue System', year: '2016',
        text: 'Specialised epidermal cells surrounding the guard cells are called',
        A: 'Complementary cells', B: 'Subsidiary cells', C: 'Bulliform cells', D: 'Lenticels'
    },
    {
        qNo: 13, topic: 'Tissue System', year: '2015',
        text: 'Vascular bundles in monocotyledons are considered closed because:',
        A: 'There are no vessels with perforations', B: 'Xylem is surrounded all around by phloem', C: 'A bundle sheath surrounds each bundle', D: 'Cambium is absent'
    },
    // Anatomy of Dicot & Monocot Plants (Q14-19)
    {
        qNo: 14, topic: 'Anatomy of Dicot & Monocot Plants', year: '2021',
        text: 'Select the correct pair.',
        A: 'In dicot leaves, vascular bundles are surrounded by large thick-walled cells - Conjunctive tissue', B: 'Cells of medullary rays that form part of cambial rings - Interfascicular cambium', C: 'Loose parenchyma cells rupturing the epidermis and forming a lens-shaped opening in bark - Spongy parenchyma', D: 'Large colorless empty cells in the epidermis of grass leaves - Subsidiary cells'
    },
    {
        qNo: 15, topic: 'Anatomy of Dicot & Monocot Plants', year: '2020',
        text: 'Large, empty colourless cells of the adaxial epidermis along the veins of grass leaves are',
        A: 'Guard cells', B: 'Bundle sheath cells', C: 'Bulliform cells', D: 'Lenticels'
    },
    {
        qNo: 16, topic: 'Anatomy of Dicot & Monocot Plants', year: '2019',
        text: 'Grass leaves curl inwards during very dry weather. Select the most appropriate reason from the following',
        A: 'Closure of stomata', B: 'Flaccidity of bulliform cells', C: 'Shrinkage of air spaces in spongy mesophyll', D: 'Tyloses in vessels'
    },
    {
        qNo: 17, topic: 'Anatomy of Dicot & Monocot Plants', year: '2018',
        text: 'Secondary xylem and phloem in dicot stem are produced by',
        A: 'Apical meristem', B: 'Vascular cambium', C: 'Phellogen', D: 'Axillary meristems'
    },
    {
        qNo: 18, topic: 'Anatomy of Dicot & Monocot Plants', year: '2018',
        text: 'Casparian strips occur in',
        A: 'Epidermis', B: 'Pericycle', C: 'Cortex', D: 'Endodermis'
    },
    {
        qNo: 19, topic: 'Anatomy of Dicot & Monocot Plants', year: '2015',
        text: 'A major characteristic of the monocot root is the presence of:',
        A: 'Vasculature without cambium', B: 'Cambium sandwiched between phloem and xylem along the radius', C: 'Open vascular bundles', D: 'Scattered vascular bundles'
    },
    // Secondary Growth (Q20-32)
    {
        qNo: 20, topic: 'Secondary Growth', year: '2021',
        text: 'The anatomy of springwood shows some peculiar features. Identify the correct set of statements about springwood.\nA. It is also called as the earlywood\nB. In spring season cambium produces xylem elements with narrow vessels\nC. It is lighter in colour.\nD. The springwood along with autumnwood shows alternate concentric rings forming annual rings\nE. It has lower density\nChoose the correct answer.',
        A: 'C, D and E only', B: 'A, B, D and E only', C: 'A, C, D and E only', D: 'A, B and D only'
    },
    {
        qNo: 21, topic: 'Secondary Growth', year: '2021',
        text: 'Match List-I with List-II\nA. Lenticels → (i) Phellogen\nB. Cork cambium → (ii) Suberin deposition\nC. Secondary cortex → (iii) Exchange of gases\nD. Cork → (iv) Phelloderm\nChoose the correct answer.',
        A: 'A-iii B-i C-iv D-ii', B: 'A-ii B-iii C-iv D-i', C: 'A-iv B-ii C-i D-iii', D: 'A-iv B-i C-iii D-ii'
    },
    {
        qNo: 22, topic: 'Secondary Growth', year: '2020',
        text: 'Identify the incorrect statement.',
        A: 'Sapwood is involved in conduction of water and minerals from root to leaf.', B: 'Sapwood is the innermost secondary xylem and is lighter in colour.', C: 'Due to deposition of tannins, resins, oils, etc., heart wood is dark in colour.', D: 'Heart wood does not conduct water but gives mechanical support.'
    },
    {
        qNo: 23, topic: 'Secondary Growth', year: '2020',
        text: 'Which of the following statements about cork cambium is incorrect?',
        A: 'It forms a part of periderm', B: 'It is responsible for the formation of lenticels', C: 'It is a couple of layers thick', D: 'It forms secondary cortex on its outerside'
    },
    {
        qNo: 24, topic: 'Secondary Growth', year: '2019',
        text: 'Which of the statements given below is not true about formation of annual rings in trees?',
        A: 'Annual ring is a combination of spring wood and autumn wood produced in a year', B: 'Differential activity of cambium causes light and dark bands of tissue-early and late wood respectively.', C: 'Activity of cambium depends upon variation in climate.', D: 'Annual rings are not prominent in trees of temperate region.'
    },
    {
        qNo: 25, topic: 'Secondary Growth', year: '2018',
        text: 'Plants having little or no secondary growth are',
        A: 'Grasses', B: 'Deciduous angiosperms', C: 'Conifers', D: 'Cycads'
    },
    {
        qNo: 26, topic: 'Secondary Growth', year: '2017',
        text: 'The vascular cambium normally gives rise to:',
        A: 'Phelloderm', B: 'Primary phloem', C: 'Secondary xylem', D: 'Periderm'
    },
    {
        qNo: 27, topic: 'Secondary Growth', year: '2017',
        text: 'Identify the wrong statement in context of heartwood:',
        A: 'Organic compounds are deposited in it', B: 'It is highly durable', C: 'It conducts water and minerals efficiently', D: 'It comprises dead elements with highly lignified wall'
    },
    {
        qNo: 28, topic: 'Secondary Growth', year: '2015',
        text: 'Read the different components from (A) to (D) in the list given below and tell the correct order of the components with reference to their arrangement from outer side to inner side in a woody dicot stem:\nA. Secondary cortex\nB. Wood\nC. Secondary phloem\nD. Phellem\nThe correct order is:',
        A: '(A), (B), (D), (C)', B: '(D), (A), (C), (B)', C: '(D), (C), (A), (B)', D: '(C), (D), (B), (A)'
    },
    {
        qNo: 29, topic: 'Secondary Growth', year: '2014',
        text: 'You are given a fairly old piece of dicot stem and a dicot root. Which of the following anatomical structures will you use to distinguish between the two?',
        A: 'Cortical cells', B: 'Secondary xylem', C: 'Secondary phloem', D: 'Protoxylem'
    },
    {
        qNo: 30, topic: 'Secondary Growth', year: '2013',
        text: 'Lenticels are involved in:',
        A: 'Photosynthesis', B: 'Transpiration', C: 'Gaseous exchange', D: 'Food transport'
    },
    {
        qNo: 31, topic: 'Secondary Growth', year: '2013',
        text: 'Interfascicular cambium develops from the cells of:',
        A: 'Pericycle', B: 'Medullary rays', C: 'Xylem parenchyma', D: 'Endodermis'
    },
    {
        qNo: 32, topic: 'Secondary Growth', year: '2013',
        text: 'Age of a tree can be estimated by:',
        A: 'Diameter of its heartwood', B: 'Its height and girth', C: 'Biomass', D: 'Number of annual rings'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME);

    // Anatomy of Flowering Plants is Chapter 6 in NCERT Biology Class 11
    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME.split(' ').slice(0, 2).join('%')}%`, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 5]);
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
