/**
 * Seed REAL NEET PYQs — Chapter: Atoms (Physics)
 * Usage: node scripts/seed_pyq_physics_atoms.mjs
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

const CHAPTER_NAME = 'Atoms';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'Bohr Model (Failure of Bohr\'s Theory)',
    'Bohr Model (Energy of Electron in nth Orbit)',
    'Hydrogen Spectrum',
    'X-Rays (Properties)',
    'Bohr Model (Radius in nth Orbit)',
    'Thomson Model',
    'de-Broglie\'s Explanation of Bohr\'s Quantization'
];

const ANSWER_KEY = {
    1: 'A', 2: 'A', 3: 'C', 4: 'A', 5: 'C', 6: 'B', 7: 'B', 8: 'A', 9: 'C', 10: 'A', 11: 'A', 12: 'C', 13: 'B'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Bohr Model (Failure of Bohr\'s Theory)', year: '2016',
        text: `When an α particle of mass m moving with velocity v bombards on a heavy nucleus of charge ‘Ze’, its distance of closest approach from the nucleus depends on mass: (2016 - I)`,
        A: `1 m`, B: `1 m`, C: `2 1 m`, D: `m Bohr H-atom Model, Radius of Orbit, Velocity and Energy of Electrons, Wavelengths of Hydrogen Spectrum and Ionisation Potential`
    },
    {
        qNo: 2, topic: 'Bohr Model (Energy of Electron in nth Orbit)', year: '2022',
        text: `Let T 1 and T 2 be the energy of an electron in the first and second excited states of hydrogen atom, respectively. According to the Bohr’s model of an atom, the ratio T 1 : T 2 is : (2022)`,
        A: `9 : 4`, B: `1 : 4`, C: `4 : 1`, D: `4 : 9`
    },
    {
        qNo: 3, topic: 'Hydrogen Spectrum', year: '2020',
        text: `For which one of the following, Bohr’s model is not valid? (2020)`,
        A: `Singly ionised helium atom (He + )`, B: `Deuteron atom`, C: `Singly ionised neon atom (Ne + )`, D: `Hydrogen atom`
    },
    {
        qNo: 4, topic: 'X-Rays (Properties)', year: '2020',
        text: `The total energy of an electron in the n th stationary orbit of the hydrogen atom can be obtained by. (2020-Covid)`,
        A: `n 2 13.6 E eV n = −`, B: `n 2 1.36 E eV n = −`, C: `2 n E 13.6 n eV = − ×`, D: `n 2 13.6 E eV n =`
    },
    {
        qNo: 5, topic: 'Bohr Model (Radius in nth Orbit)', year: '2019',
        text: `The total energy of an electron in n atom in an orbit is –3.4 eV. Its kinetic and potential energies are, respectively: (2019)`,
        A: `–3.4 eV, –3.4 eV`, B: `–3.4 eV, –6.8 eV`, C: `3.4 eV, –6.8 eV`, D: `3.4 eV, 3.4 eV`
    },
    {
        qNo: 6, topic: 'Thomson Model', year: '2018',
        text: `The ratio of kinetic energy to the total energy of an electron in a Bohr orbit of the hydrogen atom, is (2018)`,
        A: `2 : –1`, B: `1 : –1`, C: `1 : 1`, D: `1 : –2`
    },
    {
        qNo: 7, topic: 'de-Broglie\'s Explanation of Bohr\'s Quantization', year: '2017',
        text: `The ratio of wavelengths of the last line of Balmer series and the last line of Lyman series is: (2017-Delhi)`,
        A: `1`, B: `4`, C: `0.5`, D: `2`
    },
    {
        qNo: 8, topic: 'Bohr Model (Failure of Bohr\'s Theory)', year: '2016',
        text: `If an electron in a hydrogen atom jumps from the 3rd orbit to the 2nd orbit, it emits a photon of wavelength λ. When it jumps from the 4th orbit to the 3rd orbit, the corresponding wavelength of the photon will be: (2016 - II)`,
        A: `20 7 λ`, B: `20 13 λ`, C: `16 25 λ`, D: `9 16 λ`
    },
    {
        qNo: 9, topic: 'Bohr Model (Energy of Electron in nth Orbit)', year: '2016',
        text: `Given the value of Rydberg constant is 10 7 m –1 , the wave number of the last line of the Balmer series in hydrogen spectrum will be: (2016 - I)`,
        A: `0.025 × 10 4 m –1`, B: `0.5 × 10 7 m –1`, C: `0.25 × 10 7 m –1`, D: `2.5 × 10 7 m –1`
    },
    {
        qNo: 10, topic: 'Hydrogen Spectrum', year: '2015',
        text: `Consider 3rd orbit of He + (Helium) using non relativistic approach the speed of electron in this orbit will be (given K = 9 × 10 9 constant Z = 2 and h (Planck’s constant) = 6.6 × 10 –34 Js): (2015)`,
        A: `1.46 × 10 6 m/s`, B: `0.73 × 10 6 m/s`, C: `3.0 × 10 8 m/s`, D: `2.92 × 10 6 m/s`
    },
    {
        qNo: 11, topic: 'X-Rays (Properties)', year: '2015 Pre',
        text: `In the spectrum of hydrogen, the ratio of the longest wavelength in the Lyman series to the longest wavelength in the Balmer series is: (2015 Pre)`,
        A: `5/27`, B: `4/9`, C: `9/4`, D: `27/5 12 C H A P T E R Atoms Chapter & Topicwise NEET PYQ's P W 2`
    },
    {
        qNo: 12, topic: 'Bohr Model (Radius in nth Orbit)', year: '2014',
        text: `Hydrogen atom in ground state is excited by a monochromatic radiation of λ = 975 Å. Number of spectral lines in the resulting spectrum emitted will be: (2014)`,
        A: `3`, B: `2`, C: `6`, D: `10`
    },
    {
        qNo: 13, topic: 'Thomson Model', year: '2013',
        text: `Ratio of longest wavelengths corresponding to Lyman and Balmer series in hydrogen spectrum is: (2013)`,
        A: `9/31`, B: `5/27`, C: `3/ 23`, D: `7/29 1 2 3 4 5 6 7 8 9 10 11 12 13 a a c a c b b a c a a c b Answer Key`
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
