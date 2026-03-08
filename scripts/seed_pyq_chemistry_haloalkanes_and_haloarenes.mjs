/**
 * Seed REAL NEET PYQs — Chapter: Haloalkanes and Haloarenes (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_haloalkanes_and_haloarenes.mjs
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

const CHAPTER_NAME = 'Haloalkanes and Haloarenes';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Chemical Properties',
    'Nucleophilic Substitution Reactions',
    'Preparation of Haloalkanes',
    'Classification'
];

const ANSWER_KEY = {
    1: 'A', 2: 'D', 3: 'D', 4: 'C', 5: 'A', 6: 'C', 7: 'B', 8: 'D', 9: 'C', 10: 'D', 11: 'C', 12: 'C', 13: 'B'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Chemical Properties', year: '2021',
        text: `The correct sequence of bond enthalpy of ‘C–X’ bond is: (2021)`,
        A: `CH 3 – F > CH 3 – Cl > CH 3 – Br > CH 3 – I`, B: `CH 3 – F < CH 3 – Cl > CH 3 – Br > CH 3 – I`, C: `CH 3 – Cl > CH 3 – F > CH 3 – Br > CH 3 – I`, D: `CH 3 – F < CH 3 – Cl < CH 3 – Br < CH 3 – I Haloalkanes and Chemical Reactions of Haloalkanes`
    },
    {
        qNo: 2, topic: 'Nucleophilic Substitution Reactions', year: '2021',
        text: `The major product formed in dehydrohalogenation reaction of 2-Bromo pentane is Pent-2-ene. This product formation is based on? (2021)`,
        A: `Hund’s rule`, B: `Hofmann rule`, C: `Huckel’s rule`, D: `Saytzeff’s rule`
    },
    {
        qNo: 3, topic: 'Preparation of Haloalkanes', year: '2020',
        text: `Elimination reaction of 2-Bromo-pentane to form pent-2-ene is (2020) (1) β-Elimination reaction (2) Follows Zaitsev rule (3) Dehydrohalogenation reaction (4) Dehydration reaction`,
        A: `a.`, B: `,`, C: `,`, D: `b.`
    },
    {
        qNo: 4, topic: 'Classification', year: '2017',
        text: `An example of a sigma bonded organometallic compound is: (2017-Delhi)`,
        A: `Cobaltocene`, B: `Ruthenocene`, C: `Grignard’s`, D: `Ferrocene`
    },
    {
        qNo: 5, topic: 'Chemical Properties', year: '2016',
        text: `Consider the reaction CH 3 CH 2 CH 2 Br+NaCN → CH 3 CH 2 CH 2 CN+NaBr This reaction will be the fastest in: (2016 - II)`,
        A: `N,N’-dimethylformamide (DMF)`, B: `Water`, C: `Ethanol`, D: `Methanol`
    },
    {
        qNo: 6, topic: 'Nucleophilic Substitution Reactions', year: '2020',
        text: `For the following reaction:`,
        A: `CH 3 CH 2 CH 2 Br + KOH → CH 3 CH = CH 2 + KBr + H 2 O`, B: `Which of the following statements is correct? (2016 - I) a.`, C: `is substitution,`, D: `and`
    },
    {
        qNo: 7, topic: 'Preparation of Haloalkanes', year: '2015 Re',
        text: `Which of the following reaction(s) can be used for the preparation of alkyl halides? (2015 Re) (I) 2 anh.ZnCl 3 2 CH CH OH HCl +  → (II) 3 2 CH CH OH HCl +  → (III) ( ) 3 3 CH COH HCl +  → (IV) ( ) 2 anh. ZnCl 3 2 CH CHOH HCl +  →`,
        A: `(III) and (IV) only`, B: `(I), (III) and (IV) only`, C: `(I) and (II) only`, D: `(IV) only Stereochemical Aspects of Nucleophilic Substitution Reactions`
    },
    {
        qNo: 8, topic: 'Classification', year: '2022',
        text: `The incorrect statement regarding chirality is: (2022) a . A recemic mixture shows zero optical rotation. b. S N 1 reaction yields 1 : 1 mixture of both enantiomers. c. The product obtained by S N 2 reaction of haloalkane having chirality at the reactive site shows inversion of configuration. d. Enantiomers are superimposable mirror images on each other. 7 C H A P T E R Haloalkanes and Haloarenes Chapter & Topicwise NEET PYQ’s P W 2`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 9, topic: 'Chemical Properties', year: '2016',
        text: `Which of the following biphenyls is optically active? (2016 - I)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 10, topic: 'Nucleophilic Substitution Reactions', year: '2015 Re',
        text: `Two possible stereo-structures of CH 3 CHOHCOOH, which are optically active, are called: (2015 Re)`,
        A: `Mesomers`, B: `Diastereomers`, C: `Atropisomers`, D: `Enantiomers`
    },
    {
        qNo: 11, topic: 'Preparation of Haloalkanes', year: '2015 Re',
        text: `In a S N 1 reaction on chiral centres, there is: (2015 Re)`,
        A: `100% inversion`, B: `100% racemisation`, C: `Inversion more than retention leading to partial racemisation`, D: `100% retention`
    },
    {
        qNo: 12, topic: 'Classification', year: '2014',
        text: `Which of the following compounds will undergo racemisation when solution of KOH hydrolyses? (2014) (i) CHBrCl (ii) CH 3 CH 2 CH 2 Cl (iii) CH H C 3 CH 3 C C H 3 l (iv) C H CH 3 C H 2 5 Cl`,
        A: `(ii) and (iv)`, B: `(iii) and (iv)`, C: `(i) and (iv)`, D: `(i) and (ii) Haloarenes and Chemical Reactions of Haloarenes`
    },
    {
        qNo: 13, topic: 'Chemical Properties', year: '2020',
        text: `Which of the following will NOT undergo S N 1 reaction with OH – ? (2020-Covid)`,
        A: `a. (CH 3 ) 3 CCl b. c. d. CH 2 = CH – CH 2 Cl 1 2 3 4 5 6 7 8 9 10 11 12 13 a d d c a c b d c d c c b Answer Key`, B: `Option B`, C: `Option C`, D: `Option D`
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
