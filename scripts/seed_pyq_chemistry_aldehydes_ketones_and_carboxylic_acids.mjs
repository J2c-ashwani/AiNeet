/**
 * Seed REAL NEET PYQs — Chapter: Aldehydes, Ketones and Carboxylic Acids (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_aldehydes_ketones_and_carboxylic_acids.mjs
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

const CHAPTER_NAME = 'Aldehydes, Ketones and Carboxylic Acids';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'General'
];

const ANSWER_KEY = {
    1: 'D', 2: 'B', 3: 'D', 4: 'D', 5: 'B', 6: 'A', 7: 'C', 8: 'C', 9: 'C', 10: 'D', 11: 'B', 12: 'B', 13: 'C', 14: 'B', 15: 'C', 16: 'B', 17: 'D', 18: 'B', 19: 'B', 20: 'C', 21: 'D', 22: 'B', 23: 'C', 24: 'D', 25: 'A', 26: 'D'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'General', year: '2021',
        text: `The intermediate compound ‘X’ in the following chemical reaction is: (2021) O CH 3 C H + CrO 2 Cl 2 X CS 2 H 3 O +`,
        A: `CH(OCOCH 3 ) 2`, B: `CH Cl Cl`, C: `CH Cl H`, D: `CH(OCrOHCl 2 ) 2`
    },
    {
        qNo: 2, topic: 'General', year: '2020',
        text: `Identify compound X in the following sequence of reactions: (2020)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 3, topic: 'General', year: '2020',
        text: `Identify compound (A) in the following reaction: (2020-Covid) ,`,
        A: `Toluene`, B: `Acetophenone`, C: `Benzoic acid`, D: `Benzoyl chloride`
    },
    {
        qNo: 4, topic: 'General', year: '2013',
        text: `Reaction by which Benzaldehyde cannot be prepared: (2013)`,
        A: `+ CrO 2 Cl 2 in CS 2 followed by H 3 O +`, B: `+ H 2 in presence of Pd-BaSO 4`, C: `+ CO + HCl in presence of anhydrous + AlCl 3`, D: `COOH + Zn/Hg and concentration HCl Physical Properties and Chemical Reactions of Aldehydes and Ketones`
    },
    {
        qNo: 5, topic: 'General', year: '2022',
        text: `Given below are two statements: (2022) Statements: I The boiling points of aldehydes and ketones are higher than hydrocarbons of comparable molecular mass because of weak molecular association in aldehydes and ketones due to dipole - dipole interactions. Statements: II : The boiling points of aldehydes and ketones are lower than the alcohols of similar molecular mass due to the absence of H-bonding. In the light of the above statements, choose the most appropriate answer from the options given below`,
        A: `Statements I is incorrect but Statements II is correct.`, B: `Both Statements I and Statement II are correct.`, C: `Both Statements I and Statements II are incorrect.`, D: `Statements I is correct but Statements II is incorrect.`
    },
    {
        qNo: 6, topic: 'General', year: '2022',
        text: `Match List-I with List-II. (2022) List-I List-II (Products formed) (Reaction of carbonyl compound with) (a) Cyanohydrin (i) NH 2 OH (b) Acetal (ii) RNH 2 (c) Schiff's base (iii) alcohol (d) Oxime (iv) HCN 9 C H A P T E R Aldehydes, Ketones and Carboxylic Acids Chapter & Topicwise NEET PYQ’s P W 2 Choose the correct answer from the options given below:`,
        A: `(a)-(iv), (b)-(iii), (c)-(ii), (d)-(i)`, B: `(a)-(iii), (b)-(iv), (c)-(ii), (d)-(i)`, C: `(a)-(ii), (b)-(iii), (c)-(iv), (d)-(i)`, D: `(a)-(i), (b)-(iii), (c)-(ii), (d)-(iv)`
    },
    {
        qNo: 7, topic: 'General', year: '2022',
        text: `Which one of the following is not formed when acetone reacts with 2-pentanone in the presence of dilute NaOH followed by heating? (2022)`,
        A: `CH 3 O CH 3 CH 3 CH 3`, B: `CH 3 CH 3 H 3 C O`, C: `CH 3 O CH 3 CH 3 CH 3`, D: `CH 3 CH 3 CH 3 O`
    },
    {
        qNo: 8, topic: 'General', year: '2020',
        text: `Reaction between benzaldehyde and acetophenone in presence of dilute NaOH is known as : (2020)`,
        A: `Cannizzaro’s reaction`, B: `Cross Cannizzaro’s reaction`, C: `Cross Aldol condensation`, D: `Aldol condensation`
    },
    {
        qNo: 9, topic: 'General', year: '2017',
        text: `Which of the following product is formed when cyclohexanone undergoes aldol condensation followed by heating? (2017-Delhi)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 10, topic: 'General', year: '2017',
        text: `Consider the reactions: (2017-Delhi) Silver mirror observed Identify A, X, Y and Z`,
        A: `A-Ethanol, X-Acetaldehyde, Y-Butanone, Z-Hydrazone`, B: `A-Methoxymethane, X-Ethanoic acid, Y-Acetate ion, Z-hydrazine`, C: `A-Methoxymethane, X-Ethanol, Y-Ethanoic acid, Z-Semicarbazide`, D: `A-Ethanal, X-Ethanol, Y-But-2-enal, Z-Semicarbazone`
    },
    {
        qNo: 11, topic: 'General', year: '2016',
        text: `The correct structure of the product ‘A’ formed in the reaction (2016 - II) A is`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 12, topic: 'General', year: '2016',
        text: `The product formed by the reaction of an aldehyde with a primary amine is: (2016 - I)`,
        A: `Aromatic acid`, B: `Schiff base`, C: `Ketone`, D: `Carboxylic acid`
    },
    {
        qNo: 13, topic: 'General', year: '2016',
        text: `Which of the following reagents would distinguish cis- cyclopenta-1, 2-diol from the trans-isomer? (2016 - I)`,
        A: `MnO 2`, B: `Aluminium isopropoxide`, C: `Acetone`, D: `Ozone`
    },
    {
        qNo: 14, topic: 'General', year: '2016',
        text: `The correct statement regarding a carbonyl compound with a hydrogen atom on its alpha-carbon, is: (2016 - I)`,
        A: `A carbonyl compound with a hydrogen atom on its alpha- carbon rapidly equilibrates with its corresponding enol and this process is known as carbonylation`, B: `A carbonyl compound with a hydrogen atom on its alpha- carbon rapidly equilibrates with its corresponding enol and this process is known as keto-enol tautomerism`, C: `A carbonyl compound with a hydrogen atom on its alpha- carbon never equilibrates with its corresponding enol`, D: `A carbonyl compound with a hydrogen atom on its alpha- carbon rapidly equilibrates with its corresponding enol and this process is known as aldehyde-ketone equilibration`
    },
    {
        qNo: 15, topic: 'General', year: '2015 Re',
        text: `Reaction of a carbonyl compound with one of the following reagents involves nucleophilic addition followed by elimination of water. The reagent is: (2015 Re)`,
        A: `Sodium hydrogen sulphite`, B: `A Grignard reagent`, C: `Hydrazine in presence of feebly acidic solution`, D: `Hydrocyanic acid`
    },
    {
        qNo: 16, topic: 'General', year: '2015',
        text: `An organic compound ‘X’ having molecular formula C 5 H 10 O yields phenyl hydrazone and gives negative response to the Iodoform test and Tollen’s test. It produces n-pentane on reduction. ‘X’ could be: (2015)`,
        A: `2-pentanone`, B: `3-pentanone`, C: `n-pentyl alcohol`, D: `Pentanal Aldehydes, Ketones and Carboxylic Acids 3`
    },
    {
        qNo: 17, topic: 'General', year: '2013',
        text: `The order of stability of the following tautomeric compounds is: (2013)`,
        A: `II > I > III`, B: `II > III > I`, C: `I > II > III`, D: `III > II > I Methods of Preparation of Carboxylic Acids`
    },
    {
        qNo: 18, topic: 'General', year: '2022',
        text: `H O dry 3 2 ether RMgX CO Y RCOOH + +  →  → (2022) What is Y in the above reaction? a . (RCOO) 2 Mg b. RCOO – Mg + X c. R 3 CO – Mg + X d. RCOO – X + Physical Properties and Chemical Reactions of Carboxylic Acids`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 19, topic: 'General', year: '2021',
        text: `3 2 3 3 2 3 NaOH, ? Heat CH CH COO Na CH CH Na CO . − + +  → + Consider the above reaction and identify the missing reagent/ chemical. (2021)`,
        A: `Red Phosphorus`, B: `CaO`, C: `DIBAL-H`, D: `B 2 H 6`
    },
    {
        qNo: 20, topic: 'General', year: '2021',
        text: `Match List-I with List-II. (2021) List-I List-II (A) CO, HCl Anhyd. AlCl 3 /CuCl (i) Hell-Volhard-Zelinsky reaction (B) O R CH 3 + C NaOX → (ii) Gattermann-Koch reaction (C) R – CH 2 – OH + R’COOH Conc. H SO 2 4  → (iii) Haloform reaction (D) R – CH 2 COOH (i) X /Red P 2 (ii) H O 2  → (iv) Esterification Choose the correct answer from the options given below.`,
        A: `A-iii B-ii C-i D-iv`, B: `A-i B-iv C-iii D-ii`, C: `A-ii B-iii C-iv D-i`, D: `A-iv B-i C-ii D-iii`
    },
    {
        qNo: 21, topic: 'General', year: '2020',
        text: `Which of the following acid will form an (i) Anhydride on heating and (ii) Acid imide on strong heating with ammonia? (2020-Covid)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 22, topic: 'General', year: '2019',
        text: `The major product of the following reaction is: (2019)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 23, topic: 'General', year: '2018',
        text: `Carboxylic acids have higher boiling points than aldehydes, ketones and even alcohols of comparable molecular mass. It is due to their: (2018)`,
        A: `Formation of intramolecular H-bonding`, B: `Formation of carboxylate ion`, C: `Formation of intermolecular H-bonding`, D: `More extensive association of carboxylic acid via van der Waals force of attraction`
    },
    {
        qNo: 24, topic: 'General', year: '2016',
        text: `The correct order of strengths of the carboxylic Acids is: (2016 - II)`,
        A: `III > II > I`, B: `II > I > III`, C: `I > II > III`, D: `II > III > I`
    },
    {
        qNo: 25, topic: 'General', year: '2015 Re',
        text: `The oxidation of benzene by V 2 O 5 in the presence of air produces: (2015 Re)`,
        A: `Maleic anhydride`, B: `Benzoic acid`, C: `Benzaldehyde`, D: `Benzoic anhydride`
    },
    {
        qNo: 26, topic: 'General', year: '2015 Re',
        text: `Which one of the following esters gets hydrolysed most easily under alkaline conditions? (2015 Re)`,
        A: `a. b. c. d. Chapter & Topicwise NEET PYQ’s P W 4 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 d b d d b a c c c d b b c b c b d 18 19 20 21 22 23 24 25 26 b b c d b c d a d Answer Key`, B: `Option B`, C: `Option C`, D: `Option D`
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
