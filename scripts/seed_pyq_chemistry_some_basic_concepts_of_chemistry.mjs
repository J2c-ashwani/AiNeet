/**
 * Seed REAL NEET PYQs — Chapter: Some Basic Concepts of Chemistry (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_some_basic_concepts_of_chemistry.mjs
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

const CHAPTER_NAME = 'Some Basic Concepts of Chemistry';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Atoms and Molecules',
    'Empirical And Molecular Formula',
    'Concentration Terms & Application',
    'Stoichiometry And Stoichiometric Calculations',
    'Mole Concept',
    'Dalton\'s Atomic Theory'
];

const ANSWER_KEY = {
    1: 'C', 2: 'C', 3: 'C', 4: 'C', 5: 'A', 6: 'D', 7: 'A', 8: 'C', 9: 'B', 10: 'C', 11: 'D', 12: 'B', 13: 'C', 14: 'D', 15: 'D', 16: 'C', 17: 'B', 18: 'A', 19: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Atoms and Molecules', year: '2014',
        text: `Equal masses of H 2 , O 2 and methane have been taken in a container of volume V at temperature 27°C in identical conditions. The ratio of the volumes of gases H 2 : O 2 : methane would be: (2014)`,
        A: `8 : 16 : 1`, B: `16 : 8 : 1`, C: `16 : 1 : 2`, D: `8 : 1 : 2 Atomic and Molecular Masses`
    },
    {
        qNo: 2, topic: 'Empirical And Molecular Formula', year: '2016',
        text: `Suppose the elements X and Y combine to form two compounds XY 2 and X 3 Y 2 . When 0.1 mole of XY 2 weighs 10 g and 0.05 mole of X 3 Y 2 weighs 9 g, the atomic weights of X and Y are: (2016)`,
        A: `20, 30`, B: `30, 20`, C: `40, 30`, D: `60, 40 Mole Concept and Molar Masses`
    },
    {
        qNo: 3, topic: 'Concentration Terms & Application', year: '2020',
        text: `Which one of the followings has maximum number of atoms? (2020)`,
        A: `1 g of Mg(s) [Atomic mass of Mg = 24]`, B: `1 g of O 2 (g) [Atomic mass of O = 16]`, C: `1 g of Li(s) [Atomic mass of Li = 7]`, D: `1 g of Ag(s) [Atomic mass of Ag = 108]`
    },
    {
        qNo: 4, topic: 'Stoichiometry And Stoichiometric Calculations', year: '2020',
        text: `One mole of carbon atom weighs 12g, the number of atoms in it is equal to. (2020-Covid) (Mass of carbon- 12 is 1.9926 × 10 –23 g)`,
        A: `6.022 × 10 22`, B: `12 × 10 22`, C: `6.022 × 10 23`, D: `12 × 10 23`
    },
    {
        qNo: 5, topic: 'Mole Concept', year: '2018',
        text: `In which case is number of molecules of water maximum? (2018)`,
        A: `18 mL of water`, B: `0.18 g of water`, C: `10 –3 mol of water`, D: `0.00224 L of water vapours at 1 atm and 273 K`
    },
    {
        qNo: 6, topic: 'Dalton\'s Atomic Theory', year: '2015',
        text: `A mixture of gases contains H 2 and O 2 gases in the ratio of 1 : 4 (w/w). What is the molar ratio of the two gases in the mixture? (2015)`,
        A: `16 : 1`, B: `2 : 1`, C: `1 : 4`, D: `4 : 1`
    },
    {
        qNo: 7, topic: 'Atoms and Molecules', year: '2015 Re',
        text: `The number of water molecules is maximum in: (2015 Re)`,
        A: `18 moles of water`, B: `18 molecules of water`, C: `1.8 gram of water`, D: `18 gram of water`
    },
    {
        qNo: 8, topic: 'Empirical And Molecular Formula', year: '2015 Re',
        text: `If Avogadro number N A , is changed from 6.022 × 10 23 mol –1 to 6.022 × 10 20 mol –1 , this would change: (2015 Re)`,
        A: `The ratio of elements to each other in a compound`, B: `The definition of mass in units of grams`, C: `The mass of one mole of carbon`, D: `The ratio of chemical species to each other in a balanced equation Percentage Composition, Empirical & Molecular Formula`
    },
    {
        qNo: 9, topic: 'Concentration Terms & Application', year: '2021',
        text: `An organic compound contains 78% (by wt.) carbon and remaining percentage of hydrogen. The right option for the empirical formula of this compound is: [Atomic wt. of C is 12, H is 1] (2021)`,
        A: `CH 2`, B: `CH 3`, C: `CH 4`, D: `CH Stoichiometry and Stoichiometric Calculations`
    },
    {
        qNo: 10, topic: 'Stoichiometry And Stoichiometric Calculations', year: '2019',
        text: `The number of moles of hydrogen molecules required to produce 20 moles of ammonia through Haber’s process is: (2019)`,
        A: `10`, B: `20`, C: `30`, D: `40`
    },
    {
        qNo: 11, topic: 'Mole Concept', year: '2018',
        text: `A mixture of 2.3 g formic acid and 4.5 g oxalic acid is treated with concentration H 2 SO 4 . The evolved gaseous mixture is passed through KOH pellets. Weight (in g) of the remaining product at STP will be: (2018)`,
        A: `1.4`, B: `3.0`, C: `4.4`, D: `2.8 1 C H A P T E R Some Basic Concepts of Chemistry Chapter & Topicwise NEET PYQ's P W 2`
    },
    {
        qNo: 12, topic: 'Dalton\'s Atomic Theory', year: '2015 Re',
        text: `What is the mass of the precipitate formed when 50 mL of 16.9% solution of AgNO 3 is mixed with 50 mL of 5.8% NaCl solution? (Ag = 107.8, N = 14, O = 16, Na = 23, Cl = 35.5) (2015 Re)`,
        A: `3.5 g`, B: `7 g`, C: `14 g`, D: `28 g`
    },
    {
        qNo: 13, topic: 'Atoms and Molecules', year: '2015 Re',
        text: `20.0 g of a magnesium carbonate sample decomposes on heating to give carbon dioxide and 8.0 g magnesium oxide. What will be the percentage purity of magnesium carbonate in the sample? (2015 Re) (Atomic weight of Mg = 24)`,
        A: `96`, B: `60`, C: `84`, D: `75`
    },
    {
        qNo: 14, topic: 'Empirical And Molecular Formula', year: '2014',
        text: `When 22.4 litres of H 2 (g) is mixed with 11.2 litres of Cl 2 (g), each at STP, the moles of HCl(g) formed is equal to: (2014)`,
        A: `2 mol of HCl(g)`, B: `0.5 mol of HCl(g)`, C: `1.5 mol of HCl(g)`, D: `1 mol of HCl(g)`
    },
    {
        qNo: 15, topic: 'Concentration Terms & Application', year: '2014',
        text: `1.0 g of magnesium is burnt with 0.56 g O 2 in a closed vessel. Which reactant is left in excess and how much? (2014) (Atomic weight Mg = 24; O = 16)`,
        A: `O 2 , 0.16 g`, B: `Mg, 0.44 g`, C: `O 2 , 0.28 g`, D: `Mg, 0.16 g Concentration Terms`
    },
    {
        qNo: 16, topic: 'Stoichiometry And Stoichiometric Calculations', year: '2022',
        text: `What mass of 95% pure CaCO 3 will be required to neutralise 50 mL of 0.5 M HCl solution according to the following reaction? (2022) CaCO 3(s) + 2HCl (aq) → CaCl 2(aq) + CO 2(g) + 2H 2 O (l) [Calculate upto second place of decimal point]`,
        A: `9.50 g`, B: `1.25 g`, C: `1.32 g`, D: `3.66 g`
    },
    {
        qNo: 17, topic: 'Mole Concept', year: '2013',
        text: `6.02 × 10 20 molecules of urea are present in 100 mL of its solution. The concentration of solution is: (2013)`,
        A: `0.02 M`, B: `0.01 M`, C: `0.001 M`, D: `0.1 M`
    },
    {
        qNo: 18, topic: 'Dalton\'s Atomic Theory', year: '2013',
        text: `An excess of AgNO 3 is added to 100 mL of a 0.01 M solution of dichlorotetraaquachromium(III) chloride. The number of moles of AgCl precipitated would be: (2013)`,
        A: `0.001`, B: `0.002`, C: `0.003`, D: `0.01`
    },
    {
        qNo: 19, topic: 'Atoms and Molecules', year: '2013',
        text: `How many grams of concentrated nitric acid solution should be used to prepare 250 mL of 2.0 M HNO 3 ? The concentrated acid is 70 % HNO 3 : (2013)`,
        A: `45.0 g conc. HNO 3`, B: `90.0 g conc. HNO 3`, C: `70.0 g conc. HNO 3`, D: `54.0 g conc. HNO 3 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 c c c c a d a c b c d b c d d c b 18 19 a a Answer Key`
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
