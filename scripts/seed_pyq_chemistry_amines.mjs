/**
 * Seed REAL NEET PYQs — Chapter: Amines (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_amines.mjs
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables before getting the DB
dotenv.config({ path: path.join(__dirname, '../.env') });
// We also try .env.local just in case
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { getDb } from '../lib/db.js';

const db = getDb();

const CHAPTER_NAME = 'Amines';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Chemical Reactions of Amines & Anilines',
    'Preparation of Amines',
    'Diazonium Salts'
];

const ANSWER_KEY = {
    1: 'D', 2: 'A', 3: 'D', 4: 'B', 5: 'D', 6: 'A', 7: 'C', 8: 'A', 9: 'B', 10: 'A', 11: 'A', 12: 'A', 13: 'D', 14: 'C', 15: 'A', 16: 'C', 17: 'A', 18: 'C', 19: 'B'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Chemical Reactions of Amines & Anilines', year: '2020',
        text: `Reaction of propanamide with ethanolic sodium hydroxide and bromine will give (2020-Covid)`,
        A: `Methylamine`, B: `Propylamine`, C: `Aniline`, D: `Ethylamine`
    },
    {
        qNo: 2, topic: 'Preparation of Amines', year: '2015 Re',
        text: `Method by which Aniline cannot be prepared is: (2015 Re)`,
        A: `Potassium salt of phthalimide treated with chlorobenzene followed by hydrolysis with aqueous NaOH solution`, B: `Hydrolysis of phenylisocyanide with acidic solution`, C: `Degradation of benzamide with bromine in alkaline solution`, D: `Reduction of nitrobenzene with H 2 /Pd in ethanol Physical & Chemical Properties of Amines`
    },
    {
        qNo: 3, topic: 'Diazonium Salts', year: '2022',
        text: `Given below are two statements: (2022) Statements I : Primary aliphatic amines react with HNO 2 to give unstable diazonium salts. Statements II : Primary aromatic amines react with HNO 2 to form diazonium salts which are stable even above 300 K. In the light of the above Statements, choose the most appropriate answer from the options given below:`,
        A: `Statements I is incorrect but Statements II is correct.`, B: `Both Statements I and Statements II are correct`, C: `Both Statements I and Statements II are incorrect.`, D: `Statements I is correct but Statement II is incorrect.`
    },
    {
        qNo: 4, topic: 'Chemical Reactions of Amines & Anilines', year: '2021',
        text: `Identify the compound that will react with Hinsberg’s reagent to give a solid which dissolves in alkali. (2021)`,
        A: `CH 3 CH 3 CH 2 NH`, B: `CH 3 CH 2 NH 2`, C: `CH 3 CH 3 CH 2 CH 3 CH 2 N`, D: `CH 3 CH 2 NO 2`
    },
    {
        qNo: 5, topic: 'Preparation of Amines', year: '2020',
        text: `Which of the following amine will give the carbylamine test? (2020)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 6, topic: 'Diazonium Salts', year: '2019',
        text: `The correct order of the basic strength of methyl substituted amines in aqueous solution is: (2019)`,
        A: `(CH 3 ) 2 NH > CH 3 NH 2 > (CH 3 ) 3 N`, B: `(CH 3 ) 3 N > CH 3 NH 2 > (CH 3 ) 2 NH`, C: `(CH 3 ) 3 N > (CH 3 ) 2 NH > CH 3 NH 2`, D: `CH 3 NH 2 > (CH 3 ) 2 NH > (CH 3 ) 3 N`
    },
    {
        qNo: 7, topic: 'Chemical Reactions of Amines & Anilines', year: '2018',
        text: `Nitration of aniline in strong acidic medium also gives m-nitroaniline because: (2018)`,
        A: `Inspite of substituents nitro group always goes to only m-position.`, B: `In electrophilic substitution reactions, amino group is meta directive.`, C: `In acidic (strong) medium, aniline is present as anilinium ion.`, D: `In absence of substituents nitro group always goes to m-position.`
    },
    {
        qNo: 8, topic: 'Preparation of Amines', year: '2017',
        text: `The correct increasing order of basic strength for the following compounds is: (2017-Delhi)`,
        A: `II < I < III`, B: `II < III < I`, C: `III < I < II`, D: `III < II < I 10 C H A P T E R Amines Amines 2`
    },
    {
        qNo: 9, topic: 'Diazonium Salts', year: '2016',
        text: `The correct statement regarding the basicity of arylamines is: (2016 - I)`,
        A: `Arylamines are generally more basic than alkylamines, because the nitrogen atom in arylamines is sp-hybridised.`, B: `Arylamines are generally less basic than alkylamines because the nitrogen lone pair electrons are delocalized by interaction with the aromatic ring π electrons system.`, C: `Arylamines are generally more basic than alkylamines because the nitrogen lone pair electrons are not delocalised by interaction with the aromatic ring π electron system.`, D: `Arylamines are generally more basic than alkylamines because of aryl group`
    },
    {
        qNo: 10, topic: 'Chemical Reactions of Amines & Anilines', year: '2015 Re',
        text: `The following reaction is known by the name: [OS] (2015 Re)`,
        A: `Schotten-Baumen reaction`, B: `Friedel-Craft’s reaction`, C: `Perkin’s reaction`, D: `Acetylation reaction Diazonium Salt (Preparation, Physical & Chemical Properties)`
    },
    {
        qNo: 11, topic: 'Preparation of Amines', year: '2022',
        text: `The product formed from the following reaction sequence is (2022) CN (i) LiAlH 4 , H 2 O (ii) NaNO 2 + HCl (iii) H 2 O`,
        A: `OH`, B: `NH 2 O`, C: `N 2 Cl`, D: `Cl`
    },
    {
        qNo: 12, topic: 'Diazonium Salts', year: '2021',
        text: `The reagent ‘R’ in the given sequence of chemical reaction is: (2021) NH 2 N 2 Cl – + Br Br Br Br Br Br Br Br Br NaNO 2 , HCl R 0–5°C`,
        A: `CH 3 CH 2 OH`, B: `HI`, C: `CuCN/KCN`, D: `H 2 O`
    },
    {
        qNo: 13, topic: 'Chemical Reactions of Amines & Anilines', year: '2016',
        text: `A given nitrogen-containing aromatic compound A reacts with Sn/HCl, followed by HNO 2 to give an unstable compound B. B, on treatment with phenol, forms a beautiful coloured compound C with the molecular formula C 12 H 10 N 2 O. The structure of compound A is: (2016 - II)`,
        A: `CN`, B: `CONH 2`, C: `NH 2`, D: `NO 2`
    },
    {
        qNo: 14, topic: 'Preparation of Amines', year: '2014',
        text: `In the following reaction, the product (A) is: (2014)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 15, topic: 'Diazonium Salts', year: '2014',
        text: `Which of the following will be most stable diazonium salt RN 2 + X – ? (2014)`,
        A: `C 6 H 5 N 2 + X –`, B: `CH 3 CH 2 N 2 + X –`, C: `C 6 H 5 CH 2 N 2 + H –`, D: `CH 3 N 2 + X –`
    },
    {
        qNo: 16, topic: 'Chemical Reactions of Amines & Anilines', year: '2013',
        text: `In the reaction: (2013)`,
        A: `HgSO 4 /H 2 SO 4`, B: `Cu 2 Cl 2`, C: `H 3 PO 2 and H 2 O`, D: `H + /H 2 O Chapter & Topicwise NEET PYQ’s P W 3 Nitrobenzene (Preparation and Properties)`
    },
    {
        qNo: 17, topic: 'Preparation of Amines', year: '2016',
        text: `Which one of the following nitro-compounds does not react with nitrous acid? (2016 - II)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 18, topic: 'Diazonium Salts', year: '2015',
        text: `The electrolytic reduction of nitrobenzene in strongly acidic medium produces (2015)`,
        A: `Azobenzene`, B: `Aniline`, C: `p-aminophenol`, D: `Azoxybenzene`
    },
    {
        qNo: 19, topic: 'Chemical Reactions of Amines & Anilines', year: '2013',
        text: `Nitrobenzene on reaction with conc. HNO 3 /H 2 SO 4 at 80° – 100°C forms which one of the following products? (2013)`,
        A: `1,2-Dinitrobenzene`, B: `1,3-Dinitrobenzene`, C: `1,4-Dinitrobenzene`, D: `1,2,4-Trinitrobenzene 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 d a d b d a c a b a a a d c a c a 18 19 c b Answer Key`
    },
];

async function seed() {
    console.log(`Starting seeding for ${SUBJECT_NAME} - ${CHAPTER_NAME}...`);
    try {
        let subjectRow = await db.get('SELECT id FROM subjects WHERE name = ?', [SUBJECT_NAME]);
        if (!subjectRow) {
            console.log(`Inserting Subject: ${SUBJECT_NAME}`);
            const info = await db.run('INSERT INTO subjects (name) VALUES (?) RETURNING id', [SUBJECT_NAME]);
            subjectRow = { id: info.lastInsertRowid };
        }
        const subjectId = subjectRow.id;

        let chapterRow = await db.get('SELECT id FROM chapters WHERE subject_id = ? AND name = ?', [subjectId, CHAPTER_NAME]);
        if (!chapterRow) {
            console.log(`Inserting Chapter: ${CHAPTER_NAME}`);
            const info = await db.run('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES (?, ?, ?, ?) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 0]);
            chapterRow = { id: info.lastInsertRowid };
        }
        const chapterId = chapterRow.id;

        const topicIdMap = {};
        for (const topicName of TOPICS) {
            let tRow = await db.get('SELECT id FROM topics WHERE chapter_id = ? AND name = ?', [chapterId, topicName]);
            if (!tRow) {
                const info = await db.run('INSERT INTO topics (chapter_id, name) VALUES (?, ?) RETURNING id', [chapterId, topicName]);
                tRow = { id: info.lastInsertRowid };
            }
            topicIdMap[topicName] = tRow.id;
        }

        let added = 0;
        let skipped = 0;
        for (const q of QUESTIONS) {
            const topicId = topicIdMap[q.topic];
            const existing = await db.get('SELECT id FROM questions WHERE chapter_id = ? AND text = ?', [chapterId, q.text]);
            if (existing) {
                skipped++;
                continue;
            }

            const correctOption = ANSWER_KEY[q.qNo] || 'A';
            const examName = parseInt(q.year) < 2013 ? 'AIPMT' : 'NEET';

            await db.run(`
                INSERT INTO questions (
                    subject_id, chapter_id, topic_id, text,
                    option_a, option_b, option_c, option_d,
                    correct_option, difficulty, explanation,
                    year_asked, is_pyq, exam_name
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
            `, [
                subjectId, chapterId, topicId, q.text,
                q.A, q.B, q.C, q.D,
                correctOption, 'neet', 'Chemistry PYQ', q.year, examName
            ]);
            added++;
        }
        
        console.log(`✅ Done! Added ${added} questions (Skipped ${skipped})`);
    } catch (e) {
        console.error('Failed to seed:', e);
    }
}

seed();
