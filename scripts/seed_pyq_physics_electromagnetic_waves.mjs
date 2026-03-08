/**
 * Seed REAL NEET PYQs — Chapter: Electromagnetic Waves (Physics)
 * Usage: node scripts/seed_pyq_physics_electromagnetic_waves.mjs
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

const CHAPTER_NAME = 'Electromagnetic Waves';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'Relation Between E, B and Speed of Light',
    'Intensity of EM Wave',
    'EM Spectrum (Microwaves)',
    'Characteristics of EM Waves',
    'Displacement Current'
];

const ANSWER_KEY = {
    1: 'C', 2: 'A', 3: 'A', 4: 'B', 5: 'A', 6: 'A', 7: 'B', 8: 'A', 9: 'D', 10: 'A', 11: 'B', 12: 'A', 13: 'B', 14: 'A', 15: 'B', 16: 'B', 17: 'A', 18: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Relation Between E, B and Speed of Light', year: '2016',
        text: `A 100 Ω resistance and a capacitor of 100 Ω reactance are connected in series across a 220 V source. When the capacitor is 50% charged, the peak value of the displacement current is: (2016 - II)`,
        A: `4.4 A`, B: `11 2 A`, C: `2.2 A`, D: `11 A Properties and Applications (i.e. Velocity, Amplitude, Energy Density) of Electromagnetic Waves`
    },
    {
        qNo: 2, topic: 'Intensity of EM Wave', year: '2022',
        text: `When light propagates through a material medium of relative permittivity ∈ r and relative permeability μ r , the velocity of light, v is given by : (c - velocity of light in vacuum) (2022)`,
        A: `r r c v = ∈ μ`, B: `v = c`, C: `r r v μ = ∈`, D: `r r v ∈ = μ`
    },
    {
        qNo: 3, topic: 'EM Spectrum (Microwaves)', year: '2021',
        text: `For a plane electromagnetic wave propagating in x-direction, which one of the following combination gives the correct possible directions for electric field (E) and magnetic field (B) respectively? (2021)`,
        A: `  j k, j k − + − −  `, B: `  j k, j k + − −  `, C: `  j k, j k − + − +  `, D: `  j k, j k + +  `
    },
    {
        qNo: 4, topic: 'Characteristics of EM Waves', year: '2020',
        text: `Light with an average flux of 20 W/cm 2 falls on non-reflecting surface at normal incidence having surface area 20 cm 2 . The energy received by the surface during time span of 1 minute is: (2020)`,
        A: `12 × 10 3 J`, B: `24 × 10 3 J`, C: `48 × 10 3 J`, D: `10 × 10 3 J`
    },
    {
        qNo: 5, topic: 'Displacement Current', year: '2020',
        text: `The ratio of contributions made by the electric field and magnetic field components to the intensity of an electromagnetic wave is : (c = speed of electromagnetic waves) (2020)`,
        A: `1 : 1`, B: `1 : c`, C: `1 : c 2`, D: `c : 1`
    },
    {
        qNo: 6, topic: 'Relation Between E, B and Speed of Light', year: '2020',
        text: `The magnetic field in an electromagnetic wave is given by, (2020-Covid) B y = 2 × 10 –7 sin(π × 10 3 x + 3π × 10 11 t)T Calculate the wavelength.`,
        A: `2 × 10 –3 m`, B: `2 ×10 3 m`, C: `π × 10 –3 m`, D: `π × 10 3 m`
    },
    {
        qNo: 7, topic: 'Intensity of EM Wave', year: '2018',
        text: `An em wave is propagating in a medium with a velocity ˆ v i v. = The instantaneous oscillating electric field of this em wave is along +y axis. Then the direction of oscillating magnetic field of the em wave will be along. (2018)`,
        A: `–y direction`, B: `+z direction`, C: `–z direction`, D: `–x direction`
    },
    {
        qNo: 8, topic: 'EM Spectrum (Microwaves)', year: '2017',
        text: `In an electromagnetic wave in free space the root mean square value of the electric field is E rms = 6 V/m. The peak value of the magnetic field is: (2017-Delhi)`,
        A: `2.83 × 10 –8 T`, B: `0.70 × 10 –8 T`, C: `4.23 × 10 –8 T`, D: `1.41 × 10 –8 T`
    },
    {
        qNo: 9, topic: 'Characteristics of EM Waves', year: '2016',
        text: `Out of the following options which one can be used to produce a propagating electromagnetic wave? (2016 - I)`,
        A: `A charge moving at constant velocity`, B: `A stationary charge`, C: `A charge less particle`, D: `An accelerating charge`
    },
    {
        qNo: 10, topic: 'Displacement Current', year: '2015',
        text: `Radiation of energy ‘E’ falls normally on a perfectly reflecting surface. The momentum transferred to the surface is ( C = velocity of light): (2015)`,
        A: `a. 2E C b. 2 2E C c. d. E C`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 11, topic: 'Relation Between E, B and Speed of Light', year: '2014',
        text: `Light with an energy flux of 25 × 10 4 W/m 2 falls on a perfectly reflecting surface at normal incidence. If the surface area is 15 cm 2 , the average force exerted on the surface is: (2014)`,
        A: `1.25 × 10 –6 N`, B: `2.50 × 10 –6 N`, C: `1.20 × 10 –6 N`, D: `3.0 × 10 –6 N 8 C H A P T E R Electromagnetic Waves Electromagnetic Waves 2 Electromagnetic Spectrum`
    },
    {
        qNo: 12, topic: 'Intensity of EM Wave', year: '2022',
        text: `Match List-I with List-II (2022) List-I List-II (Electromagnetic waves) (Wavelength)`,
        A: `AM radio waves (i) 10 –10 m`, B: `Microwaves (ii) 10 2 m`, C: `Infraraed radiations (iii) 10 –2 m`, D: `X-rays (iv) 10 –4 m Choose the correct answer from the options given below:`
    },
    {
        qNo: 13, topic: 'EM Spectrum (Microwaves)', year: '2020',
        text: `The E.M. wave with shortest wavelength among the following is, (2020-Covid)`,
        A: `X-rays`, B: `Gamma-rays`, C: `Microwaves`, D: `Ultraviolet rays`
    },
    {
        qNo: 14, topic: 'Characteristics of EM Waves', year: '2019',
        text: `Which colour of the light has the longest wavelength? (2019)`,
        A: `Red`, B: `Blue`, C: `Green`, D: `Violet`
    },
    {
        qNo: 15, topic: 'Displacement Current', year: '2015 Pre',
        text: `The energy of the E.M. waves is of the order of 15 keV. To which part of the spectrum does it belong? (2015 Pre)`,
        A: `Gamma-rays`, B: `X-rays`, C: `Infra-red rays`, D: `Ultraviolet rays`
    },
    {
        qNo: 16, topic: 'Relation Between E, B and Speed of Light', year: '2013',
        text: `The condition under which a microwave oven heats up a food item containing water molecules most efficiently is: (2013)`,
        A: `Infra-red waves produce heating in a microwave oven`, B: `The frequency of the microwaves must match the resonant frequency of the water molecules`, C: `The frequency of the microwaves has no relation with natural frequency of water molecules`, D: `Microwaves are heat waves, so always produce heating Effects of Dielectrics in Capacitors`
    },
    {
        qNo: 17, topic: 'Intensity of EM Wave', year: '2022',
        text: `When light propagates through a material medium of relative permittivity ∈ r and relative permeability μ r , the velocity of light, v is given by : (c - velocity of light in vacuum) (2022)`,
        A: `r r c v = ∈ μ`, B: `v = c`, C: `r r v μ = ∈`, D: `r r v ∈ = μ`
    },
    {
        qNo: 18, topic: 'EM Spectrum (Microwaves)', year: '2019',
        text: `A parallel plate capacitor of capacitance 20 μF is being charged by a voltage source whose potential is changing at the rate of 3 V/s. The conduction current through the connecting wires, and the displacement current through the plates of the capacitor, would be, respectively. (2019)`,
        A: `Zero, 60 μA`, B: `60 μA, 60 μA`, C: `60 μA, zero`, D: `Zero, zero Answer Key 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 c a a b a a b a d a b a b a b b a 18 b`
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
