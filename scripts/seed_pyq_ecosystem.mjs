/**
 * Seed REAL NEET PYQs — Chapter: Ecosystem (12th Biology)
 * Usage: node scripts/seed_pyq_ecosystem.mjs
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

const CHAPTER_NAME = 'Ecosystem';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 12;

const TOPICS = [
    'Ecosystem-Structure And Function',
    'Productivity',
    'Decomposition',
    'Energy Flow & Ecological Pyramids',
    'Ecological Succession',
    'Nutrient Cycling',
    'Ecosystem Services'
];

const ANSWER_KEY = {
    1: 'A', 2: 'B', 3: 'B', 4: 'D', 5: 'A', 6: 'C', 7: 'A', 8: 'D', 9: 'D', 10: 'C',
    11: 'C', 12: 'C', 13: 'B', 14: 'A', 15: 'D', 16: 'A', 17: 'D', 18: 'A', 19: 'D', 20: 'B',
    21: 'C', 22: 'B', 23: 'B', 24: 'A', 25: 'D', 26: 'D', 27: 'D', 28: 'D', 29: 'B', 30: 'B',
    31: 'D', 32: 'D', 33: 'D', 34: 'A'
};

const QUESTIONS = [
    // Ecosystem-Structure And Function (Q1-5)
    {
        qNo: 1, topic: 'Ecosystem-Structure And Function', year: '2017',
        text: 'Which ecosystem has the maximum biomass?',
        A: 'Forest ecosystem', B: 'Grassland ecosystem', C: 'Pond ecosystem', D: 'Lake ecosystem'
    },
    {
        qNo: 2, topic: 'Ecosystem-Structure And Function', year: '2016',
        text: 'The term ecosystem was coined by:',
        A: 'E.P. Odum', B: 'A.G. Tansley', C: 'E. Haeckel', D: 'E. Warming'
    },
    {
        qNo: 3, topic: 'Ecosystem-Structure And Function', year: '2016',
        text: 'Which one of the following is a characteristic feature of cropland ecosystem?',
        A: 'Absence of soil organisms', B: 'Least genetic diversity', C: 'Absence of weeds', D: 'Ecological succession'
    },
    {
        qNo: 4, topic: 'Ecosystem-Structure And Function', year: '2015',
        text: 'Vertical distribution of different species occupying different levels in a biotic community is known as:',
        A: 'Zonation', B: 'Pyramid', C: 'Divergence', D: 'Stratification'
    },
    {
        qNo: 5, topic: 'Ecosystem-Structure And Function', year: '2015',
        text: 'An association of individuals of different species living in the same habitual and having functional interactions is:',
        A: 'Biotic community', B: 'Ecosystem', C: 'Population', D: 'Ecological niche'
    },
    // Productivity (Q6-9)
    {
        qNo: 6, topic: 'Productivity', year: '2021',
        text: 'In the equation GPP-R = NPP.\nR represents:',
        A: 'Retaradation factor', B: 'Environment factor', C: 'Respiration losses', D: 'Radiant energy'
    },
    {
        qNo: 7, topic: 'Productivity', year: '2020',
        text: 'In relation to gross primary productivity and net primary productivity of an ecosystem, which one of the following statements is correct?',
        A: 'Gross primary productivity is always more than net primary productivity.', B: 'Gross primary productivity and net primary productivity are one and same.', C: 'There is no relationship between Gross primary productivity and net primary productivity', D: 'Gross primary productivity is always less than net primary productivity.'
    },
    {
        qNo: 8, topic: 'Productivity', year: '2015',
        text: 'In an ecosystem, the rate of production of organic matter during photosynthesis is termed as:',
        A: 'Secondary productivity', B: 'Net productivity', C: 'Net primary productivity', D: 'Gross primary productivity'
    },
    {
        qNo: 9, topic: 'Productivity', year: '2013',
        text: 'Secondary productivity is rate of formation of new organic matter by:',
        A: 'Decomposer', B: 'Producer', C: 'Parasite', D: 'Consumer'
    },
    // Decomposition (Q10-13)
    {
        qNo: 10, topic: 'Decomposition', year: '2022',
        text: 'Given below are two statements:\nStatement I: Decomposition is a process in which the detritus is degraded into simpler substances by microbes.\nStatement II: Decomposition is faster if the detritus is rich in lignin and chitin\nIn the light of the above statements, choose the correct answer from the options given below.',
        A: 'Statement I is incorrect but Statement II is correct', B: 'Both Statement I and Statement II are correct', C: 'Both statement I and statement II are incorrect', D: 'Statement I is correct but Statement II is incorrect'
    },
    {
        qNo: 11, topic: 'Decomposition', year: '2022',
        text: 'Detritivores breakdown detritus into smaller particles. This process is called.',
        A: 'Decomposition', B: 'Catabolism', C: 'Fragmentation', D: 'Humification'
    },
    {
        qNo: 12, topic: 'Decomposition', year: '2020',
        text: 'The rate of decomposition is faster in the ecosystem due to following factors EXCEPT:',
        A: 'Warm and moist environment', B: 'Presence of aerobic soil microbes', C: 'Detritus richer in lignin and chitin', D: 'Detritus rich in sugars'
    },
    {
        qNo: 13, topic: 'Decomposition', year: '2013',
        text: 'Which one of the following processes during decomposition is correctly described?',
        A: 'Leaching: Water soluble inorganic nutrients rise to the top layers of soil', B: 'Fragmentation: Carried out by organisms such as earthworm', C: 'Humification: Leads to the accumulation of a dark colored substance humus which undergoes microbial action at a very fast rate', D: 'Catabolism: Last step in the decomposition under fully anaerobic condition'
    },
    // Energy Flow & Ecological Pyramids (Q14-22)
    {
        qNo: 14, topic: 'Energy Flow & Ecological Pyramids', year: '2021',
        text: 'Which of the following statements is not correct ?',
        A: 'Pyramid of biomass in sea is generally upright.', B: 'Pyramid of energy is always upright.', C: 'Pyramid of numbers in a grassland ecosystem is upright.', D: 'Pyramid of biomass in sea is generally inverted.'
    },
    {
        qNo: 15, topic: 'Energy Flow & Ecological Pyramids', year: '2020',
        text: 'Match the trophic levels with their correct species examples in grassland ecosystem.\nColumn-I (1. Fourth trophic level, 2. Second trophic level, 3. First trophic level, 4. Third trophic level)\nColumn-II (i. Crow, ii. Vulture, iii. Rabbit, iv. Grass)',
        A: '(iii) (ii) (i) (iv)', B: '(iv) (iii) (ii) (i)', C: '(i) (ii) (iii) (iv)', D: '(ii) (iii) (iv) (i)'
    },
    {
        qNo: 16, topic: 'Energy Flow & Ecological Pyramids', year: '2020',
        text: 'Which of the following statements is incorrect?',
        A: 'Energy content gradually increases from first to fourth trophic level', B: 'Number of individuals decreases from first trophic level to fourth trophic level', C: 'Energy content gradually decreases from first to fourth trophic level', D: 'Biomass decreases from first to fourth trophic level'
    },
    {
        qNo: 17, topic: 'Energy Flow & Ecological Pyramids', year: '2019',
        text: 'Which of the following ecological pyramids is generally inverted?',
        A: 'Pyramid of numbers in grassland', B: 'Pyramid of energy', C: 'Pyramid of biomass in a forest', D: 'Pyramid of biomass in a sea'
    },
    {
        qNo: 18, topic: 'Energy Flow & Ecological Pyramids', year: '2018',
        text: 'What type of ecological pyramid would obtained with the following data?\nSecondary consumer : 120 g\nPrimary consumer : 60 g\nPrimary producer : 10 g',
        A: 'Inverted pyramid of biomass', B: 'Pyramid of energy', C: 'Upright pyramid of numbers', D: 'Upright pyramid of biomass'
    },
    {
        qNo: 19, topic: 'Energy Flow & Ecological Pyramids', year: '2016',
        text: 'The primary producers of the deep-sea hydrothermal vent ecosystem are:',
        A: 'Blue-green algae', B: 'Coral reefs', C: 'Green algae', D: 'Chemosynthetic bacteria'
    },
    {
        qNo: 20, topic: 'Energy Flow & Ecological Pyramids', year: '2015',
        text: 'The mass of living material at a tropic level at a particular time is called:',
        A: 'Net primary productivity', B: 'Standing crop', C: 'Gross primary productivity', D: 'Standing state'
    },
    {
        qNo: 21, topic: 'Energy Flow & Ecological Pyramids', year: '2015',
        text: 'Most animals that live in deep oceanic waters are:',
        A: 'Secondary consumers', B: 'Tertary consumers', C: 'Detritivores', D: 'Primary consumers'
    },
    {
        qNo: 22, topic: 'Energy Flow & Ecological Pyramids', year: '2014',
        text: 'If 20 J of energy is trapped at producer level, then how much energy will be available to peacock as food in the following chain?\nPlant → Mice → Snake → Peacock',
        A: '0.0002 J', B: '0.02 J', C: '0.002 J', D: '0.2 J'
    },
    // Ecological Succession (Q23-27)
    {
        qNo: 23, topic: 'Ecological Succession', year: '2017',
        text: 'Presence of plants arranged into well defined vertical layers depending on their height can be seen best in:',
        A: 'Tropical Savannah', B: 'Tropical Rain Forest', C: 'Grassland', D: 'Temperate Forest'
    },
    {
        qNo: 24, topic: 'Ecological Succession', year: '2016',
        text: 'Which of the following would appear as the pioneer organisms on bare rocks?',
        A: 'Lichens', B: 'Liverworts', C: 'Mosses', D: 'Green algae'
    },
    {
        qNo: 25, topic: 'Ecological Succession', year: '2015',
        text: 'Secondary succession takes place on/in:',
        A: 'Newly created pond', B: 'Newly cooled lava', C: 'Bare rock', D: 'Degraded forest'
    },
    {
        qNo: 26, topic: 'Ecological Succession', year: '2015',
        text: 'During ecological succession:',
        A: 'The establishment of a new biotic community is very fast in its primary phase.', B: 'The numbers and types of animals remain constant.', C: 'The changes lead to a community that is in near equilibrium with the environment and is called pioneer community', D: 'The gradual and predictable change in species composition occurs in a given area'
    },
    {
        qNo: 27, topic: 'Ecological Succession', year: '2013',
        text: 'The second stage of hydrosere is occupied by plants like:',
        A: 'Azolla', B: 'Typha', C: 'Salix', D: 'Vallisneria'
    },
    // Nutrient Cycling (Q28-33)
    {
        qNo: 28, topic: 'Nutrient Cycling', year: '2022',
        text: 'Which one of the following will accelerate phosphorus cycle?',
        A: 'Rain fall and storms', B: 'Burning of fossil fuels', C: 'Volcanic activity', D: 'Weathering of rocks'
    },
    {
        qNo: 29, topic: 'Nutrient Cycling', year: '2021',
        text: 'The amount of nutrients, such as carbon, nitrogen, phosphorus and calcium present in the soil at any given time is referred as:',
        A: 'Climax community', B: 'Standing state', C: 'Standing crop', D: 'Climax'
    },
    {
        qNo: 30, topic: 'Nutrient Cycling', year: '2020',
        text: 'Which of the following statements is incorrect regarding the phosphorus cycle?',
        A: 'Phosphorus solubilising bacteria facilitate the release of phosphorus from organic remains', B: 'There is appreciable respiratory release of phosphorus into atmosphere', C: 'It is sedimentary cycle', D: 'Phosphates are the major form of phosphorus reservoir'
    },
    {
        qNo: 31, topic: 'Nutrient Cycling', year: '2015',
        text: 'In which of the following both pairs have correct combination?',
        A: 'Gaseous nutrient cycle: Carbon and sulphur; Sedimentary nutrient cycle: Nitrogen and Phosphorus', B: 'Gaseous nutrient cycle: Nitrogen and sulphur; Sedimentary nutrient cycle: Carbon and Phosphorus', C: 'Gaseous nutrient cycle: Sulphur and Phosphorus; Sedimentary nutrient cycle: Carbon and Nitrogen', D: 'Gaseous nutrient cycle: Carbon and Nitrogen; Sedimentary nutrient cycle: Sulphur and Phosphorus'
    },
    {
        qNo: 32, topic: 'Nutrient Cycling', year: '2014',
        text: 'Given below is a simplified model of phosphorus cycling in a terrestrial ecosystem with four blanks (A-D). Identify the blanks.\n(Image based question)',
        A: 'Producers, Litter fall, Rock minerals, Detritus', B: 'Rock minerals, Detritus, Litter fall, Producers', C: 'Litter fall, Producers, Rock minerals, Detritus', D: 'Detritus, Rock minerals, Producer, Litter fall'
    },
    {
        qNo: 33, topic: 'Nutrient Cycling', year: '2013',
        text: 'Natural reservoir of phosphorus is:',
        A: 'Fossils', B: 'Sea water', C: 'Animal bones', D: 'Rock'
    },
    // Ecosystem Services (Q34)
    {
        qNo: 34, topic: 'Ecosystem Services', year: '2014',
        text: 'Match the following and select the correct option:\nA. Earthworm -> i. Pioneer species\nB. Succession -> ii. Detritivores\nC. Ecosystem service -> iii. Natality\nD. Population growth -> iv. Pollination',
        A: 'ii i iv iii', B: 'i ii iii iv', C: 'iv i iii ii', D: 'iii ii iv i'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME, '(Class 12)');

    // Ecosystem is Chapter 14 in NCERT Biology Class 12
    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME.split(' ').slice(0, 2).join('%')}%`, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 14]); // typically ch 14
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
