/**
 * Seed REAL NEET PYQs — Chapter: Human Health and Diseases (12th Biology)
 * Usage: node scripts/seed_pyq_human_health.mjs
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

const CHAPTER_NAME = 'Human Health and Diseases';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 12;

const TOPICS = [
    'Common Disease in Humans',
    'Immunity',
    'AIDS',
    'Cancer',
    'Drugs & Alcohol Abuse'
];

const ANSWER_KEY = {
    1: 'A', 2: 'A', 3: 'A', 4: 'D', 5: 'D', 6: 'A', 7: 'C', 8: 'C', 9: 'A', 10: 'A',
    11: 'A', 12: 'C', 13: 'B', 14: 'B', 15: 'A', 16: 'D', 17: 'B', 18: 'D', 19: 'D', 20: 'D',
    21: 'A', 22: 'B', 23: 'D', 24: 'C', 25: 'A', 26: 'B', 27: 'B', 28: 'D', 29: 'A', 30: 'D',
    31: 'D', 32: 'B', 33: 'B', 34: 'B'
};

const QUESTIONS = [
    // Common Disease in Humans (Q1-14)
    {
        qNo: 1, topic: 'Common Disease in Humans', year: '2021',
        text: 'Match the following:\nList-I (A. Filariasis, B. Amoebiasis, C. Pneumonia, D. Ringworm)\nList-II (i. Haemophilus influenzae, ii. Trichophyton, iii. Wuchereria bancrofti, iv. Entamoeba histolytica)\nChoose the correct answer from the options given below.',
        A: 'A-iii B-iv C-i D-ii', B: 'A-i B-ii C-iv D-iii', C: 'A-ii B-iii C-i D-iv', D: 'A-iv B-i C-iii D-ii'
    },
    {
        qNo: 2, topic: 'Common Disease in Humans', year: '2020',
        text: 'Match the following diseases with the causative organism and select the correct option.\nColumn - I (1. Typhoid, 2. Pneumonia, 3. Filariasis, 4. Malaria)\nColumn - II (i. Wuchereria, ii. Plasmodium, iii. Salmonella, iv. Haemophilus)',
        A: '1-iii 2-iv 3-i 4-ii', B: '1-ii 2-i 3-iii 4-iv', C: '1-iv 2-i 3-ii 4-iii', D: '1-i 2-iii 3-ii 4-iv'
    },
    {
        qNo: 3, topic: 'Common Disease in Humans', year: '2020',
        text: 'The infectious stage of Plasmodium that enters the human body is:',
        A: 'Sporozoites', B: 'Female gametocytes', C: 'Male gametocytes', D: 'Trophozoites'
    },
    {
        qNo: 4, topic: 'Common Disease in Humans', year: '2020',
        text: 'Match the following columns and select the correct option:\nColumn-I (1. Typhoid, 2. Malaria, 3. Pneumonia, 4. Filariasis)\nColumn-II (i. Haemophilus influenzae, ii. Wuchereria bancrofti, iii. Plasmodium vivax, iv. Salmonella typhi)',
        A: '1-iii 2-iv 3-ii 4-i', B: '1-i 2-iii 3-ii 4-iv', C: '1-i 2-ii 3-iv 4-iii', D: '1-iv 2-iii 3-i 4-ii'
    },
    {
        qNo: 5, topic: 'Common Disease in Humans', year: '2019',
        text: 'Identify the correct pair representing the causative agent of typhoid fever and the confirmatory test for typhoid.',
        A: 'Plasmodium vivax / UTI test', B: 'Streptococcus pneumoniae / Widal test', C: 'Salmonella typhi / Anthrone test', D: 'Salmonella typhi / Widal test'
    },
    {
        qNo: 6, topic: 'Common Disease in Humans', year: '2018',
        text: 'In which disease does mosquito transmitted pathogen cause chronic inflammation of lymphatic vessels?',
        A: 'Elephantiasis', B: 'Ascariasis', C: 'Ringworm disease', D: 'Amoebiasis'
    },
    {
        qNo: 7, topic: 'Common Disease in Humans', year: '2018',
        text: 'Which of the following is not an autoimmune disease?',
        A: 'Psoriasis', B: 'Rheumatoid arthritis', C: 'Alzheimer\'s disease', D: 'Vitiligo'
    },
    {
        qNo: 8, topic: 'Common Disease in Humans', year: '2016',
        text: 'Which of the following sets of diseases is caused by bacteria?',
        A: 'Tetanus and mumps', B: 'Herpes and influenza', C: 'Cholera and tetanus', D: 'Typhoid and smallpox'
    },
    {
        qNo: 9, topic: 'Common Disease in Humans', year: '2016',
        text: 'The organisms which cause diseases in plants and animals are called:',
        A: 'Pathogens', B: 'Vectors', C: 'Insects', D: 'Worms'
    },
    {
        qNo: 10, topic: 'Common Disease in Humans', year: '2015',
        text: 'Which of the following viruses is not transferred through semen of an infected male?',
        A: 'Chikungunya virus', B: 'Ebola virus', C: 'Hepatitis B virus', D: 'Human immunodeficiency virus'
    },
    {
        qNo: 11, topic: 'Common Disease in Humans', year: '2015',
        text: 'Match each disease with its correct type of vaccine:\nA. Tuberculosis (i) Harmless virus\nB. Whooping cough (ii) Inactivated toxin\nC. Diphtheria (iii) Killed bacteria\nD. Polio (iv) Harmless bacteria',
        A: 'A-iv B-iii C-ii D-i', B: 'A-i B-ii C-iv D-iii', C: 'A-ii B-i C-iii D-iv', D: 'A-iii B-ii C-iv D-i'
    },
    {
        qNo: 12, topic: 'Common Disease in Humans', year: '2015',
        text: 'The active form of Entamoeba histolytica feeds upon:',
        A: 'Food in intestine', B: 'Blood only', C: 'Erythrocytes; mucosa and submucosa of colon', D: 'Mucosa and submucosa of colon only'
    },
    {
        qNo: 13, topic: 'Common Disease in Humans', year: '2015',
        text: 'Which of the following diseases is caused by a protozoan?',
        A: 'Influenza', B: 'Babesiosis', C: 'Blastomycosis', D: 'Syphilis'
    },
    {
        qNo: 14, topic: 'Common Disease in Humans', year: '2013',
        text: 'Infection of Ascaris usually occurs by:',
        A: 'Mosquito bite', B: 'Drinking water containing eggs of Ascaris', C: 'Eating imperfectly cooked pork', D: 'Tse-tse fly'
    },
    // Immunity (Q15-27)
    {
        qNo: 15, topic: 'Immunity', year: '2022',
        text: 'Select the incorrect statement with respect to acquired immunity.',
        A: 'Acquired immunity is non-specific type of defense present at the time of birth', B: 'Primary response is produced when our body encounters a pathogen for the first time.', C: 'Anamnestic response is elicited on subsequent encounters with the same pathogen.', D: 'Anamnestic response is due to memory of first encounter.'
    },
    {
        qNo: 16, topic: 'Immunity', year: '2022',
        text: 'Given below are two statements:\nStatement I: Autoimmune disorder is a condition where body defense mechanism recognizes its own cells as foreign bodies.\nStatement II: Rheumatoid arthritis is a condition where body does not attack self cells.\nIn the light of the above statements, choose the most appropriate answer from the options given below.',
        A: 'Statement I is incorrect but Statement II is correct', B: 'Both Statement I and Statement II are correct', C: 'Both statement I and statement II are incorrect', D: 'Statement I is correct but Statement II is incorrect'
    },
    {
        qNo: 17, topic: 'Immunity', year: '2020',
        text: 'Identify the wrong statement with reference to immunity.',
        A: 'When ready-made antibodies are directly given, it is called “Passive immunity”.', B: 'Active immunity is quick and gives full response.', C: 'Foetus receives some antibodies from mother, it is an example for passive immunity.', D: 'When exposed to antigen (living or dead) antibodies are produced in the host’s body. It is called “Active immunity”.'
    },
    {
        qNo: 18, topic: 'Immunity', year: '2020',
        text: 'The yellowish fluid "colostrum" secreted by mammary glands of mother during the initial days of lactation has abundant antibodies (IgA) to protect the infant. This type of immunity is called as:',
        A: 'Active immunity', B: 'Acquired immunity', C: 'Autoimmunity', D: 'Passive immunity'
    },
    {
        qNo: 19, topic: 'Immunity', year: '2019',
        text: 'Colostrum, the yellowish fluid, secreted by mother during the initial days of lactation is very essential to impart immunity to the new born infants because it contains',
        A: 'Natural killer cells', B: 'Monocytes', C: 'Macrophages', D: 'Immunoglobulin A'
    },
    {
        qNo: 20, topic: 'Immunity', year: '2019',
        text: 'Which of the following immune responses is responsible for rejection of kidney graft?',
        A: 'Auto-immune response', B: 'Humoral immune response', C: 'Inflammatory immune response', D: 'Cell-mediated immune response'
    },
    {
        qNo: 21, topic: 'Immunity', year: '2017',
        text: 'MALT constitutes about ___________ percent of the lymphoid tissue in human body.',
        A: '50%', B: '20%', C: '70%', D: '10%'
    },
    {
        qNo: 22, topic: 'Immunity', year: '2017',
        text: 'Transplantation of tissues/organs fails often due to non-acceptance by the patient’s body. Which type of immune-response is responsible for such rejections?',
        A: 'Autoimmune response', B: 'Cell-mediated immune response', C: 'Hormonal immune response', D: 'Physiological immune response'
    },
    {
        qNo: 23, topic: 'Immunity', year: '2016',
        text: 'Antivenom injection contains preformed antibodies while polio drops that are administered into the body contain:',
        A: 'Activated pathogens', B: 'Harvested antibodies', C: 'Gamma globulin', D: 'Attenuated pathogens'
    },
    {
        qNo: 24, topic: 'Immunity', year: '2016',
        text: 'In higher vertebrates, the immune system can distinguish self-cells and non-self. If this property is lost due to genetic abnormality and it attacks self cells, then it leads to:',
        A: 'Allergic response', B: 'Graft rejection', C: 'Auto-immune disease', D: 'Active immunity'
    },
    {
        qNo: 25, topic: 'Immunity', year: '2015',
        text: 'Grafted kidney may be rejected in a patient due to:',
        A: 'Cell-mediated immune response', B: 'Passive immune response', C: 'Innate immune response', D: 'Humoral immune response'
    },
    {
        qNo: 26, topic: 'Immunity', year: '2015',
        text: 'Which of the following immunoglobulins does constitute the largest percentage in human milk?',
        A: 'IgM', B: 'IgA', C: 'IgG', D: 'IgD'
    },
    {
        qNo: 27, topic: 'Immunity', year: '2013',
        text: 'The cell-mediated immunity inside the human body is carried out by:',
        A: 'Erythrocytes', B: 'T-lymphocytes', C: 'B-lymphocytes', D: 'Thrombocytes'
    },
    // AIDS (Q28-30)
    {
        qNo: 28, topic: 'AIDS', year: '2016',
        text: 'Which of the following is correct regarding AIDS causative agent HIV?',
        A: 'HIV is undeveloped retrovirus.', B: 'HIV does not escape but attacks the acquired immune response.', C: 'HIV is enveloped virus containing one molecule of single-stranded RNA and one molecule of reverse transcriptase.', D: 'HIV is enveloped virus that contains two identical molecules of single-stranded RNA and two molecules of reverse transcriptase.'
    },
    {
        qNo: 29, topic: 'AIDS', year: '2015',
        text: 'HIV that causes AIDS, first starts destroying:',
        A: 'Helper T - Lymphocytes', B: 'Thrombocytes', C: 'B - Lymphocytes', D: 'Leucocytes'
    },
    {
        qNo: 30, topic: 'AIDS', year: '2014',
        text: 'At which stage of HIV infection does one usually show symptoms of AIDS?',
        A: 'When the viral DNA is produced by reverse transcriptase', B: 'Within 15 days of sexual contact with an infected person', C: 'When the infected retro virus enters host cells', D: 'When HIV damages large number of helper T- lymphocytes'
    },
    // Cancer (Q31)
    {
        qNo: 31, topic: 'Cancer', year: '2016',
        text: 'Which of the following statements is not true for cancer cells in relation to mutations?',
        A: 'Mutations in proto-oncogenes accelerate the cell cycle', B: 'Mutations destroy telomerase inhibitor', C: 'Mutations inactivate the cell control', D: 'Mutations inhibit production of telomerase'
    },
    // Drugs & Alcohol Abuse (Q32-34)
    {
        qNo: 32, topic: 'Drugs & Alcohol Abuse', year: '2019',
        text: 'Drug called ‘Heroin’ is synthesised by',
        A: 'Methylation of morphine', B: 'Acetylation of morphine', C: 'Glycosylation of morphine', D: 'Nitration of morphine'
    },
    {
        qNo: 33, topic: 'Drugs & Alcohol Abuse', year: '2018',
        text: 'Which part of poppy plant is used to obtain the drug "Smack"?',
        A: 'Flowers', B: 'Latex', C: 'Roots', D: 'Leaves'
    },
    {
        qNo: 34, topic: 'Drugs & Alcohol Abuse', year: '2014',
        text: 'Which is the particular type of drug that is obtained from the plant whose one flowering branch is shown below? (Image based)',
        A: 'Pain-killer', B: 'Hallucinogen', C: 'Depressant', D: 'Stimulant'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME, '(Class 12)');

    // Human Health and Diseases is Chapter 8 in NCERT Biology Class 12
    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME.split(' ').slice(0, 2).join('%')}%`, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 8]); // Typically ch 8
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
