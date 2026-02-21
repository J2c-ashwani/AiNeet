/**
 * Seed REAL NEET PYQs — Chapter: Animal Kingdom (11th Biology)
 * Usage: node scripts/seed_pyq_animal_kingdom.mjs
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

const CHAPTER_NAME = 'Animal Kingdom';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Basis of Classification',
    'Porifera, Coelenterata, Ctenophora, Platyhelminthes & Aschelminthes',
    'Annelida, Arthropoda, Mollusca & Echinodermata',
    'Hemichordata & Chordata',
    'Cyclostomata, Chondrichthyes & Osteichthyes',
    'Amphibia, Reptilia, Aves & Mammalia',
];

const ANSWER_KEY = {
    1: 'A', 2: 'A', 3: 'C', 4: 'A', 5: 'A', 6: 'C', 7: 'B', 8: 'B', 9: 'C', 10: 'A',
    11: 'A', 12: 'B', 13: 'A', 14: 'C', 15: 'A', 16: 'A', 17: 'C', 18: 'D', 19: 'D', 20: 'B',
    21: 'C', 22: 'D', 23: 'C', 24: 'A', 25: 'D', 26: 'C', 27: 'C', 28: 'A', 29: 'D', 30: 'B',
    31: 'D', 32: 'B', 33: 'C', 34: 'C', 35: 'B', 36: 'D', 37: 'C', 38: 'A', 39: 'B', 40: 'A',
    41: 'A', 42: 'B',
};

const QUESTIONS = [
    // Basis of Classification (Q1-2)
    {
        qNo: 1, topic: 'Basis of Classification', year: '2020',
        text: 'Bilaterally symmetrical and acoelomate animals are exemplified by:',
        A: 'Platyhelminthes', B: 'Aschelminthes', C: 'Annelida', D: 'Ctenophora'
    },
    {
        qNo: 2, topic: 'Basis of Classification', year: '2019',
        text: 'Consider following features:\nA. Organ system level of organisation\nB. Bilateral symmetry\nC. True coelomates with segmentation of body\nSelect the correct option of animal groups which possess all the above characteristics',
        A: 'Annelida, Arthropoda and Chordata', B: 'Annelida, Arthropoda and Mollusca', C: 'Arthropoda, Mollusca and Chordata', D: 'Annelida, Mollusca and Chordata'
    },
    // Porifera, Coelenterata, Ctenophora, Platyhelminthes & Aschelminthes (Q3-6)
    {
        qNo: 3, topic: 'Porifera, Coelenterata, Ctenophora, Platyhelminthes & Aschelminthes', year: '2017',
        text: 'In case of poriferans, the spongocoel is lined with flagellated cells called:',
        A: 'Ostia', B: 'Oscula', C: 'Choanocytes', D: 'Mesenchymal cells'
    },
    {
        qNo: 4, topic: 'Porifera, Coelenterata, Ctenophora, Platyhelminthes & Aschelminthes', year: '2015',
        text: 'Which of the following endoparasites of humans does show viviparity?',
        A: 'Trichinella spiralis', B: 'Ascaris lumbricoides', C: 'Ancylostoma duodenale', D: 'Enterobius vermicularis'
    },
    {
        qNo: 5, topic: 'Porifera, Coelenterata, Ctenophora, Platyhelminthes & Aschelminthes', year: '2015',
        text: 'Metagenesis refers to:',
        A: 'Alternation of generation between asexual and sexual phases of organisms', B: 'Occurrence of a drastic change in form during post-embryonic development', C: 'Presence of a segmented body and parthenogenetic mode of reproduction', D: 'Presence of different morphic forms'
    },
    {
        qNo: 6, topic: 'Porifera, Coelenterata, Ctenophora, Platyhelminthes & Aschelminthes', year: '2014',
        text: 'Planaria possess high capacity of:',
        A: 'Bioluminescence', B: 'Metamorphosis', C: 'Regeneration', D: 'Alternation of generation'
    },
    // Annelida, Arthropoda, Mollusca & Echinodermata (Q7-19)
    {
        qNo: 7, topic: 'Annelida, Arthropoda, Mollusca & Echinodermata', year: '2021',
        text: 'Match List-I with List-II:\n(A) Metamerism → (i) Coelenterata\n(B) Canal system → (ii) Ctenophora\n(C) Comb plates → (iii) Annelida\n(D) Cnidoblasts → (iv) Porifera\nChoose the correct answer from the options given below.',
        A: 'A-iii B-iv C-i D-ii', B: 'A-iii B-iv C-ii D-i', C: 'A-iv B-i C-ii D-iii', D: 'A-iv B-iii C-i D-ii'
    },
    {
        qNo: 8, topic: 'Annelida, Arthropoda, Mollusca & Echinodermata', year: '2021',
        text: 'Match the following:\n(A) Physalia → (i) Pearl oyster\n(B) Limulus → (ii) Portuguese Man of War\n(C) Ancylostoma → (iii) Living fossil\n(D) Pinctada → (iv) Hookworm\nChoose the correct answer.',
        A: 'A-iv B-i C-iii D-ii', B: 'A-ii B-iii C-iv D-i', C: 'A-i B-iv C-iii D-ii', D: 'A-ii B-iii C-i D-iv'
    },
    {
        qNo: 9, topic: 'Annelida, Arthropoda, Mollusca & Echinodermata', year: '2021',
        text: 'Read the following statements:\nA. Metagenesis is observed in Helminths.\nB. Echinoderms are triploblastic and coelomate animals.\nC. Round worms have organ-system level of body organization.\nD. Comb plates present in ctenophores help in digestion.\nE. Water vascular system is characteristic of Echinoderms.\nChoose the correct answer.',
        A: 'A, B and C are correct', B: 'A, D and E are correct', C: 'B, C and E are correct', D: 'C, D and E are correct'
    },
    {
        qNo: 10, topic: 'Annelida, Arthropoda, Mollusca & Echinodermata', year: '2020',
        text: 'Match the following columns and select the correct option:\n(A) Gregarious, polyphagous pest → (i) Asterias\n(B) Adult with radial symmetry and larva with bilateral symmetry → (ii) Scorpion\n(C) Book lungs → (iii) Ctenoplana\n(D) Bioluminescence → (iv) Locusta',
        A: '(iv) (i) (ii) (iii)', B: '(iii) (ii) (i) (iv)', C: '(ii) (i) (iii) (iv)', D: '(i) (iii) (ii) (iv)'
    },
    {
        qNo: 11, topic: 'Annelida, Arthropoda, Mollusca & Echinodermata', year: '2020',
        text: 'Which of the following options does correctly represent the characteristic features of phylum Annelida?',
        A: 'Triploblastic, segmented body and bilaterally symmetrical', B: 'Triploblastic, flattened body and acoelomate condition', C: 'Diploblastic, mostly marine and radially symmetrical', D: 'Triploblastic, unsegmented body and bilaterally symmetrical'
    },
    {
        qNo: 12, topic: 'Annelida, Arthropoda, Mollusca & Echinodermata', year: '2019',
        text: 'Match the following organisms with their respective characteristics:\nA. Pila → i. Flame cells\nB. Bombyx → ii. Comb plates\nC. Pleurobrachia → iii. Radula\nD. Taenia → iv. Malpighian tubules\nSelect the correct option:',
        A: '(iii) (ii) (i) (iv)', B: '(iii) (iv) (ii) (i)', C: '(ii) (iv) (iii) (i)', D: '(iii) (ii) (iv) (i)'
    },
    {
        qNo: 13, topic: 'Annelida, Arthropoda, Mollusca & Echinodermata', year: '2018',
        text: 'Which of the following animals does not undergo metamorphosis?',
        A: 'Earthworm', B: 'Tunicate', C: 'Moth', D: 'Starfish'
    },
    {
        qNo: 14, topic: 'Annelida, Arthropoda, Mollusca & Echinodermata', year: '2016',
        text: 'Which of the following features is not present in the Phylum-Arthropoda?',
        A: 'Chitinous exoskeleton', B: 'Metameric segmentation', C: 'Parapodia', D: 'Jointed appendages'
    },
    {
        qNo: 15, topic: 'Annelida, Arthropoda, Mollusca & Echinodermata', year: '2015',
        text: 'Which of the following characteristics is mainly responsible for diversification of insects on land?',
        A: 'Exoskeleton', B: 'Eyes', C: 'Segmentation', D: 'Bilateral symmetry'
    },
    {
        qNo: 16, topic: 'Annelida, Arthropoda, Mollusca & Echinodermata', year: '2015',
        text: 'Body having mesh-work of cell, internal cavities lined with food filtering flagellated cells and indirect development are the characteristics of phylum:',
        A: 'Porifera', B: 'Mollusca', C: 'Protozoa', D: 'Coelenterate'
    },
    {
        qNo: 17, topic: 'Annelida, Arthropoda, Mollusca & Echinodermata', year: '2013',
        text: 'One of the representatives of Phylum Arthropoda is:',
        A: 'Flying fish', B: 'Cuttlefish', C: 'Silverfish', D: 'Pufferfish'
    },
    {
        qNo: 18, topic: 'Annelida, Arthropoda, Mollusca & Echinodermata', year: '2013',
        text: 'Which of the following are correctly matched with respect to their taxonomic classification?',
        A: 'Spiny anteater, sea urchin, sea cucumber – Echinodermata', B: 'Flying fish, cuttlefish, silverfish – Pisces', C: 'Centipede, millipede, spider, scorpion – Insecta', D: 'House fly, butterfly, tsetsefly, silverfish – Insecta'
    },
    {
        qNo: 19, topic: 'Annelida, Arthropoda, Mollusca & Echinodermata', year: '2013',
        text: 'Which group of animals belongs to the same phylum?',
        A: 'Sponge, Sea anemone, Starfish', B: 'Malarial parasite, Amoeba, Mosquito', C: 'Earthworm, Pinworm, Tapeworm', D: 'Prawn, Scorpion, Locusta'
    },
    // Hemichordata & Chordata (Q20-24)
    {
        qNo: 20, topic: 'Hemichordata & Chordata', year: '2022',
        text: 'Given below are two statements:\nAssertion (A): All vertebrates are chordates but all chordates are not vertebrates.\nReason (R): Notochord is replaced by vertebral column in the adult vertebrates.\nIn the light of the above statements, choose the correct answer.',
        A: '(A) is not correct but (R) is correct', B: 'Both (A) and (R) are correct and (R) is the correct explanation of (A)', C: 'Both (A) and (R) are correct but (R) is not the correct explanation of (A)', D: '(A) is correct but (R) is not correct'
    },
    {
        qNo: 21, topic: 'Hemichordata & Chordata', year: '2020',
        text: 'Which of the following statements are true for the phylum-Chordata?',
        A: 'In Urochordata notochord extends from head to tail and it is present throughout their life.', B: 'In Vertebrata notochord is present during the embryonic period only.', C: 'Central nervous system is dorsal and hollow.', D: 'Chordata is divided into 3 subphyla: Hemichordata, Tunicata and Cephalochordata.'
    },
    {
        qNo: 22, topic: 'Hemichordata & Chordata', year: '2020',
        text: 'All vertebrates are chordates but all chordates are not vertebrates, why?',
        A: 'Ventral hollow nerve cord remains throughout life in some chordates', B: 'All chordates possess vertebral column', C: 'All chordates possess notochord throughout their life', D: 'Notochord is replaced by vertebral column in adult of some chordates'
    },
    {
        qNo: 23, topic: 'Hemichordata & Chordata', year: '2017',
        text: 'An important characteristic that hemichordates share with chordates is:',
        A: 'Absence of notochord', B: 'Ventral tubular nerve cord', C: 'Pharynx with gill slits', D: 'Pharynx without gill slits'
    },
    {
        qNo: 24, topic: 'Hemichordata & Chordata', year: '2014',
        text: 'Select the taxon mentioned that represents both marine and fresh water species:',
        A: 'Cnidaria', B: 'Echinoderms', C: 'Ctenophora', D: 'Cephalochordata'
    },
    // Cyclostomata, Chondrichthyes & Osteichthyes (Q25-27)
    {
        qNo: 25, topic: 'Cyclostomata, Chondrichthyes & Osteichthyes', year: '2020',
        text: 'Match the following columns and select the correct option:\n(A) 6-15 pairs of gill slits → (i) Trygon\n(B) Heterocercal caudal fin → (ii) Cyclostomes\n(C) Air bladder → (iii) Chondrichthyes\n(D) Poison sting → (iv) Osteichthyes',
        A: '(iii) (iv) (i) (ii)', B: '(iv) (ii) (iii) (i)', C: '(i) (iv) (iii) (ii)', D: '(ii) (iii) (iv) (i)'
    },
    {
        qNo: 26, topic: 'Cyclostomata, Chondrichthyes & Osteichthyes', year: '2015',
        text: 'A jawless fish, which lays eggs in freshwater and whose ammocoetes larvae after metamorphosis return to the ocean is:',
        A: 'Myxine', B: 'Neomyxine', C: 'Petromyzon', D: 'Eptatretus'
    },
    {
        qNo: 27, topic: 'Cyclostomata, Chondrichthyes & Osteichthyes', year: '2014',
        text: 'A marine cartilaginous fish that can produce electric current is:',
        A: 'Scoliodon', B: 'Pristis', C: 'Torpedo', D: 'Trygon'
    },
    // Amphibia, Reptilia, Aves & Mammalia (Q28-42)
    {
        qNo: 28, topic: 'Amphibia, Reptilia, Aves & Mammalia', year: '2022',
        text: 'In which of the following animals, digestive tract has additional chambers like crop and gizzard?',
        A: 'Pavo, Psittacula, Corvus', B: 'Corvus, Columba, Chameleon', C: 'Bufo, Balaenoptera, Bangarus', D: 'Catla, Columba, Crocodilus'
    },
    {
        qNo: 29, topic: 'Amphibia, Reptilia, Aves & Mammalia', year: '2021',
        text: 'Which one of the following organisms bears hollow and pneumatic long bones?',
        A: 'Hemidactylus', B: 'Macropus', C: 'Ornithorhynchus', D: 'Neophron'
    },
    {
        qNo: 30, topic: 'Amphibia, Reptilia, Aves & Mammalia', year: '2020',
        text: 'Match the following columns and select the correct option:\n(A) Aptenodytes → (i) Flying fox\n(B) Pteropus → (ii) Angel fish\n(C) Pterophyllum → (iii) Lamprey\n(D) Petromyzon → (iv) Penguin',
        A: '(iii) (iv) (i) (ii)', B: '(iv) (i) (ii) (iii)', C: '(ii) (i) (iv) (iii)', D: '(iii) (iv) (ii) (i)'
    },
    {
        qNo: 31, topic: 'Amphibia, Reptilia, Aves & Mammalia', year: '2020',
        text: 'Match the following group of organisms with their respective distinctive characteristics:\n(A) Platyhelminthes → (i) Cylindrical body with no segmentation\n(B) Echinoderms → (ii) Warm blooded animals with direct development\n(C) Hemichordates → (iii) Bilateral symmetry with incomplete digestive system\n(D) Aves → (iv) Radial symmetry with indirect development',
        A: '(ii) (iii) (iv) (i)', B: '(iv) (i) (ii) (iii)', C: '(i) (ii) (iii) (iv)', D: '(iii) (iv) (i) (ii)'
    },
    {
        qNo: 32, topic: 'Amphibia, Reptilia, Aves & Mammalia', year: '2018',
        text: 'Which one of these animals is not a homeotherm?',
        A: 'Macropus', B: 'Chelone', C: 'Camelus', D: 'Psittacula'
    },
    {
        qNo: 33, topic: 'Amphibia, Reptilia, Aves & Mammalia', year: '2018',
        text: 'Identify the vertebrate group of animals characterised by crop and gizzard in its digestive system.',
        A: 'Amphibia', B: 'Reptilia', C: 'Aves', D: 'Osteichthyes'
    },
    {
        qNo: 34, topic: 'Amphibia, Reptilia, Aves & Mammalia', year: '2017',
        text: 'Which among these is the correct combination of aquatic mammals?',
        A: 'Seals, Dolphins, Sharks', B: 'Dolphins, Seals, Trygon', C: 'Whales, Dolphins, Seals', D: 'Trygon, Whales, Seals'
    },
    {
        qNo: 35, topic: 'Amphibia, Reptilia, Aves & Mammalia', year: '2017',
        text: "Which of the following represents order of 'Horse'?",
        A: 'Equidae', B: 'Perissodactyla', C: 'Caballus', D: 'Ferus'
    },
    {
        qNo: 36, topic: 'Amphibia, Reptilia, Aves & Mammalia', year: '2016',
        text: 'Choose the correct statement:',
        A: 'All reptiles have a three-chambered heart.', B: 'All pisces have gills covered by an operculum.', C: 'All mammals are viviparous.', D: 'All cyclostomes do not possess jaws and paired fins.'
    },
    {
        qNo: 37, topic: 'Amphibia, Reptilia, Aves & Mammalia', year: '2016',
        text: 'Which one of the following characteristic is not shared by birds and mammals?',
        A: 'Ossified endoskeleton', B: 'Breathing using lungs', C: 'Viviparity', D: 'Warm blooded nature'
    },
    {
        qNo: 38, topic: 'Amphibia, Reptilia, Aves & Mammalia', year: '2016',
        text: 'Which of the following characteristic features always holds true for the corresponding group of animals?',
        A: 'Cartilaginous endoskeleton — Chondrichthyes', B: 'Viviparous — Mammalia', C: 'Possess a mouth with an upper and a lower jaw — Chordata', D: '3-chambered heart with one incompletely divided ventricle — Reptilia'
    },
    {
        qNo: 39, topic: 'Amphibia, Reptilia, Aves & Mammalia', year: '2016',
        text: 'Which is the National Aquatic Animal of India?',
        A: 'Gangetic shark', B: 'River dolphin', C: 'Blue whale', D: 'Sea-horse'
    },
    {
        qNo: 40, topic: 'Amphibia, Reptilia, Aves & Mammalia', year: '2015',
        text: 'Which of the following animals is not viviparous?',
        A: 'Platypus', B: 'Whale', C: 'Flying fox (bat)', D: 'Elephant'
    },
    {
        qNo: 41, topic: 'Amphibia, Reptilia, Aves & Mammalia', year: '2015',
        text: 'Which of the following represents the correct combination without any exception?\na. Sucking and circular mouth; jaws absent, integument without scales; paired appendages — Cyclostomata\nb. Body covered with feathers; skin moist and glandular; fore-limbs form wings; lungs with air sacs — Aves\nc. Mammary glands; hair on body; pinnae; two pairs of limbs — Mammalia\nd. Mouth ventral; gills without operculum; skin with placoid scales, persistent notochord — Chondrichthyes',
        A: 'Mammary glands; hair on body; pinnae; two pairs of limbs — Mammalia', B: 'Body covered with feathers; skin moist and glandular; fore-limbs form wings; lungs with air sacs — Aves', C: 'Sucking and circular mouth; jaws absent, integument without scales; paired appendages — Cyclostomata', D: 'Mouth ventral; gills without operculum; skin with placoid scales, persistent notochord — Chondrichthyes'
    },
    {
        qNo: 42, topic: 'Amphibia, Reptilia, Aves & Mammalia', year: '2013',
        text: 'Match the name of the animal (Column-I) with one characteristic (Column-II) and the phylum/class (Column-III) to which it belongs:\na. Adamsia — Radially symmetrical — Porifera\nb. Petromyzon — Ectoparasite — Cyclostomata\nc. Ichthyophis — Terrestrial — Reptilia\nd. Limulus — Body covered by chitinous exoskeleton — Pisces',
        A: 'Adamsia — Radially symmetrical — Porifera', B: 'Petromyzon — Ectoparasite — Cyclostomata', C: 'Ichthyophis — Terrestrial — Reptilia', D: 'Limulus — Body covered by chitinous exoskeleton — Pisces'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME);

    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name = $1 AND subject_id = $2', [CHAPTER_NAME, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 4]);
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
