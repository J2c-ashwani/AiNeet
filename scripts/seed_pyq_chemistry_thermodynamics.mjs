/**
 * Seed REAL NEET PYQs — Chapter: Thermodynamics (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_thermodynamics.mjs
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

const CHAPTER_NAME = 'Thermodynamics';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Expansion or Contraction of a Gas',
    'Second Law of Thermodynamics (Spontaneity)',
    'Heat of Reaction (Constant Pressure vs Volume)',
    'Pressure-Volume Work',
    'Gibbs Energy Change',
    'Bomb Calorimeter (dU and dH)',
    'Thermodynamic Processes',
    'Enthalpy Change'
];

const ANSWER_KEY = {
    1: 'C', 2: 'A', 3: 'D', 4: 'A', 5: 'D', 6: 'D', 7: 'D', 8: 'C', 9: 'A', 10: 'B', 11: 'C', 12: 'D', 13: 'D', 14: 'C', 15: 'D', 16: 'D', 17: 'A', 18: 'B'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Expansion or Contraction of a Gas', year: '2022',
        text: `Which of the following p-V curve represents maximum work done? (2022) a . Isothermal p V b. Isothermal p V c . Isothermal p V d. Isothermal p V`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 2, topic: 'Second Law of Thermodynamics (Spontaneity)', year: '2021',
        text: `Which one among the following is the correct option for right relationship between C P and C V for one mole of ideal gas? (2021)`,
        A: `C P – C V = R`, B: `C P = RC V`, C: `C V = RC P`, D: `C P + C V = R`
    },
    {
        qNo: 3, topic: 'Heat of Reaction (Constant Pressure vs Volume)', year: '2020',
        text: `The correct option for free expansion of an ideal gas under adiabatic condition is : (2020)`,
        A: `q = 0, D T < 0 and w > 0`, B: `q < 0, D T = 0 and w = 0`, C: `q > 0, D T > 0 and w > 0`, D: `q = 0, D T = 0 and w = 0`
    },
    {
        qNo: 4, topic: 'Pressure-Volume Work', year: '2019',
        text: `Under isothermal condition, a gas at 300 K expands from 0.1 L to 0.25 L against a constant external pressure of 2 bar. The work done by the gas is (Given that 1 L bar = 100 J) (2019)`,
        A: `–30 J`, B: `5 kJ`, C: `25 J`, D: `30 J`
    },
    {
        qNo: 5, topic: 'Gibbs Energy Change', year: '2017',
        text: `A gas is allowed to expand in a well insulated container against a constant external pressure of 2.5 atm from an initial volume of 2.50 L to a final volume of 4.50 L. The change in internal energy ∆U of the gas in joules will be: (2017-Delhi)`,
        A: `+505 J`, B: `1136.25 J`, C: `–500 J`, D: `–505 J Enthalpies For Different Types of Reactions`
    },
    {
        qNo: 6, topic: 'Bomb Calorimeter (dU and dH)', year: '2020',
        text: `At standard conditions, if the change in the enthalpy for the following reaction is –109 kJ mol –1 H 2 (g) + Br 2 (g) → 2HBr(g) Given that bond energy of H 2 and Br 2 is 435 kJ mol –1 and 192 kJ mol –1 , respectively, what is the bond energy (in kJ mol –1 ) of HBr? (2020-Covid)`,
        A: `736`, B: `518`, C: `259`, D: `368`
    },
    {
        qNo: 7, topic: 'Thermodynamic Processes', year: '2020',
        text: `The bond dissociation energies of X 2 , Y 2 and XY are in the ratio of 1 : 0.5 :`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 8, topic: 'Enthalpy Change', year: '2018',
        text: `∆ H for the formation of XY is –200 kJ mol –1 (2018) The bond dissociation energy of X 2 will be`,
        A: `200 kJ mol –1`, B: `100 kJ mol –1`, C: `400 kJ mol –1`, D: `800 kJ mol –1`
    },
    {
        qNo: 9, topic: 'Expansion or Contraction of a Gas', year: '2015',
        text: `The heat of combustion of carbon to CO 2 is –393.5 kJ/mol. The heat released upon formation of 35.2 g of CO 2 from carbon and oxygen gas is: (2015)`,
        A: `+ 315 kJ`, B: `– 630 kJ`, C: `– 3.15 kJ`, D: `– 315 kJ Spontaneity, Entropy, Gibbs Energy Change and Equilibrium`
    },
    {
        qNo: 10, topic: 'Second Law of Thermodynamics (Spontaneity)', year: '2021',
        text: `For irreversible expansion of an ideal gas under isothermal condition, the correct option is: (2021)`,
        A: `ΔU ≠ 0, ΔS total ≠ 0`, B: `ΔU = 0, ΔS total ≠ 0`, C: `ΔU ≠ 0, ΔS total = 0`, D: `ΔU = 0, ΔS total = 0`
    },
    {
        qNo: 11, topic: 'Heat of Reaction (Constant Pressure vs Volume)', year: '2020',
        text: `For the reaction, 2Cl(g) → Cl 2 (g), the correct option is: (2020)`,
        A: `D r H > 0 and D r S < 0`, B: `D r H < 0 and D r S < 0`, C: `D r H < 0 and D r S < 0`, D: `D r H > 0 and D r S > 0 5 C H A P T E R Thermodynamics Chapter & Topicwise NEET PYQ's P W 2`
    },
    {
        qNo: 12, topic: 'Pressure-Volume Work', year: '2020',
        text: `If for a certain reaction Δ r H is 30 kJ mol –1 at 450 K, the value of Δ r S (in JK –1 mol –1 ) for which the same reaction will be spontaneous at the same temperature is (2020-Covid)`,
        A: `–33`, B: `33`, C: `–70`, D: `70`
    },
    {
        qNo: 13, topic: 'Gibbs Energy Change', year: '2019',
        text: `In which case change in entropy is negative? (2019)`,
        A: `Evaporation of water`, B: `Expansion of a gas at constant temperature`, C: `Sublimation of solid to gas`, D: `2H(g) → H 2 (g)`
    },
    {
        qNo: 14, topic: 'Bomb Calorimeter (dU and dH)', year: '2017',
        text: `For a given reaction, ΔH = 35.5 KJ mol –1 and ΔS = 83.6 JK –1 mol –1 . The reaction is spontaneous at: (Assume that ΔH and ΔS do not vary with temperature) (2017-Delhi)`,
        A: `T > 298 K`, B: `T < 425 K`, C: `T > 425 K`, D: `All temperatures`
    },
    {
        qNo: 15, topic: 'Thermodynamic Processes', year: '2016',
        text: `For a sample of perfect gas when its pressure is changed isothermally from P i to P f , the entropy change is given by: (2016 - II)`,
        A: `f i P S nRT ln P   ∆ =    `, B: `i f P S nRT ln P   ∆ =    `, C: `f i P S nR ln P   ∆ =    `, D: `i f P S nR ln P   ∆ =    `
    },
    {
        qNo: 16, topic: 'Enthalpy Change', year: '2016',
        text: `The correct thermodynamic conditions for the spontaneous reaction at all temperatures is: (2016 - I)`,
        A: `ΔH < 0 and ΔS < 0`, B: `ΔH < 0 and ΔS = 0`, C: `ΔH > 0 and ΔS < 0`, D: `ΔH < 0 and ΔS > 0`
    },
    {
        qNo: 17, topic: 'Expansion or Contraction of a Gas', year: '2014',
        text: `For the reaction, X 2 O 4 ( l ) → 2XO 2 (g), ΔU = 2.1 kcal, ΔS = 20 cal K –1 at 300 K. Hence, ΔG is: (2014)`,
        A: `–2.7 kcal`, B: `9.3 kcal`, C: `–9.3 kcal`, D: `2.7 kcal Clausius Clapeyron Equation`
    },
    {
        qNo: 18, topic: 'Second Law of Thermodynamics (Spontaneity)', year: '2016',
        text: `Consider the following liquid-vapour equilibrium. Liquid  Vapour. Which of the following relations is correct? (2016 - I)`,
        A: `v 2 2 d1nP H dT T −∆ =`, B: `v 2 d1nP H dT RT −∆ =`, C: `v 2 2 d1nG H dT RT ∆ =`, D: `v d1nP H dT RT −∆ = 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 c a d a d d d a b c d d c d d a b Answer Key`
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
