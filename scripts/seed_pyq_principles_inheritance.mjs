/**
 * Seed REAL NEET PYQs — Chapter: Principles of Inheritance and Variation (12th Biology)
 * Usage: node scripts/seed_pyq_principles_inheritance.mjs
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

const CHAPTER_NAME = 'Principles of Inheritance and Variation';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 12;

const TOPICS = [
    'Mendal\'s Laws of Inheritance And Inheritance of One Gene',
    'Inheritance of Two Genes',
    'Chromosomal Theory of Inheritance',
    'Linkage and Recombination, Polygenic Inheritance and Pleiotropy',
    'Sex Determination And Mutation',
    'Genetic Disorders'
];

const ANSWER_KEY = {
    1: 'B', 2: 'B', 3: 'B', 4: 'B', 5: 'C', 6: 'D', 7: 'B', 8: 'B', 9: 'C', 10: 'A',
    11: 'A', 12: 'C', 13: 'A', 14: 'B', 15: 'A', 16: 'A', 17: 'A', 18: 'C', 19: 'A', 20: 'B',
    21: 'A', 22: 'C', 23: 'C', 24: 'D', 25: 'C', 26: 'D', 27: 'A', 28: 'C', 29: 'B', 30: 'B',
    31: 'A', 32: 'D', 33: 'C', 34: 'C', 35: 'C', 36: 'A', 37: 'D', 38: 'C', 39: 'A', 40: 'B',
    41: 'B', 42: 'B', 43: 'D', 44: 'A', 45: 'C', 46: 'C', 47: 'D', 48: 'B', 49: 'B', 50: 'C',
    51: 'B', 52: 'D', 53: 'D', 54: 'D'
};

const QUESTIONS = [
    // Mendal's Laws of Inheritance And Inheritance of One Gene (Q1-21)
    {
        qNo: 1, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2022',
        text: 'Given below are two statements:\nStatement I: Mendel studied seven pairs of contrasting traits in pea plants and proposed the Laws of Inheritance.\nStatement II: Seven characters examined by Mendel in his experiment on pea plants were seed shape and colour, flower colour, pod shape and colour, flower position and stem height.\nIn the light of the above statements, choose the correct answer from the options given below.',
        A: 'Statement I is incorrect but Statement II is correct', B: 'Both Statement I and Statement II are correct', C: 'Both statement I and statement II are incorrect', D: 'Statement I is correct but Statement II is incorrect'
    },
    {
        qNo: 2, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2021',
        text: 'The production for gametes by the parents, formation of zygotes, the F1 and F2 plants, can be understood from a diagram called:',
        A: 'Punch square', B: 'Punnett square', C: 'Net square', D: 'Bullet square'
    },
    {
        qNo: 3, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2020',
        text: 'Identify the wrong statement with reference to the gene ‘I’ that controls ABO blood groups.',
        A: 'A person will have only two of the three alleles.', B: 'When IA and IB are present together, they express same type of sugar.', C: 'Allele ‘i’ does not produce any sugar', D: 'The gene I has three alleles.'
    },
    {
        qNo: 4, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2020',
        text: 'How many true breeding pea plant varieties did Mendel select as pairs, which were similar except in one character with contrasting traits?',
        A: '2', B: '14', C: '8', D: '4'
    },
    {
        qNo: 5, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2020',
        text: 'The number of contrasting characters studied by Mendel for his experiments was:',
        A: '4', B: '2', C: '7', D: '14'
    },
    {
        qNo: 6, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2019',
        text: 'In Antirrhinum (Snapdragon), a red flower was crossed with a white flower and in F1 generation pink flowers were obtained. When pink flowers were selfed, the F2 generation showed white, red and pink flowers. Choose the incorrect statement from the following:',
        A: 'This experiment does not follow the principle of dominance.', B: 'Pink colour in F1 is due to incomplete dominance.', C: 'Ratio of F2 is 1/4(Red) : 2/4(Pink) : 1/4(White)', D: 'Law of segregation does not apply in this experiment'
    },
    {
        qNo: 7, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2018',
        text: 'Which of the following characteristics represent \'Inheritance of blood groups\' in humans?\nA. Dominance \nB. Co-dominance \nC. Multiple alleles \nD. Incomplete dominance \nE. Polygenic inheritance',
        A: 'B, C and E', B: 'A, B and C', C: 'B, D and E', D: 'A, C and E'
    },
    {
        qNo: 8, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2017',
        text: 'Among the following characters, which one was not considered by Mendel in his experiments on pea?',
        A: 'Stem – Tall or Dwarf', B: 'Trichomes – Glandular or non-glandular', C: 'Seed – Green or Yellow', D: 'Pod – Inflated or Constricted'
    },
    {
        qNo: 9, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2017',
        text: 'The genotypes of a Husband and Wife are IAIB and IAi. Among the blood types of their children, how many different genotypes and phenotypes are possible?',
        A: '3 genotypes ; 3 phenotypes', B: '3 genotypes ; 4 phenotypes', C: '4 genotypes ; 3 phenotypes', D: '4 genotypes ; 4 phenotypes'
    },
    {
        qNo: 10, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2017',
        text: 'Which one from those given below is the period for Mendel’s hybridisation experiments?',
        A: '1856 - 1863', B: '1840 - 1850', C: '1857 - 1869', D: '1870 - 1877'
    },
    {
        qNo: 11, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2016',
        text: 'A true breeding plant is:',
        A: 'Nearly homozygous and produces offspring of its own kind', B: 'Always homozygous recessive in its genetic constitution', C: 'One that is able to breed on its own', D: 'Produced due to cross-pollination among unrelated plants'
    },
    {
        qNo: 12, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2016',
        text: 'In a test cross involving F1 dihybrid flies, more parental-type offspring were produced than the recombinant-type offspring. This indicates',
        A: 'The two genes are located on two different chromosomes', B: 'Chromosomes failed to separate during meiosis', C: 'The two genes are linked and present on the same chromosome', D: 'Both of the characters are controlled by more than one gene'
    },
    {
        qNo: 13, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2016',
        text: 'A tall true breeding garden pea plant is crossed with a dwarf true breeding garden pea plant. When the F1 plants were selfed the resulting genotypes were in the ratio of:',
        A: '1 : 2 : 1 : Tall homozygous : Tall heterozygous : Dwarf', B: '1 : 2 : 1 : Tall heterozygous : Tall homozygous : Dwarf', C: '3 : 1 : Tall : Dwarf', D: '3 : 1 : Dwarf : Tall'
    },
    {
        qNo: 14, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2016',
        text: 'How many pairs of contrasting characters in pea plants were studied by Mendel in his experiments?',
        A: 'Eight', B: 'Seven', C: 'Five', D: 'Six'
    },
    {
        qNo: 15, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2016',
        text: 'A man with blood group ‘A’ marries a woman with blood group ‘B’. What are all the possible blood groups of their offspring’s?',
        A: 'A, B, AB and O', B: 'O only', C: 'A and B only', D: 'A, B and AB only'
    },
    {
        qNo: 16, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2015',
        text: 'Multiple alleles are present:',
        A: 'At the same locus of the chromosome', B: 'On non-sister chromatids', C: 'On different chromosomes', D: 'At different loci on the same chromosome'
    },
    {
        qNo: 17, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2015',
        text: 'Alleles are:',
        A: 'Different molecular forms of a gene', B: 'Heterozygote’s', C: 'Different phenotype', D: 'True breeding homozygote’s'
    },
    {
        qNo: 18, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2015',
        text: 'A gene showing co-dominance has:',
        A: 'Alleles tightly linked on the same chromosome', B: 'Alleles that is recessive to each other', C: 'Both alleles independently expressed in the heterozygote', D: 'One allele dominant on the other'
    },
    {
        qNo: 19, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2015',
        text: 'In his classic experiments on pea plants, Mendel did not use:',
        A: 'Pod length', B: 'Seed shape', C: 'Flower position', D: 'Seed colour'
    },
    {
        qNo: 20, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2013',
        text: 'If two persons with ‘AB’ blood group marry and have sufficiently large number of children, these children could be classified as ‘A’ blood group : ‘AB’ blood group : ‘B’ blood group in 1 : 2 : 1 ratio. Modern technique of protein electrophoresis reveals presence of both ‘A’ and ‘B’ type proteins in ‘AB’ blood group individuals. This is an example of:',
        A: 'Complete dominance', B: 'Co-dominance', C: 'Incomplete dominance', D: 'Partial dominance'
    },
    {
        qNo: 21, topic: 'Mendal\'s Laws of Inheritance And Inheritance of One Gene', year: '2013',
        text: 'Which Mendelian idea is depicted by a cross in which the F1 generation resembles both the parents?',
        A: 'Co-dominance', B: 'Incomplete dominance', C: 'Law of dominance', D: 'Inheritance of one gene'
    },

    // Inheritance of Two Genes (Q22)
    {
        qNo: 22, topic: 'Inheritance of Two Genes', year: '2014',
        text: 'Fruit colour in squash is an example of:',
        A: 'Inhibitory genes', B: 'Recessive epistasis', C: 'Dominant epistasis', D: 'Complementary genes'
    },

    // Chromosomal Theory of Inheritance (Q23-25)
    {
        qNo: 23, topic: 'Chromosomal Theory of Inheritance', year: '2020',
        text: 'Experimental verification of the chromosomal theory of inheritance was done by:',
        A: 'Sutton', B: 'Boveri', C: 'Morgan', D: 'Mendel'
    },
    {
        qNo: 24, topic: 'Chromosomal Theory of Inheritance', year: '2020',
        text: 'Chromosomal theory of inheritance was proposed by:',
        A: 'Bateson and Punnet', B: 'T.H. Morgan', C: 'Watson and Crick', D: 'Sutton and Boveri'
    },
    {
        qNo: 25, topic: 'Chromosomal Theory of Inheritance', year: '2019',
        text: 'What map unit (Centimorgan) is adopted in the construction of genetic maps?',
        A: 'A unit of distance between two expressed genes representing 10% cross over.', B: 'A unit of distance between two expressed genes representing 100% cross over.', C: 'A unit of distance between genes on chromosomes, representing 1% cross over.', D: 'A unit of distance between genes on chromosomes, representing 50% cross over.'
    },

    // Linkage and Recombination, Polygenic Inheritance and Pleiotropy (Q26-34)
    {
        qNo: 26, topic: 'Linkage and Recombination, Polygenic Inheritance and Pleiotropy', year: '2022',
        text: 'Given below are two statements: one is labelled as Assertion (A) and the other is labelled as Reason (R).\nAssertion (A): Mendel\'s law of Independent assortment does not hold good for the genes that are located closely one the same chromosome.\nReason (R): Closely located genes assort independently.\nIn the light of the above statements, choose the correct answer from the options given below.',
        A: '(A) is not correct but (R) is correct', B: 'Both (A) and (R) are correct and (R) is the correct explanation of (A)', C: 'Both (A) and (R) are correct but (R) is not the correct explanation of (A)', D: '(A) is correct but (R) is not correct'
    },
    {
        qNo: 27, topic: 'Linkage and Recombination, Polygenic Inheritance and Pleiotropy', year: '2020',
        text: 'The best example for pleiotropy is:',
        A: 'Phenylketonuria', B: 'Colour Blindness', C: 'ABO Blood group', D: 'Skin colour'
    },
    {
        qNo: 28, topic: 'Linkage and Recombination, Polygenic Inheritance and Pleiotropy', year: '2019',
        text: 'The frequency of recombination between gene pairs on the same chromosome as a measure of the distance between genes was explained by',
        A: 'T.H. Morgan', B: 'Gregor J. Mendel', C: 'Alfred Sturtevant', D: 'Sutton Boveri'
    },
    {
        qNo: 29, topic: 'Linkage and Recombination, Polygenic Inheritance and Pleiotropy', year: '2018',
        text: 'Select the correct statement:',
        A: 'Franklin Stahl coined the term "linkage".', B: 'Punnett square was developed by a British scientist.', C: 'Spliceosomes take part in translation.', D: 'Transduction was discovered by S. Altman.'
    },
    {
        qNo: 30, topic: 'Linkage and Recombination, Polygenic Inheritance and Pleiotropy', year: '2016',
        text: 'Match the terms in Column-I with their description in Column-II and choose the correct option\nColumn-I (A. Dominance, B. Co-dominance, C. Pleiotropy, D. Polygenic inheritance)\nColumn-II (i. Many genes govern a single character, ii. In a heterozygous organism only one allele expresses itself, iii. In a heterozygous organism both alleles express themselves fully, iv. A single gene influences many characters)',
        A: 'A-(ii), B-(i), C-(iv), D-(iii)', B: 'A-(ii), B-(iii), C-(iv), D-(i)', C: 'A-(iv), B-(i), C-(ii), D-(iii)', D: 'A-(iv), B-(iii), C-(i), D-(ii)'
    },
    {
        qNo: 31, topic: 'Linkage and Recombination, Polygenic Inheritance and Pleiotropy', year: '2015',
        text: 'The movement of a gene from one linkage group to another is called:',
        A: 'Translocation', B: 'Crossing over', C: 'Inversion', D: 'Duplication'
    },
    {
        qNo: 32, topic: 'Linkage and Recombination, Polygenic Inheritance and Pleiotropy', year: '2015',
        text: 'The term “linkage” was coined by:',
        A: 'T. Boveri', B: 'G. Mendel', C: 'W. Sutton', D: 'T.H. Morgan'
    },
    {
        qNo: 33, topic: 'Linkage and Recombination, Polygenic Inheritance and Pleiotropy', year: '2015',
        text: 'A pleiotropic gene:',
        A: 'Is a gene evolved during Pliocene', B: 'Controls a trait only in combination with another gene', C: 'Controls multiple traits in an individual', D: 'Is expressed only in primitive plants'
    },
    {
        qNo: 34, topic: 'Linkage and Recombination, Polygenic Inheritance and Pleiotropy', year: '2013',
        text: 'Which of the following statements is not true for two genes that show 50% recombination frequency?',
        A: 'If the genes are present on the same chromosome, they undergo more than one crossover in every meiosis', B: 'The genes may be on different chromosomes', C: 'The genes are tightly linked', D: 'The genes show independent assortment'
    },

    // Sex Determination And Mutation (Q35-37)
    {
        qNo: 35, topic: 'Sex Determination And Mutation', year: '2019',
        text: 'Select the incorrect statement.',
        A: 'Male fruit fly is heterogametic', B: 'In male grasshoppers 50% of sperms have no sex-chromosome', C: 'In domesticated fowls, sex of progeny depends on the type of sperm rather than egg', D: 'Human males have one of their sex-chromosome much shorter than the other'
    },
    {
        qNo: 36, topic: 'Sex Determination And Mutation', year: '2018',
        text: 'Which of the following pairs is wrongly matched?',
        A: 'Starch synthesis in pea : Multiple alleles', B: 'ABO blood grouping : Co-dominance', C: 'XO type sex determination : Grasshopper', D: 'T.H. Morgan : Linkage'
    },
    {
        qNo: 37, topic: 'Sex Determination And Mutation', year: '2015',
        text: 'An abnormal human baby with ‘XXX’ sex chromosomes was born due to:',
        A: 'Fusion of two ova and one sperm', B: 'Fusion of two sperms and one ovum', C: 'Formation of abnormal sperms in the father', D: 'Formation of abnormal ova in the mother'
    },

    // Genetic Disorders (Q38-54)
    {
        qNo: 38, topic: 'Genetic Disorders', year: '2022',
        text: 'Which of the following occurs due to the presence of autosome linked dominant trait?',
        A: 'Thalessemia', B: 'Sickle cell anaemia', C: 'Myotonic dystrophy', D: 'Haemophilia'
    },
    {
        qNo: 39, topic: 'Genetic Disorders', year: '2022',
        text: 'If a colour blind female marries a man whose mother was also colour blind, what are the chances of her progeny having colour blindness?',
        A: '100%', B: '25%', C: '50%', D: '75%'
    },
    {
        qNo: 40, topic: 'Genetic Disorders', year: '2021',
        text: 'In a cross between a male and female, both heterozygous for sickle cell anaemia gene, what percentage of the progeny will be diseased?',
        A: '75%', B: '25%', C: '100%', D: '50%'
    },
    {
        qNo: 41, topic: 'Genetic Disorders', year: '2020',
        text: 'Select the correct match\nColumn-I | Column-II',
        A: 'Phenylketonuria - Autosomal dominant trait', B: 'Sickle cell anaemia - Autosomal recessive trait, chromosome-11', C: 'Thalassemia - X linked', D: 'Haemophilia - Y linked'
    },
    {
        qNo: 42, topic: 'Genetic Disorders', year: '2019',
        text: 'What is the genetic disorder in which an individual has an overall masculine development gynaecomastia, and is sterile?',
        A: 'Turner\'s syndrome', B: 'Klinefelter\'s syndrome', C: 'Edward syndrome', D: 'Down\'s syndrome'
    },
    {
        qNo: 43, topic: 'Genetic Disorders', year: '2018',
        text: 'A woman has an X-linked condition on one of her X chromosomes. This chromosome can be inherited by:',
        A: 'Only daughters', B: 'Only sons', C: 'Only grandchildren', D: 'Both sons and daughters'
    },
    {
        qNo: 44, topic: 'Genetic Disorders', year: '2017',
        text: 'A disease caused by an autosomal primary non-disjunction is',
        A: 'Down’s syndrome', B: 'Klinefelter’s syndrome', C: 'Turner’s syndrome', D: 'Sickle cell anemia'
    },
    {
        qNo: 45, topic: 'Genetic Disorders', year: '2017',
        text: 'Thalassemia and sickle cell anemia are caused due to a problem in globin molecule synthesis. Select the correct statement.',
        A: 'Both are due to a qualitative defect in globin chain synthesis', B: 'Both are due to a quantitative defect in globin chain synthesis', C: 'Thalassemia is due to less synthesis of globin molecules', D: 'Sickle cell anemia is due to a quantitative problem of globin molecules'
    },
    {
        qNo: 46, topic: 'Genetic Disorders', year: '2016',
        text: 'If a colour-blind man marries a woman who is homozygous for normal colour vision, the probability of their son being colour-blind is:',
        A: '0.75', B: '1', C: '0', D: '0.5'
    },
    {
        qNo: 47, topic: 'Genetic Disorders', year: '2016',
        text: 'Pick out the correct statements:\nA. Haemophilia is a sex-linked recessive disease.\nB. Down’s syndrome is due to aneuploidy.\nC. Phenylketonuria is an autosomal recessive gene disorder.\nD. Sickle cell anaemia is an X-linked recessive gene disorder.',
        A: '(A) and (D) are correct', B: '(B) and (D) are correct', C: '(A), (C) and (D) are correct', D: '(A), (B) and (C) are correct'
    },
    {
        qNo: 48, topic: 'Genetic Disorders', year: '2016',
        text: 'Which of the following most appropriately describes haemophilia?',
        A: 'Recessive gene disorder', B: 'X-linked recessive gene disorder', C: 'Chromosomal disorder', D: 'Dominant gene disorder'
    },
    {
        qNo: 49, topic: 'Genetic Disorders', year: '2015',
        text: 'In the following human pedigree, the filled symbols represent the affected individuals. Identify the type of given pedigree. (Image based)',
        A: 'X-linked recessive', B: 'Autosomal recessive', C: 'X-linked dominant', D: 'Autosomal dominant'
    },
    {
        qNo: 50, topic: 'Genetic Disorders', year: '2015',
        text: 'A colour blind man marries a woman with normal sight who has no history of colour blindness in her family. What is the probability of their grandson being colour blind?',
        A: '1', B: 'Nil', C: '0.25', D: '0.5'
    },
    {
        qNo: 51, topic: 'Genetic Disorders', year: '2014',
        text: 'A human female with Turner’s syndrome:',
        A: 'Is able to produce children with normal husband', B: 'Has 45 chromosomes with XO', C: 'Has one additional X chromosome', D: 'Exhibits male characters'
    },
    {
        qNo: 52, topic: 'Genetic Disorders', year: '2014',
        text: 'A man whose father was colour blind marries a woman who had a colour blind mother and normal father. What percentage of male children of this couple will be colour blind?',
        A: '75%', B: '25%', C: '0%', D: '50%'
    },
    {
        qNo: 53, topic: 'Genetic Disorders', year: '2013',
        text: 'The incorrect statement with regard to Haemophilia is:',
        A: 'A single protein involved in the clotting of blood is affected', B: 'It is a sex - linked disease', C: 'It is a recessive disease', D: 'It is a dominant disease'
    },
    {
        qNo: 54, topic: 'Genetic Disorders', year: '2013',
        text: 'If both parents are carriers for Thalassaemia, which is an autosomal recessive disorder, what are the chances of pregnancy resulting in an affected child?',
        A: '100%', B: 'No chance', C: '50%', D: '25%'
    }
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME, '(Class 12)');

    // Principles of Inheritance and Variation is Chapter 5 in NCERT Biology Class 12
    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME.split(' ').slice(0, 2).join('%')}%`, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 5]);
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
