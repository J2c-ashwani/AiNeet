/**
 * Seed REAL NEET PYQs — Chapter: Molecular Basis of Inheritance (12th Biology)
 * Usage: node scripts/seed_pyq_molecular_basis.mjs
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

const CHAPTER_NAME = 'Molecular Basis of Inheritance';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 12;

const TOPICS = [
    'DNA',
    'The Search For Genetic Material And RNA World',
    'Replication',
    'Transcription',
    'Genetic Code',
    'Translation',
    'Regulation of Gene Expression',
    'Human Genome Project And DNA Fingerprinting'
];

const ANSWER_KEY = {
    1: 'B', 2: 'C', 3: 'B', 4: 'B', 5: 'A', 6: 'D', 7: 'B', 8: 'C', 9: 'D', 10: 'B',
    11: 'C', 12: 'B', 13: 'B', 14: 'D', 15: 'D', 16: 'A', 17: 'B', 18: 'A', 19: 'B', 20: 'A',
    21: 'D', 22: 'A', 23: 'A', 24: 'C', 25: 'D', 26: 'D', 27: 'B', 28: 'A', 29: 'A', 30: 'A',
    31: 'C', 32: 'A', 33: 'D', 34: 'A', 35: 'C', 36: 'C', 37: 'D', 38: 'C', 39: 'C', 40: 'A',
    41: 'B', 42: 'C', 43: 'B', 44: 'B', 45: 'D', 46: 'C', 47: 'D', 48: 'C', 49: 'D', 50: 'D',
    51: 'B', 52: 'D', 53: 'B', 54: 'A', 55: 'D', 56: 'A', 57: 'B', 58: 'C', 59: 'A', 60: 'C',
    61: 'A'
};

const QUESTIONS = [
    // DNA (Q1-14)
    {
        qNo: 1, topic: 'DNA', year: '2022',
        text: 'If the length of a DNA molecule is 1.1 metres, what will be the approximate number of base pairs?',
        A: '6.6 × 10^6 bp', B: '3.3 × 10^9 bp', C: '6.6 × 10^9 bp', D: '3.3 × 10^6 bp'
    },
    {
        qNo: 2, topic: 'DNA', year: '2022',
        text: 'Read the following statements and choose the set of correct statements\nA. Euchromatin is loosely packed chromatin\nB. Heterochromatin is transcriptionally active\nC. Histone octomer is wrapped by negatively charged DNA in nucleosome\nD. Histones are rich in lysine and arginine\nE. A typical nucleosome contains 400 bp of DNA helix\nChoose the correct answer from the options given below.',
        A: 'A, C and E only', B: 'B, D and E only', C: 'A, C and D only', D: 'B and E only'
    },
    {
        qNo: 3, topic: 'DNA', year: '2021',
        text: 'Complete the flow chart on central dogma.\nDNA --(A)--> mRNA --(B)--> (C) --(D)--> Protein (conceptualized structure)',
        A: '(A)-Translation;(B)-Replication;(C)-Transcription;(D)- Transduction', B: '(A)-Replication;(B)-Transcription;(C)-Translation; (D)-Protein', C: '(A)-Transduction;(B)-Translation;(C)-Replication; (D)-Protein', D: '(A)-Replication;(B)-Transcription(C)-Transduction;(D)-Protein'
    },
    {
        qNo: 4, topic: 'DNA', year: '2021',
        text: 'If Adenine makes 30% of the DNA molecule, what will be the percentage of Thymine, Guanine and Cytosine in it?',
        A: 'T : 20; G : 20; C : 30', B: 'T : 30; G : 20; C : 20', C: 'T : 20; G : 25; C : 25', D: 'T : 20; G : 30; C : 20'
    },
    {
        qNo: 5, topic: 'DNA', year: '2021',
        text: 'Which one of the following statement about histones is wrong?',
        A: 'The pH of histones is slightly acidic.', B: 'Histones are rich in amino acids - Lysine and Arginine.', C: 'Histones carry positive charge in the side chain.', D: 'Histones are organized to form a unit of 8 molecules.'
    },
    {
        qNo: 6, topic: 'DNA', year: '2020',
        text: 'Which of the following statements is correct?',
        A: 'Adenine pairs with thymine through one H-bond', B: 'Adenine pairs with thymine through three H-bonds.', C: 'Adenine does not pair with thymine.', D: 'Adenine pairs with thymine through two H-bonds.'
    },
    {
        qNo: 7, topic: 'DNA', year: '2020',
        text: 'If the distance between two consecutive base pairs is 0.34 nm and the total number of base pairs of a DNA double helix in a typical mammalian cell is 6.6 × 10^9 bp, then the length of the DNA is approximately:',
        A: '2.5 meters', B: '2.2 meters', C: '2.7 meters', D: '2.0 meters'
    },
    {
        qNo: 8, topic: 'DNA', year: '2020',
        text: 'In the polynucleotide chain of DNA, a nitrogenous base is linked to the –OH of:',
        A: '3\'C pentose sugar', B: '5\'C pentose sugar', C: '1\'C pentose sugar', D: '2\'C pentose sugar'
    },
    {
        qNo: 9, topic: 'DNA', year: '2020',
        text: 'E. Coli has only 4.6 × 10^6 base pairs and completes the process of replication within 18 minutes; then the average rate of polymerisation is approximately-',
        A: '3000 base pairs/second', B: '4000 base pairs/second', C: '1000 base pairs/second', D: '2000 base pairs/second'
    },
    {
        qNo: 10, topic: 'DNA', year: '2019',
        text: 'Purines found both in DNA and RNA are',
        A: 'Adenine and thymine', B: 'Adenine and guanine', C: 'Guanine and cytosine', D: 'Cytosine and thymine'
    },
    {
        qNo: 11, topic: 'DNA', year: '2017',
        text: 'The association of histone H1 with a nucleosome indicates:',
        A: 'Transcription is occurring', B: 'DNA replication is occurring', C: 'The DNA is condensed into a chromatin fibre', D: 'The DNA double helix is exposed'
    },
    {
        qNo: 12, topic: 'DNA', year: '2017',
        text: 'DNA fragments are:',
        A: 'Positively charged', B: 'Negatively charged', C: 'Neutral', D: 'Either positively or negatively charged depending on their size'
    },
    {
        qNo: 13, topic: 'DNA', year: '2015',
        text: 'Identify the correct order of organisation of genetic material from largest to smallest:',
        A: 'Genome, chromosome, nucleotide, gene', B: 'Genome, chromosome, gene, nucleotide', C: 'Chromosome, genome, nucleotide, gene', D: 'Chromosome, gene, genome, nucleotide'
    },
    {
        qNo: 14, topic: 'DNA', year: '2013',
        text: 'The diagram shows an important concept in the genetic implication of DNA. Fill in the blanks A to C: (Central Dogma Image)\nDNA →(A)→ mRNA →(B)→ Protein \nProposed by (C)',
        A: 'A-translation, B-extension, C-Rosalind Franklin', B: 'A-transcription, B-replication, C-James Watson', C: 'A-translation, B-transcription, C-Erwin Chargaff', D: 'A-transcription, B-translation, C-Francis Crick'
    },
    // The Search For Genetic Material And RNA World (Q15-25)
    {
        qNo: 15, topic: 'The Search For Genetic Material And RNA World', year: '2022',
        text: 'Ten E.coli with 15N- dsDNA are incubated in medium containing 14N nucleotide. After 60 minutes, how many E.coli cells will have DNA totally free from 15N?',
        A: '80 cells', B: '20 cells', C: '40 cells', D: '60 cells'
    },
    {
        qNo: 16, topic: 'The Search For Genetic Material And RNA World', year: '2020',
        text: 'The term \'Nuclein\' for the genetic material was used by:',
        A: 'Meischer', B: 'Chargaff', C: 'Mendel', D: 'Franklin'
    },
    {
        qNo: 17, topic: 'The Search For Genetic Material And RNA World', year: '2018',
        text: 'The experimental proof for semiconservative replication of DNA was first shown in a:',
        A: 'Fungus', B: 'Bacterium', C: 'Plant', D: 'Virus'
    },
    {
        qNo: 18, topic: 'The Search For Genetic Material And RNA World', year: '2018',
        text: 'Select the correct match',
        A: 'Ribozyme - Nucleic acid', B: 'F2 × Recessive parent - Dihybrid cross', C: 'T.H. Morgan - Transduction', D: 'G. Mendel - Transformation'
    },
    {
        qNo: 19, topic: 'The Search For Genetic Material And RNA World', year: '2017',
        text: 'The final proof for DNA as the genetic material came from the experiments of',
        A: 'Griffith', B: 'Hershey and Chase', C: 'Avery, Mcleod and McCarty', D: 'Hargobind Khorana'
    },
    {
        qNo: 20, topic: 'The Search For Genetic Material And RNA World', year: '2016',
        text: 'A molecule that can act as a genetic material must fulfill the traits given below, except:',
        A: 'It should be unstable structurally and chemically', B: 'It should provide the scope for slow changes that are required for evolution', C: 'It should be able to express itself in the form of ‘Mendelian characters’', D: 'It should be able to generate its replica'
    },
    {
        qNo: 21, topic: 'The Search For Genetic Material And RNA World', year: '2016',
        text: 'Taylor conducted the experiment to prove semi- conservative mode of chromosome replication on:',
        A: 'Drosophila melanogaster', B: 'E. coli', C: 'Vinca rosea', D: 'Vicia faba'
    },
    {
        qNo: 22, topic: 'The Search For Genetic Material And RNA World', year: '2016',
        text: 'Which of the following rRNA acts as structural RNA as well as ribozyme in bacteria?',
        A: '23 S rRNA', B: '5.8 S rRNA', C: '5 S rRNA', D: '18 S rRNA'
    },
    {
        qNo: 23, topic: 'The Search For Genetic Material And RNA World', year: '2015',
        text: 'In sea urchin DNA, which is double stranded, 17% of the bases were shown to be cytosine. The percentages of the other three bases expected to be present in this DNA are:',
        A: 'G = 17%, A = 33%, T = 33%', B: 'G = 8.5 %, A = 50 %, T = 24.5 %', C: 'G = 34%, A = 24.5%, T = 24.5%', D: 'G = 17%, A = 16.5%, T = 32.5%'
    },
    {
        qNo: 24, topic: 'The Search For Genetic Material And RNA World', year: '2015',
        text: 'Which one of the following is not applicable to RNA?',
        A: '5′ phosphoryl and 3′ hydroxyl ends', B: 'Heterocyclic nitrogenous bases', C: 'Chargaff’s rule', D: 'Complementary base pairing'
    },
    {
        qNo: 25, topic: 'The Search For Genetic Material And RNA World', year: '2014',
        text: 'Transformation was discovered by:',
        A: 'Watson and Crick', B: 'Messelson and Stahl', C: 'Hershey and Chase', D: 'Griffith'
    },
    // Replication (Q26-27)
    {
        qNo: 26, topic: 'Replication', year: '2017',
        text: 'During DNA replication, Okazaki fragments are used to elongate',
        A: 'The leading strand towards replication fork', B: 'The lagging strand towards replication fork', C: 'The leading strand away from replication fork', D: 'The lagging strand away from the replication fork'
    },
    {
        qNo: 27, topic: 'Replication', year: '2014',
        text: 'Select the correct option regarding direction of RNA synthesis and direction of reading of the template DNA strand:',
        A: '3′ → 5′ ; 3′ → 5′', B: '5′ → 3′ ; 3′ → 5′', C: '3′ → 5′ ; 5′ → 3′', D: '5′ → 3′ ; 5′ → 3′'
    },
    // Transcription (Q28-35)
    {
        qNo: 28, topic: 'Transcription', year: '2021',
        text: 'What is the role of RNA ploymerase III in the process of transcription in eukaryotes?',
        A: 'Transcribes tRNA, 5s rRNA and sn RNA', B: 'Transcribes precursor of mRNA', C: 'Transcribes only snRNAs', D: 'Transcribes rRNAs (28S, 18S and 5.8S)'
    },
    {
        qNo: 29, topic: 'Transcription', year: '2021',
        text: 'Identify the correct statement.',
        A: 'RNA polymerase binds with Rho factor to terminate the process of transcription in bacteria.', B: 'The coding strand in transcription unit is copied to an mRNA.', C: 'Split gene arrangement is characteristic of prokaryotes.', D: 'In capping, methyl guanosine triphosphate is added to the 3′ end of hnRNA.'
    },
    {
        qNo: 30, topic: 'Transcription', year: '2021',
        text: 'Which is the “Only enzyme” that has “Capability” to catalyse Initiation, Elongation and Termination in the process of transcription in prokaryotes?',
        A: 'DNA dependent RNA polymerase', B: 'DNA Ligase', C: 'DNase', D: 'DNA dependent DNA polymerase'
    },
    {
        qNo: 31, topic: 'Transcription', year: '2020',
        text: 'Name the enzyme that facilitates opening of DNA helix during transcription.',
        A: 'DNA helicase', B: 'DNA polymerase', C: 'RNA polymerase', D: 'DNA ligase'
    },
    {
        qNo: 32, topic: 'Transcription', year: '2018',
        text: 'AGGTATCGCAT is a sequence from the coding strand of a gene. What will be the corresponding sequence of the transcribed mRNA?',
        A: 'AGGUAUCGCAU', B: 'UGGTUTCGCAT', C: 'ACCUAUGCGAU', D: 'UCCAUAGCGUA'
    },
    {
        qNo: 33, topic: 'Transcription', year: '2017',
        text: 'Spliceosomes are not found in cells of:',
        A: 'Plants', B: 'Fungi', C: 'Animals', D: 'Bacteria'
    },
    {
        qNo: 34, topic: 'Transcription', year: '2017',
        text: 'Which of the following RNAs should be most abundant in animal cell?',
        A: 'r-RNA', B: 't-RNA', C: 'm-RNA', D: 'mi-RNA'
    },
    {
        qNo: 35, topic: 'Transcription', year: '2016',
        text: 'DNA-dependent RNA polymerase catalyses transcription on one strand of the DNA which is called the:',
        A: 'Alpha strand', B: 'Antistrand', C: 'Template strand', D: 'Coding strand'
    },
    // Genetic Code (Q36-40)
    {
        qNo: 36, topic: 'Genetic Code', year: '2021',
        text: 'Statement I: The codon ‘AUG’ codes for methionine and phenylalanine.\nStatement II: ‘AAA’ and ‘AAG’ both codons code for the amino acid lysine.\nIn the light of the above statements, choose the correct answer from the options given below.',
        A: 'Both statement I and statement II are false', B: 'Statement I is correct but statement II is false', C: 'Statement I is incorrect but statement II is true', D: 'Both statement I and statement II are true'
    },
    {
        qNo: 37, topic: 'Genetic Code', year: '2019',
        text: 'Under which of the following conditions will there be no change in the reading frame of following mRNA?\n5′AACAGCGGUGCUAUU3′',
        A: 'Insertion of G at 5th position', B: 'Deletion of G from 5th position', C: 'Insertion of A and G at 4th and 5th positions respectively', D: 'Deletion of GGU from 7th, 8th and 9th positions'
    },
    {
        qNo: 38, topic: 'Genetic Code', year: '2019',
        text: 'Which of the following features of genetic code does allow bacteria to produce human insulin by recombinant DNA technology?',
        A: 'Genetic code is not ambiguous', B: 'Genetic code is redundant', C: 'Genetic code is nearly universal', D: 'Genetic code is specific'
    },
    {
        qNo: 39, topic: 'Genetic Code', year: '2017',
        text: 'If there are 999 bases in an RNA that codes for a protein with 333 amino acids, and the base at position 901 is deleted such that the length of the RNA becomes 998 bases, how many codons will be altered?',
        A: '1', B: '11', C: '33', D: '333'
    },
    {
        qNo: 40, topic: 'Genetic Code', year: '2016',
        text: 'Which one of the following is the starter codon?',
        A: 'AUG', B: 'UGA', C: 'UAA', D: 'UAG'
    },
    // Translation (Q41-44)
    {
        qNo: 41, topic: 'Translation', year: '2022',
        text: 'The process of translation of mRNA to proteins begins as soon as:',
        A: 'The tRNA is activated and the larger subunit of ribosome encounters mRNA', B: 'The small subunit of ribosome encounters mRNA', C: 'The larger subunit of ribosome encounters mRNA', D: 'Both the subunits join together to bind with mRNA'
    },
    {
        qNo: 42, topic: 'Translation', year: '2021',
        text: 'Which of the following RNAs is not required for the synthesis of protein?',
        A: 'tRNA', B: 'rRNA', C: 'siRNA', D: 'mRNA'
    },
    {
        qNo: 43, topic: 'Translation', year: '2020',
        text: 'The first phase of translation is:',
        A: 'Recognition of DNA molecule', B: 'Aminoacylation of tRNA', C: 'Recognition of an anti-codon', D: 'Binding of mRNA to ribosome'
    },
    {
        qNo: 44, topic: 'Translation', year: '2014',
        text: 'Which one of the following is wrongly matched?',
        A: 'Operon-Structural genes, operator and promoter', B: 'Transcription-Writing information from DNA to tRNA', C: 'Translation-Using information in mRNA to make protein', D: 'Repressor protein-Binds to operator to stop enzyme synthesis'
    },
    // Regulation of Gene Expression (Q45-51)
    {
        qNo: 45, topic: 'Regulation of Gene Expression', year: '2022',
        text: 'In an E.coli strain i gene gets mutated and its product can not bind the inducer molecule. If growth medium is provided with lactose, what will be the outcome?',
        A: 'RNA polymerase will bind the promoter region', B: 'Only z gene will get transcribed', C: 'z, y, a genes will be transcribed', D: 'z, y, a genes will not be translated'
    },
    {
        qNo: 46, topic: 'Regulation of Gene Expression', year: '2019',
        text: 'Match the following genes of the Lac operon with their respective products :\nA. i gene (i) β-galactosidase\nB. z gene (ii) Permease\nC. a gene (iii) Repressor\nD. y gene (iv) Transacetylase\nSelect the correct option.',
        A: '(i) (iii) (ii) (iv)', B: '(iii) (i) (ii) (iv)', C: '(iii) (i) (iv) (ii)', D: '(iii) (iv) (i) (ii)'
    },
    {
        qNo: 47, topic: 'Regulation of Gene Expression', year: '2018',
        text: 'Select the correct match:',
        A: 'Alec Jeffreys – Streptococcus pneumoniae', B: 'Alfred Hershey and Martha Chase – TMV', C: 'Matthew Meselson and F. Stahl – Pisum sativum', D: 'Francois Jacob and Jacques Monod – Lac operon'
    },
    {
        qNo: 48, topic: 'Regulation of Gene Expression', year: '2018',
        text: 'All of the following are part of an operon except:',
        A: 'An operator', B: 'Structural genes', C: 'An enhancer', D: 'A promoter'
    },
    {
        qNo: 49, topic: 'Regulation of Gene Expression', year: '2016',
        text: 'The equivalent of a structural gene is:',
        A: 'Operon', B: 'Recon', C: 'Muton', D: 'Cistron'
    },
    {
        qNo: 50, topic: 'Regulation of Gene Expression', year: '2015',
        text: 'Gene regulation governing lactose operon of E. coli that involves the lac I gene product is:',
        A: 'Negative and repressible because repressor protein prevents transcription', B: 'Feedback inhibition because excess of β-galactosidase can switch off transcription', C: 'Positive and inducible because it can be induced', D: 'Negative and inducible because repressor protein prevents transcription'
    },
    {
        qNo: 51, topic: 'Regulation of Gene Expression', year: '2013',
        text: 'Which enzyme/s will be produced in a cell in which there is a nonsense mutation in the lac Y gene?',
        A: 'Lactose permease and transacetylase', B: 'β-galactosidase', C: 'Lactose permease', D: 'Transacetylase'
    },
    // Human Genome Project And DNA Fingerprinting (Q52-61)
    {
        qNo: 52, topic: 'Human Genome Project And DNA Fingerprinting', year: '2022',
        text: 'DNA polymorphism forms the basis of:',
        A: 'Translation', B: 'Genetic mapping', C: 'DNA finger printing', D: 'Both genetic mapping and DNA finger printing'
    },
    {
        qNo: 53, topic: 'Human Genome Project And DNA Fingerprinting', year: '2022',
        text: 'If a geneticist uses the blind approach for sequencing the whole genome of an organism, followed by assignment of function to different segments, the methodology adopted by him is called as:',
        A: 'Bioinformatics', B: 'Sequence annotation', C: 'Gene mapping', D: 'Expressed sequence tags'
    },
    {
        qNo: 54, topic: 'Human Genome Project And DNA Fingerprinting', year: '2021',
        text: 'DNA fingerprinting involves identifying differences in some specific regions in DNA sequence, called as:',
        A: 'Repetitive DNA', B: 'Single nucleotides', C: 'Polymorphic DNA', D: 'Satellite DNA'
    },
    {
        qNo: 55, topic: 'Human Genome Project And DNA Fingerprinting', year: '2020',
        text: 'Which is the basis of genetic mapping of human genome as well as DNA finger printing?',
        A: 'Single nucleotide polymorphism', B: 'Polymorphism in hnRNA sequence', C: 'Polymorphism in RNA sequence', D: 'Polymorphism in DNA sequence'
    },
    {
        qNo: 56, topic: 'Human Genome Project And DNA Fingerprinting', year: '2019',
        text: 'Expressed Sequence Tags (ESTs) refers to :',
        A: 'Genes expressed as RNA', B: 'Polypeptide expression', C: 'DNA polymorphism', D: 'Novel DNA sequences'
    },
    {
        qNo: 57, topic: 'Human Genome Project And DNA Fingerprinting', year: '2016',
        text: 'Which of the following is not required for any of the techniques of DNA fingerprinting available at present?',
        A: 'Polymerase chain reaction', B: 'Zinc finger analysis', C: 'Restriction enzymes', D: 'DNA-DNA hybridisation'
    },
    {
        qNo: 58, topic: 'Human Genome Project And DNA Fingerprinting', year: '2016',
        text: 'Which of the following is required as inducer(s) for the expression of Lac operon?',
        A: 'Glucose', B: 'Galactose', C: 'Lactose', D: 'Lactose and Galactose'
    },
    {
        qNo: 59, topic: 'Human Genome Project And DNA Fingerprinting', year: '2015',
        text: 'Satellite DNA is important because it:',
        A: 'Shows high degree of polymorphism in population and also the same degree of polymorphism in an individual, which are heritable form parents to children.', B: 'Does not code for proteins and is same in all members of the population', C: 'Codes for enzymes needed for DNA replication', D: 'Codes for proteins needed in cell cycle.'
    },
    {
        qNo: 60, topic: 'Human Genome Project And DNA Fingerprinting', year: '2014',
        text: 'Commonly used vectors for human genome sequencing are:',
        A: 'T/A Cloning Vectors', B: 'T-DNA', C: 'BAC and YAC', D: 'Expression Vectors'
    },
    {
        qNo: 61, topic: 'Human Genome Project And DNA Fingerprinting', year: '2014',
        text: 'An analysis of chromosomal DNA using the southern hybridisation technique does not use:',
        A: 'PCR', B: 'Electrophoresis', C: 'Blotting', D: 'Autoradiography'
    }
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME, '(Class 12)');

    // Molecular Basis of Inheritance is Chapter 6 in NCERT Biology Class 12
    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME.split(' ').slice(0, 2).join('%')}%`, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 6]);
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
