/**
 * Seed REAL NEET PYQs — Chapter: Plant Kingdom (11th Biology)
 * Usage: node scripts/seed_pyq_plant_kingdom.mjs
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

const CHAPTER_NAME = 'Plant Kingdom';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Algae',
    'Bryophytes',
    'Pteridophytes',
    'Gymnosperms',
    'Angiosperms',
    'Plant Life Cycles',
];

const ANSWER_KEY = {
    1: 'C', 2: 'D', 3: 'B', 4: 'D', 5: 'C', 6: 'A', 7: 'D', 8: 'B', 9: 'D', 10: 'A',
    11: 'C', 12: 'D', 13: 'C', 14: 'A', 15: 'C', 16: 'C', 17: 'C', 18: 'D', 19: 'A', 20: 'B',
    21: 'A', 22: 'D', 23: 'A', 24: 'A', 25: 'C', 26: 'A', 27: 'D', 28: 'C', 29: 'B', 30: 'D',
    31: 'D', 32: 'C', 33: 'C', 34: 'D',
};

const QUESTIONS = [
    // Algae (Q1-12)
    {
        qNo: 1, topic: 'Algae', year: '2022',
        text: 'Which of the following is incorrectly matched?',
        A: 'Volvox - Starch', B: 'Ectocarpus - Fucoxanthin', C: 'Ulothrix - Mannitol', D: 'Porphyra - Floridean Starch'
    },
    {
        qNo: 2, topic: 'Algae', year: '2022',
        text: 'Hydrocolloid carrageen is obtained from:',
        A: 'Phaeophyceae only', B: 'Chlorophyceae and Phaeophyceae', C: 'Phaeophyceae and Rhodophyceae', D: 'Rhodophyceae only'
    },
    {
        qNo: 3, topic: 'Algae', year: '2021',
        text: 'Which of the following algae produce Carrageen?',
        A: 'Brown algae', B: 'Red algae', C: 'Blue-green algae', D: 'Green algae'
    },
    {
        qNo: 4, topic: 'Algae', year: '2021',
        text: 'Which of the following algae contains mannitol as reserve food material?',
        A: 'Gracilaria', B: 'Volvox', C: 'Ulothrix', D: 'Ectocarpus'
    },
    {
        qNo: 5, topic: 'Algae', year: '2020',
        text: 'Which of the following pairs is of unicellular algae?',
        A: 'Gelidium and Gracilaria', B: 'Anabaena and Volvox', C: 'Chlorella and Spirulina', D: 'Laminaria and Sargassum'
    },
    {
        qNo: 6, topic: 'Algae', year: '2020',
        text: 'Floridean starch has structure similar to:',
        A: 'Amylopectin and glycogen', B: 'Mannitol and algin', C: 'Laminarin and cellulose', D: 'Starch and cellulose'
    },
    {
        qNo: 7, topic: 'Algae', year: '2020',
        text: 'Phycoerythrin is the major pigment in:',
        A: 'Blue green algae', B: 'Green algae', C: 'Brown algae', D: 'Red algae'
    },
    {
        qNo: 8, topic: 'Algae', year: '2017',
        text: 'An example of colonial alga is',
        A: 'Chlorella', B: 'Volvox', C: 'Ulothrix', D: 'Spirogyra'
    },
    {
        qNo: 9, topic: 'Algae', year: '2016',
        text: 'Which one of the following statements is wrong?',
        A: 'Agar-agar is obtained from Gelidium and Gracilaria.', B: 'Laminaria and Sargassum are used as food.', C: 'Algae increase the level of dissolved oxygen in the immediate environment.', D: 'Algin is obtained from red algae, and carrageen from brown algae.'
    },
    {
        qNo: 10, topic: 'Algae', year: '2015',
        text: 'Male gametes are flagellated in:',
        A: 'Ectocarpus', B: 'Spirogyra', C: 'Polysiphonia', D: 'Anabaena'
    },
    {
        qNo: 11, topic: 'Algae', year: '2013',
        text: 'Isogamous condition with non-flagellated gametes is found in:',
        A: 'Fucus', B: 'Chlamydomonas', C: 'Spirogyra', D: 'Volvox'
    },
    {
        qNo: 12, topic: 'Algae', year: '2013',
        text: 'Select the wrong statement:',
        A: 'Chlamydomonas exhibits both isogamy and anisogamy and Fucus shows oogamy', B: 'Isogametes are similar in structure, function and behaviour', C: 'Anisogametes differ either in structure, function or behaviour', D: 'In oogamous reproduction, female gamete is smaller and motile, while male gamete is larger and non motile'
    },
    // Bryophytes (Q13-14)
    {
        qNo: 13, topic: 'Bryophytes', year: '2021',
        text: 'Gemmae are present in:',
        A: 'Pteridophytes', B: 'Some Gymnosperms', C: 'Some Liverworts', D: 'Mosses'
    },
    {
        qNo: 14, topic: 'Bryophytes', year: '2018',
        text: 'Which one is wrongly matched?',
        A: 'Uniflagellate gametes - Polysiphonia', B: 'Biflagellate zoospores - Brown algae', C: 'Gemma cups - Marchantia', D: 'Unicellular organism - Chlorella'
    },
    // Pteridophytes (Q15-18)
    {
        qNo: 15, topic: 'Pteridophytes', year: '2021',
        text: 'Genera like Selaginella and Salvinia produce two kinds of spores. Such plants are known as:',
        A: 'Heterosorus', B: 'Homosporous', C: 'Heterosporous', D: 'Homosorus'
    },
    {
        qNo: 16, topic: 'Pteridophytes', year: '2020',
        text: 'Strobili or cones are found in:',
        A: 'Pteris', B: 'Marchantia', C: 'Equisetum', D: 'Salvinia'
    },
    {
        qNo: 17, topic: 'Pteridophytes', year: '2019',
        text: 'From evolutionary point of view, retention of the female gametophyte with developing young embryo on the parent sporophyte for some time, is first observed in',
        A: 'Liverworts', B: 'Mosses', C: 'Pteridophytes', D: 'Gymnosperms'
    },
    {
        qNo: 18, topic: 'Pteridophytes', year: '2016',
        text: 'In bryophytes and pteridophytes, transport of male gametes requires:',
        A: 'Wind', B: 'Insects', C: 'Birds', D: 'Water'
    },
    // Gymnosperms (Q19-28)
    {
        qNo: 19, topic: 'Gymnosperms', year: '2020',
        text: 'Which of the following statements is incorrect about gymnosperms?',
        A: 'Male and female gametophytes are free living', B: 'Most of them have narrow leaves with thick cuticle', C: 'Their seeds are not covered', D: 'They are heterosporous'
    },
    {
        qNo: 20, topic: 'Gymnosperms', year: '2019',
        text: 'Pinus seed cannot germinate and established without fungal association. This is because:',
        A: 'Its embryo is immature.', B: 'It has obligate association with mycorrhizae.', C: 'It has very hard seed coat.', D: 'Its seeds contain inhibitors that prevent germination.'
    },
    {
        qNo: 21, topic: 'Gymnosperms', year: '2018',
        text: 'Which of the following statement is correct?',
        A: 'Ovules are not enclosed by ovary wall in gymnosperms', B: 'Selaginella is heterosporous, while Salvinia is homosporous', C: 'Horsetails are gymnosperms', D: 'Stems are usually unbranched in both Cycas and Cedrus'
    },
    {
        qNo: 22, topic: 'Gymnosperms', year: '2018',
        text: 'Winged pollen grains are present in',
        A: 'Mustard', B: 'Cycas', C: 'Mango', D: 'Pinus'
    },
    {
        qNo: 23, topic: 'Gymnosperms', year: '2017',
        text: 'Select the mismatch:',
        A: 'Pinus – Dioecious', B: 'Cycas – Dioecious', C: 'Salvinia – Heterosporous', D: 'Equisetum – Homosporous'
    },
    {
        qNo: 24, topic: 'Gymnosperms', year: '2016',
        text: 'Conifers are adapted to tolerate extreme environmental conditions because of:',
        A: 'Thick cuticle', B: 'Presence of vessels', C: 'Broad hardy leaves', D: 'Superficial stomata'
    },
    {
        qNo: 25, topic: 'Gymnosperms', year: '2016',
        text: 'Select the correct statement.',
        A: 'Gymnosperms are both homosporous and heterosporous', B: 'Salvinia, Ginkgo and Pinus all are gymnosperms', C: 'Sequoia is one of the tallest trees', D: 'The leaves of gymnosperms are not well adapted to extremes of climate'
    },
    {
        qNo: 26, topic: 'Gymnosperms', year: '2015',
        text: 'Which one is wrong statement?',
        A: 'Mucor has biflagellate zoospores', B: 'Haploid endosperm is typical feature of gymnosperms', C: 'Brown algae have chlorophyll a and c and fucoxanthin', D: 'Archegonia are found in Bryophyta, Pteridophyta and Gymnosperms.'
    },
    {
        qNo: 27, topic: 'Gymnosperms', year: '2013',
        text: 'Read the following statements (A-E):\nA. In liverworts, mosses, and ferns gametophytes are free-living\nB. Gymnosperms and some ferns are heterosporous\nC. Sexual reproduction in Fucus, Volvox and Albugo is oogamous\nD. The sporophyte in liverworts is more elaborate than that in mosses\nE. Both Pinus and Marchantia are dioecious.\nHow many of the above statements are correct?',
        A: 'Four', B: 'One', C: 'Two', D: 'Three'
    },
    {
        qNo: 28, topic: 'Gymnosperms', year: '2013',
        text: 'Besides paddy fields, Cyanobacteria are also found inside vegetative part of:',
        A: 'Psilotum', B: 'Pinus', C: 'Cycas', D: 'Equisetum'
    },
    // Angiosperms (Q29-31)
    {
        qNo: 29, topic: 'Angiosperms', year: '2020',
        text: 'Male and female gametophytes do not have an independent free living existence in:',
        A: 'Algae', B: 'Angiosperms', C: 'Bryophytes', D: 'Pteridophytes'
    },
    {
        qNo: 30, topic: 'Angiosperms', year: '2017',
        text: 'Double fertilisation is exhibited by',
        A: 'Gymnosperms', B: 'Algae', C: 'Fungi', D: 'Angiosperms'
    },
    {
        qNo: 31, topic: 'Angiosperms', year: '2014',
        text: 'Male gametophyte with least number of cells is present in:',
        A: 'Pinus', B: 'Pteris', C: 'Funaria', D: 'Lilium'
    },
    // Plant Life Cycles (Q32-34)
    {
        qNo: 32, topic: 'Plant Life Cycles', year: '2022',
        text: 'Match the plant with the kind of life cycle it exhibits:\n(A) Spirogyra → (i) Dominant diploid sporophyte vascular plant, with highly reduced male or female gametophyte\n(B) Fern → (ii) Dominant haploid free-living gametophyte\n(C) Funaria → (iii) Dominant diploid sporophyte alternating with reduced gametophyte called prothallus\n(D) Cycas → (iv) Dominant haploid leafy gametophyte alternating with partially dependent multicellular sporophyte\nChoose the correct answer.',
        A: 'A-ii B-iv C-i D-iii', B: 'A-iv B-i C-ii D-iii', C: 'A-ii B-iii C-iv D-i', D: 'A-iii B-iv C-i D-ii'
    },
    {
        qNo: 33, topic: 'Plant Life Cycles', year: '2017',
        text: 'Life cycle of Ectocarpus and Fucus respectively are:',
        A: 'Haplontic, Diplontic', B: 'Diplontic, Haplodiplontic', C: 'Haplo-diplontic, Diplontic', D: 'Haplo-diplontic, Haplontic'
    },
    {
        qNo: 34, topic: 'Plant Life Cycles', year: '2017',
        text: 'Zygotic meiosis is characteristic of:',
        A: 'Marchantia', B: 'Fucus', C: 'Funaria', D: 'Chlamydomonas'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME);

    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME.split(' ').slice(0, 2).join('%')}%`, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 3]);
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
