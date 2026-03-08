/**
 * Seed REAL NEET PYQs — Chapter: Thermodynamics (Physics)
 * Usage: node scripts/seed_pyq_physics_thermodynamics.mjs
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

const CHAPTER_NAME = 'Thermodynamics';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'Thermodynamic State Variables',
    'Thermodynamic Processes (Adiabatic)',
    'Carnot\'s Engine',
    'Internal Energy',
    'First Law of Thermodynamics',
    'Work Done (P-V Curve)'
];

const ANSWER_KEY = {
    1: 'C', 2: 'A', 3: 'B', 4: 'B', 5: 'C', 6: 'B', 7: 'A', 8: 'B', 9: 'B', 10: 'A', 11: 'B', 12: 'D', 13: 'C', 14: 'A', 15: 'C', 16: 'D', 17: 'C', 18: 'A', 19: 'C', 20: 'A', 21: 'A', 22: 'A', 23: 'A', 24: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Thermodynamic State Variables', year: '2022',
        text: `An ideal gas undergoes four different processes from the same initial state as shown in the figure below. Those processes are adiabatic, isothermal isobaric and isochoric. The curve which represents the adiabatic process among 1, 2, 3 and 4 is: (2022) P V 4 3 2 1`,
        A: `4`, B: `1`, C: `2`, D: `3`
    },
    {
        qNo: 2, topic: 'Thermodynamic Processes (Adiabatic)', year: '2020',
        text: `Two cylinders A and B of equal capacity are connected to each other via a stop cock. A contains an ideal gas at standard temperature and pressure. B is completely evacuated. The entire system is thermally insulated. The stop cock is suddenly opened. The process is: (2020)`,
        A: `Adiabatic`, B: `Isochoric`, C: `Isobaric`, D: `Isothermal`
    },
    {
        qNo: 3, topic: 'Carnot\'s Engine', year: '2020',
        text: `The P-V diagram for an ideal gas in a piston cylinder assembly undergoing a thermodynamic process is shown in the figure. The process is (2020-Covid)`,
        A: `Isochoric`, B: `Isobaric`, C: `Isothermal`, D: `Adiabatic`
    },
    {
        qNo: 4, topic: 'Internal Energy', year: '2019',
        text: `In which of the following processes, heat is neither absorbed nor released by a system? (2019)`,
        A: `Isothermal`, B: `Adiabatic`, C: `Isobaric`, D: `Isochoric`
    },
    {
        qNo: 5, topic: 'First Law of Thermodynamics', year: '2018',
        text: `The volume (V) of a monoatomic gas varies with its temperature (T), as shown in the graph. The ratio of the work done by the gas, to the heat absorbed by it, when it undergoes a change from state A to State B, is (2018)`,
        A: `1 3`, B: `2 3`, C: `2 5`, D: `2 7`
    },
    {
        qNo: 6, topic: 'Work Done (P-V Curve)', year: '2018',
        text: `A sample of 0.1 g of water at 100°C and normal pressure (1.013 × 10 5 Nm –2 ) requires 54 cal of heat energy to convert to steam at 100°C. If the volume of the steam produced is 167.1 cc, the change in internal energy of the sample, is: (2018)`,
        A: `42.2 J`, B: `208.7 J`, C: `104.3 J`, D: `84.5 J`
    },
    {
        qNo: 7, topic: 'Thermodynamic State Variables', year: '2017',
        text: `Thermodynamic processes are indicated in the following diagram. (2017-Delhi) Match the following: Column-I Column-II P. Process I`,
        A: `Adiabatic Q. Process II`, B: `Isobaric R. Process III`, C: `Isochoric S. Process IV`, D: `Isothermal`
    },
    {
        qNo: 8, topic: 'Thermodynamic Processes (Adiabatic)', year: '2016',
        text: `A gas is compressed isothermally to half its initial volume. The same gas is compressed separately through an adiabatic process until its volume is again reduced to half. Then: (2016 - I)`,
        A: `Compressing the gas isothermally will require more work to be done`, B: `Compressing the gas through adiabatic process will require more work to be done`, C: `Compressing the gas isothermally or adiabatically will require the same amount of work`, D: `Which of the case (whether compression through isothermal or through adiabatic process) requires more work will depend upon the atomicity of the gas`
    },
    {
        qNo: 9, topic: 'Carnot\'s Engine', year: '2015',
        text: `Figure below shows two paths that may be taken by a gas to go from a state A to a state C. In process AB, 400 J of heat is added to the system and in process BC, 100 J of heat is added to the system. The heat absorbed by the system in the process AC will be: (2015)`,
        A: `500 J`, B: `460 J`, C: `300 J`, D: `380 J`
    },
    {
        qNo: 10, topic: 'Internal Energy', year: '2015',
        text: `One mole of an ideal diatomic gas undergoes a transition from A to B along a path AB as shown in the figure, The change in internal energy of the gas during the transition is: (2015)`,
        A: `–20 kJ`, B: `20 J`, C: `–12 kJ`, D: `20 kJ`
    },
    {
        qNo: 11, topic: 'First Law of Thermodynamics', year: '2015 Re',
        text: `An ideal gas is compressed to half its initial volume by means of several processes. Which of the process results in the maximum work done on the gas? (2015 Re)`,
        A: `Isothermal`, B: `Adiabatic`, C: `Isobaric`, D: `Isochoric`
    },
    {
        qNo: 12, topic: 'Work Done (P-V Curve)', year: '2014',
        text: `A thermodynamic system undergoes cyclic process ABCDA as shown in figure. The work done by the system in the cycle is: (2014)`,
        A: `P 0 V 0`, B: `2 P 0 V 0`, C: `0 0 P V 2`, D: `Zero`
    },
    {
        qNo: 13, topic: 'Thermodynamic State Variables', year: '2014',
        text: `A monoatomic gas at a pressure P, having a volume V expands isothermally to a volume 2 V and then adiabatically to a volume 16 V. The final pressure of the gas is (take γ = 5/3): (2014)`,
        A: `64 P`, B: `32 P`, C: `P/64`, D: `16 P`
    },
    {
        qNo: 14, topic: 'Thermodynamic Processes (Adiabatic)', year: '2013',
        text: `During an adiabatic process, the pressure of a gas is found to be proportional to the cube of its temperature. The ratio of P C C ν for the gas is: (2013)`,
        A: `3/2`, B: `2`, C: `4/3`, D: `5/3`
    },
    {
        qNo: 15, topic: 'Carnot\'s Engine', year: '2013',
        text: `A gas is taken through the cycle A → B → C → A, as shown. What is the net work done by the gas? (2013)`,
        A: `–2000 J`, B: `2000 J`, C: `1000 J`, D: `Zero Second Law of Thermodynamics & Refrigerator`
    },
    {
        qNo: 16, topic: 'Internal Energy', year: '2016',
        text: `The temperature inside a refrigerator is t 2 °C and the room temperature is t 1 °C. The amount of heat delivered to the room for each joule of electrical energy consumed ideally will be: [RC] (2016 - II)`,
        A: `1 1 2 t 273 t t ° + ° + °`, B: `1 2 1 t t t 273 ° + ° ° +`, C: `1 1 2 t t t ° ° + °`, D: `1 1 2 t 273 t t ° + ° − °`
    },
    {
        qNo: 17, topic: 'First Law of Thermodynamics', year: '2016',
        text: `A refrigerator works between 4°C and 30°C. It is required to remove 600 calories of heat every second in order to keep the temperature of the refrigerated space constant. The power required is (Take 1 cal = 4.2 joules): [RC] (2016 - I)`,
        A: `2.365 W`, B: `23.65 W`, C: `236.5 W`, D: `2365 W`
    },
    {
        qNo: 18, topic: 'Work Done (P-V Curve)', year: '2020',
        text: `The coefficient of performance of a refrigerator is`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 19, topic: 'Thermodynamic State Variables', year: '2015 Re',
        text: `If the temperature inside freezer is –20°C, the temperature of the surroundings to which it rejects heat is: [RC] (2015 Re)`,
        A: `21°C`, B: `31°C`, C: `41°C`, D: `11°C Chapter & Topicwise NEET PYQ's P W 3 Carnot Engine`
    },
    {
        qNo: 20, topic: 'Thermodynamic Processes (Adiabatic)', year: '2020',
        text: `The efficiency of a carnot engine depends upon [RC] (2020-Covid)`,
        A: `The temperatures of the source and sink`, B: `The volume of the cylinder of the engine`, C: `The temperature of the source only`, D: `The temperature of the sink only`
    },
    {
        qNo: 21, topic: 'Carnot\'s Engine', year: '2018',
        text: `The efficiency of an ideal heat engine working between the freezing point and boiling point of water, is: [RC] (2018)`,
        A: `6.25%`, B: `20%`, C: `26.8%`, D: `12.5%`
    },
    {
        qNo: 22, topic: 'Internal Energy', year: '2017',
        text: `A carnot engine having an efficiency of 1/10 as heat engine, is used as a refrigerator. If the work done on the system is 10 J, the amount of energy absorbed from the reservoir at lower temperature is: [RC] (2017-Delhi)`,
        A: `90 J`, B: `99 J`, C: `100 J`, D: `1 J`
    },
    {
        qNo: 23, topic: 'First Law of Thermodynamics', year: '2020',
        text: `Carnot engine, having an efficiency of η =1/`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 24, topic: 'Work Done (P-V Curve)', year: '2015',
        text: `As heat engine, is used as a refrigerator. If the work done on the system is 10 J, the amount of energy absorbed from the reservoir at lower temperature is: [RC] (2015)`,
        A: `99 J`, B: `90 J`, C: `1 J`, D: `100 J Answer Key 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 c a b b c b a b b a b d c a c d c 18 19 20 21 22 b a c a b`
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
