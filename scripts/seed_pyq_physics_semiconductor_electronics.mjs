/**
 * Seed REAL NEET PYQs — Chapter: Semiconductor Electronics (Physics)
 * Usage: node scripts/seed_pyq_physics_semiconductor_electronics.mjs
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

const CHAPTER_NAME = 'Semiconductor Electronics';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'P-N Junction (Forward/Reverse Bias)',
    'Transistor Configurations',
    'Digital Electronics and Logic Gates',
    'P-N Junction Formation',
    'Zener Diode',
    'Junction Diode as Rectifier',
    'Semiconductor Diode',
    'Photo Diode, LED, Solar Cell'
];

const ANSWER_KEY = {
    1: 'C', 2: 'B', 3: 'D', 4: 'B', 5: 'D', 6: 'A', 7: 'C', 8: 'A', 9: 'D', 10: 'C', 11: 'B', 12: 'C', 13: 'D', 14: 'D', 15: 'D', 16: 'B', 17: 'A', 18: 'C', 19: 'B', 20: 'D', 21: 'A', 22: 'B', 23: 'A', 24: 'A', 25: 'B', 26: 'D', 27: 'D', 28: 'C', 29: 'D', 30: 'B', 31: 'C', 32: 'B', 33: 'B', 34: 'A', 35: 'D', 36: 'B', 37: 'D'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'P-N Junction (Forward/Reverse Bias)', year: '2020',
        text: `The solids which have the negative temperature coefficient of resistance are: [RC] (2020)`,
        A: `Insulators only`, B: `Semiconductors only`, C: `Insulators and semiconductors`, D: `Metals Intrinsic and Extrinsic Semiconductor (P and N types)`
    },
    {
        qNo: 2, topic: 'Transistor Configurations', year: '2021',
        text: `The electron concentration in an n-type semiconductor is the same as hole concentration in a p-type semiconductor. An external field (electric) is applied across each of them. Compare the currents in them. (2021)`,
        A: `current in p-type > current in n-type.`, B: `current in n-type > current in p-type.`, C: `No current will flow in p-type, current will only flow in n-type.`, D: `current in n-type = current in p-type.`
    },
    {
        qNo: 3, topic: 'Digital Electronics and Logic Gates', year: '2020',
        text: `An intrinsic semiconductor is converted into n-type extrinsic semiconductor by doping it with (2020-Covid)`,
        A: `Aluminium`, B: `Silver`, C: `Germanium`, D: `Phosphorous`
    },
    {
        qNo: 4, topic: 'P-N Junction Formation', year: '2019',
        text: `For a p-type semiconductor, which of the following statements is true? (2019)`,
        A: `Electrons are the majority carriers and trivalent atoms are the dopants.`, B: `Holes are the majority carriers and trivalent atoms are the dopants.`, C: `Holes are the majority carriers and pentavalent atoms are the dopants.`, D: `Electrons are the majority carriers and pentavalent atoms are the dopants.`
    },
    {
        qNo: 5, topic: 'Zener Diode', year: '2013',
        text: `In a n-type semiconductor, which of the following statement is true? (2013)`,
        A: `Holes are majority carriers and trivalent atoms are dopants`, B: `Electrons are majority carriers and trivalent atoms are dopants`, C: `Electron are minority carriers and pentavalent atoms are dopants`, D: `Holes are minority carriers and pentavalent atoms are dopants P-N Junction Diode (forward and reverse bias), Diffusion and Drift Current`
    },
    {
        qNo: 6, topic: 'Junction Diode as Rectifier', year: '2022',
        text: `P P N P N N a b c N N P N P P In the given circuits (a), (b) and (c), the potential drop across the two p-n junctions are equal in: (2022)`,
        A: `Both circuits (a) and (c)`, B: `Circuit (a) only`, C: `Circuit (b) only`, D: `Circuit (c) only`
    },
    {
        qNo: 7, topic: 'Semiconductor Diode', year: '2020',
        text: `Out of the following which one is a forward biased diode? (2020-Covid)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 8, topic: 'Photo Diode, LED, Solar Cell', year: '2020',
        text: `The increase in the width of the depletion region in a p-n junction diode is due to : (2020)`,
        A: `Reverse bias only`, B: `Both forward bias and reverse bias`, C: `Increase in forward current`, D: `Forward bias only 14 C H A P T E R Semiconductor Electronics Chapter & Topicwise NEET PYQ's P W 2`
    },
    {
        qNo: 9, topic: 'P-N Junction (Forward/Reverse Bias)', year: '2017',
        text: `Which one of the following represents forward bias diode? (2017-Delhi, 2006)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 10, topic: 'Transistor Configurations', year: '2016',
        text: `The given circuit has two ideal diodes connected as shown in the figure below. The current flowing through the resistance R 1 will be: (2016-II)`,
        A: `1.43 A`, B: `3.13 A`, C: `2.5 A`, D: `10.0 A`
    },
    {
        qNo: 11, topic: 'Digital Electronics and Logic Gates', year: '2016',
        text: `Consider the junction diode as ideal. The value of current flowing through AB is: (2016-I)`,
        A: `0 A`, B: `10 –2 A`, C: `10 –1 A`, D: `10 –3 A`
    },
    {
        qNo: 12, topic: 'P-N Junction Formation', year: '2015',
        text: `If in a p-n junction, a square input signal of 10 V is applied, as shown then the output across R L will be: (2015)`,
        A: `a. b. c. d. Characteristics of P-N Junction`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 13, topic: 'Zener Diode', year: '2018',
        text: `In a p-n junction diode, change in temperature due to heating (2018)`,
        A: `Does not affect resistance of p-n junction`, B: `Affects only forward resistance`, C: `Affects only reverse resistance`, D: `Affects the overall V–I characteristics of p-n junction`
    },
    {
        qNo: 14, topic: 'Junction Diode as Rectifier', year: '2014',
        text: `The barrier potential of a p-n junction depends on: (2014)`,
        A: `Type of semiconductor material`, B: `Amount of doping`, C: `Temperature Which one of the following is correct?`, D: `a and b only`
    },
    {
        qNo: 15, topic: 'Semiconductor Diode', year: '2022',
        text: `In half wave rectification, if the input frequency is 60 Hz, then the output frequency would be: (2022)`,
        A: `120 Hz`, B: `0`, C: `30 Hz`, D: `60 Hz Zener Diode`
    },
    {
        qNo: 16, topic: 'Photo Diode, LED, Solar Cell', year: '2021',
        text: `Consider the following statements (A) and (B) and identify the correct answer. (2021) (A)  A  zener diode is Connected in reverse bias, when used as a voltage regulator. (B)  The  potential barrier of p-n junction lies between 0.1 V to 0.3 V.`,
        A: `(A) and (B) both are incorrect.`, B: `(A) is correct and (B) is incorrect.`, C: `(A) is incorrect but (B) is correct.`, D: `(A) and (B) both are correct. Optoelectronic Devices`
    },
    {
        qNo: 17, topic: 'P-N Junction (Forward/Reverse Bias)', year: '2014',
        text: `The given graph represents V-I characteristic for a semiconductor device. (2014) Which of the following statement is correct?`,
        A: `It is V–I characteristic for solar cell where point A represents open circuit voltage and point B short circuit current`, B: `It is for a solar cell and points A and B represent open circuit voltage and current, respectively`, C: `It is for a photo diode and points A and B represent open circuit voltage and current, respectively`, D: `It is for a LED and points A and B represents open circuit voltage and short circuit current respectively Semiconductor Electronics 3 Transistor`
    },
    {
        qNo: 18, topic: 'Transistor Configurations', year: '2020',
        text: `For transistor action, which of the following statements is correct? [RC] (2020)`,
        A: `Base, emitter and collector regions should have same size.`, B: `Both emitter junction as well as the collector junction are forward biased.`, C: `The base region must be very thin and lightly doped.`, D: `Base, emitter and collector regions should have same doping concentrations.`
    },
    {
        qNo: 19, topic: 'Digital Electronics and Logic Gates', year: '2020',
        text: `A n-p-n transistor is connected in common emitter configuration (see figure) in which collector voltage drop across  load  resistance  (800  Ω)  connected  to  the  collector  circuit is 0.8 V. The collector current is, [RC] (2020-Covid)`,
        A: `0.1 mA`, B: `1 mA`, C: `0.2 mA`, D: `2 mA`
    },
    {
        qNo: 20, topic: 'P-N Junction Formation', year: '2020',
        text: `In the circuit shown in the figure, the input voltage V i is 20 V, V BE = 0 and V CE =`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 21, topic: 'Zener Diode', year: '2018',
        text: `The values of I B , I C  and  β  are  given  by [RC] (2018)`,
        A: `I B = 20 μA, I C  =  5mA,  β  =  250`, B: `I B = 25 μA, I C  =  5mA,  β  =  200`, C: `I B = 40 μA, I C  =  10  mA,  β  =  250`, D: `I B = 40 μA, I C  =  5mA,  β  =  125`
    },
    {
        qNo: 22, topic: 'Junction Diode as Rectifier', year: '2017',
        text: `In a common emitter transistor amplifier the audio signal voltage across the collector is 3 V. The resistance of collector is  3  kΩ.  If  current  gain  is  100  and  the  base  resistance  is  2  kΩ,  the  voltage  and  power  gain  of  the  amplifier  is: [RC] (2017-Delhi)`,
        A: `15 and 200`, B: `150 and 15000`, C: `20 and 2000`, D: `200 and 1000`
    },
    {
        qNo: 23, topic: 'Semiconductor Diode', year: '2016',
        text: `A npn transistor is connected in common emitter configuration in  a  given  amplifier.  A  load  resistance  of  800  Ω  is  connected  in the collector circuit and the voltage drop across it is 0.8 V. If the current amplification factor is 0.96 and the input resistance  of  the  circuit  is  192  Ω,  the  voltage  gain  and  the  power gain of the amplifier will respectively be: [RC] (2016-I)`,
        A: `4, 3.84`, B: `3.69, 3.84`, C: `4, 4`, D: `4, 3.69`
    },
    {
        qNo: 24, topic: 'Photo Diode, LED, Solar Cell', year: '2015 Pre',
        text: `The input signal given to a CE amplifier having a voltage gain of 150 is i V = 2cos 15t + . 3 π       The corresponding output signal will be: [RC] (2015 Pre)`,
        A: `4 300 cos 15t 3 π   +    `, B: `300 cos 15t 3 π   +    `, C: `2 75 cos 15t 3 π   +    `, D: `5 2 cos 15t 6 π   +    `
    },
    {
        qNo: 25, topic: 'P-N Junction (Forward/Reverse Bias)', year: '2020',
        text: `In a common emitter (CE) amplifier having a voltage Gain G, the transistor used has transconductance 0.03 mho and current gain`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 26, topic: 'Transistor Configurations', year: '2013',
        text: `If the above transistor is replaced with another one with transconductance 0.02 mho and current gain 20, the voltage gain will be: [RC] (2013)`,
        A: `5/4 G`, B: `2/3 G`, C: `1.5 G`, D: `1/3 G Digital Electronics and Logic Gates`
    },
    {
        qNo: 27, topic: 'Digital Electronics and Logic Gates', year: '2022',
        text: `A B C The truth table for the given logic circuit is: (2022)`,
        A: `A B C 0 0 0 0 1 1 1 0 0 1 1 1`, B: `A B C 0 0 0 0 1 1 1 0 1 1 1 0`, C: `A B C 0 0 1 0 1 0 1 0 0 1 1 1`, D: `A B C 0 0 1 0 1 0 1 0 1 1 1 0`
    },
    {
        qNo: 28, topic: 'P-N Junction Formation', year: '2021',
        text: `For the given circuit, the input digital signals are applied at the terminals A, B and C. What would be the output at the terminal y? (2021) A B C 0 0 0 5 5 5 t 1 t 2 t 3 t 4 t 5 t 6 Chapter & Topicwise NEET PYQ's P W 4 y B A C`,
        A: `0 V t 1 y t 2 t 3 t 4 t 5 t 6`, B: `5 V 0 V`, C: `5 V`, D: `0 V 5 V`
    },
    {
        qNo: 29, topic: 'Zener Diode', year: '2020',
        text: `For the logic circuit shown, the truth table is: (2020) A B Y`,
        A: `A B Y`, B: `A B Y 0 0 0 0 0 1 0 1 1 0 1 1 1 0 1 1 0 1 1 1 1 1 1 0`, C: `A B Y`, D: `A B Y 0 0 1 0 0 0 0 1 0 0 1 0 1 0 0 1 0 0 1 1 0 1 1 1`
    },
    {
        qNo: 30, topic: 'Junction Diode as Rectifier', year: '2020',
        text: `Which of the following gate is called universal gate? (2020-Covid)`,
        A: `AND gate`, B: `NAND gate`, C: `NOT gate`, D: `OR gate`
    },
    {
        qNo: 31, topic: 'Semiconductor Diode', year: '2019',
        text: `The correct Boolean operation represented by the circuit diagram drawn is: (2019)`,
        A: `AND`, B: `OR`, C: `NAND`, D: `NOR`
    },
    {
        qNo: 32, topic: 'Photo Diode, LED, Solar Cell', year: '2018',
        text: `In the combination of the following gates the output Y can be written in terms of inputs A and B as (2018)`,
        A: `B`, B: `B +`, C: `B`, D: `B +`
    },
    {
        qNo: 33, topic: 'P-N Junction (Forward/Reverse Bias)', year: '2017',
        text: `The given electrical network is equivalent to: (2017-Delhi)`,
        A: `OR gate`, B: `NOR gate`, C: `NOT gate`, D: `AND gate`
    },
    {
        qNo: 34, topic: 'Transistor Configurations', year: '2016',
        text: `What is the output Y in the following circuit, when all the three inputs A, B, C are first 0 and then 1? (2016-II) B Q P Y A C`,
        A: `1, 0`, B: `1, 1`, C: `0, 1`, D: `0, 0`
    },
    {
        qNo: 35, topic: 'Digital Electronics and Logic Gates', year: '2016',
        text: `To get output 1 for the following circuit, the correct choice for the input is: (2016-I, 2012 Mains, 2010 Pre)`,
        A: `A = 0, B = 1, C = 0`, B: `A = 1, B = 0, C = 0`, C: `A = 1, B = 1, C = 0`, D: `A = 1, B = 0, C = 1`
    },
    {
        qNo: 36, topic: 'P-N Junction Formation', year: '2015',
        text: `Which logic gate is represented by the following combination of logic gates? (2015)`,
        A: `NAND`, B: `AND`, C: `NOR`, D: `OR`
    },
    {
        qNo: 37, topic: 'Zener Diode', year: '2013',
        text: `The output ( X ) of the logic circuit shown in figure will be: (2013)`,
        A: `X A B = +`, B: `X`, C: `B =`, D: `X`
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
