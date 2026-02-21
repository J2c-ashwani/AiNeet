/**
 * Seed REAL NEET PYQs — Chapter: Biomolecules (11th Biology)
 * Usage: node scripts/seed_pyq_biomolecules.mjs
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

const CHAPTER_NAME = 'Biomolecules';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Analysis of Chemical Composition',
    'Primary & Secondary Metabolites',
    'Biomacromolecules & Proteins',
    'Polysaccharides, Nucleic Acids & Types of Bond',
    'Enzymes',
];

const ANSWER_KEY = {
    1: 'D', 2: 'B', 3: 'B', 4: 'A', 5: 'B',
    6: 'D', 7: 'C', 8: 'A', 9: 'C', 10: 'A',
    11: 'A', 12: 'D', 13: 'D', 14: 'B', 15: 'D',
    16: 'D', 17: 'C', 18: 'D', 19: 'D', 20: 'D',
    21: 'B', 22: 'C', 23: 'C', 24: 'D', 25: 'B',
    26: 'B', 27: 'D', 28: 'D', 29: 'B', 30: 'C',
    31: 'A', 32: 'D',
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Analysis of Chemical Composition', year: '2022',
        text: 'Read the following statements and choose the set of correct statements:\nA. Lecithin found in the plasma membrane is a glycolipid\nB. Saturated fatty acids possess one or more C=C bonds\nC. Gingely oil has lower melting point, hence remains as oil in winter\nD. Lipids are generally insoluble in water but soluble in some organic solvents\nE. When fatty acid is esterified with glycerol, monoglycerides are formed\nChoose the correct answer from the options given below.',
        A: 'A, B and D only', B: 'A, B and C only', C: 'A, D and E only', D: 'C, D and E only'
    },
    {
        qNo: 2, topic: 'Analysis of Chemical Composition', year: '2021',
        text: "Following are the statements with reference to 'lipids'.\nA. Lipids having only single bonds are called unsaturated fatty acids.\nB. Lecithin is a phospholipid.\nC. Trihydroxy propane is glycerol.\nD. Palmitic acid has 20 carbon atoms including carboxyl carbon.\nE. Arachidonic acid has 16 carbon atoms.\nChoose the correct answer from the options given below.",
        A: 'C & D only', B: 'B & C only', C: 'B & E only', D: 'A & B only'
    },
    {
        qNo: 3, topic: 'Analysis of Chemical Composition', year: '2020',
        text: 'Identify the basic amino acid from the following.',
        A: 'Glutamic acid', B: 'Lysine', C: 'Valine', D: 'Tyrosine'
    },
    {
        qNo: 4, topic: 'Analysis of Chemical Composition', year: '2020',
        text: 'Identify the statement which is incorrect.',
        A: 'Glycine is an example of lipids', B: 'Lecithin contains phosphorus atom in its structure', C: 'Tyrosine possesses aromatic ring in its structure', D: 'Sulphur is an integral part of cysteine'
    },
    {
        qNo: 5, topic: 'Analysis of Chemical Composition', year: '2016',
        text: 'A typical fat molecule is made up of:',
        A: 'Three glycerol molecules and one fatty acid molecule', B: 'One glycerol and three fatty acid molecules', C: 'One glycerol and one fatty acid molecule', D: 'Three glycerol and three fatty acid molecules'
    },
    {
        qNo: 6, topic: 'Analysis of Chemical Composition', year: '2013',
        text: 'A phosphoglyceride is always made up of:',
        A: 'A saturated or unsaturated fatty acid esterified to a phosphate group which is also attached to a glycerol molecule', B: 'Only a saturated fatty acid esterified to a glycerol molecule to which a phosphate group is also attached', C: 'Only an unsaturated fatty acid esterified to a glycerol molecule to which a phosphate group is also attached', D: 'A saturated or unsaturated fatty acid esterified to a glycerol molecule to which a phosphate group is also attached'
    },
    {
        qNo: 7, topic: 'Primary & Secondary Metabolites', year: '2021',
        text: 'Identify the incorrect pair.',
        A: 'Toxin - Abrin', B: 'Lectins - Concanavalin A', C: 'Drugs - Ricin', D: 'Alkaloids - Codeine'
    },
    {
        qNo: 8, topic: 'Primary & Secondary Metabolites', year: '2021',
        text: 'Which of the following are not secondary metabolites in plants?',
        A: 'Amino acids, glucose', B: 'Vinblastin, curcumin', C: 'Rubber, gums', D: 'Morphine, codeine'
    },
    {
        qNo: 9, topic: 'Primary & Secondary Metabolites', year: '2019',
        text: 'Concanavalin A is',
        A: 'An alkaloid', B: 'An essential oil', C: 'A lectin', D: 'A pigment'
    },
    {
        qNo: 10, topic: 'Biomacromolecules & Proteins', year: '2022',
        text: 'Match List-I with List-II.\n(A) Glycogen → (i) Hormone\n(B) Globulin → (ii) Biocatalyst\n(C) Steroids → (iii) Antibody\n(D) Thrombin → (iv) Storage product\nChoose the correct answer from the options given below.',
        A: 'A-iv B-iii C-i D-ii', B: 'A-iii B-ii C-iv D-i', C: 'A-iv B-ii C-i D-iii', D: 'A-ii B-iv C-iii D-i'
    },
    {
        qNo: 11, topic: 'Biomacromolecules & Proteins', year: '2020',
        text: 'Which one of the following is the most abundant protein in the animals?',
        A: 'Collagen', B: 'Lectin', C: 'Insulin', D: 'Haemoglobin'
    },
    {
        qNo: 12, topic: 'Biomacromolecules & Proteins', year: '2019',
        text: 'Which of the following glucose transporters is insulin-dependent?',
        A: 'GLUT I', B: 'GLUT II', C: 'GLUT III', D: 'GLUT IV'
    },
    {
        qNo: 13, topic: 'Biomacromolecules & Proteins', year: '2017',
        text: 'Which of the following are not polymeric?',
        A: 'Nucleic acids', B: 'Proteins', C: 'Polysaccharides', D: 'Lipids'
    },
    {
        qNo: 14, topic: 'Biomacromolecules & Proteins', year: '2016',
        text: 'Which of the following is the least likely to be involved in stabilising the three-dimensional folding of most proteins?',
        A: 'Hydrophobic interaction', B: 'Ester bonds', C: 'Hydrogen bonds', D: 'Electrostatic interaction'
    },
    {
        qNo: 15, topic: 'Polysaccharides, Nucleic Acids & Types of Bond', year: '2022',
        text: 'Exoskeleton of arthropods is composed of:',
        A: 'Glucosamine', B: 'Cutin', C: 'Cellulose', D: 'Chitin'
    },
    {
        qNo: 16, topic: 'Polysaccharides, Nucleic Acids & Types of Bond', year: '2021',
        text: 'Match List-I with List-II\n(A) Protein → (i) C=C double bonds\n(B) Unsaturated fatty acid → (ii) Phosphodiester bonds\n(C) Nucleic acid → (iii) Glycosidic bonds\n(D) Polysaccharide → (iv) Peptide bonds\nChoose the correct answer from the options given below.',
        A: 'A-i B-iv C-iii D-ii', B: 'A-ii B-i C-iv D-iii', C: 'A-iv B-iii C-i D-ii', D: 'A-iv B-i C-ii D-iii'
    },
    {
        qNo: 17, topic: 'Polysaccharides, Nucleic Acids & Types of Bond', year: '2020',
        text: 'Identify the substances having glycosidic bond and peptide bond, respectively in their structure:',
        A: 'Glycerol, trypsin', B: 'Cellulose, lecithin', C: 'Inulin, insulin', D: 'Chitin, cholesterol'
    },
    {
        qNo: 18, topic: 'Polysaccharides, Nucleic Acids & Types of Bond', year: '2020',
        text: 'Match the following:\n1. Aquaporin → (i) Amide\n2. Asparagine → (ii) Polysaccharide\n3. Abscisic acid → (iii) Polypeptide\n4. Chitin → (iv) Carotenoids\nSelect the correct option:',
        A: '(ii) (iii) (iv) (i)', B: '(ii) (i) (iv) (iii)', C: '(iii) (i) (ii) (iv)', D: '(iii) (i) (iv) (ii)'
    },
    {
        qNo: 19, topic: 'Polysaccharides, Nucleic Acids & Types of Bond', year: '2018',
        text: 'The two functional groups characteristic of sugars are:',
        A: 'Hydroxyl and methyl', B: 'Carbonyl and methyl', C: 'Carbonyl and phosphate', D: 'Carbonyl and hydroxyl'
    },
    {
        qNo: 20, topic: 'Polysaccharides, Nucleic Acids & Types of Bond', year: '2016',
        text: 'Which one of the following statements is wrong?',
        A: 'Sucrose is a disaccharide', B: 'Cellulose is a polysaccharide', C: 'Uracil is a pyrimidine', D: 'Glycine is a sulphur containing amino acid'
    },
    {
        qNo: 21, topic: 'Polysaccharides, Nucleic Acids & Types of Bond', year: '2015',
        text: 'The chitinous exoskeleton of arthropods is formed by the polymerisation of:',
        A: 'D-glucosamine', B: 'N-acetyl glucosamine', C: 'Lipoglycans', D: 'Keratin sulphate and chondroitin sulphate'
    },
    {
        qNo: 22, topic: 'Polysaccharides, Nucleic Acids & Types of Bond', year: '2015',
        text: 'Which of the following biomolecules does have phosphodiester bond?',
        A: 'Monosaccharides in polysaccharide', B: 'Amino acids in a polypeptide', C: 'Nucleic acids in a nucleotide', D: 'Fatty acids in a diglyceride'
    },
    {
        qNo: 23, topic: 'Polysaccharides, Nucleic Acids & Types of Bond', year: '2014',
        text: 'Which one of the following is a non-reducing carbohydrate?',
        A: 'Ribose 5-phosphate', B: 'Maltose', C: 'Sucrose', D: 'Lactose'
    },
    {
        qNo: 24, topic: 'Enzymes', year: '2020',
        text: 'Match the following. Choose the correct option:\n1. Inhibitor of catalytic activity → (i) Ricin\n2. Possess peptide bonds → (ii) Malonate\n3. Cell wall material in fungi → (iii) Chitin\n4. Secondary metabolite → (iv) Collagen',
        A: '(iii) (i) (iv) (ii)', B: '(iii) (iv) (i) (ii)', C: '(ii) (iii) (i) (iv)', D: '(ii) (iv) (iii) (i)'
    },
    {
        qNo: 25, topic: 'Enzymes', year: '2019',
        text: 'Consider the following statements:\nA. Coenzyme or metal ion that is tightly bound to enzyme protein is called prosthetic group.\nB. A complete catalytic active enzyme with its bound prosthetic group is called apoenzyme.\nSelect the correct option.',
        A: 'Both (A) and (B) are true.', B: '(A) is true but (B) is false.', C: 'Both (A) and (B) are false.', D: '(A) is false but (B) is true.'
    },
    {
        qNo: 26, topic: 'Enzymes', year: '2017',
        text: 'Which one of the following statements is correct, with reference to enzymes?',
        A: 'Apoenzyme = Holoenzyme + Coenzyme', B: 'Holoenzyme = Apoenzyme + Coenzyme', C: 'Coenzyme = Apoenzyme + Holoenzyme', D: 'Holoenzyme = Coenzyme + Cofactor'
    },
    {
        qNo: 27, topic: 'Enzymes', year: '2016',
        text: 'Which of the following describes the given graph correctly? (Graph shows activation energy with and without enzyme)',
        A: 'Endothermic reaction with energy A in absence of enzyme and B in presence of enzyme', B: 'Exothermic reaction with energy A in absence of enzyme and B in presence of enzyme', C: 'Endothermic reaction with energy A in presence of enzyme and B in absence of enzyme', D: 'Exothermic reaction with energy A in presence of enzyme and B in absence of enzyme.'
    },
    {
        qNo: 28, topic: 'Enzymes', year: '2016',
        text: 'A non-proteinaceous enzyme is:',
        A: 'Ligase', B: 'Deoxyribonuclease', C: 'Lysozyme', D: 'Ribozyme'
    },
    {
        qNo: 29, topic: 'Enzymes', year: '2015',
        text: 'Which one of the following statements is incorrect?',
        A: 'The competitive inhibitor does not affect the rate of breakdown of the enzyme substrate complex', B: 'The presence of the competitive inhibitor decreases the Km of the enzyme for the substrate', C: 'A competitive inhibitor reacts with the enzyme to form an enzyme inhibitor complex', D: 'In competitive inhibition, the inhibitor molecule is not chemically changed by the enzyme'
    },
    {
        qNo: 30, topic: 'Enzymes', year: '2014',
        text: 'Select the option which is not correct with respect to enzyme action:',
        A: 'Malonate is a competitive inhibitor of succinic dehydrogenase', B: 'Substrate binds with enzyme at its active site', C: 'Addition of lot of succinate does not reverse the inhibition of succinic dehydrogenase by malonate', D: 'A non-competitive inhibitor binds the enzyme at a site distinct from that which binds the substrate'
    },
    {
        qNo: 31, topic: 'Enzymes', year: '2013',
        text: 'The essential chemical components of many coenzymes are:',
        A: 'Vitamins', B: 'Proteins', C: 'Nucleic acids', D: 'Carbohydrates'
    },
    {
        qNo: 32, topic: 'Enzymes', year: '2013',
        text: 'Transition state structure of the substrate formed during an enzymatic reaction is:',
        A: 'Permanent and stable', B: 'Transient but stable', C: 'Permanent but unstable', D: 'Transient and unstable'
    },
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME);

    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name = $1 AND subject_id = $2', [CHAPTER_NAME, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 9]);
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
