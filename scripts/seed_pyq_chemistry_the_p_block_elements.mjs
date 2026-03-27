/**
 * Seed REAL NEET PYQs — Chapter: The p-Block Elements (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_the_p_block_elements.mjs
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

const CHAPTER_NAME = 'The p-Block Elements';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'General'
];

const ANSWER_KEY = {
    1: 'C', 2: 'D', 3: 'B', 4: 'C', 5: 'A', 6: 'A', 7: 'A', 8: 'D', 9: 'D', 10: 'A', 11: 'B', 12: 'D', 13: 'A', 14: 'C', 15: 'B', 16: 'C', 17: 'B'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'General', year: '2018',
        text: `The correct order of atomic radii in group 13 elements is (2018)`,
        A: `B < Al < In < Ga < Tl`, B: `B < Al < Ga < In < Tl`, C: `B < Ga < Al < In < Tl`, D: `B < Ga < Al < Tl < In`
    },
    {
        qNo: 2, topic: 'General', year: '2018',
        text: `Which one of the following elements is unable to form MF 6 3– ion ? (2018)`,
        A: `Ga`, B: `Al`, C: `In`, D: `B`
    },
    {
        qNo: 3, topic: 'General', year: '2016',
        text: `AlF 3 is soluble in HF only in presence of KF. It is due to the formation of: (2016-II)`,
        A: `K 3 [AlF 3 H 3 ]`, B: `K 3 [AlF 6 ]`, C: `AlH 3`, D: `K[AlF 3 H 3 ]`
    },
    {
        qNo: 4, topic: 'General', year: '2015 Re',
        text: `The stability of +1 oxidation state among Al, Ga, In and Tl increases in the sequence: (2015 Re)`,
        A: `In < Tl < Ga < Al`, B: `Ga < In < Al < Tl`, C: `Al < Ga < In < Tl`, D: `Tl < In < Ga < Al Compounds of Boron and Uses of B and Al and Their Compounds`
    },
    {
        qNo: 5, topic: 'General', year: '2022',
        text: `Which of the following statement is not correct about diborane? (2022)`,
        A: `Both the Boron atoms are sp 2 hyridised.`, B: `There are two 3-centre-2-electron bonds.`, C: `The four terminal B-H bonds are two centre two electron bonds`, D: `The four terminal Hydrogen atoms and the two Boron atoms lie in one plane.`
    },
    {
        qNo: 6, topic: 'General', year: '2016',
        text: `Boric acid is an acid because its molecule: (2016 - II)`,
        A: `Accepts OH – from water releasing proton`, B: `Combines with proton from water molecule`, C: `Contains replaceable H + ion`, D: `Gives up a proton Group 14 Elements (Carbon Family)`
    },
    {
        qNo: 7, topic: 'General', year: '2020',
        text: `Match the following : (2020) Oxide Nature A. CO (i) Basic B. BaO (ii) Neutral C. Al 2 O 3 (iii) Acidic D. Cl 2 O 7 (iv) Amphoteric Which of the following is correct option? (A) (B) (C) (D)`,
        A: `(ii) (i) (iv) (iii)`, B: `(iii) (iv) (i) (ii)`, C: `(iv) (iii) (ii) (i)`, D: `(i) (ii) (iii) (iv)`
    },
    {
        qNo: 8, topic: 'General', year: '2020',
        text: `Which of the following oxide is amphoteric in nature? (2020-Covid)`,
        A: `SiO 2`, B: `GeO 2`, C: `CO 2`, D: `SnO 2`
    },
    {
        qNo: 9, topic: 'General', year: '2019',
        text: `Which of the following species is not stable? (2019)`,
        A: `[SiF 6 ] 2–`, B: `[GeCl 6 ] 2–`, C: `[Sn(OH) 6 ] 2–`, D: `[SiCl 6 ] 2–`
    },
    {
        qNo: 10, topic: 'General', year: '2019',
        text: `Which of the following is incorrect statement? (2019)`,
        A: `PbF 4 is covalent in nature`, B: `SiCl 4 is easily hydrolysed`, C: `GeX 4 (X = F, Cl, Br, I) is more stable than GeX 2`, D: `SnF 4 is ionic in nature`
    },
    {
        qNo: 11, topic: 'General', year: '2017',
        text: `It is because of inability of ns 2 electrons of the valence shell to participate in bonding that: (2017-Delhi)`,
        A: `Sn 4+ is reducing while Pb 4+ is oxidising`, B: `Sn 2+ is reducing while Pb 4+ is oxidising`, C: `Sn 2+ is oxidising while Pb 4+ is reducing`, D: `Sn 2+ and Pb 2+ are both oxidising and reducing Allotropes of Carbon`
    },
    {
        qNo: 12, topic: 'General', year: '2022',
        text: `Choose the correct statement: (2022) a . Both diamond and graphite are used as dry lubricants. b. Diamond and graphite have two dimensional network c. Diamond is covalent and graphite is ionic d. Diamond is sp 3 hyridised and graphite is sp 2 hybridized. 8 C H A P T E R The p-Block Elements Chapter & Topicwise NEET PYQ's P W 2`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 13, topic: 'General', year: '2013',
        text: `Which of the following structure is similar to graphite? (2013)`,
        A: `BN`, B: `B`, C: `B 4 C`, D: `B 2 H 6 Some Important Compounds of C & Si`
    },
    {
        qNo: 14, topic: 'General', year: '2020',
        text: `Identify the correct statements from the following : (2020) (1) CO 2 (g) is used as refrigerant for ice-cream and frozen food. (2) The structure of C 60 contains twelve six carbon rings and twenty five carbon rings. (3) ZSM-5, a type of zeolite, is used to convert alcohols into gasoline. (4) CO is colorless and odourless gas.`,
        A: `(1) and (3) only`, B: `(2) and (3) only`, C: `(3) and (4) only`, D: `(1), (2) and (3) only`
    },
    {
        qNo: 15, topic: 'General', year: '2020',
        text: `Which of the following is not correct about carbon monoxide? (2020)`,
        A: `It reduces oxygen carrying ability of blood.`, B: `The carboxyhaemoglobin (haemoglobin bound to CO) is less stable than oxyhaemoglobin.`, C: `It is produced due to incomplete combustion.`, D: `It forms carboxyhaemoglobin.`
    },
    {
        qNo: 16, topic: 'General', year: '2013',
        text: `Which of these is not a monomer for a high molecular mass silicone polymer? (2013)`,
        A: `MeSiCl 3`, B: `Me 2 SiCl 2`, C: `Me 3 SiCl`, D: `PhSiCl 3`
    },
    {
        qNo: 17, topic: 'General', year: '2013',
        text: `The basic structural unit of silicates is: (2013)`,
        A: `SiO –`, B: `4 4 SiO −`, C: `2 3 SiO −`, D: `2 4 SiO − 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 c d b c a a a d d a b d a c b c b Answer Key`
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
