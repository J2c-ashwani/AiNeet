/**
 * Seed REAL NEET PYQs — Chapter: Neural Control and Coordination (11th Biology)
 * Usage: node scripts/seed_pyq_neural.mjs
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

const CHAPTER_NAME = 'Neural Control and Coordination';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Neural System, Human Neural System & Neuron',
    'Central Nervous System & Reflex Action',
    'Reflex Action & Reflex Arc',
    'Sensory Organs - Eye',
    'Sensory Organs - Ear',
];

const ANSWER_KEY = {
    1: 'A', 2: 'D', 3: 'A', 4: 'D', 5: 'B', 6: 'B', 7: 'B', 8: 'D', 9: 'A', 10: 'A',
    11: 'C', 12: 'D', 13: 'D', 14: 'A', 15: 'B', 16: 'A', 17: 'B', 18: 'D', 19: 'B', 20: 'B',
    21: 'A', 22: 'D',
};

const QUESTIONS = [
    // Neural System, Human Neural System & Neuron (Q1-5)
    {
        qNo: 1, topic: 'Neural System, Human Neural System & Neuron', year: '2022',
        text: 'Select the incorrect statement regarding synapses:',
        A: 'Impulse transmission across a chemical synapse is always faster than that across an electrical synapse.', B: 'The membranes of presynaptic and postsynaptic neurons are in close proximity in an electrical synapse.', C: 'Electrical current can flow directly from one neuron into the other across the electrical synapse.', D: 'Chemical synapses use neurotransmitters'
    },
    {
        qNo: 2, topic: 'Neural System, Human Neural System & Neuron', year: '2018',
        text: 'Nissl bodies are mainly composed of:',
        A: 'Proteins and lipids', B: 'DNA and RNA', C: 'Nucleic acids and SER', D: 'Free ribosomes and RER'
    },
    {
        qNo: 3, topic: 'Neural System, Human Neural System & Neuron', year: '2017',
        text: 'Myelin sheath is produced by:',
        A: 'Schwann Cells and Oligodendrocytes', B: 'Astrocytes and Schwann Cells', C: 'Oligodendrocytes and Osteoclasts', D: 'Osteoclasts and Astrocytes'
    },
    {
        qNo: 4, topic: 'Neural System, Human Neural System & Neuron', year: '2017',
        text: 'Receptor sites for neurotransmitters are present on:',
        A: 'Membranes of synaptic vesicles', B: 'Pre-synaptic membrane', C: 'Tips of axons', D: 'Post-synaptic membrane'
    },
    {
        qNo: 5, topic: 'Neural System, Human Neural System & Neuron', year: '2013',
        text: 'A diagram showing axon terminal and synapse is given. Identify correctly at least two of A-D:',
        A: 'C-Neurotransmitter; D-Ca++', B: 'A-Receptor; C-Synaptic vesicles', C: 'B-Synaptic connection; D-K+', D: 'A-Neurotransmitter; B-Synaptic cleft'
    },
    // Central Nervous System & Reflex Action (Q6-9)
    {
        qNo: 6, topic: 'Central Nervous System & Reflex Action', year: '2019',
        text: 'Which part of the brain is responsible for thermoregulation?',
        A: 'Cerebrum', B: 'Hypothalamus', C: 'Corpus callosum', D: 'Medulla oblongata'
    },
    {
        qNo: 7, topic: 'Central Nervous System & Reflex Action', year: '2018',
        text: 'Which of the following structures or regions is incorrectly paired with its function?',
        A: 'Medulla oblongata: controls respiration and cardiovascular reflexes.', B: 'Limbic system: consists of fibre tracts that interconnect different regions of brain; controls movement.', C: 'Hypothalamus: production of releasing hormones and regulation of temperature, hunger and thirst.', D: 'Corpus callosum: band of fibres connecting left and right cerebral hemispheres.'
    },
    {
        qNo: 8, topic: 'Central Nervous System & Reflex Action', year: '2015',
        text: 'Which of the following regions of the brain is incorrectly paired with its function?',
        A: 'Corpus callosum - Communication between the left and right cerebral cortices', B: 'Cerebrum - Calculation and contemplation', C: 'Medulla oblongata - Homeostatic control', D: 'Cerebellum - Language comprehension'
    },
    {
        qNo: 9, topic: 'Central Nervous System & Reflex Action', year: '2014',
        text: 'Injury localised to the hypothalamus would most likely disrupt:',
        A: 'Regulation of body temperature', B: 'Short term memory', C: 'Co-ordination during locomotion', D: 'Executive function, such as decision making'
    },
    // Reflex Action & Reflex Arc (Q10)
    {
        qNo: 10, topic: 'Reflex Action & Reflex Arc', year: '2015',
        text: 'Destruction of the anterior horn cell of the spinal cord would result in loss of:',
        A: 'Voluntary motor impulses', B: 'Commissural impulses', C: 'Integrating impulses', D: 'Sensory impulses'
    },
    // Sensory Organs - Eye (Q11-19)
    {
        qNo: 11, topic: 'Sensory Organs - Eye', year: '2017',
        text: 'The Pacinian corpuscle responds to rapid changes in:',
        A: 'Light intensity', B: 'Gravity', C: 'Pressure', D: 'Temperature'
    },
    {
        qNo: 12, topic: 'Sensory Organs - Eye', year: '2020',
        text: 'Match the following columns and select the correct option:\n1. Rods and Cones → (i) Absence of photoreceptor cells\n2. Blind Spot → (ii) Cones are densely packed\n3. Fovea → (iii) Photoreceptor cells\n4. Iris → (iv) Visible coloured portion of the eye',
        A: '(ii) (iii) (i) (iv)', B: '(iii) (iv) (ii) (i)', C: '(ii) (iv) (iii) (i)', D: '(iii) (i) (ii) (iv)'
    },
    {
        qNo: 13, topic: 'Sensory Organs - Eye', year: '2019',
        text: 'Which of the following statements is correct?',
        A: 'Cornea is an external, transparent and protective proteinacious covering of the eye-ball.', B: 'Cornea consists of dense connective tissue of elastin and can repair itself.', C: 'Cornea is convex, transparent layer which is highly vascularised.', D: 'Cornea consists of dense matrix of collagen and is the most sensitive portion of the eye.'
    },
    {
        qNo: 14, topic: 'Sensory Organs - Eye', year: '2018',
        text: 'The transparent lens in the human eye is held in its place by:',
        A: 'Ligaments attached to the ciliary body', B: 'Ligaments attached to the iris', C: 'Smooth muscles attached to the iris', D: 'Smooth muscles attached to the ciliary body'
    },
    {
        qNo: 15, topic: 'Sensory Organs - Eye', year: '2017',
        text: 'Good vision depends on adequate intake of carotene rich food. Select the best option from the following statements:\nA. Vitamin A derivatives are formed from carotene\nB. The photopigments are embedded in the membrane discs of the inner segment\nC. Retinal is a derivative of vitamin A\nD. Retinal is a light absorbing part of all the visual photopigments',
        A: '(A) & (B)', B: '(A), (C) & (D)', C: '(A) & (C)', D: '(B), (C) & (D)'
    },
    {
        qNo: 16, topic: 'Sensory Organs - Eye', year: '2016',
        text: 'Choose the correct statement.',
        A: 'Photoreceptors in the human eye are depolarised during darkness and become hyperpolarised in response to the light stimulus.', B: 'Receptors do not produce graded potentials.', C: 'Nociceptors respond to changes in pressure.', D: "Meissner's corpuscles are thermoreceptors."
    },
    {
        qNo: 17, topic: 'Sensory Organs - Eye', year: '2016',
        text: 'Photosensitive compound in human eye is made up of:',
        A: 'Guanosine and Retinol', B: 'Opsin and Retinal', C: 'Opsin and Retinol', D: 'Transducin and Retinone'
    },
    {
        qNo: 18, topic: 'Sensory Organs - Eye', year: '2015',
        text: "In mammalian eye, the 'fovea' is the centre of the visual field, where:",
        A: 'The optic nerve leaves the eye.', B: 'Only rods are present.', C: 'More rods than cones are found.', D: 'High density of cones occurs, but has no rods'
    },
    {
        qNo: 19, topic: 'Sensory Organs - Eye', year: '2013',
        text: 'Parts A, B, C and D of the human eye are shown in the diagram. Select the option which gives correct identification along with its functions/characteristics:',
        A: 'D: Choroid – Its anterior part forms ciliary body', B: 'A: Retina – Contains photo receptors – rods and cones', C: 'B: Blind spot – Has only a few rods and cones', D: 'C: Aqueous chamber – Reflects the light which does not pass through the lens'
    },
    // Sensory Organs - Ear (Q20-22)
    {
        qNo: 20, topic: 'Sensory Organs - Ear', year: '2020',
        text: 'Match the following columns and select the correct option:\n1. Organ of Corti → (i) Connects middle ear and pharynx\n2. Cochlea → (ii) Coiled part of the labyrinth\n3. Eustachian tube → (iii) Attached to the oval window\n4. Stapes → (iv) Located on the basilar membrane',
        A: '(iii) (i) (iv) (ii)', B: '(iv) (ii) (i) (iii)', C: '(i) (ii) (iv) (iii)', D: '(ii) (iii) (i) (iv)'
    },
    {
        qNo: 21, topic: 'Sensory Organs - Ear', year: '2017',
        text: 'Which of the following ossicles is adhered to tympanic membrane of middle ear?',
        A: 'Malleus', B: 'Incus', C: 'Stapes', D: 'Utricle'
    },
    {
        qNo: 22, topic: 'Sensory Organs - Ear', year: '2015',
        text: 'A gymnast is able to balance his body upside down even in the total darkness because of:',
        A: 'Tectorial membrane', B: 'Organ of Corti', C: 'Cochlea', D: 'Vestibular apparatus'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME);

    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME.split(' ').slice(0, 2).join('%')}%`, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 14]);
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
