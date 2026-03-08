/**
 * Seed REAL NEET PYQs — Chapter: Kinetic Theory (Physics)
 * Usage: node scripts/seed_pyq_physics_kinetic_theory.mjs
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

const CHAPTER_NAME = 'Kinetic Theory';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'Mean Free Path',
    'Average Kinetic Energy of Gas Molecule',
    'RMS Speed',
    'Ideal Gas Equation',
    'Mean Square Speed',
    'Charles\' Law',
    'Kinetic Theory of an Ideal Gas'
];

const ANSWER_KEY = {
    1: 'A', 2: 'A', 3: 'B', 4: 'B', 5: 'D', 6: 'C', 7: 'D', 8: 'B', 9: 'B', 10: 'B', 11: 'A', 12: 'C', 13: 'C', 14: 'B', 15: 'B', 16: 'B', 17: 'B', 18: 'A', 19: 'A', 20: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Mean Free Path', year: '2022',
        text: `The volume occupied by the molecules contained in 4.5 kg water at STP, if the intermolecular forces vanish away is: (2022)`,
        A: `5.6 m 3`, B: `5.6 × 10 6 m 3`, C: `5.6 × 10 3 m 3`, D: `5.6 × 10 –3 m 3`
    },
    {
        qNo: 2, topic: 'Average Kinetic Energy of Gas Molecule', year: '2020',
        text: `A cylinder contains hydrogen gas at pressure of 249 kPa and temperature 27° C. Its density is : (R = 8.3 J mol –1 K –1 ) (2020)`,
        A: `0.2 kg/m 3`, B: `0.1 kg/m 3`, C: `0.02 kg/m 3`, D: `0.5 kg/m 3`
    },
    {
        qNo: 3, topic: 'RMS Speed', year: '2020',
        text: `An ideal gas equation can be written as 0 RT P M ρ = where ρ and M 0 are respectively, (2020-Covid)`,
        A: `Number density, molar mass`, B: `Mass density, molar mass`, C: `Number density, mass of the gas`, D: `Mass density, mass of the gas`
    },
    {
        qNo: 4, topic: 'Ideal Gas Equation', year: '2019',
        text: `Increase in temperature of a gas filled in a container would lead to: (2019)`,
        A: `Increase in its mass`, B: `Increase in its kinetic energy`, C: `Decrease in its pressure`, D: `Decrease in intermolecular distance`
    },
    {
        qNo: 5, topic: 'Mean Square Speed', year: '2016',
        text: `A given sample of an ideal gas occupies a volume V at a pressure P and absolute temperature T. The mass of each molecule of the gas is m. Which of the following gives the density of the gas? (2016 - II)`,
        A: `P/(kTV)`, B: `mkT`, C: `P/(kT)`, D: `Pm/(kT)`
    },
    {
        qNo: 6, topic: 'Charles\' Law', year: '2015 Re',
        text: `Two vessels separately contain two ideal gases A and B at the same temperature, the pressure of A being twice that of B. Under such conditions, the density of A is found to be 1.5 times the density of B. The ratio of molecular weight of A and B is: (2015 Re)`,
        A: `1/2`, B: `2/3`, C: `3/4`, D: `2`
    },
    {
        qNo: 7, topic: 'Kinetic Theory of an Ideal Gas', year: '2013',
        text: `In the given (V-T) diagram, what is the relation between pressures P 1 and P 2 ? (2013)`,
        A: `Cannot be predicted`, B: `P 2 = P 1`, C: `P 2 > P 1`, D: `P 2 < P 1 Speed of Gas Molecules`
    },
    {
        qNo: 8, topic: 'Mean Free Path', year: '2021',
        text: `Match Column-I and Column-II and choose the correct match from the given choices. (2021) Column-I Column-II (A) Root mean square speed of gas molecules (P) 2 1 nmv 3 (B) Pressure exerted by ideal gas (Q) 3RT M (C) Average kinetic energy of a molecule (R) 5 RT 2 (D) Total internal energy of 1 mole of a diatomic gas (S) B 3 k T 2`,
        A: `(A) - (Q), (B) - (R), (C) - (S), (D) - (P)`, B: `(A) - (Q), (B) - (P), (C) - (S), (D) - (R)`, C: `(A) - (R), (B) - (Q), (C) - (P), (D) - (S)`, D: `(A) - (R), (B) - (P), (C) - (S), (D) - (Q)`
    },
    {
        qNo: 9, topic: 'Average Kinetic Energy of Gas Molecule', year: '2018',
        text: `At what temperature will the rms speed of oxygen molecules become just sufficient for escaping from the Earth’s atmosphere ? (Given: Mass of oxygen molecule (m) = 2.76 × 10 –26 kg, Boltzmann’s constant k B = 1.38 × 10 –23 JK –1 ) (2018)`,
        A: `5.016 ×10 4 K`, B: `8.360 ×10 4 K`, C: `2.508 ×10 4 K`, D: `1.254 ×10 4 K 12 C H A P T E R Kinetic Theory Chapter & Topicwise NEET PYQ's P W 2`
    },
    {
        qNo: 10, topic: 'RMS Speed', year: '2016',
        text: `The molecules of a given mass of a gas have r.m.s velocity of 200 ms –1 at 27°C and 1.0 × 10 5 Nm –2 pressure. When the temperature and pressure of the gas are respectively, 127°C and 0.05 × 10 5 Nm –2 , the r.m.s. velocity of its molecules in ms –1 is: (2016 - I)`,
        A: `100 2`, B: `400 3`, C: `100 2 3`, D: `100 3 Variation of Pressure with Depth and Pascal's Law`
    },
    {
        qNo: 11, topic: 'Ideal Gas Equation', year: '2020',
        text: `The average thermal energy for a mono-atomic gas is : (k B ) is Boltzmann constant and T is absolute temperature) (2020)`,
        A: `3 2 k B T`, B: `5 2 k B T`, C: `7 2 k B T`, D: `1 2 k B T`
    },
    {
        qNo: 12, topic: 'Mean Square Speed', year: '2017',
        text: `A gas mixture consists of 2 moles of O 2 and 4 moles of Ar at temperature T. Neglecting all vibrational modes, the total internal energy of the system is: (2017-Delhi)`,
        A: `15 RT`, B: `9 RT`, C: `11 RT`, D: `4 RT`
    },
    {
        qNo: 13, topic: 'Charles\' Law', year: '2013',
        text: `The molar specific heats of an ideal gas at constant pressure and volume are denoted by C P and C V respectively. If P C C ν γ = and R is the universal gas constant, then C V is equal to: (2013)`,
        A: `γR`, B: `1 1 + γ − γ`, C: `( ) R 1 γ −`, D: `( ) 1 R γ − Specific and Molar Heat Capacity of Gases`
    },
    {
        qNo: 14, topic: 'Kinetic Theory of an Ideal Gas', year: '2016',
        text: `One mole of an ideal monoatomic gas undergoes a process described by the equation PV 3 = constant. The heat capacity of the gas during this process is: (2016 - II)`,
        A: `2 R`, B: `R`, C: `3 R 2`, D: `5 R 3`
    },
    {
        qNo: 15, topic: 'Mean Free Path', year: '2015',
        text: `The ratio of the specific heats P v C C = γ in terms of degrees of freedom (n) is given by: (2015)`,
        A: `n 1 3   +    `, B: `2 1 n   +    `, C: `n 1 2   +    `, D: `1 1 n   +    `
    },
    {
        qNo: 16, topic: 'Average Kinetic Energy of Gas Molecule', year: '2015 Re',
        text: `4.0 g of a gas occupies 22.4 litres at NTP. The specific heat capacity of the gas at constant volume is 5.0 JK –1 mol –1 . If the speed of sound in this gas at NTP is 952 ms –1 , then the heat capacity at constant pressure is (Take gas constant R = 8.3 J/mol K): (2015 Re)`,
        A: `8.5 J/K mol`, B: `8.0 J/K mol`, C: `7.5 J/K mol`, D: `7.0 J/K mol`
    },
    {
        qNo: 17, topic: 'RMS Speed', year: '2013',
        text: `The amount of heat energy required to raise the temperature of 1 g of Helium at NTP, from T 1 K to T 2 K is: (2013)`,
        A: `2 A B 1 3 T N k 4 T      `, B: `( ) A B 2 1 3 N k T T 8 −`, C: `( ) A B 2 1 3 N k T T 2 −`, D: `( ) A B 2 1 3 N k T T 4 − Mean Free Path`
    },
    {
        qNo: 18, topic: 'Ideal Gas Equation', year: '2020',
        text: `The mean free path for a gas, with molecular diameter and number density n can be expressed as: (2020)`,
        A: `2 1 2 n d π`, B: `2 2 1 2 n d π`, C: `2 2 2 1 2 n d π`, D: `1 2 n d π`
    },
    {
        qNo: 19, topic: 'Mean Square Speed', year: '2020',
        text: `The mean free path l for a gas molecule depends upon diameter, d of the molecule as: (2020-Covid)`,
        A: `l ∝ d`, B: `l ∝ d 2`, C: `1 d ∝ `, D: `2 1 d ∝ `
    },
    {
        qNo: 20, topic: 'Charles\' Law', year: '2014',
        text: `The mean free path of molecules of a gas, (radius r) is inversely proportional to: (2014)`,
        A: `r 3`, B: `r -2`, C: `r`, D: `r Kinetic Theory 3 Answer Key 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 a a b b d c d b b b a c c b b b b 18 19 20 a d b`
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
                correctOption, 'neet', 'Physics PYQ', q.year, 1, examName
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
