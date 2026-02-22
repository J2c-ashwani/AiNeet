/**
 * Seed REAL NEET PYQs — Chapter: Biotechnology and its Applications (12th Biology)
 * Usage: node scripts/seed_pyq_biotech_applications.mjs
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

const CHAPTER_NAME = 'Biotechnology and its Applications'; // Chapter 12 in Class 12
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 12;

const TOPICS = [
    'Biotechnological Application in Agriculture',
    'Biotechnological Application in Medicine',
    'Ethical Issues'
];

const ANSWER_KEY = {
    1: 'C', 2: 'D', 3: 'A', 4: 'A', 5: 'C', 6: 'D', 7: 'C', 8: 'C', 9: 'C', 10: 'A',
    11: 'C', 12: 'A', 13: 'B', 14: 'D', 15: 'B', 16: 'B', 17: 'B', 18: 'D', 19: 'B', 20: 'D',
    21: 'A', 22: 'C', 23: 'D', 24: 'B', 25: 'B', 26: 'D', 27: 'D', 28: 'D', 29: 'B', 30: 'A'
};

const QUESTIONS = [
    // Biotechnological Application in Agriculture (Q1-9)
    {
        qNo: 1, topic: 'Biotechnological Application in Agriculture', year: '2022',
        text: 'Transposons can be used during which one of the following?',
        A: 'Gene sequencing', B: 'Polymerase Chain Reaction', C: 'Gene silencing', D: 'Autoradiography'
    },
    {
        qNo: 2, topic: 'Biotechnological Application in Agriculture', year: '2020',
        text: 'Bt cotton variety that was developed by the introduction of toxin gene of Bacillus thuringiensis (Bt) is resistant to',
        A: 'Fungal diseases', B: 'Plant nematodes', C: 'Insect predators', D: 'Insect pests'
    },
    {
        qNo: 3, topic: 'Biotechnological Application in Agriculture', year: '2020',
        text: 'RNA interference is used for which of the following purposes in the field of biotechnology?',
        A: 'To develop a pest resistant plant against infestation by nematode', B: 'To enhance the mineral usage by the plant', C: 'To reduce post harvest losses', D: 'To develop a plant tolerant to abiotic stresses'
    },
    {
        qNo: 4, topic: 'Biotechnological Application in Agriculture', year: '2019',
        text: 'Which of the following is true for Golden rice?',
        A: 'It is Vitamin A enriched, with a gene from daffodil', B: 'It is pest resistant, with a gene from Bacillus thuringiensis', C: 'It is drought tolerant, developed using Agrobacterium vector', D: 'It has yellow grains, because of a gene introduced from a primitive variety of rice'
    },
    {
        qNo: 5, topic: 'Biotechnological Application in Agriculture', year: '2019',
        text: 'What triggers activation of protoxin to active Bt toxin of Bacillus thuringiensis in boll worm?',
        A: 'Body temperature', B: 'Moist surface of midgut', C: 'Alkaline pH of gut', D: 'Acidic pH of stomach'
    },
    {
        qNo: 6, topic: 'Biotechnological Application in Agriculture', year: '2016',
        text: 'Which part of the tobacco plant is infected by Meloidogyne incognita?',
        A: 'Flower', B: 'Leaf', C: 'Stem', D: 'Root'
    },
    {
        qNo: 7, topic: 'Biotechnological Application in Agriculture', year: '2015',
        text: 'In Bt cotton, the Bt toxin present in plant tissue as pro-toxin is converted into active toxin due to:',
        A: 'Action of gut micro-organism', B: 'Presence of conversion factors in insect gut', C: 'Alkaline pH of the insect gut', D: 'Acidic pH of the insect gut'
    },
    {
        qNo: 8, topic: 'Biotechnological Application in Agriculture', year: '2015',
        text: 'Golden rice is a genetically modified crop plant where the incorporated gene is meant for biosynthesis of:',
        A: 'Vitamin C', B: 'Omega 3', C: 'Vitamin A', D: 'Vitamin B'
    },
    {
        qNo: 9, topic: 'Biotechnological Application in Agriculture', year: '2013',
        text: 'Which of the following Bt crops is being grown in India by the farmers?',
        A: 'Soyabean', B: 'Maize', C: 'Cotton', D: 'Brinjal'
    },

    // Biotechnological Application in Medicine (Q10-25)
    {
        qNo: 10, topic: 'Biotechnological Application in Medicine', year: '2022',
        text: 'In gene therapy of Adenosine Deaminase (ADA) deficiency, the patient requires periodic infusion genetically engineered lymphocytes because:',
        A: 'Genetically engineered lymphocytes are not immortal cells.', B: 'Retroviral vector is introduced into these lymphocytes.', C: 'Gene isolated from marrow cells producing ADA is introduced into cells at embryonic stages', D: 'Lymphocytes from patient\'s blood are grown in culture, outside the body.'
    },
    {
        qNo: 11, topic: 'Biotechnological Application in Medicine', year: '2022',
        text: 'Statements related to human Insulin are given below. Which statement(s) is/are correct about genetically engineered Insulin?\nA. Pro-hormone insulin contain extra stretch of C-peptide\nB. A-peptide and B-peptide chains of insulin were produced separately in E.coli, extracted and combined by creating disulphide bond between them.\nC. Insulin used for treating Diabetes was extracted from Cattles and Pigs.\nD. Pro-hormone Insulin needs to be processed for converting into a mature and functional hormone.\nE. Some patients develop allergic reactions to the foreign insulin.\nChoose the most appropriate answer from the options given below.',
        A: 'C, D and E only', B: 'A, B and D only', C: 'B only', D: 'C and D only'
    },
    {
        qNo: 12, topic: 'Biotechnological Application in Medicine', year: '2021',
        text: 'When gene targetting involving gene amplification is attempted in an individual’s tissue to treat disease, it is known as:',
        A: 'Gene therapy', B: 'Molecular diagnosis', C: 'Safety testing', D: 'Biopiracy'
    },
    {
        qNo: 13, topic: 'Biotechnological Application in Medicine', year: '2021',
        text: 'Which of the following is not an application of PCR (Polymerase Chain Reaction) ?',
        A: 'Gene amplification', B: 'Purification of isolated protein', C: 'Detection of gene mutation', D: 'Molecular diagnosis'
    },
    {
        qNo: 14, topic: 'Biotechnological Application in Medicine', year: '2021',
        text: 'Which of the following is a correct sequence of steps in a PCR (Polymerase Chain Reaction)?',
        A: 'Denaturation, Extension, Annealing', B: 'Extension, Denaturation, Annealing', C: 'Annealing, Denaturation, Extension', D: 'Denaturation, Annealing, Extension'
    },
    {
        qNo: 15, topic: 'Biotechnological Application in Medicine', year: '2021',
        text: 'Now a days it is possible to detect the mutated gene causing cancer by allowing radioactive probe to hybridise its complimentary DNA in a clone of cells, followed by its detection using autoradiography because:',
        A: 'Mutated gene completely and clearly appears on a photographic film.', B: 'Mutated gene does not appear on a photographic film as the prober has no complimentarity with it.', C: 'Mutated gene does not appear on photographic film as the probe has complimentarity with it.', D: 'Mutated gene partially appears on a photographic film.' // Correct answer is B, per the key `b`. But actually the probe has NO complementarity so it doesn't hybridise and thus doesn't appear.
    },
    {
        qNo: 16, topic: 'Biotechnological Application in Medicine', year: '2021',
        text: 'With regard to insulin choose correct options.\nA. C-peptide is not present in mature insulin.\nB. The insulin produced by rDNA technology has C-peptide.\nC. The pro-insulin has C-peptide.\nD. A-peptide and B-peptide of insulin are interconnected by disulphide bridges.\nChoose the correct answer from the options given below.',
        A: 'B and C only', B: 'A, C and D only', C: 'A and D only', D: 'B and D only'
    },
    {
        qNo: 17, topic: 'Biotechnological Application in Medicine', year: '2021',
        text: 'For effective treatment of the disease, early diagnosis and understanding its pathophysiology is very important. Which of the following molecular diagnostic techniques is very useful for early detection?',
        A: 'Southern Blotting Technique', B: 'ELISA Technique', C: 'Hybridization Technique', D: 'Western Blotting Technique'
    },
    {
        qNo: 18, topic: 'Biotechnological Application in Medicine', year: '2021',
        text: 'The adenosine deaminase deficiency results into:',
        A: 'Parkinson’s disease', B: 'Digestive disorder', C: 'Addison’s disease', D: 'Dysfunction of Immune system'
    },
    {
        qNo: 19, topic: 'Biotechnological Application in Medicine', year: '2020',
        text: 'Which of the following statements is not correct?',
        A: 'The proinsulin has an extra peptide called C-peptide', B: 'The functional insulin has A and B chains linked together by hydrogen bonds', C: 'Genetically engineered insulin is produced in E.coli.', D: 'In man insulin is synthesised as a proinsulin.'
    }, // B is wrong because it's disulphide bonds, not hydrogen bonds
    {
        qNo: 20, topic: 'Biotechnological Application in Medicine', year: '2020',
        text: 'Match the following columns and select the correct option\nColumn-I\n1. Bt cotton\n2. Adenosine deaminase deficiency\n3. RNAi\n4. PCR\nColumn-II\n(i) Gene therapy\n(ii) Cellular defence\n(iii) Detection of HIV infection\n(iv) Bacillus thuringiensis\nSelect the correct option from the following:',
        A: '(iii) (ii) (i) (iv)', B: '(ii) (iii) (iv) (i)', C: '(i) (ii) (iii) (iv)', D: '(iv) (i) (ii) (iii)'
    },
    {
        qNo: 21, topic: 'Biotechnological Application in Medicine', year: '2018',
        text: 'Which of the following is commonly used as a vector for introducing a DNA fragment in human lymphocytes?',
        A: 'Retrovirus', B: 'Ti plasmid', C: 'λ phage', D: 'pBR322'
    },
    {
        qNo: 22, topic: 'Biotechnological Application in Medicine', year: '2016',
        text: 'Which kind of therapy was given in 1990 to a four year old girl with adenosine deaminase (ADA) deficiency?',
        A: 'Immunotherapy', B: 'Radiation therapy', C: 'Gene therapy', D: 'Chemotherapy'
    },
    {
        qNo: 23, topic: 'Biotechnological Application in Medicine', year: '2016',
        text: 'The two polypeptides of human insulin are linked together by:',
        A: 'Hydrogen bonds', B: 'Phosphodiester bond', C: 'Covalent bond', D: 'Disulphide bridges'
    },
    {
        qNo: 24, topic: 'Biotechnological Application in Medicine', year: '2014',
        text: 'ADA is an enzyme which is deficient in a genetic disorder SCID. What is the full form of ADA?',
        A: 'Adenosine DeoxyAminase', B: 'Adenosine Deaminase', C: 'Aspartate Deaminase', D: 'Arginine Deaminase'
    },
    {
        qNo: 25, topic: 'Biotechnological Application in Medicine', year: '2014',
        text: 'The first human hormone produced by recombinant DNA technology is:',
        A: 'Progesterone', B: 'Insulin', C: 'Estrogen', D: 'Thyroxin'
    },

    // Ethical Issues (Q26-30)
    {
        qNo: 26, topic: 'Ethical Issues', year: '2020',
        text: 'The laws and rules to prevent unauthorised exploitation of bio-resources are termed as-',
        A: 'Bioethics', B: 'Bioengineering', C: 'Biopiracy', D: 'Biopatenting'
    },
    {
        qNo: 27, topic: 'Ethical Issues', year: '2018',
        text: 'In India, the organisation responsible for assessing the safety of introducing genetically modified organisms for public use is:',
        A: 'Indian Council of Medical Research (ICMR)', B: 'Council for Scientific and Industrial Research (CSIR)', C: 'Research Committee on Genetic Manipulation (RCGM)', D: 'Genetic Engineering Appraisal Committee (GEAC)'
    },
    {
        qNo: 28, topic: 'Ethical Issues', year: '2018',
        text: 'A ‘new’ variety of rice was patented by a foreign company though such varieties have been present in India for a long time. This is related to:',
        A: 'Co-667', B: 'Sharbati Sonora', C: 'Lerma Rojo', D: 'Basmati'
    },
    {
        qNo: 29, topic: 'Ethical Issues', year: '2018',
        text: 'Use of bioresources by multinational companies and organisations without authorisation from the concerned country and its people is called:',
        A: 'Bio-infringement', B: 'Biopiracy', C: 'Biodegradation', D: 'Bioexploitation'
    },
    {
        qNo: 30, topic: 'Ethical Issues', year: '2015',
        text: 'Which body of the Government of India regulates GM research and safety of introducing GM organisms for public services?',
        A: 'Genetic Engineering Approval Committee', B: 'Research Committee on Genetic Manipulation', C: 'Bio-safety committee', D: 'Indian Council of Agricultural Research'
    }
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME, '(Class 12)');

    // Biotechnology and its Applications is Chapter 12 in NCERT Biology Class 12
    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    // Use an exact match or strict ILIKE instead of `%Biotechnology%` to prevent matching chapter 11 (Biotechnology: Principles and Processes)
    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`Biotechnology and its Applications`, subjectId]);
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
