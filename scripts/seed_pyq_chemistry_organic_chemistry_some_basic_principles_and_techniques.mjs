/**
 * Seed REAL NEET PYQs — Chapter: Organic Chemistry - Some basic Principles and Techniques (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_organic_chemistry_some_basic_principles_and_techniques.mjs
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

const CHAPTER_NAME = 'Organic Chemistry - Some basic Principles and Techniques';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Methods of Purification',
    'Reaction Intermediate',
    'Nomenclature of Organic Compounds',
    'Isomerism',
    'Qualitative Analysis'
];

const ANSWER_KEY = {
    1: 'B', 2: 'D', 3: 'C', 4: 'D', 5: 'B', 6: 'D', 7: 'B', 8: 'A', 9: 'B', 10: 'C', 11: 'A', 12: 'C', 13: 'D', 14: 'A', 15: 'D', 16: 'B', 17: 'B', 18: 'A', 19: 'B', 20: 'C', 21: 'C', 22: 'B', 23: 'D', 24: 'A', 25: 'D', 26: 'A', 27: 'B', 28: 'D', 29: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Methods of Purification', year: '2018',
        text: `Which of the following molecules represents the order of hybridisation sp 2 , sp 2 , sp, sp from left to right atoms? (2018)`,
        A: `HC ≡ C – C ≡ CH`, B: `CH 2 = CH – C ≡ CH`, C: `CH 3 – CH = CH – CH 3`, D: `CH 2 = CH – CH = CH 2`
    },
    {
        qNo: 2, topic: 'Reaction Intermediate', year: '2015',
        text: `Which of the following species contains equal number of σ-bonds and π-bonds? (2015)`,
        A: `(CN) 2`, B: `CH 2 (CN) 2`, C: `HCO 3 –`, D: `XeO 4`
    },
    {
        qNo: 3, topic: 'Nomenclature of Organic Compounds', year: '2015',
        text: `The enolic form of ethyl acetoacetate as shown below has (2015)`,
        A: `9 σ-bonds and 2 π-bonds`, B: `9 σ-bonds and 1 π-bonds`, C: `18 σ-bonds and 2 π-bonds`, D: `16 σ-bonds and 1 π-bond`
    },
    {
        qNo: 4, topic: 'Isomerism', year: '2015',
        text: `The total number of p -bond electrons in the following structure is (2015)`,
        A: `12`, B: `16`, C: `4`, D: `8 Classification, Nomenclature of Organic Compounds`
    },
    {
        qNo: 5, topic: 'Qualitative Analysis', year: '2022',
        text: `The correct IUPAC name of the following compound is: (2022) OH Cl Br`,
        A: `6-bromo-4-methyl-2-chlorohexan-4-ol`, B: `1-bromo-5-chloro-4-methylhexan-3-ol`, C: `6-bromo-2-chloro-4-methylhexan-4-ol`, D: `1-bromo-4-methyl-5-chlorohexan-3-ol`
    },
    {
        qNo: 6, topic: 'Methods of Purification', year: '2021',
        text: `The correct structure of 2,6-Dimethyl-dec-4-ene is: (2021)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 7, topic: 'Reaction Intermediate', year: '2017',
        text: `The IUPAC name of the compound is (2017-Delhi)`,
        A: `3–keto–2–methylhex–5–enal`, B: `3–keto–2–methylhex–4–enal`, C: `5–formylhex–2–en–3–one`, D: `5–methyl–4–oxohex–2–en–5–al`
    },
    {
        qNo: 8, topic: 'Nomenclature of Organic Compounds', year: '2013',
        text: `The structure of isobutyl group in an organic compound is: (2013)`,
        A: `a. b. c. CH 3 CH 2 CH 2 CH 2 d. CH 3 CH 3 CH 3 C 9 C H A P T E R Organic Chemistry- Some Basic Principles and Techniques Organic Chemistry- Some Basic Principles and Techniques 2`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 9, topic: 'Isomerism', year: '2013',
        text: `Structure of the compound whose IUPAC name is 3-Ethyl- 2-hydroxy-4-methylhex-3-en-5-ynoic acid is: (2013)`,
        A: `a. b. OH COOH c. OH COOH d. COOH OH Isomerism`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 10, topic: 'Qualitative Analysis', year: '2021',
        text: `The compound which shows metamerism is: (2021)`,
        A: `C 3 H 8 O`, B: `C 3 H 6 O`, C: `C 4 H 10 O`, D: `C 5 H 12`
    },
    {
        qNo: 11, topic: 'Methods of Purification', year: '2016',
        text: `Which among the given molecules can exhibit tautomerism? (2016 - II)`,
        A: `III only`, B: `Both I and III`, C: `Both I and II`, D: `Both II and III Fundamental Concepts of Organic Reactions`
    },
    {
        qNo: 12, topic: 'Reaction Intermediate', year: '2020',
        text: `A tertiary butyl carbocation is more stable than a secondary butyl carbocation because of which of the following? (2020)`,
        A: `+ R effect of – CH 3 groups`, B: `– R effect of – CH 3 groups`, C: `Hyperconjugation`, D: `–I effect of – CH 3 groups`
    },
    {
        qNo: 13, topic: 'Nomenclature of Organic Compounds', year: '2018',
        text: `Which of the following carbocations is expected to be most stable? (2018)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 14, topic: 'Isomerism', year: '2018',
        text: `Which of the following is correct with respect to – I effect of the substituents? (R = alkyl) (2018)`,
        A: `– NH 2 < – OR < – F`, B: `– NR 2 < – OR < – F`, C: `– NR 2 > – OR > – F`, D: `– NH 2 > – OR > – F`
    },
    {
        qNo: 15, topic: 'Qualitative Analysis', year: '2017',
        text: `The correct statement regarding electrophile is: (2017-Delhi)`,
        A: `Electrophile can be either neutral or positively charged species and can form a bond by accepting a pair of electrons from a nucleophile`, B: `Electrophile is a negatively charged species and can form a bond by accepting a pair of electrons from a nucleophile`, C: `Electrophile is a negatively charged species and can form a bond by accepting a pair of electrons from another electrophile`, D: `Electrophiles are generally neutral species and can form a bond by accepting a pair of electrons from a nucleophile`
    },
    {
        qNo: 16, topic: 'Methods of Purification', year: '2016',
        text: `In pyrrole, the electron density is maximum on (2016 - II)`,
        A: `2 and 3`, B: `3 and 4`, C: `2 and 4`, D: `2 and 5`
    },
    {
        qNo: 17, topic: 'Reaction Intermediate', year: '2015 Re',
        text: `Which of the following statements is not correct for a nucleophile? (2015 Re)`,
        A: `Nucleophiles are not electron seeking`, B: `Nucleophile is a Lewis acid`, C: `Ammonia is a nucleophile`, D: `Nucleophiles attack low electron density sites`
    },
    {
        qNo: 18, topic: 'Nomenclature of Organic Compounds', year: '2015',
        text: `Consider the following compounds Hyperconjugation occurs in: (2015)`,
        A: `II only`, B: `III only`, C: `I and III`, D: `I only`
    },
    {
        qNo: 19, topic: 'Isomerism', year: '2015',
        text: `In which of the following compounds, the C – Cl bond ionization shall give most stable carbonium ion? (2015)`,
        A: `a. b. CH Cl H c. d. Chapter & Topicwise NEET PYQ's P W 3`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 20, topic: 'Qualitative Analysis', year: '2015',
        text: `Which of the following is the most correct electron displacement for a nucleophilic reaction to take place? (2015)`,
        A: `H C 3 H C C H H 2 C Cl < <`, B: `H C 3 H C C H H 2 C Cl < <`, C: `H C 3 H C C H H 2 C Cl < <`, D: `H C 3 H C C H H 2 C Cl < < C C C Cl CH 3 (+)`
    },
    {
        qNo: 21, topic: 'Methods of Purification', year: '2015',
        text: `Treatment of cyclopentanone O with methyl lithium gives which of the following species? (2015)`,
        A: `Cyclopentanonyl radical`, B: `Cyclopentanonyl biradical`, C: `Cyclopentanonyl anion`, D: `Cyclopentanonyl cation`
    },
    {
        qNo: 22, topic: 'Reaction Intermediate', year: '2014',
        text: `Which one is most reactive towards nucleophilic addition reaction? (2014)`,
        A: `a. b. c. d. CHO`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 23, topic: 'Nomenclature of Organic Compounds', year: '2013',
        text: `Some meta -directing substituents in aromatic substitution are given. Which one is most deactivating? (2013)`,
        A: `— COOH`, B: `— NO 2`, C: `— C ≡ N`, D: `— SO 3 H Methods of Purification, Qualitative and Quantitative Analysis of Organic Compounds`
    },
    {
        qNo: 24, topic: 'Isomerism', year: '2022',
        text: `The Kjeldahl’s method for the estimation of nitrogen can be used to estimate the amount of nitrogen in which one of the following compounds? (2022) a . N = N b. NO 2 c. N d. NH 2`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 25, topic: 'Qualitative Analysis', year: '2020',
        text: `Paper chromatography is an example of : (2020)`,
        A: `Partition chromatography`, B: `Thin layer chromatography`, C: `Column chromatography`, D: `Adsorption chromatography`
    },
    {
        qNo: 26, topic: 'Methods of Purification', year: '2020',
        text: `A liquid compound (x) can be purified by steam distillation only if it is (2020-Covid)`,
        A: `Not steam volatile, miscible with water`, B: `Steam volatile, miscible with water`, C: `Not steam volatile, immiscible with water`, D: `Steam volatile, immiscible with water`
    },
    {
        qNo: 27, topic: 'Reaction Intermediate', year: '2017',
        text: `The most suitable method of separation of 1 : 1 mixture of ortho and para-nitrophenols is (2017-Delhi)`,
        A: `Steam distillation`, B: `Sublimation`, C: `Chromatography`, D: `Crystallisation`
    },
    {
        qNo: 28, topic: 'Nomenclature of Organic Compounds', year: '2015',
        text: `In Duma’s method for estimation of nitrogen, 0.25 g of an organic compound gave 40 mL of nitrogen collected at 300 K temperature and 725 mm pressure. If the aqueous tension at 300 K is 25 mm, the percentage of nitrogen in the compound is: (2015)`,
        A: `18.20`, B: `16.76`, C: `15.76`, D: `17.36`
    },
    {
        qNo: 29, topic: 'Isomerism', year: '2014',
        text: `In the Kjeldahl’s method for estimation of nitrogen present in a soil sample, ammonia evolved from 0.75 g of sample neutralised 10 mL of 1 M H 2 SO 4 . The percentage of nitrogen in the soil is (2014)`,
        A: `45.33`, B: `35.33`, C: `43.33`, D: `37.33 Organic Chemistry- Some Basic Principles and Techniques 4 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 b d c d b d b a b c a c d a,b a d b 18 19 20 21 22 23 24 25 26 27 28 29 b a b c c b d a d a b d Answer Key`
    },
];

async function seed() {
    console.log(`Starting seeding for ${SUBJECT_NAME} - ${CHAPTER_NAME}...`);
    try {
        // 1. Get Subject ID
        let subjectRows = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
        if (subjectRows.length === 0) {
            console.log(`Inserting Subject: ${SUBJECT_NAME}`);
            subjectRows = await query('INSERT INTO subjects (name) VALUES ($1) RETURNING id', [SUBJECT_NAME]);
        }
        const subjectId = subjectRows[0].id;

        // 2. Get Chapter ID
        let chapterRows = await query('SELECT id FROM chapters WHERE subject_id = $1 AND name = $2', [subjectId, CHAPTER_NAME]);
        if (chapterRows.length === 0) {
            console.log(`Inserting Chapter: ${CHAPTER_NAME}`);
            chapterRows = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 0]);
        }
        const chapterId = chapterRows[0].id;

        // 3. Insert Topics
        const topicIdMap = {};
        for (const topicName of TOPICS) {
            let tRows = await query('SELECT id FROM topics WHERE chapter_id = $1 AND name = $2', [chapterId, topicName]);
            if (tRows.length === 0) {
                tRows = await query('INSERT INTO topics (chapter_id, name) VALUES ($1, $2) RETURNING id', [chapterId, topicName]);
            }
            topicIdMap[topicName] = tRows[0].id;
        }

        // 4. Insert Questions
        let added = 0;
        let skipped = 0;
        for (const q of QUESTIONS) {
            const topicId = topicIdMap[q.topic];
            // Check if exists
            const existing = await query('SELECT id FROM questions WHERE chapter_id = $1 AND text = $2', [chapterId, q.text]);
            if (existing.length > 0) {
                skipped++;
                continue;
            }

            const correctOption = ANSWER_KEY[q.qNo] || 'A';
            const examName = parseInt(q.year) < 2013 ? 'AIPMT' : 'NEET';

            await query(`
                INSERT INTO questions (
                    subject_id, chapter_id, topic_id, text,
                    option_a, option_b, option_c, option_d,
                    correct_option, difficulty, explanation,
                    year_asked, is_pyq, exam_name
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `, [
                subjectId, chapterId, topicId, q.text,
                q.A, q.B, q.C, q.D,
                correctOption, 'neet', 'Chemistry PYQ', q.year, 1, examName
            ]);
            added++;
        }
        
        console.log(`✅ Done! Added ${added} questions (Skipped ${skipped})`);
    } catch (e) {
        console.error('Failed to seed:', e);
    } finally {
        pool.end();
    }
}

seed();
