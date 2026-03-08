/**
 * Seed REAL NEET PYQs — Chapter: Chemical Kinetics (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_chemical_kinetics.mjs
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

const CHAPTER_NAME = 'Chemical Kinetics';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Activation Energy',
    'Integrated Rate Equations',
    'Rate Constant',
    'Order of Reaction',
    'Temperature Dependence of Reaction Rate'
];

const ANSWER_KEY = {
    1: 'C', 2: 'A', 3: 'A', 4: 'C', 5: 'D', 6: 'B', 7: 'D', 8: 'C', 9: 'B', 10: 'B', 11: 'C', 12: 'B', 13: 'A', 14: 'A', 15: 'A', 16: 'D', 17: 'A', 18: 'B', 19: 'C', 20: 'C', 21: 'A', 22: 'C'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Activation Energy', year: '2019',
        text: `For the chemical reaction N 2 (g) + 3H 2 (g)  2NH 3 (g) The correct option is: (2019)`,
        A: `2 3 1 [H ] 1 [NH ] 3 2 − = − d d dt dt`, B: `2 3 [N ] [NH ] 2 d d dt dt - =`, C: `2 3 [N ] 1 [NH ] 2 d d dt dt - =`, D: `2 3 [H ] [NH ] 3 2 d d dt dt = Factors Influencing Rate of a Reaction & Order of Reaction`
    },
    {
        qNo: 2, topic: 'Integrated Rate Equations', year: '2017',
        text: `Mechanism of a hypothetical reaction (2017-Delhi) X 2 + Y 2 → 2XY is given below: (i) X 2 → X + X (fast) (ii) X + Y 2  XY + Y (slow) (iii) X + Y → XY (fast) The overall order of the reaction will be`,
        A: `1.5`, B: `1`, C: `2`, D: `0`
    },
    {
        qNo: 3, topic: 'Rate Constant', year: '2016',
        text: `The decomposition of phosphine (PH 3 ) on tungsten at low pressure is a first-order reaction. It is because the: (2016-II)`,
        A: `Rate is proportional to the surface coverage`, B: `Rate is inversely proportional to the surface coverage`, C: `Rate is independent of the surface coverage`, D: `Rate of decomposition is very low Integrated Rate Equation & Half Life of Reactions`
    },
    {
        qNo: 4, topic: 'Order of Reaction', year: '2022',
        text: `For a first order reaction A → Products, initial concentration of A is 0.1 M, which becomes 0.001 M after 5 minutes. Rate constant for the reaction in min –1 is (2022)`,
        A: `0.2303`, B: `1.3818`, C: `0.9212`, D: `0.4606`
    },
    {
        qNo: 5, topic: 'Temperature Dependence of Reaction Rate', year: '2022',
        text: `The given graph is a representation of kinetics of a reaction. Constant temperature T y x The y and x axes for zero and first order reactions, respectively are (2022) a . zero order (y = rate and x = concentration), first order (y = rate and x = t 1/2 ) b. zero order (y = concentration and x = time), first order (y = t 1/2 and x = c concentration) c. zero order (y = concentration and x = time), first order (y = rate constant and x = concentration) d. zero order (y = rate and x = concentration), first order (y = t 1/2 and x = concentration)`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 6, topic: 'Activation Energy', year: '2020',
        text: `The rate contant for a first order reaction is 4.606 × 10 –3 s –1 . The time required to reduce 2.0 g of the reactant to 0.2 g is: (2020)`,
        A: `200 s`, B: `500 s`, C: `1000 s`, D: `100 s`
    },
    {
        qNo: 7, topic: 'Integrated Rate Equations', year: '2020',
        text: `The half-life for a zero order reaction having 0.02 M initial concentration of reactant is 100 s. The rate constant (in mol L –1 s –1 ) for the reaction is (2020-Covid)`,
        A: `2.0 × 10 –4`, B: `2.0 × 10 –3`, C: `1.0 × 10 –2`, D: `1.0 × 10 –4`
    },
    {
        qNo: 8, topic: 'Rate Constant', year: '2019',
        text: `If the rate constant for a first order reaction is k, the time (t) required for the completion of 99% of the reaction is given by: (2019)`,
        A: `t = 0.693/k`, B: `t = 6.909/k`, C: `t = 4.606/k`, D: `t = 2.303/k`
    },
    {
        qNo: 9, topic: 'Order of Reaction', year: '2018',
        text: `When initial concentration of the reactant is doubled, the half- life period of a zero order reaction (2018)`,
        A: `Is halved`, B: `Is doubled`, C: `Is tripled`, D: `Remains unchanged 3 C H A P T E R Chemical Kinetics Chemical Kinetics 2`
    },
    {
        qNo: 10, topic: 'Temperature Dependence of Reaction Rate', year: '2018',
        text: `The correct difference between first and second order reactions is that: (2018)`,
        A: `The rate of a first-order reaction does not depend on reactant concentrations; the rate of a second-order reaction does depend on reactant concentrations`, B: `The half-life of a first-order reaction does not depend on [A] 0 ; the half-life of a second-order reaction does depend on [A] 0`, C: `The rate of a first-order reaction does depend on reactant concentrations; the rate of a second-order reaction does not depend on reactant concentrations`, D: `A first-order reaction can catalyzed; a second-order reaction cannot be catalyzed`
    },
    {
        qNo: 11, topic: 'Activation Energy', year: '2017',
        text: `A first order reaction has a specific reaction rate of 10 –2 s –1 . How much time will it take for 20 g of the reactant to reduce to 5 g? (2017-Delhi)`,
        A: `693.0 second`, B: `238.6 second`, C: `138.6 second`, D: `346.5 second`
    },
    {
        qNo: 12, topic: 'Integrated Rate Equations', year: '2016',
        text: `The rate of a first-order reaction is 0.04 mol L – 1 s –1 at 10 seconds and 0.03 mol L – 1 s –1 at 20 seconds after initiation of the reaction. The half-life period of the reaction is: (2016 - I)`,
        A: `54.1 s`, B: `24.1 s`, C: `34.1 s`, D: `44.1 s`
    },
    {
        qNo: 13, topic: 'Rate Constant', year: '2015 Re',
        text: `The rate constant of the reaction A → B is 0.6 × 10 –3 mole per second. If the concentration of A is 5 M, then concentration of B after 20 minutes is: (2015 Re)`,
        A: `0.72 M`, B: `1.08 M`, C: `3.60 M`, D: `0.36 M`
    },
    {
        qNo: 14, topic: 'Order of Reaction', year: '2015',
        text: `When initial concentration of a reactant is doubled in a reaction, its half-life period is not affected. The order of the reaction is: (2015)`,
        A: `First`, B: `Second`, C: `More than zero but less than first`, D: `Zero Temperature Dependence of the Rate of a Reaction & Effect of Catalysts`
    },
    {
        qNo: 15, topic: 'Temperature Dependence of Reaction Rate', year: '2021',
        text: `For a reaction A → B, enthalpy of reaction is –4.2 kJ mol –1 and enthalpy of activation is 9.6 kJ mol –1 . The correct potential energy profile for the reaction is shown in option. (2021)`,
        A: `PE A B Reaction Progress`, B: `PE A B Reaction Progress`, C: `PE A B Reaction Progress`, D: `PE A B Reaction Progress`
    },
    {
        qNo: 16, topic: 'Activation Energy', year: '2021',
        text: `The slope of Arrhenius Plot (ln K v/s 1/T) of first order reaction is –5 × 10 3 K. The value of E a of the reaction is. Choose the correct option for your answer. (2021) [Given R = 8.314 JK –1 mol –1 ]`,
        A: `83.0 kJ mol –1`, B: `166 kJ mol –1`, C: `–83 kJ mol –1`, D: `41.5 kJ mol –1`
    },
    {
        qNo: 17, topic: 'Integrated Rate Equations', year: '2016',
        text: `The addition of a catalyst during a chemical reaction alters which of the following quantities? (2016 - I)`,
        A: `Activation energy`, B: `Entropy`, C: `Internal energy`, D: `Enthalpy`
    },
    {
        qNo: 18, topic: 'Rate Constant', year: '2015',
        text: `The activation energy of a reaction can be determined from the slope of which of the following graphs? (2015)`,
        A: `ln k vs. T T`, B: `1 ln k vs. T`, C: `T 1 vs. ln k T`, D: `ln k vs. T`
    },
    {
        qNo: 19, topic: 'Order of Reaction', year: '2013',
        text: `A reaction having equal energies of activation for forward and reverse reactions has: (2013)`,
        A: `ΔS = 0`, B: `ΔG = 0`, C: `ΔH = 0`, D: `ΔH = ΔG = ΔS = 0`
    },
    {
        qNo: 20, topic: 'Temperature Dependence of Reaction Rate', year: '2013',
        text: `What is the activation energy for a reaction if its rate doubles when the temperature is raised from 20°C to 35°C? (R = 8.314 J mol –1 K –1 ) (2013)`,
        A: `342 kJ mol –1`, B: `269 kJ mol –1`, C: `34.7 kJ mol –1`, D: `15.1 kJ mol –1 Collision Theory of Chemical Reactions`
    },
    {
        qNo: 21, topic: 'Activation Energy', year: '2020',
        text: `In collision theory of chemical reaction, Z AB represents (2020-Covid)`,
        A: `The collision frequency of reactants, A and B`, B: `Steric factor`, C: `The fraction of molecules with energies equal to E a`, D: `The fraction of molecules with energies greater than E a`
    },
    {
        qNo: 22, topic: 'Integrated Rate Equations', year: '2020',
        text: `An increase in the concentration of the reactants of a reaction leads to change in : (2020)`,
        A: `Heat of reaction`, B: `Threshold energy`, C: `Collision frequency`, D: `Activation energy Chapter & Topicwise NEET PYQ’s P W 3 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 c a a c d b d c b b c b a a a d a 18 19 20 21 22 b c c a c Answer Key`
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
