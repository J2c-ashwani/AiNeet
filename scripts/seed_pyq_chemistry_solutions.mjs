/**
 * Seed REAL NEET PYQs — Chapter: Solutions (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_solutions.mjs
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

const CHAPTER_NAME = 'Solutions';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Colligative Properties',
    'Ideal And Non-Ideal Solutions',
    'Vapour Pressure of Liquid Solutions',
    'Solubility'
];

const ANSWER_KEY = {
    1: 'B', 2: 'C', 3: 'C', 4: 'A', 5: 'A', 6: 'C', 7: 'A', 8: 'A', 9: 'A', 10: 'B', 11: 'A', 12: 'B', 13: 'A', 14: 'A', 15: 'A', 16: 'A', 17: 'A', 18: 'A', 19: 'A', 20: 'A', 21: 'A', 22: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Colligative Properties', year: '2022',
        text: `In one molal solution that contains 0.5 mole of a solute, there is (2022) a . 1000 g of solvent b. 500 mL of solvent c . 500 g of solvent d. 100 mL of solvent`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 2, topic: 'Ideal And Non-Ideal Solutions', year: '2017',
        text: `Which of the following is dependent on temperature? (2017-Delhi)`,
        A: `Weight percentage`, B: `Molality`, C: `Molarity`, D: `Mole fraction`
    },
    {
        qNo: 3, topic: 'Vapour Pressure of Liquid Solutions', year: '2015 Re',
        text: `What is the mole fraction of the solute in a 1.00 m aqueous solution? (2015 Re)`,
        A: `0.0177`, B: `0.177`, C: `1.770`, D: `0.0354`
    },
    {
        qNo: 4, topic: 'Solubility', year: '2013',
        text: `How many grams of concentrated nitric acid solution should be used to prepare 250 mL of 2.0 M HNO 3 ? The concentrated acid is 70% HNO 3 . (2013)`,
        A: `70.0 g conc. HNO 3`, B: `54.0 g conc. HNO 3`, C: `45.0 g conc. HNO 3`, D: `90.0 g conc. HNO 3 Vapour Pressure of Liquid Solutions`
    },
    {
        qNo: 5, topic: 'Colligative Properties', year: '2022',
        text: `Which one is not correct mathematical equation for Dalton's Law of partial pressure? Here p = total pressure of gaseous mixture (2022)`,
        A: `p i = x i p i o , where x i = mole fraction of i th gas in gaseous mixture p i o = pressure of i th gas in pure state`, B: `p = p 1 + p 2 + p 3`, C: `1 2 3 RT RT RT p n n n V V V = + +`, D: `p i = x i p, where p i = partial pressure of i th gas x i = mole fraction of i th gas in gaseous mixture`
    },
    {
        qNo: 6, topic: 'Ideal And Non-Ideal Solutions', year: '2021',
        text: `The correct option for the value of vapour pressure of a solution at 45°C with benzene to octane in molar ratio 3 : 2 is: (2021) [At 45°C vapour pressure of benzene is 280 mm Hg and that of octane is 420 mm Hg. Assume Ideal gas]`,
        A: `168 mm of Hg`, B: `336 mm of Hg`, C: `350 mm of Hg`, D: `160 mm of Hg`
    },
    {
        qNo: 7, topic: 'Vapour Pressure of Liquid Solutions', year: '2016',
        text: `Which of the following statements about the composition of the vapour over an ideal 1 : 1 molar mixture of benzene and toluene is correct? Assume that the temperature is at 25°C. (Given, vapour pressure data at 25°C, benzene = 12.8 kPa, toluene = 3.85 kPa) (2016-I)`,
        A: `The vapour will contain equal amounts of benzene and toluene`, B: `Not enough information is given to make a prediction`, C: `The vapour will contain a higher percentage of benzene`, D: `The vapour will contain a higher percentage of toluene Ideal and Non-Ideal Solutions`
    },
    {
        qNo: 8, topic: 'Solubility', year: '2020',
        text: `The mixture which shows positive deviation from Raoult’s law is: (2020)`,
        A: `Benzene + Toluene`, B: `Acetone + Chloroform`, C: `Chloroethane + Bromoethane`, D: `Ethanol + Acetone`
    },
    {
        qNo: 9, topic: 'Colligative Properties', year: '2019',
        text: `For an ideal solution, the correct option is : (2019)`,
        A: `∆ mix S = 0 at constant T and P`, B: `∆ mix V ≠ 0 at constant T and P`, C: `∆ mix H = 0 at constant T and P`, D: `∆ mix G = 0 at constant T and P`
    },
    {
        qNo: 10, topic: 'Ideal And Non-Ideal Solutions', year: '2019',
        text: `The mixture that forms maximum boiling azeotrope is: (2019)`,
        A: `Water + Nitric acid`, B: `Ethanol + Water`, C: `Acetone + Carbon disulphide`, D: `Heptane + Octane 1 C H A P T E R Solutions Chapter & Topicwise NEET PYQ's P W 2`
    },
    {
        qNo: 11, topic: 'Vapour Pressure of Liquid Solutions', year: '2016',
        text: `Which one of the following is incorrect for ideal solution? (2016 - II)`,
        A: `∆P = P obs – P calculated by Raoult’s law = 0`, B: `∆G mix = 0`, C: `∆H mix = 0`, D: `∆U mix = 0`
    },
    {
        qNo: 12, topic: 'Solubility', year: '2015',
        text: `Which one is not equal to zero for an ideal solution? (2015)`,
        A: `∆S mix`, B: `∆V mix`, C: `∆P = P observed – P Raoult`, D: `∆H mix Colligative Properties and Determination of Molar Mass`
    },
    {
        qNo: 13, topic: 'Colligative Properties', year: '2021',
        text: `The following solutions were prepared by dissolving 10 g of glucose (C 6 H 12 O 6 ) in 250 ml of water (P 1 ), 10 g of urea (CH 4 N 2 O) in 250 ml of water (P 2 ) and 10 g of sucrose (C 12 H 22 O 11 ) in 250 ml of water (P 3 ). The right option for the decreasing order of osmotic pressure of these solutions is: (2021)`,
        A: `P 1 > P 2 > P 3`, B: `P 2 > P 3 > P 1`, C: `P 3 > P 1 > P 2`, D: `P 2 > P 1 > P 3`
    },
    {
        qNo: 14, topic: 'Ideal And Non-Ideal Solutions', year: '2020',
        text: `If 8 g of a non-electrolyte solute is dissolved in 114 g of n-octane to reduce its vapour pressure to 80%, the molar mass (in g mol –1 ) of the solute is [Given that molar mass of n-octane is 114 g mol –1 ] (2020-Covid)`,
        A: `60`, B: `80`, C: `20`, D: `40`
    },
    {
        qNo: 15, topic: 'Vapour Pressure of Liquid Solutions', year: '2020',
        text: `Isotonic solutions have same (2020-Covid)`,
        A: `Freezing temperature`, B: `Osmotic pressure`, C: `Boiling temperature`, D: `Vapour pressure`
    },
    {
        qNo: 16, topic: 'Solubility', year: '2017',
        text: `If molality of the dilute solution is doubled, the value of molal depression constant (K f ) will be: (2017-Delhi)`,
        A: `Unchanged`, B: `Doubled`, C: `Halved`, D: `Tripled`
    },
    {
        qNo: 17, topic: 'Colligative Properties', year: '2016',
        text: `At 100°C, the vapour pressure of a solution of 6.5 g of a solute in 100 g water is 732 mm. If K b = 0.52, the boiling point of this solution will be: (2016 - I)`,
        A: `103° C`, B: `101° C`, C: `100° C`, D: `102° C Abnormal Molar Mass`
    },
    {
        qNo: 18, topic: 'Ideal And Non-Ideal Solutions', year: '2020',
        text: `The freezing point depression constant (K f ) of benzene is 5.12 K kg mol –1 . The freezing point depression for the solution of molality 0.078 m containing a non-electrolyte solute in benzene is (rounded off upto two decimal places) : (2020)`,
        A: `0.80 K`, B: `0.40 K`, C: `0.60 K`, D: `0.20 K`
    },
    {
        qNo: 19, topic: 'Vapour Pressure of Liquid Solutions', year: '2016',
        text: `The van’t Hoff factor (i) for a dilute aqueous solution of the strong electrolyte barium hydroxide is: (2016 - II)`,
        A: `2`, B: `3`, C: `0`, D: `1`
    },
    {
        qNo: 20, topic: 'Solubility', year: '2015',
        text: `Which one of the following electrolytes has the same value of van’t Hoff’s factor ( i ) as that of Al 2 (SO 4 ) 3 (if all are 100% ionised)? (2015)`,
        A: `K 3 [Fe(CN) 6 ]`, B: `Al(NO 3 ) 3`, C: `K 4 [Fe(CN) 6 ]`, D: `K 2 SO 4`
    },
    {
        qNo: 21, topic: 'Colligative Properties', year: '2015',
        text: `The boiling point of 0.2 mol kg –1 solution of X in water is greater than equimolal solution of Y in water. Which one of the following statements is true in this case? (2015 )`,
        A: `Molecular mass of X is greater than the molecular mass of Y`, B: `Molecular mass of X is less than the molecular mass of Y`, C: `Y is undergoing dissociation in water while X undergoes no change`, D: `X is undergoing dissociation in water`
    },
    {
        qNo: 22, topic: 'Ideal And Non-Ideal Solutions', year: '2014',
        text: `Of the following 0.10 m aqueous solutions, which one will exhibit the largest freezing point depression? (2014)`,
        A: `C 6 H 12 O 6`, B: `Al 2 (SO 4 ) 3`, C: `K 2 SO 4`, D: `KCl 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 c c a c a b c d c a b a d d b a b 18 19 20 21 22 b b c d b Answer Key`
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
