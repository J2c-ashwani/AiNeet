/**
 * Seed REAL NEET PYQs — Chapter: Cell: The Unit of Life (11th Biology)
 * Usage: node scripts/seed_pyq_cell_unit.mjs
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

const CHAPTER_NAME = 'Cell: The Unit of Life';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 11;

const TOPICS = [
    'An Overview of Cell and Cell Theory',
    'Prokaryotic Cells',
    'Endomembrane System',
    'Mitochondria, Plastids, Ribosomes',
    'Cytoskeleton, Cilia and Flagella, Centrosome and Centrioles',
    'Nucleus and Microbodies',
];

const ANSWER_KEY = {
    1: 'A', 2: 'C', 3: 'D', 4: 'A', 5: 'D', 6: 'A', 7: 'A', 8: 'C', 9: 'A', 10: 'A',
    11: 'D', 12: 'D', 13: 'D', 14: 'A', 15: 'B', 16: 'D', 17: 'A', 18: 'C', 19: 'A', 20: 'B',
    21: 'D', 22: 'B', 23: 'D', 24: 'C', 25: 'D', 26: 'C', 27: 'A', 28: 'C', 29: 'A', 30: 'C',
    31: 'B', 32: 'D', 33: 'C', 34: 'D', 35: 'D', 36: 'A', 37: 'D', 38: 'B', 39: 'C', 40: 'B',
    41: 'B', 42: 'D', 43: 'B', 44: 'D', 45: 'C', 46: 'B', 47: 'D', 48: 'D', 49: 'B', 50: 'C',
    51: 'A',
};

const QUESTIONS = [
    // An Overview of Cell and Cell Theory (Q1-4)
    {
        qNo: 1, topic: 'An Overview of Cell and Cell Theory', year: '2019',
        text: 'The concept of "Omnis cellula-e cellula" regarding cell division was first proposed by',
        A: 'Rudolf Virchow', B: 'Theodor Schwann', C: 'Schleiden', D: 'Aristotle'
    },
    {
        qNo: 2, topic: 'An Overview of Cell and Cell Theory', year: '2015',
        text: 'Cellular organelles with membranes are:',
        A: 'Chromosomes, ribosomes and endoplasmic reticulum', B: 'Endoplasmic reticulum, ribosomes and nuclei', C: 'Lysosomes, Golgi apparatus and mitochondria', D: 'Nuclei, ribosome and mitochondria'
    },
    {
        qNo: 3, topic: 'An Overview of Cell and Cell Theory', year: '2015',
        text: 'Which of the following structures is not found in a prokaryotic cell?',
        A: 'Ribosome', B: 'Mesosome', C: 'Plasma membrane', D: 'Nuclear envelope'
    },
    {
        qNo: 4, topic: 'An Overview of Cell and Cell Theory', year: '2015',
        text: 'Which of the following is not membrane-bound?',
        A: 'Ribosomes', B: 'Lysosomes', C: 'Mesosomes', D: 'Vacuoles'
    },
    // Prokaryotic Cells (Q5-18)
    {
        qNo: 5, topic: 'Prokaryotic Cells', year: '2022',
        text: 'Given below are two statements:\nStatement I: Mycoplasma can pass through less than 1 micron filter size.\nStatement II: Mycoplasma are bacteria with cell wall\nIn the light of the above statements, choose the most appropriate answer.',
        A: 'Statement I is incorrect but Statement II is correct', B: 'Both Statement I and Statement II are correct', C: 'Both statement I and statement II are incorrect', D: 'Statement I is correct but Statement II is incorrect'
    },
    {
        qNo: 6, topic: 'Prokaryotic Cells', year: '2020',
        text: 'Which of the following statements about inclusion bodies is incorrect?',
        A: 'These are involved in ingestion of food particles.', B: 'They lie free in the cytoplasm', C: 'These represent reserve material in cytoplasm', D: 'They are not bound by any membrane'
    },
    {
        qNo: 7, topic: 'Prokaryotic Cells', year: '2020',
        text: 'Inclusion bodies of blue-green, purple and green photosynthetic bacteria are:',
        A: 'Gas vacuoles', B: 'Centrioles', C: 'Microtubules', D: 'Contractile vacuoles'
    },
    {
        qNo: 8, topic: 'Prokaryotic Cells', year: '2020',
        text: 'The size of Pleuropneumonia-like Organism (PPLO) is:',
        A: '1 - 2 μm', B: '10 - 20 μm', C: '0.1 μm', D: '0.02 μm'
    },
    {
        qNo: 9, topic: 'Prokaryotic Cells', year: '2018',
        text: 'Which among the following is not a prokaryote?',
        A: 'Saccharomyces', B: 'Mycobacterium', C: 'Nostoc', D: 'Oscillatoria'
    },
    {
        qNo: 10, topic: 'Prokaryotic Cells', year: '2018',
        text: 'Many ribosomes may associate with a single mRNA to form multiple copies of a polypeptide simultaneously. Such strings of ribosomes are termed as',
        A: 'Polysome', B: 'Polyhedral bodies', C: 'Plastidome', D: 'Nucleosome'
    },
    {
        qNo: 11, topic: 'Prokaryotic Cells', year: '2017',
        text: 'Which of the following components provides sticky character to the bacterial cell?',
        A: 'Cell wall', B: 'Nuclear membrane', C: 'Plasma membrane', D: 'Glycocalyx'
    },
    {
        qNo: 12, topic: 'Prokaryotic Cells', year: '2016',
        text: 'Select the wrong statement:',
        A: 'Cyanobacteria lack flagellated cells.', B: 'Mycoplasma is a wall-less microorganism', C: 'Bacterial cell wall is made up of peptidoglycan.', D: 'Pilli and fimbriae are mainly involved in motility of bacterial cells'
    },
    {
        qNo: 13, topic: 'Prokaryotic Cells', year: '2016',
        text: 'Select the mismatch:',
        A: 'Protists-Eukaryotes', B: 'Methanogens-Prokaryotes', C: 'Gas vacuoles-Green bacteria', D: 'Large central vacuoles-Animal cells'
    },
    {
        qNo: 14, topic: 'Prokaryotic Cells', year: '2016',
        text: 'A complex of ribosomes attached to a single strand of RNA is known as:',
        A: 'Polysome', B: 'Polymer', C: 'Polypeptide', D: 'Okazaki fragment'
    },
    {
        qNo: 15, topic: 'Prokaryotic Cells', year: '2015',
        text: 'Which one of the following is not an inclusion body found in prokaryotes?',
        A: 'Glycogen granule', B: 'Polysome', C: 'Phosphate granule', D: 'Cyanophycean granule'
    },
    {
        qNo: 16, topic: 'Prokaryotic Cells', year: '2015',
        text: 'Chromatophores take part in:',
        A: 'Growth', B: 'Movement', C: 'Respiration', D: 'Photosynthesis'
    },
    {
        qNo: 17, topic: 'Prokaryotic Cells', year: '2015',
        text: 'The structures that help some bacteria to attach to rocks and or host tissues are:',
        A: 'Fimbriae', B: 'Mesosomes', C: 'Holdfast', D: 'Rhizoids'
    },
    {
        qNo: 18, topic: 'Prokaryotic Cells', year: '2014',
        text: 'The motile bacteria are able to move by:',
        A: 'Pili', B: 'Fimbriae', C: 'Flagella', D: 'Cilia'
    },
    // Endomembrane System (Q19-29)
    {
        qNo: 19, topic: 'Endomembrane System', year: '2021',
        text: 'The organelles that are included in the endomembrane system are:',
        A: 'Endoplasmic reticulum, Golgi complex, Lysosomes and Vacuoles.', B: 'Golgi complex, Mitochondria, Ribosomes and Lysosomes.', C: 'Golgi complex, Endoplasmic reticulum, Mitochondria and Lysosomes.', D: 'Endoplasmic reticulum, Mitochondria, Ribosomes and Lysosomes.'
    },
    {
        qNo: 20, topic: 'Endomembrane System', year: '2020',
        text: 'Which is the important site of formation of glycoproteins and glycolipids in eukaryotic cells?',
        A: 'Peroxisomes', B: 'Golgi bodies', C: 'Polysomes', D: 'Endoplasmic reticulum'
    },
    {
        qNo: 21, topic: 'Endomembrane System', year: '2019',
        text: 'Which of the following statements is not correct?',
        A: 'Lysosomes have numerous hydrolytic enzymes.', B: 'The hydrolytic enzymes of lysosomes are active under acidic pH.', C: 'Lysosomes are membrane bound structures.', D: 'Lysosomes are formed by the process of packaging in the endoplasmic reticulum.'
    },
    {
        qNo: 22, topic: 'Endomembrane System', year: '2018',
        text: 'The Golgi complex participates in:',
        A: 'Fatty acid breakdown', B: 'Formation of secretory vesicles', C: 'Respiration in bacteria', D: 'Activation of amino acid'
    },
    {
        qNo: 23, topic: 'Endomembrane System', year: '2018',
        text: 'Which of the following events does not occur in rough endoplasmic reticulum?',
        A: 'Protein folding', B: 'Protein glycosylation', C: 'Cleavage of signal peptide', D: 'Phospholipid synthesis'
    },
    {
        qNo: 24, topic: 'Endomembrane System', year: '2016',
        text: 'A cell organelle containing hydrolytic enzymes is:',
        A: 'Ribosome', B: 'Mesosome', C: 'Lysosome', D: 'Microsome'
    },
    {
        qNo: 25, topic: 'Endomembrane System', year: '2015',
        text: 'Select the correct matching in the following pairs:',
        A: 'Rough ER – Synthesis of glycogen', B: 'Rough ER – Oxidation of fatty acids', C: 'Smooth ER – Oxidation of phospholipids', D: 'Smooth ER – Synthesis of lipids'
    },
    {
        qNo: 26, topic: 'Endomembrane System', year: '2014',
        text: 'The osmotic expansion of a cell kept in water is chiefly regulated by:',
        A: 'Ribosomes', B: 'Mitochondria', C: 'Vacuoles', D: 'Plastids'
    },
    {
        qNo: 27, topic: 'Endomembrane System', year: '2013',
        text: 'Which one of the following organelle correctly matches with its function? (Ref: diagram showing RER)',
        A: 'Rough endoplasmic reticulum, protein synthesis', B: 'Rough endoplasmic reticulum, formation of glycoproteins', C: 'Golgi apparatus, protein synthesis', D: 'Golgi apparatus, formation of glycolipids'
    },
    {
        qNo: 28, topic: 'Endomembrane System', year: '2013',
        text: 'A major site for synthesis of lipids is:',
        A: 'Nucleoplasm', B: 'RER', C: 'SER', D: 'Symplast'
    },
    {
        qNo: 29, topic: 'Endomembrane System', year: '2013',
        text: 'The Golgi complex plays a major role:',
        A: 'In post translational modification of proteins and glycosidation of lipids', B: 'In trapping the light and transforming it into chemical energy', C: 'In digesting proteins and carbohydrates', D: 'As energy transferring organelles'
    },
    // Mitochondria, Plastids, Ribosomes (Q30-36)
    {
        qNo: 30, topic: 'Mitochondria, Plastids, Ribosomes', year: '2019',
        text: 'Which of the following pair of organelles does not contain DNA?',
        A: 'Mitochondria and Lysosomes', B: 'Chloroplast and Vacuoles', C: 'Lysosomes and Vacuoles', D: 'Nuclear envelope and Mitochondria'
    },
    {
        qNo: 31, topic: 'Mitochondria, Plastids, Ribosomes', year: '2019',
        text: 'Which of the following statements regarding mitochondria is incorrect?',
        A: 'Outer membrane is permeable to monomers of carbohydrates, fats and proteins.', B: 'Enzymes of electron transport are embedded in outer membrane.', C: 'Inner membrane is convoluted with infoldings.', D: 'Mitochondrial matrix contains single circular DNA molecule and ribosomes.'
    },
    {
        qNo: 32, topic: 'Mitochondria, Plastids, Ribosomes', year: '2017',
        text: 'Which of the following cell organelles is responsible for extracting energy from carbohydrates to form ATP?',
        A: 'Lysosome', B: 'Ribosome', C: 'Chloroplast', D: 'Mitochondrion'
    },
    {
        qNo: 33, topic: 'Mitochondria, Plastids, Ribosomes', year: '2016',
        text: 'Mitochondria and chloroplast are\nA. Semi-autonomous organelles\nB. Formed by division of pre-existing organelles and they contain DNA but lack protein synthesizing machinery\nWhich one of the following options is correct?',
        A: 'Both (A) and (B) are correct', B: '(B) is true but (A) is false', C: '(A) is true but (B) is false', D: 'Both (A) and (B) are false'
    },
    {
        qNo: 34, topic: 'Mitochondria, Plastids, Ribosomes', year: '2015',
        text: 'The structures that are formed by stacking of organized flattened membranous sacs in the chloroplasts are:',
        A: 'Stroma lamellae', B: 'Stroma', C: 'Cristae', D: 'Grana'
    },
    {
        qNo: 35, topic: 'Mitochondria, Plastids, Ribosomes', year: '2015',
        text: 'DNA is not present in:',
        A: 'Nucleus', B: 'Mitochondria', C: 'Chloroplast', D: 'Ribosomes'
    },
    {
        qNo: 36, topic: 'Mitochondria, Plastids, Ribosomes', year: '2014',
        text: 'Which structures perform the function of mitochondria in bacteria?',
        A: 'Mesosomes', B: 'Nucleoid', C: 'Ribosomes', D: 'Cell wall'
    },
    // Cytoskeleton, Cilia and Flagella, Centrosome and Centrioles (Q37-40)
    {
        qNo: 37, topic: 'Cytoskeleton, Cilia and Flagella, Centrosome and Centrioles', year: '2020',
        text: 'Match the following columns and select the correct option:\nA. Smooth Endoplasmic Reticulum → i. Protein synthesis\nB. Rough endoplasmic reticulum → ii. Lipid synthesis\nC. Golgi complex → iii. Glycosylation\nD. Centriole → iv. Spindle formation',
        A: '(iii) (i) (ii) (iv)', B: '(iv) (ii) (i) (iii)', C: '(i) (ii) (iii) (iv)', D: '(ii) (i) (iii) (iv)'
    },
    {
        qNo: 38, topic: 'Cytoskeleton, Cilia and Flagella, Centrosome and Centrioles', year: '2016',
        text: 'Microtubules are the constituents of:',
        A: 'Cilia, Flagella and Peroxisomes', B: 'Spindle fibres, Centrioles and Cilia', C: 'Centrioles, Spindle fibres and Chromatin', D: 'Centrosome, Nucleosome and Centrioles'
    },
    {
        qNo: 39, topic: 'Cytoskeleton, Cilia and Flagella, Centrosome and Centrioles', year: '2014',
        text: 'The solid linear cytoskeleton elements having a diameter of 6 nm and made up of a single type of monomer are known as:',
        A: 'Lamins', B: 'Microtubules', C: 'Microfilaments', D: 'Intermediate filaments'
    },
    {
        qNo: 40, topic: 'Cytoskeleton, Cilia and Flagella, Centrosome and Centrioles', year: '2014',
        text: 'Match the following and select the correct answer:\nA. Centriole → i. Infoldings in mitochondria\nB. Chlorophyll → ii. Thylakoids\nC. Cristae → iii. Nucleic acids\nD. Ribozymes → iv. Basal body cilia or flagella',
        A: 'A-iv B-iii C-i D-ii', B: 'A-iv B-ii C-i D-iii', C: 'A-i B-ii C-iv D-iii', D: 'A-i B-iii C-ii D-iv'
    },
    // Nucleus and Microbodies (Q41-51)
    {
        qNo: 41, topic: 'Nucleus and Microbodies', year: '2022',
        text: 'Match List-I with List-II.\nA. Metacentric → i. Centromere situated close to the chromosome end forming one extremely short and one very long arms\nB. Acrocentric → ii. Centromere at the terminal end chromosome\nC. Sub-metacentric → iii. Centromere in the middle forming two equal arms of chromosomes\nD. Telocentric → iv. Centromere slightly away from the chromosome middle forming one shorter arm and one longer arm',
        A: 'A-i B-ii C-iii D-iv', B: 'A-iii B-i C-iv D-ii', C: 'A-i B-iii C-ii D-iv', D: 'A-ii B-iii C-iv D-i'
    },
    {
        qNo: 42, topic: 'Nucleus and Microbodies', year: '2021',
        text: 'Which of the following is an incorrect statement?',
        A: 'Microbodies are present both in plant and animal cells.', B: 'The perinuclear space forms a barrier between the materials present inside the nucleus and that of the cytoplasm.', C: 'Nuclear pores act as passages for proteins and RNA molecules in both directions between nucleus and cytoplasm.', D: 'Mature sieve tube elements possess a conspicuous nucleus and usual cytoplasmic organelles.'
    },
    {
        qNo: 43, topic: 'Nucleus and Microbodies', year: '2021',
        text: 'Match List-I with List-II\nA. Cristae → i. Primary constriction in chromosome\nB. Thylakoids → ii. Disc-shaped sacs in Golgi apparatus\nC. Centromere → iii. Infoldings in mitochondria\nD. Cisternae → iv. Flattened membranous sacs in stroma of plastids',
        A: 'A-i B-iv C-iii D-ii', B: 'A-iii B-iv C-i D-ii', C: 'A-ii B-iii C-iv D-i', D: 'A-iv B-iii C-ii D-i'
    },
    {
        qNo: 44, topic: 'Nucleus and Microbodies', year: '2021',
        text: 'When the centromere is situated in the middle of two equal arms of chromosomes, the chromosome is referred as:',
        A: 'Telocentric', B: 'Sub-metacentric', C: 'Acrocentric', D: 'Metacentric'
    },
    {
        qNo: 45, topic: 'Nucleus and Microbodies', year: '2020',
        text: 'The biosynthesis of ribosomal RNA occurs in:',
        A: 'Golgi apparatus', B: 'Microbodies', C: 'Nucleolus', D: 'Ribosomes'
    },
    {
        qNo: 46, topic: 'Nucleus and Microbodies', year: '2019',
        text: 'The shorter and longer arms of a submetacentric chromosome are referred to as',
        A: 's-arm and l-arm respectively', B: 'p-arm and q-arm respectively', C: 'q-arm and p-arm respectively', D: 'm-arm and n-arm respectively'
    },
    {
        qNo: 47, topic: 'Nucleus and Microbodies', year: '2018',
        text: 'Which of the following is true for nucleolus?',
        A: 'Larger nucleoli are present in dividing cells.', B: 'It is a membrane-bound structure.', C: 'It takes part in spindle formation.', D: 'It is a site for active ribosomal RNA synthesis'
    },
    {
        qNo: 48, topic: 'Nucleus and Microbodies', year: '2015',
        text: 'The chromosomes in which centromere are situated close to one end are:',
        A: 'Telocentric', B: 'Sub-metacentric', C: 'Metacentric', D: 'Acrocentric'
    },
    {
        qNo: 49, topic: 'Nucleus and Microbodies', year: '2015',
        text: 'Nuclear envelope is a derivative of:',
        A: 'Microtubules', B: 'Rough endoplasmic reticulum', C: 'Smooth endoplasmic reticulum', D: 'Membrane of Golgi complex'
    },
    {
        qNo: 50, topic: 'Nucleus and Microbodies', year: '2015',
        text: 'Balbiani rings are sites of:',
        A: 'Nucleotide synthesis', B: 'Polysaccharide synthesis', C: 'RNA and protein synthesis', D: 'Lipid synthesis'
    },
    {
        qNo: 51, topic: 'Nucleus and Microbodies', year: '2015',
        text: 'Match the columns and identify the correct option.\nA. Thylakoids → i. Disc-shaped sacs in Golgi apparatus\nB. Cristae → ii. Condensed structure of DNA\nC. Cisternae → iii. Flat membranous sacs in stroma\nD. Chromatin → iv. Infoldings in mitochondria',
        A: 'A-(iii) B-(iv) C-(i) D-(ii)', B: 'A-(iii) B-(i) C-(iv) D-(ii)', C: 'A-(iii) B-(iv) C-(ii) D-(i)', D: 'A-(iv) B-(iii) C-(i) D-(ii)'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME);

    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME.split(' ').slice(0, 2).join('%')}%`, subjectId]);
    if (!chapter) {
        // Find existing chapter ID or create new. It's usually "Cell: The Unit of Life (id=46)"
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 16]);
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
