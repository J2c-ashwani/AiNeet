/**
 * Seed REAL NEET PYQs — Chapter: Organisms and Populations (12th Biology)
 * Usage: node scripts/seed_pyq_organisms_populations.mjs
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

const CHAPTER_NAME = 'Organisms and Populations';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 12;

const TOPICS = [
    'Major Biomes, Abiotic Factors and Responses to Abiotic Factors',
    'Adaptations',
    'Population Attributes, Population Growth and Life History Variation',
    'Population Interactions'
];

const ANSWER_KEY = {
    1: 'D', 2: 'B', 3: 'A', 4: 'B', 5: 'D', 6: 'B', 7: 'B', 8: 'B', 9: 'B', 10: 'B',
    11: 'C', 12: 'C', 13: 'B', 14: 'A', 15: 'B', 16: 'A', 17: 'C', 18: 'A', 19: 'B', 20: 'D',
    21: 'D', 22: 'D', 23: 'A', 24: 'D', 25: 'B', 26: 'D', 27: 'D', 28: 'D', 29: 'B', 30: 'C',
    31: 'D', 32: 'D'
};

const QUESTIONS = [
    // Major Biomes, Abiotic Factors and Responses to Abiotic Factors (Q1-3)
    {
        qNo: 1, topic: 'Major Biomes, Abiotic Factors and Responses to Abiotic Factors', year: '2018',
        text: 'Niche is:',
        A: 'All the biological factors in the organism environment', B: 'The physical space where an organism live', C: 'The range of temperature that the organism needs to live', D: 'The functional role played by the organism where it lives'
    },
    {
        qNo: 2, topic: 'Major Biomes, Abiotic Factors and Responses to Abiotic Factors', year: '2015',
        text: 'Most animals are tree dwellers in a:',
        A: 'Temperature deciduous forest', B: 'Tropical rain forest', C: 'Coniferous forest', D: 'Thorn woodland'
    },
    {
        qNo: 3, topic: 'Major Biomes, Abiotic Factors and Responses to Abiotic Factors', year: '2014',
        text: 'Just as a person moving from Delhi to Shimla to escape the heat for the duration of hot summer, thousands of migratory birds from Siberia and other extremely cold northern regions move to:',
        A: 'Keolado National Park', B: 'Western Ghat', C: 'Meghalaya', D: 'Corbett National Park'
    },
    // Adaptations (Q4-8)
    {
        qNo: 4, topic: 'Adaptations', year: '2021',
        text: 'Match List-I with List-II:\nList-I (A. Allen’s Rule, B. Physiological adaptation, C. Behavioural adaptation, D. Biochemical adaptation)\nList-II (i. Kangaroo rat, ii. Desert lizard, iii. Marine fish at depth, iv. Polar seal)',
        A: 'A-iv B-i C-iii D-ii', B: 'A-iv B-i C-ii D-iii', C: 'A-iv B-iii C-ii D-i', D: 'A-iv B-ii C-iii D-i'
    },
    {
        qNo: 5, topic: 'Adaptations', year: '2021',
        text: 'Assertion (A): A person goes to high altitude and experiences ‘altitude sickness’ with symptoms like breathing difficulty and heart palpitations.\nReason (R): Due to low atmospheric pressure at high altitude, the body does not get sufficient oxygen.\nIn the light of the above statements, choose the correct answer from the options given below.',
        A: 'Both (A) and (R) are true but (R) is not the correct explanation of (A)', B: '(A) is true but (R) is false', C: '(A) is false but (R) is true', D: 'Both (A) and (R) are true and (R) is the correct explanation of (A)'
    },
    {
        qNo: 6, topic: 'Adaptations', year: '2017',
        text: 'Plants which produce characteristic pneumatophores and show vivipary belong to:',
        A: 'Mesophytes', B: 'Halophytes', C: 'Psammophytes', D: 'Hydrophytes'
    },
    {
        qNo: 7, topic: 'Adaptations', year: '2016',
        text: 'It is much easier for a small animal to run uphill than for a large animal, because:',
        A: 'It is easier to carry a small body weight', B: 'Smaller animals have a higher metabolic rate', C: 'Smaller animals have a lower O2 requirement', D: 'The efficiency of muscles in large animals is less than in the small animals'
    },
    {
        qNo: 8, topic: 'Adaptations', year: '2014',
        text: 'Which of the following are likely to be present in deep sea water?',
        A: 'Saprophytic fungi', B: 'Archaebacteria', C: 'Eubacteria', D: 'Blue-green algae'
    },
    // Population Attributes, Population Growth and Life History Variation (Q9-18)
    {
        qNo: 9, topic: 'Population Attributes, Population Growth and Life History Variation', year: '2022',
        text: 'If ‘8’ Drosophila in a laboratory population of \'80\' died during a week, the death rate in the population is _________ individuals per Drosophila per week.',
        A: 'Zero', B: '0.1', C: '10', D: '1.0'
    },
    {
        qNo: 10, topic: 'Population Attributes, Population Growth and Life History Variation', year: '2021',
        text: 'In the exponential growth equation N_t = N_o e^{rt}, e represents:',
        A: 'The base of exponential logarithms', B: 'The base of natural logarithms', C: 'The base of geometric logarithms', D: 'The base of number logarithms'
    },
    {
        qNo: 11, topic: 'Population Attributes, Population Growth and Life History Variation', year: '2020',
        text: 'Which of the following is not an attribute of a population?',
        A: 'Natality', B: 'Mortality', C: 'Species interaction', D: 'Sex ratio'
    },
    {
        qNo: 12, topic: 'Population Attributes, Population Growth and Life History Variation', year: '2020',
        text: 'The impact of immigration on population density is:',
        A: 'Both positive and negative', B: 'Neutralized by natality', C: 'Positive', D: 'Negative'
    },
    {
        qNo: 13, topic: 'Population Attributes, Population Growth and Life History Variation', year: '2018',
        text: 'Natality refers to:',
        A: 'Death rate', B: 'Birth rate', C: 'Number of individuals leaving the habitat', D: 'Number of individuals entering a habitat'
    },
    {
        qNo: 14, topic: 'Population Attributes, Population Growth and Life History Variation', year: '2018',
        text: 'In a growing population of a country:',
        A: 'Pre-reproductive individuals are more than the reproductive individuals.', B: 'Reproductive individuals are less than the post-reproductive individuals.', C: 'Reproductive and pre-reproductive individuals are equal in number.', D: 'Pre-reproductive individuals are less than the reproductive individuals.'
    },
    {
        qNo: 15, topic: 'Population Attributes, Population Growth and Life History Variation', year: '2017',
        text: 'Asymptote in a logistic growth curve is obtained when:',
        A: 'The value of ‘r’ approaches zero', B: 'K = N', C: 'K > N', D: 'K < N'
    },
    {
        qNo: 16, topic: 'Population Attributes, Population Growth and Life History Variation', year: '2016',
        text: 'When does the growth rate of a population following the logistic model equal zero? The logistic model is given as dN/dt = rN (1-N/K):',
        A: 'When N/K is exactly one', B: 'When N nears the carrying capacity of the habitat', C: 'When N/K equals zero', D: 'When death rate is greater than birth rate'
    },
    {
        qNo: 17, topic: 'Population Attributes, Population Growth and Life History Variation', year: '2016',
        text: 'Which of the following is correct for r-selected species?',
        A: 'Small number of progeny with small size', B: 'Small number of progeny with large size', C: 'Large number of progeny with small size', D: 'Large number of progeny with large size'
    },
    {
        qNo: 18, topic: 'Population Attributes, Population Growth and Life History Variation', year: '2013',
        text: 'A biologist studied the population of rats in a barn. He found that the average natality was 250, average mortality 240, immigration 20 and emigration 30. The net increase in population is:',
        A: 'Zero', B: '10', C: '15', D: '05'
    },
    // Population Interactions (Q19-32)
    {
        qNo: 19, topic: 'Population Interactions', year: '2022',
        text: 'While explaining interspecific interaction of population, (+) sign is assigned for beneficial interaction, (–) sign is assigned for detrimental interaction and (0) for neutral interaction. Which of the following interactions can be assigned (+) for one species and (–) for another species involved in the interaction?',
        A: 'Competition', B: 'Predation', C: 'Amensalism', D: 'Commensalism'
    },
    {
        qNo: 20, topic: 'Population Interactions', year: '2022',
        text: 'Which one of the following statements cannot be connected to Predation?',
        A: 'It is necessitated by nature to maintain the ecological balance', B: 'It helps in maintaining species diversity in a community', C: 'It might lead to extinction of a species', D: 'Both the interacting species are negatively impacted'
    },
    {
        qNo: 21, topic: 'Population Interactions', year: '2021',
        text: 'Inspite of interspecific competition in nature, which mechanism the competing species might have evolved for their survival?',
        A: 'Competitive release', B: 'Mutualism', C: 'Predation', D: 'Resource Partitioning'
    },
    {
        qNo: 22, topic: 'Population Interactions', year: '2021',
        text: 'Amensalism can be represented as:',
        A: 'Species A (+) ; Species B (+)', B: 'Species A (-) ; Species B (-)', C: 'Species A (+) ; Species B (0)', D: 'Species A (-) : Species B (0)'
    },
    {
        qNo: 23, topic: 'Population Interactions', year: '2020',
        text: 'Match the items in Column-I with those in Column-II:\nColumn-I (1. Herbivores-Plants, 2. Mycorrhiza-Plants, 3. Sheep-Cattle, 4. Orchid-Tree)\nColumn-II (i. Commensalism, ii. Mutualism, iii. Predation, iv. Competition)',
        A: '(iii) (ii) (iv) (i)', B: '(ii) (i) (iii) (iv)', C: '(i) (iii) (iv) (ii)', D: '(iv) (ii) (i) (iii)'
    },
    {
        qNo: 24, topic: 'Population Interactions', year: '2019',
        text: 'Match Column-I with Column-II\nColumn-I (A. Saprophyte, B. Parasite, C. Lichens, D. Mycorrhiza)\nColumn-II (i. Symbiotic association of fungi with plant roots, ii. Decomposition of dead organic materials, iii. Living on plants or animals, iv. Symbiotic association of algae and fungi)',
        A: '(i) (ii) (iii) (iv)', B: '(iii) (ii) (i) (iv)', C: '(ii) (i) (iii) (iv)', D: '(ii) (iii) (iv) (i)'
    },
    {
        qNo: 25, topic: 'Population Interactions', year: '2018',
        text: 'Which one of the following plants shows a very close relationship with a species of moth, where none of the two can complete its life cycle without the other?',
        A: 'Hydrilla', B: 'Yucca', C: 'Banana', D: 'Viola'
    },
    {
        qNo: 26, topic: 'Population Interactions', year: '2018',
        text: 'Which one of the following population interactions is widely used in medical science for the production of antibiotics?',
        A: 'Commensalism', B: 'Mutualism', C: 'Parasitism', D: 'Amensalism'
    },
    {
        qNo: 27, topic: 'Population Interactions', year: '2017',
        text: 'Mycorrhizae are the example of:',
        A: 'Fungistasis', B: 'Amensalism', C: 'Antibiosis', D: 'Mutualism'
    },
    {
        qNo: 28, topic: 'Population Interactions', year: '2016',
        text: 'The principle of competitive exclusion was stated by:',
        A: 'MacArthur', B: 'Verhulst and Pearl', C: 'C.Darwin', D: 'G.F. Gause'
    },
    {
        qNo: 29, topic: 'Population Interactions', year: '2016',
        text: 'If ‘+’ sign is assigned to beneficial interaction, ‘–’ sign to detrimental and ‘0’ sign to neutral interaction, then the population interaction represented by ‘+’ ‘–’ refers to:',
        A: 'Commensalism', B: 'Parasitism', C: 'Mutualism', D: 'Amensalism'
    },
    {
        qNo: 30, topic: 'Population Interactions', year: '2016',
        text: 'Gause’s principle of competitive exclusion states that:',
        A: 'More abundant species will exclude the less abundant species through competition', B: 'Competition for the same resources excludes species having different food preferences', C: 'No two species can occupy the same niche indefinitely for the same limiting resources', D: 'Larger organisms exclude smaller ones through competition'
    },
    {
        qNo: 31, topic: 'Population Interactions', year: '2015',
        text: 'In which of the following interactions both partners are adversely affected?',
        A: 'Predation', B: 'Parasitism', C: 'Mutualism', D: 'Competition'
    },
    {
        qNo: 32, topic: 'Population Interactions', year: '2013',
        text: 'A sedentary sea anemone gets attached to the shell lining of hermit crab. The association is:',
        A: 'Amensalism', B: 'Ectoparasitism', C: 'Symbiosis', D: 'Commensalism'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME, '(Class 12)');

    // Organisms and Populations is Chapter 13 in NCERT Biology Class 12
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
