/**
 * Seed REAL NEET PYQs — Chapter: Alternating Current (Physics)
 * Usage: node scripts/seed_pyq_physics_alternating_current.mjs
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

const CHAPTER_NAME = 'Alternating Current';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'AC Voltage on Inductor and Capacitor',
    'Power Factor in AC Circuits',
    'LCR Circuit (Impedance Variation)',
    'Transformers',
    'RMS Value of AC',
    'LCR Circuit (Phasor Diagram)',
    'Reactance of Capacitive Circuit',
    'LCR Circuit (Phase Relationship)'
];

const ANSWER_KEY = {
    1: 'D', 2: 'D', 3: 'B', 4: 'B', 5: 'D', 6: 'D', 7: 'A', 8: 'C', 9: 'C', 10: 'C', 11: 'B', 12: 'A', 13: 'B', 14: 'C', 15: 'A', 16: 'A', 17: 'D', 18: 'B', 19: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'AC Voltage on Inductor and Capacitor', year: '2022',
        text: `The peak voltage of the ac source is equal to (2022)`,
        A: `1 2 times the rms value of the source`, B: `the value of voltage supplied to the circuit`, C: `the rms value of the ac source`, D: `2 times the rms value of the ac source`
    },
    {
        qNo: 2, topic: 'Power Factor in AC Circuits', year: '2021',
        text: `A capacitor of capacitance ‘C’, is connected across an ac source of votlage V, given by V = V 0 sin w t. The displacement current between the plates of the capacitor, would then be given by: (2021)`,
        A: `0 d V I cos t C = ω ω`, B: `0 d V I sin t C = ω ω`, C: `d 0 I V Csin t = ω ω`, D: `d 0 I V Ccos t = ω ω`
    },
    {
        qNo: 3, topic: 'LCR Circuit (Impedance Variation)', year: '2020',
        text: `A 40 m F capacitor is connected to a 200V, 50Hz ac supply. The rms value of the current in the circuit is, nearly: (2020)`,
        A: `2.05 A`, B: `2.5 A`, C: `25.1 A`, D: `1.7 A`
    },
    {
        qNo: 4, topic: 'Transformers', year: '2016',
        text: `A small signal voltage V(t) = V 0 sinωt is applied across an ideal capacitor C : (2016 - I)`,
        A: `Current I(t) lags voltage V(t) by 90°`, B: `Over a full cycle the capacitor C does not consume any energy from the voltage source`, C: `Current I(t) is in phase with voltage V(t)`, D: `Current I(t) leads voltage V(t) by 180°`
    },
    {
        qNo: 5, topic: 'RMS Value of AC', year: '2020',
        text: `A light bulb and an inductor coil are connected to an ac source through a key as shown in the figure below. The key is closed and after sometime an iron rod is inserted into the interior of the inductor. The glow of the light bulb (2020-Covid)`,
        A: `Remains unchanged`, B: `Will fluctuate`, C: `Increases`, D: `Decreases`
    },
    {
        qNo: 6, topic: 'LCR Circuit (Phasor Diagram)', year: '2015',
        text: `A resistance R draws power P when connected to an AC source. If an inductance is now placed in series with the resistance, such that the impedance of the circuit becomes Z, the power drawn will be: (2015)`,
        A: `R P Z`, B: `R P Z      `, C: `P`, D: `2 R P Z      `
    },
    {
        qNo: 7, topic: 'Reactance of Capacitive Circuit', year: '2013',
        text: `A coil of self-inductance L is connected in series with a bulb B and an AC source. Brightness of the bulb decreases when: (2013)`,
        A: `An iron rod is inserted in the coil`, B: `Frequency of the AC source is decreased`, C: `Number of turns in the coil is reduced`, D: `A capacitance of reactance X C = X L is included in the same circuit`
    },
    {
        qNo: 8, topic: 'LCR Circuit (Phase Relationship)', year: '2020',
        text: `A series RC circuit is connected to an alternating voltage source. Consider two situations`,
        A: `When capacitor is air filled.`, B: `When capacitor is mica filled. 7 C H A P T E R Alternating Current Chapter & Topicwise NEET PYQ's P W 2 Current through resistor is i and voltage across capacitor is V then: (2015 Re)`, C: `V a = V b`, D: `V a < V b`
    },
    {
        qNo: 9, topic: 'AC Voltage on Inductor and Capacitor', year: '2021',
        text: `An inductor of inductance L, a capacitor of capacitance C and a resistor of resistance ‘R’ are connected in series to an ac source of potential difference ‘V’ volts as shown in figure. Potential difference across L, C and R is 40V, 10V and 40V, respectively. The amplitude of current flowing through LCR series circuit is 10 2 A . The impedance of the circuit is: (2021) 40V 10V 40V ~`,
        A: `5 / 2 Ω`, B: `4 W`, C: `5 W`, D: `4 2 Ω`
    },
    {
        qNo: 10, topic: 'Power Factor in AC Circuits', year: '2017',
        text: `Figure shows a circuit that contains three identical resistors with resistance R = 9.0 Ω each, two identical inductors with inductance L = 2.0 mH each, and an ideal battery with emf ε = 18 V. The current ‘i’ through the battery just after the switch closed is: (2017-Delhi)`,
        A: `0.2 A`, B: `2 A`, C: `0 ampere`, D: `2 mA Electric Resonance`
    },
    {
        qNo: 11, topic: 'LCR Circuit (Impedance Variation)', year: '2022',
        text: `A series LCR circuit with inductance 10 H, capacitance 10 μF, resistance 50 W is corrected to an ac source of voltage, V = 200 sin(100t) volt. If resonant frequency of the LCR circuit is ν 0 and the frequency of the ac source is ν, then: (2022)`,
        A: `0 100 100Hz; Hz ν = ν = π`, B: `n 0 = n = 50 Hz`, C: `0 50 Hz ν = ν = π`, D: `0 50 Hz, 50 Hz ν = ν = π`
    },
    {
        qNo: 12, topic: 'Transformers', year: '2020',
        text: `A series LCR circuit is connected to an ac voltage source. When L is removed from the circuit, the phase difference between current and voltage is 3 π . If instead C is removed from the circuit, the phase difference is again 3 π between current and voltage. The power factor of the circuit is: (2020)`,
        A: `0.5`, B: `1.0`, C: `–1.0`, D: `Zero`
    },
    {
        qNo: 13, topic: 'RMS Value of AC', year: '2016',
        text: `Which of the following combinations should be selected for better tuning of an L-C-R circuit used for communication? (2016 - II)`,
        A: `R = 15 Ω, L = 3.5 H, C = 30 μF`, B: `R = 25 Ω, L = 1.5 H, C = 45 μF`, C: `R = 20 Ω, L = 1.5 H, C = 35 μF`, D: `R = 25 Ω, L = 2.5 H, C = 45 μF Average Power and Power Associated with`
    },
    {
        qNo: 14, topic: 'LCR Circuit (Phasor Diagram)', year: '2021',
        text: `A series LCR circuit containing 5.0 H inductor, 80 m F capacitor and 40 W resistor is connected to 230 V variable frequency ac source. The angular frequencies of the source at which power transferred to the circuit is half the power at the resonant angular frequency are likely to be: (2021)`,
        A: `50 rad/s and 25 rad/s`, B: `46 rad/s and 54 rad/s`, C: `42 rad/s and 58 rad/s`, D: `25 rad/s and 75 rad/s`
    },
    {
        qNo: 15, topic: 'Reactance of Capacitive Circuit', year: '2018',
        text: `An inductor 20mH, a capacitor 100 m F and a resistor 50 W are connected in series across a source of emf, V = 10 sin 314 t. The power loss in the circuit is (2018)`,
        A: `2.74 W`, B: `0.43 W`, C: `0.79 W`, D: `1.13 W`
    },
    {
        qNo: 16, topic: 'LCR Circuit (Phase Relationship)', year: '2016',
        text: `The potential differences across the resistance, capacitance and inductance are 80 V, 40 V and 100 V respectively in an LCR circuit. The power factor of this circuit is: (2016 - II)`,
        A: `0.8`, B: `1.0`, C: `0.4`, D: `0.5`
    },
    {
        qNo: 17, topic: 'AC Voltage on Inductor and Capacitor', year: '2016',
        text: `An inductor 20 mH, a capacitor 50 μF and a resistor 40 Ω are connected in series across a source of emf V = 10 sin 340t. The power loss in A.C. circuit is: (2016 - I)`,
        A: `0.51 W`, B: `0.67 W`, C: `0.76 W`, D: `0.89 W Alternating Current 3 Transformer`
    },
    {
        qNo: 18, topic: 'Power Factor in AC Circuits', year: '2021',
        text: `A step down transformer connected to an ac mains supply of 220 V is made to operate at 11 V, 44 W lamp. Ignoring power losses in the transformer, what is the current in the primary circuit? (2021)`,
        A: `0.4 A`, B: `2 A`, C: `4 A`, D: `0.2 A`
    },
    {
        qNo: 19, topic: 'LCR Circuit (Impedance Variation)', year: '2014',
        text: `A transformer having efficiency of 90% is working on 200 V and 3 kW power supply. If the current in the secondary coil is 6 A, the voltage across the secondary coil and the current in the primary coil respectively are: (2014)`,
        A: `300 V, 15 A`, B: `450 V, 15 A`, C: `450 V, 13.5 A`, D: `600 V, 15 A 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 d d b b d d a c c None c b a b c a a 18 19 d b Answer Key`
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
