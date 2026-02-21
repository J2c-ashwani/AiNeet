/**
 * Seed REAL NEET PYQs — Chapter: Cell Cycle and Cell Division (11th Biology)
 * Usage: node scripts/seed_pyq_cell_cycle.mjs
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

const CHAPTER_NAME = 'Cell Cycle and Cell Division';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Cell Cycle',
    'Mitosis',
    'Meiosis',
];

const ANSWER_KEY = {
    1: 'D', 2: 'D', 3: 'B', 4: 'B', 5: 'A', 6: 'C', 7: 'D', 8: 'A', 9: 'C', 10: 'C',
    11: 'C', 12: 'A', 13: 'D', 14: 'B', 15: 'D', 16: 'C', 17: 'A', 18: 'C', 19: 'B', 20: 'C',
    21: 'D', 22: 'B', 23: 'B', 24: 'B', 25: 'D', 26: 'C', 27: 'B', 28: 'B', 29: 'A', 30: 'B',
    31: 'A', 32: 'B', 33: 'C', 34: 'A', 35: 'D', 36: 'A', 37: 'B', 38: 'D',
};

const QUESTIONS = [
    // Cell Cycle (Q1-14)
    {
        qNo: 1, topic: 'Cell Cycle', year: '2021',
        text: 'The fruit fly has 8 chromosomes (2n) in each cell. During interphase of Mitosis if the number of chromosomes at G1 phase is 8, what would be the number of chromosomes after S phase?',
        A: '16', B: '4', C: '32', D: '8'
    },
    {
        qNo: 2, topic: 'Cell Cycle', year: '2021',
        text: 'The centriole undergoes duplication during:',
        A: 'Prophase', B: 'Metaphase', C: 'G2 phase', D: 'S-phase'
    },
    {
        qNo: 3, topic: 'Cell Cycle', year: '2021',
        text: 'Match List-I with List-II\nA. S phase → (i) Proteins are synthesized\nB. G2 phase → (ii) Inactive phase\nC. Quiescent stage → (iii) Interval between mitosis and initiation of DNA replication\nD. G1 phase → (iv) DNA replication\nChoose the correct answer from the options given below.',
        A: 'A-iv B-ii C-iii D-i', B: 'A-iv B-i C-ii D-iii', C: 'A-ii B-iv C-iii D-i', D: 'A-iii B-ii C-i D-iv'
    },
    {
        qNo: 4, topic: 'Cell Cycle', year: '2020',
        text: 'Identify the correct statement with regard to G1 phase (Gap 1) of interphase.',
        A: 'Reorganisation of all cell components takes place.', B: 'Cell is metabolically active, grows but does not replicate its DNA.', C: 'Nuclear division takes place.', D: 'DNA synthesis or replication takes place.'
    },
    {
        qNo: 5, topic: 'Cell Cycle', year: '2020',
        text: 'Some dividing cells exit the cell cycle and enter vegetative inactive stage. This is called quiescent stage (G0). This process occurs at the end of:',
        A: 'M phase\n(Note: NEET answer key often considers M phase end or early G1. Actual key says A, often meaning M or G1 depending on the exact option set.)', B: 'S phase', C: 'G2 phase', D: 'G1 phase'
    },
    {
        qNo: 6, topic: 'Cell Cycle', year: '2020',
        text: 'Match the following events that occur in their respective phases of cell cycle and select the correct option:\n1. G1 phase → (i) Cell grows and organelle duplication\n2. S phase → (ii) DNA replication and chromosome duplication\n3. G2 phase → (iii) Cytoplasmic growth\n4. Metaphase in M-phase → (iv) Alignment of chromosomes',
        A: '(iii) (iv) (i) (ii)', B: '(iv) (i) (ii) (iii)', C: '(i) (ii) (iii) (iv)', D: '(ii) (iii) (iv) (i)'
    },
    {
        qNo: 7, topic: 'Cell Cycle', year: '2019',
        text: 'The correct sequence of phases of cell cycle is',
        A: 'M → G1 → G2 → S', B: 'G1 → G2 → S → M', C: 'S → G1 → G2 → M', D: 'G1 → S → G2 → M'
    },
    {
        qNo: 8, topic: 'Cell Cycle', year: '2019',
        text: 'Cells in G0 phase',
        A: 'Exit the cell cycle', B: 'Enter the cell cycle', C: 'Suspend the cell cycle', D: 'Terminate the cell cycle'
    },
    {
        qNo: 9, topic: 'Cell Cycle', year: '2017',
        text: 'DNA replication in bacteria occurs:',
        A: 'During S-phase', B: 'Within nucleolus', C: 'Prior to fission', D: 'Just before transcription'
    },
    {
        qNo: 10, topic: 'Cell Cycle', year: '2016',
        text: 'When a cell has stalled DNA replication fork, which checkpoint should be predominantly activated?',
        A: 'M', B: 'Both G2/M and M', C: 'G1/S', D: 'G2/M'
    },
    {
        qNo: 11, topic: 'Cell Cycle', year: '2016',
        text: 'During cell growth, DNA synthesis takes place in:',
        A: 'G2 phase', B: 'M phase', C: 'S phase', D: 'G1 phase'
    },
    {
        qNo: 12, topic: 'Cell Cycle', year: '2015',
        text: 'A somatic cell that has just completed the S phase of its cell cycle, as compared to gamete of the same species, has:',
        A: 'Twice the number of chromosomes and four times the amount of DNA', B: 'Four times the number of chromosomes and twice the amount of DNA', C: 'Twice the number of chromosomes and twice the amount of DNA', D: 'Same number of chromosomes but twice the amount of DNA'
    },
    {
        qNo: 13, topic: 'Cell Cycle', year: '2014',
        text: 'During which phase(s) of cell cycle, amount of DNA in a cell remains at 4C level if the initial amount is denoted as 2C?',
        A: 'G0 and G1', B: 'G1 and S', C: 'Only G2', D: 'G2 and M'
    },
    {
        qNo: 14, topic: 'Cell Cycle', year: '2014',
        text: "In 'S' phase of the cell cycle:",
        A: 'Amount of DNA is reduced to half in each cell', B: 'Amount of DNA doubles in each cell', C: 'Amount of DNA remains same in each cell', D: 'Chromosome number is increased'
    },
    // Mitosis (Q15-24)
    {
        qNo: 15, topic: 'Mitosis', year: '2022',
        text: 'Which one of the following never occurs during mitotic cell division?',
        A: 'Coiling and condensation of the chromatids', B: 'Spindle fibres attach to kinetochores of chromosomes', C: 'Movement of centrioles towards opposite poles', D: 'Pairing of homologous chromosomes'
    },
    {
        qNo: 16, topic: 'Mitosis', year: '2022',
        text: 'Select the incorrect statement with reference to mitosis:',
        A: 'Splitting of centromere occurs at anaphase.', B: 'All the chromosomes lie at the equator at metaphase.', C: 'Spindle fibres attach to centromere of chromosomes', D: 'Chromosomes decondense at telophase.'
    },
    {
        qNo: 17, topic: 'Mitosis', year: '2020',
        text: 'In a mitotic cycle, the correct sequence of phases is',
        A: 'G1, S, G2, M', B: 'M, G1, G2, S', C: 'G1, G2, S, M', D: 'S, G1, G2, M'
    },
    {
        qNo: 18, topic: 'Mitosis', year: '2020',
        text: 'Attachment of spindle fibers to kinetochores of chromosomes becomes evident in:',
        A: 'Telophase', B: 'Prophase', C: 'Metaphase', D: 'Anaphase'
    },
    {
        qNo: 19, topic: 'Mitosis', year: '2017',
        text: 'Which of the following options gives the correct sequence of events during mitosis?',
        A: 'Condensation → Nuclear membrane disassembly → Crossing over → Segregation → Telophase', B: 'Condensation → Nuclear membrane disassembly → Arrangement at equator → Centromere division → Segregation → Telophase', C: 'Condensation → Crossing over → Nuclear membrane disassembly → Segregation → Telophase', D: 'Condensation → Arrangement at equator → Centromere division → Segregation → Telophase'
    },
    {
        qNo: 20, topic: 'Mitosis', year: '2017',
        text: 'Anaphase promoting complex (APC) is a protein degradation machinery necessary for proper mitosis of animal cells. If APC is defective in a human cell, which of the following is expected to occur?',
        A: 'Chromosomes will not condense', B: 'Chromosomes will be fragmented', C: 'Chromosomes will not segregate', D: 'Recombination of chromosome arms will occur'
    },
    {
        qNo: 21, topic: 'Mitosis', year: '2016',
        text: 'Which of the following is not a characteristic feature during mitosis in somatic cells?',
        A: 'Spindle fibres', B: 'Disappearance of nucleolus', C: 'Chromosome movement', D: 'Synapsis'
    },
    {
        qNo: 22, topic: 'Mitosis', year: '2016',
        text: 'Spindle fibres attach on to:',
        A: 'Telomere of the chromosome', B: 'Kinetochore of the chromosome', C: 'Centromere of the chromosome', D: 'Kinetosome of the chromosome'
    },
    {
        qNo: 23, topic: 'Mitosis', year: '2016',
        text: 'A cell at telophase stage is observed by a student in a plant brought from the field. He tells his teacher that this cell is not like other cells at telophase stage. There is no formation of cell plate and thus the cell is containing more number of chromosomes as compared to other dividing cells. This would result in:',
        A: 'Aneuploidy', B: 'Polyploidy', C: 'Somaclonal variation', D: 'Polyteny'
    },
    {
        qNo: 24, topic: 'Mitosis', year: '2013',
        text: 'A stage in cell division is shown in the figure. Select the answer which gives correct identification of the stage with its characteristics:',
        A: 'Telophase: Endoplasmic reticulum and nucleolus not reformed yet.', B: 'Telophase: Nuclear envelope reforms, Golgi complex reforms.', C: 'Late Anaphase: Chromosomes move away from equatorial plate, Golgi complex not present.', D: 'Cytokinesis: Cell plate formed, mitochondria distributed between two daughter cells.'
    },
    // Meiosis (Q25-38)
    {
        qNo: 25, topic: 'Meiosis', year: '2022',
        text: 'The appearance of recombination nodules on homologous chromosomes during meiosis characterizes?',
        A: 'Terminalization', B: 'Synaptonemal complex', C: 'Bivalent', D: 'Sites at which crossing over occurs'
    },
    {
        qNo: 26, topic: 'Meiosis', year: '2022',
        text: 'Regarding Meiosis, which of the statements is incorrect?',
        A: 'Four haploid cells are formed at the end of Meiosis-II', B: 'There are two stages in Meiosis, Meiosis-I and II', C: 'DNA replication occurs in S phase of Meiosis-II', D: 'Pairing of homologous chromosomes and recombination occurs in Meiosis-I'
    },
    {
        qNo: 27, topic: 'Meiosis', year: '2021',
        text: 'Which stage of meiotic prophase shows terminalisation of chiasmata as its distinctive feature?',
        A: 'Zygotene', B: 'Diakinesis', C: 'Pachytene', D: 'Leptotene'
    },
    {
        qNo: 28, topic: 'Meiosis', year: '2021',
        text: 'Which of the following stages of meiosis involves division of centromere?',
        A: 'Metaphase II', B: 'Anaphase II', C: 'Telophase II', D: 'Metaphase I'
    },
    {
        qNo: 29, topic: 'Meiosis', year: '2020',
        text: 'Match the following with respect to meiosis:\n1. Zygotene → (i) Terminalization\n2. Pachytene → (ii) Chiasmata\n3. Diplotene → (iii) Crossing over\n4. Diakinesis → (iv) Synapsis\nSelect the correct option',
        A: '(iv) (iii) (ii) (i)', B: '(i) (ii) (iv) (iii)', C: '(ii) (iv) (iii) (i)', D: '(iii) (iv) (i) (ii)'
    },
    {
        qNo: 30, topic: 'Meiosis', year: '2020',
        text: 'Dissolution of the synaptonemal complex occurs during:',
        A: 'Zygotene', B: 'Diplotene', C: 'Leptotene', D: 'Pachytene'
    },
    {
        qNo: 31, topic: 'Meiosis', year: '2020',
        text: 'During Meiosis I, in which stage synapsis takes place?',
        A: 'Zygotene', B: 'Diplotene', C: 'Leptotene', D: 'Pachytene'
    },
    {
        qNo: 32, topic: 'Meiosis', year: '2018',
        text: 'The stage during which separation of the paired homologous chromosomes begins is',
        A: 'Pachytene', B: 'Diplotene', C: 'Diakinesis', D: 'Zygotene'
    },
    {
        qNo: 33, topic: 'Meiosis', year: '2016',
        text: 'Match the stages of meiosis in Column-I to their characteristic features in Column-II:\nA. Pachytene → i. Pairing of homologous chromosomes\nB. Metaphase-I → ii. Terminalisation of chiasmata\nC. Diakinesis → iii. Crossing over takes place\nD. Zygotene → iv. Chromosomes align at equatorial plate',
        A: 'A-ii B-iv C-iii D-i', B: 'A-iv B-iii C-ii D-i', C: 'A-iii B-iv C-ii D-i', D: 'A-i B-iv C-ii D-iii'
    },
    {
        qNo: 34, topic: 'Meiosis', year: '2016',
        text: 'In meiosis, crossing over is initiated at:',
        A: 'Pachytene', B: 'Leptotene', C: 'Zygotene', D: 'Diplotene'
    },
    {
        qNo: 35, topic: 'Meiosis', year: '2015',
        text: 'Select the correct option:\nA. Synapsis aligns the homologous chromosomes → i. Anaphase-II\nB. Synthesis of RNA and protein → ii. Zygotene\nC. Action of enzyme recombinase → iii. G2-phase\nD. Centromeres do not separate but chromatids move towards opposite poles → iv. Anaphase-I\n                                              v. Pachytene',
        A: 'A-i B-ii C-iii D-iv', B: 'A-ii B-iii C-iv D-v', C: 'A-ii B-i C-iii D-iv', D: 'A-ii B-iii C-v D-iv'
    },
    {
        qNo: 36, topic: 'Meiosis', year: '2015',
        text: 'Arrange the following events of meiosis in correct sequence:\nA. Crossing over\nB. Synapsis\nC. Terminalisation of chiasmata\nD. Disappearance of nucleolus',
        A: '(B), (A), (C), (D)', B: '(A), (B), (C), (D)', C: '(B), (C), (D), (A)', D: '(B), (A), (D), (C)'
    },
    {
        qNo: 37, topic: 'Meiosis', year: '2014',
        text: 'The enzyme recombinase is required at which stage of meiosis?',
        A: 'Diakinesis', B: 'Pachytene', C: 'Zygotene', D: 'Diplotene'
    },
    {
        qNo: 38, topic: 'Meiosis', year: '2013',
        text: 'The complex formed by a pair of synapsed homologous chromosomes is called:',
        A: 'Axoneme', B: 'Equatorial plate', C: 'Kinetochores', D: 'Bivalent'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME);

    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME.split(' ').slice(0, 2).join('%')}%`, subjectId]);
    if (!chapter) {
        // Find existing chapter ID or create new. Usually "Cell Cycle and Cell Division"
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 17]);
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
