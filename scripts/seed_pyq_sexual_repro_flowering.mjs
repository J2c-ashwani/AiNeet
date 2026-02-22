/**
 * Seed REAL NEET PYQs — Chapter: Sexual Reproduction in Flowering Plants (12th Biology)
 * Usage: node scripts/seed_pyq_sexual_repro_flowering.mjs
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

const CHAPTER_NAME = 'Sexual Reproduction in Flowering Plants';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 12;

const TOPICS = [
    'Flower and Pre-fertilisation',
    'Double Fertilisation',
    'Post Fertilisation',
    'Apomixis and Polyembryony'
];

const ANSWER_KEY = {
    1: 'B', 2: 'A', 3: 'D', 4: 'D', 5: 'C', 6: 'C', 7: 'D', 8: 'D', 9: 'A', 10: 'D',
    11: 'C', 12: 'C', 13: 'B', 14: 'C', 15: 'B', 16: 'C', 17: 'D', 18: 'A', 19: 'A', 20: 'A',
    21: 'D', 22: 'C', 23: 'D', 24: 'B', 25: 'C', 26: 'D', 27: 'B', 28: 'D', 29: 'A', 30: 'B',
    31: 'A', 32: 'D', 33: 'A', 34: 'D', 35: 'D', 36: 'D', 37: 'D', 38: 'B', 39: 'D', 40: 'A',
    41: 'D', 42: 'D', 43: 'C', 44: 'B', 45: 'C', 46: 'A', 47: 'A', 48: 'D', 49: 'D'
};

const QUESTIONS = [
    // Flower and Pre-fertilisation (Q1-33)
    {
        qNo: 1, topic: 'Flower and Pre-fertilisation', year: '2022',
        text: 'Given below are two statements:\nStatement I: Cleistogamous flowers are invariably autogamous\nStatement II: Cleistogamy is disadvantageous as there is no chance for cross pollination\nIn the light of the above statements, choose the correct answer from the options given below.',
        A: 'Statement I is incorrect but Statement II is correct', B: 'Both Statement I and Statement II are correct', C: 'Both statement I and statement II are incorrect', D: 'Statement I is correct but Statement II is incorrect'
    },
    {
        qNo: 2, topic: 'Flower and Pre-fertilisation', year: '2022',
        text: 'Identify the incorrect statement related to Pollination:',
        A: 'Moths and butterflies are the most dominant pollinating agents among insects', B: 'Pollination by water is quite rare in flowering plants', C: 'Pollination by wind is more common amongst abiotic pollination', D: 'Flowers produce foul odours to attract flies and beetles to get pollinated'
    },
    {
        qNo: 3, topic: 'Flower and Pre-fertilisation', year: '2021',
        text: 'A typical angiosperm embryo sac at maturity is:',
        A: '7- nucleate and 8-celled', B: '7- nucleate and 7-celled', C: '8- nucleate and 8- celled', D: '8-nucleate and 7- celled'
    },
    {
        qNo: 4, topic: 'Flower and Pre-fertilisation', year: '2021',
        text: 'The term used for transfer of pollen grains from anthers of one plant to stigma of different plant which, during pollination, brings genetically different types of pollen grains to stigma, is:',
        A: 'Geitonogamy', B: 'Chasmogamy', C: 'Cleistogamy', D: 'Xenogamy'
    },
    {
        qNo: 5, topic: 'Flower and Pre-fertilisation', year: '2021',
        text: 'In some members of which of the following pairs of families, pollen grains retain their viability for months after release ?',
        A: 'Poaceae ; Leguminosae', B: 'Poaceae ; Solanaceae', C: 'Rosaceae ; Leguminosae', D: 'Poaceae ; Rosaceae'
    },
    {
        qNo: 6, topic: 'Flower and Pre-fertilisation', year: '2020',
        text: 'The plant parts which consist of two generations one within the other:\n1. Pollen grains inside the anther\n2. Germinated pollen grain with two male gametes\n3. Seed inside the fruit\n4. Embryo sac inside the ovule',
        A: '(1), (2) and (3)', B: '(3) and (4)', C: '(1) and (4)', D: '(1) only'
    },
    {
        qNo: 7, topic: 'Flower and Pre-fertilisation', year: '2020',
        text: 'In water hyacinth and water lily, pollination takes place by:',
        A: 'Water currents only', B: 'Wind and water', C: 'Insects and water', D: 'Insects or wind'
    },
    {
        qNo: 8, topic: 'Flower and Pre-fertilisation', year: '2020',
        text: 'The body of the ovule is fused within the funicle at:',
        A: 'Micropyle', B: 'Nucellus', C: 'Chalaza', D: 'Hilum'
    },
    {
        qNo: 9, topic: 'Flower and Pre-fertilisation', year: '2020',
        text: 'Which of the following is incorrect for wind-pollinated plants?',
        A: 'Many ovules in each ovary', B: 'Flowers are small and not brightly coloured', C: 'Pollen grains are light and non-sticky', D: 'Well exposed stamens and stigma'
    },
    {
        qNo: 10, topic: 'Flower and Pre-fertilisation', year: '2018',
        text: 'Which of the following has proved helpful in preserving pollen as fossils?',
        A: 'Pollenkitt', B: 'Cellulosic intine', C: 'Oil content', D: 'Sporopollenin'
    },
    {
        qNo: 11, topic: 'Flower and Pre-fertilisation', year: '2018',
        text: 'Pollen grains can be stored for several years in liquid nitrogen having a temperature of:',
        A: '–120°C', B: '–80°C', C: '–196°C', D: '–160°C'
    },
    {
        qNo: 12, topic: 'Flower and Pre-fertilisation', year: '2017',
        text: 'Functional megaspore in an angiosperm develops into:',
        A: 'Ovule', B: 'Endosperm', C: 'Embryo sac', D: 'Embryo'
    },
    {
        qNo: 13, topic: 'Flower and Pre-fertilisation', year: '2017',
        text: 'A dioecious flowering plant prevents both:',
        A: 'Autogamy and xenogamy', B: 'Autogamy and geitonogamy', C: 'Geitonogamy and xenogamy', D: 'Cleistogamy and xenogamy'
    },
    {
        qNo: 14, topic: 'Flower and Pre-fertilisation', year: '2017',
        text: 'Flowers which have single ovule in the ovary and are packed into inflorescence are usually pollinated by:',
        A: 'Water', B: 'Bee', C: 'Wind', D: 'Bat'
    },
    {
        qNo: 15, topic: 'Flower and Pre-fertilisation', year: '2017',
        text: 'Attractants and rewards are required for:',
        A: 'Anemophily', B: 'Entomophily', C: 'Hydrophily', D: 'Cleistogamy'
    },
    {
        qNo: 16, topic: 'Flower and Pre-fertilisation', year: '2016',
        text: 'The ovule of an angiosperm is technically equivalent to:',
        A: 'Megaspore mother cell', B: 'Megaspore', C: 'Megasporangium', D: 'Megasporophyll'
    },
    {
        qNo: 17, topic: 'Flower and Pre-fertilisation', year: '2016',
        text: 'Pollination in water hyacinth and water lily is brought about by the agency of:',
        A: 'Birds', B: 'Bats', C: 'Water', D: 'Insects or wind'
    },
    {
        qNo: 18, topic: 'Flower and Pre-fertilisation', year: '2016',
        text: 'In majority of angiosperms:',
        A: 'Reduction division occurs in the megaspore mother cell', B: 'A small central cell is present in the embryo sac', C: 'Egg has a filiform apparatus to attract them', D: 'There are numerous antipodal cells'
    },
    {
        qNo: 19, topic: 'Flower and Pre-fertilisation', year: '2016',
        text: 'Which of the following statements is not correct?',
        A: 'Pollen grains of many species can germinate on the stigma of a flower, but only one pollen tube of the same species grows into the style.', B: 'Insects that consume pollen or nectar without bringing about pollination are called pollen/nectar robbers.', C: 'Pollen germination and pollen tube growth are regulated by chemical components of pollen interacting with those of the pistil.', D: 'Some reptiles have also been reported as pollinators in some plant species.'
    },
    {
        qNo: 20, topic: 'Flower and Pre-fertilisation', year: '2016',
        text: 'Which one of the following statements is not true?',
        A: 'Tapetum helps in the dehiscence of anther', B: 'Exine of pollen grains is made up of sporopollenin', C: 'Pollen grains of many species cause severe allergies', D: 'Stored pollen in liquid nitrogen can be used in the crop breeding programmes'
    },
    {
        qNo: 21, topic: 'Flower and Pre-fertilisation', year: '2016',
        text: 'Proximal end of the filament of stamen is attached to the:',
        A: 'Anther', B: 'Connective', C: 'Placenta', D: 'Thalamus or petal'
    },
    {
        qNo: 22, topic: 'Flower and Pre-fertilisation', year: '2015',
        text: 'Which one of the following may require pollinators but is genetically similar to autogamy?',
        A: 'Apogamy', B: 'Cleistogamy', C: 'Geitonogamy', D: 'Xenogamy'
    },
    {
        qNo: 23, topic: 'Flower and Pre-fertilisation', year: '2015',
        text: 'Which of the following are important floral rewards to the animal pollinators?',
        A: 'Floral fragrance and calcium crystal', B: 'Protein pellicle and stigmatic exudates', C: 'Colour and large size of flower', D: 'Nectar and pollen grains'
    },
    {
        qNo: 24, topic: 'Flower and Pre-fertilisation', year: '2015',
        text: 'In angiosperms, microsporogenesis and megasporogenesis:',
        A: 'Form gametes without further divisions', B: 'Involve meiosis', C: 'Occur in ovule', D: 'Occur in anther'
    },
    {
        qNo: 25, topic: 'Flower and Pre-fertilisation', year: '2015',
        text: 'Filiform apparatus is characteristic feature of:',
        A: 'Nucellar embryo', B: 'Aleurone cell', C: 'Synergids', D: 'Generative cell'
    },
    {
        qNo: 26, topic: 'Flower and Pre-fertilisation', year: '2015',
        text: 'Male gametophyte in angiosperms produces:',
        A: 'Single sperm and a vegetative cell', B: 'Single sperm and two vegetative cells', C: 'Three sperms', D: 'Two sperms and a vegetative cell'
    },
    {
        qNo: 27, topic: 'Flower and Pre-fertilisation', year: '2015',
        text: 'Which one of the following statements is not true?',
        A: 'The flowers pollinated by flies and bats secrete foul odor to attract them', B: 'Honey is made by bees by digesting pollen collected from flowers', C: 'Pollen grains are rich in nutrients, and they are used in the form of tablets and syrups', D: 'Pollen grains of some plants cause severe allergies and bronchial afflictions in some people'
    },
    {
        qNo: 28, topic: 'Flower and Pre-fertilisation', year: '2014',
        text: 'Pollen tablets are available in the market for:',
        A: 'Ex situ conservation', B: 'In vitro fertilisation', C: 'Breeding programmes', D: 'Supplementing food'
    },
    {
        qNo: 29, topic: 'Flower and Pre-fertilisation', year: '2014',
        text: 'Function of filiform apparatus is to:',
        A: 'Guide the entry of pollen tube', B: 'Recognise the suitable pollen at stigma', C: 'Stimulate division of generative cell', D: 'Produce nectar'
    },
    {
        qNo: 30, topic: 'Flower and Pre-fertilisation', year: '2014',
        text: 'Geitonogamy involves:',
        A: 'Fertilisation of a flower by the pollen from a flower of another plant belonging to a distant population', B: 'Fertilisation of a flower by the pollen from another flower of the same plant', C: 'Fertilisation of a flower by the pollen from the same flower', D: 'Fertilisation of a flower by the pollen from a flower of another plant in the same population'
    },
    {
        qNo: 31, topic: 'Flower and Pre-fertilisation', year: '2013',
        text: 'Which one of the following statements is correct?',
        A: 'Tapetum nourishes the developing pollen', B: 'Hard outer layer of pollen is called intine', C: 'Sporogenous tissue is haploid', D: 'Endothecium produces the microspores'
    },
    {
        qNo: 32, topic: 'Flower and Pre-fertilisation', year: '2013',
        text: 'Advantage of cleistogamy is:',
        A: 'Vivipary', B: 'Higher genetic variability', C: 'More vigorous offspring', D: 'No dependence on pollinators'
    },
    {
        qNo: 33, topic: 'Flower and Pre-fertilisation', year: '2013',
        text: 'Megasporangium is equivalent to:',
        A: 'Ovule', B: 'Embryo sac', C: 'Fruit', D: 'Nucellus'
    },

    // Double Fertilisation (Q34)
    {
        qNo: 34, topic: 'Double Fertilisation', year: '2018',
        text: 'Double fertilisation is:',
        A: 'Fusion of two male gametes of a pollen tube with two different eggs', B: 'Fusion of one male gamete with two polar nuclei', C: 'Fusion of two male gametes with one egg', D: 'Syngamy and triple fusion'
    },

    // Post Fertilisation (Q35-48)
    {
        qNo: 35, topic: 'Post Fertilisation', year: '2022',
        text: 'Which part of the fruit, labelled in the given figure makes it a false fruit? (Image based)',
        A: 'D → Seed', B: 'A → Mesocarp', C: 'B → Endocarp', D: 'C → Thalamus'
    },
    {
        qNo: 36, topic: 'Post Fertilisation', year: '2020',
        text: 'In some plants thalamus contributes to fruit formation. Such fruits are termed as',
        A: 'Aggregate fruits', B: 'True fruits', C: 'Parthenocarpic fruit', D: 'False fruits'
    },
    {
        qNo: 37, topic: 'Post Fertilisation', year: '2019',
        text: 'Which one of the following statements regarding post-fertilization development in flowering plants is incorrect?',
        A: 'Ovary develops into fruit', B: 'Zygote develops into embryo', C: 'Central cell develops into endosperm', D: 'Ovules develop into embryo sac'
    },
    {
        qNo: 38, topic: 'Post Fertilisation', year: '2019',
        text: 'Persistent nucellus in the seed is known as',
        A: 'Chalaza', B: 'Perisperm', C: 'Hilum', D: 'Tegmen'
    },
    {
        qNo: 39, topic: 'Post Fertilisation', year: '2019',
        text: 'What is the fate of the male gametes discharged in the synergid?',
        A: 'One fuses with egg other(s) degenerate(s) in the synergid.', B: 'All fuse with the egg.', C: 'One fuses with the egg, other(s) fuse(s) with synergid nucleus.', D: 'One fuses with the egg and other fuses with central cell nuclei.'
    },
    {
        qNo: 40, topic: 'Post Fertilisation', year: '2017',
        text: 'The hollow foliar structure in a wheat embryo that encloses the shoot apex and a few leaf primordia is called:',
        A: 'Coleoptile', B: 'Coleorrhiza', C: 'Epicotyl', D: 'Hypocotyl'
    },
    {
        qNo: 41, topic: 'Post Fertilisation', year: '2016',
        text: 'Cotyledon of maize grain is called:',
        A: 'Plumule', B: 'Coleorhiza', C: 'Celeoptile', D: 'Scutellum'
    },
    {
        qNo: 42, topic: 'Post Fertilisation', year: '2016',
        text: 'The coconut water from tender coconut represents:',
        A: 'Endocarp', B: 'Fleshy mesocarp', C: 'Free nuclear proembryo', D: 'Free nuclear endosperm'
    },
    {
        qNo: 43, topic: 'Post Fertilisation', year: '2015',
        text: 'The hilum is a scar on the:',
        A: 'Fruit, where style was present', B: 'Seed, where micropyle was present', C: 'Seed, where funicle was attached', D: 'Fruit, where it was attached to pedicel'
    },
    {
        qNo: 44, topic: 'Post Fertilisation', year: '2015',
        text: 'The wheat grain has an embryo with one, large, shield-shaped cotyledon known as:',
        A: 'Coleorrhiza', B: 'Scutellum', C: 'Coleoptile', D: 'Epiblast'
    },
    {
        qNo: 45, topic: 'Post Fertilisation', year: '2015',
        text: 'Which one of the following fruits is parthenocarpic?',
        A: 'Apple', B: 'Jackfruit', C: 'Banana', D: 'Brinjal'
    },
    {
        qNo: 46, topic: 'Post Fertilisation', year: '2015',
        text: 'Coconut water from a tender coconut is:',
        A: 'Free nuclear endosperm', B: 'Innermost layers of the seed coat', C: 'Degenerated nucellus', D: 'Immature embryo'
    },
    {
        qNo: 47, topic: 'Post Fertilisation', year: '2014',
        text: 'Non-Albuminous seed is produced in:',
        A: 'Pea', B: 'Maize', C: 'Castor', D: 'Wheat'
    },
    {
        qNo: 48, topic: 'Post Fertilisation', year: '2013',
        text: 'Perisperm differs from endosperm in:',
        A: 'Its formation by fusion of secondary nucleus with several sperms', B: 'Being a haploid tissue', C: 'Having no reserve food', D: 'Being a diploid tissue'
    },

    // Apomixis and Polyembryony (Q49)
    {
        qNo: 49, topic: 'Apomixis and Polyembryony', year: '2016',
        text: 'Seed formation without fertilisation in flowering plants involves the process of:',
        A: 'Sporulation', B: 'Budding', C: 'Somatic hybridisation', D: 'Apomixis'
    }
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME, '(Class 12)');

    // Sexual Reproduction in Flowering Plants is Chapter 2 in NCERT Biology Class 12
    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    // Ensure we match it as 'Sexual Reproduction in Flowering Plants' (class 12, order 2)
    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME.split(' ').slice(0, 2).join('%')}%`, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 2]);
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
