/**
 * Seed REAL NEET PYQs — Chapter: Atomic Structure (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_atomic_structure.mjs
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

const CHAPTER_NAME = 'Atomic Structure';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Bohr\'s Model For Hydrogen Atom',
    'Quantum Mechanical Model',
    'Atomic Terms and Quantum Numbers'
];

const ANSWER_KEY = {
    1: 'D', 2: 'D', 3: 'B', 4: 'C', 5: 'C', 6: 'B', 7: 'D', 8: 'A', 9: 'D', 10: 'A', 11: 'D', 12: 'A', 13: 'A', 14: 'C', 15: 'A', 16: 'A', 17: 'C', 18: 'D', 19: 'D', 20: 'D'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Bohr\'s Model For Hydrogen Atom', year: '2020',
        text: `The number of protons, neutrons and electrons in 175 Lu 71 , respectively, are : (2020)`,
        A: `104, 71 and 71`, B: `71, 71 and 104`, C: `175, 104 and 71`, D: `71, 104 and 71 Developments Leading to Bohr's Model of Atom`
    },
    {
        qNo: 2, topic: 'Quantum Mechanical Model', year: '2021',
        text: `A particular station of All India Radio, New Delhi, broadcasts on a frequency of 1,368 kHz (kilohertz). The wavelength of the electromagnetic radiation emitted by the transmitter is: [speed of light, c = 3.0 × 10 8 ms –1 ] (2021)`,
        A: `219.2 m`, B: `2192 m`, C: `21.92 cm`, D: `219.3 m`
    },
    {
        qNo: 3, topic: 'Atomic Terms and Quantum Numbers', year: '2019',
        text: `Which of the following series of transitions in the spectrum of hydrogen atom fall in visible region? (2019)`,
        A: `Lyman series`, B: `Balmer series`, C: `Paschen series`, D: `Brackett series`
    },
    {
        qNo: 4, topic: 'Bohr\'s Model For Hydrogen Atom', year: '2014',
        text: `Calculate the energy in joule corresponding to light of wavelength 45 nm (Planck’s constant h = 6.63 × 10 –34 Js; speed of light c = 3 × 10 8 ms –1 ) (2014)`,
        A: `6.67 × 10 11`, B: `4.42 × 10 –15`, C: `4.42 × 10 –18`, D: `6.67 × 10 15`
    },
    {
        qNo: 5, topic: 'Quantum Mechanical Model', year: '2013',
        text: `The value of Planck’s constant is 6.63 × 10 –34 Js. The speed of light is 3 × 10 8 ms –1 . Which value is closest to the wavelength in nanometer of a quantum of light with frequency of 6 × 10 15 s –1 ? (2013)`,
        A: `10 nm`, B: `25 nm`, C: `50 nm`, D: `75 nm Bohr's Model For Hydrogen Atom`
    },
    {
        qNo: 6, topic: 'Atomic Terms and Quantum Numbers', year: '2022',
        text: `If radius of second Bohr orbit of the He + ion is 105.8 pm, what is the radius of third Bohr orbit of Li 2+ ion? (2022)`,
        A: `158.7 Å`, B: `158.7 pm`, C: `15.87 pm`, D: `1.587 pm`
    },
    {
        qNo: 7, topic: 'Bohr\'s Model For Hydrogen Atom', year: '2013',
        text: `Based on equation, 2 18 2 Z E 2.178 10 J n −   = − ×     certain conclusions are written. Which of them is not correct? (2013)`,
        A: `The negative sign in equation simply means that the energy of electron bound to the nucleus is lower than it would be if the electrons were at the infinite distance from the nucleus.`, B: `Larger the value of n, the larger is the orbit radius.`, C: `Equation can be used to calculate the change in energy when the electron changes orbit.`, D: `For n = 1, the electron has a more negative energy than it does for n = 6 which means that the electron is more loosely bound in the smallest allowed orbit. Quantum Mechanical Model of Atom`
    },
    {
        qNo: 8, topic: 'Quantum Mechanical Model', year: '2022',
        text: `Identify the incorrect statements from the following. (2022)`,
        A: `The shapes of d xy , d yz , and d zx orbitals are similar to each other; and dx 2 – y 2 and d z 2 are similar to each other.`, B: `All the five 5d orbitals are different in size when compared to the respective 4d orbitals.`, C: `All the five 4d orbitals have shapes similar to the respective 3d orbitals.`, D: `In an atom, all the five 3d orbitals are equal in energy in free state.`
    },
    {
        qNo: 9, topic: 'Atomic Terms and Quantum Numbers', year: '2020',
        text: `The number of angular nodes and radial nodes in 3s orbital are (2020- Co vid)`,
        A: `1 and 0, respectively`, B: `3 and 0, respectively`, C: `0 and 1, respectively`, D: `0 and 2, respectively`
    },
    {
        qNo: 10, topic: 'Bohr\'s Model For Hydrogen Atom', year: '2019',
        text: `4d, 5p, 5f and 6p orbitals are arranged in the order of decreasing energy. The correct option is (2019)`,
        A: `5f > 6p > 5p > 4d`, B: `6p > 5f > 5p > 4d`, C: `6p > 5f > 4d > 5p`, D: `5f > 6p > 4d > 5p 2 C H A P T E R Atomic Structure Chapter & Topicwise NEET PYQ's P W 2`
    },
    {
        qNo: 11, topic: 'Quantum Mechanical Model', year: '2018',
        text: `Which one is a wrong statement? (2018)`,
        A: `Total orbital angular momentum of electron in ‘s’ orbital is equal to zero`, B: `An orbital is designated by three quantum numbers while an electron in an atom is designated by four quantum numbers`, C: `The value of m for d z 2 is zero`, D: `The electronic configuration of N atom is`
    },
    {
        qNo: 12, topic: 'Atomic Terms and Quantum Numbers', year: '2017',
        text: `Which one is the wrong statement? (2017-Delhi)`,
        A: `The energy of 2s orbital is less than the energy of 2p orbital in case of hydrogen like atoms`, B: `de-Broglie’s wavelength is given by h , mv λ = where m = mass of the particle, v = group velocity of the particle`, C: `The uncertainty principle is h E t 4 ∆ × ∆ ≥ π`, D: `Half-filled and fully filled orbitals have greater stability due to greater exchange energy, greater symmetry and more balanced arrangement`
    },
    {
        qNo: 13, topic: 'Bohr\'s Model For Hydrogen Atom', year: '2016',
        text: `Which of the following pairs of d-orbitals will have electron density along the axes? (2016 - II)`,
        A: `2 2 Z x y d , d −`, B: `2 2 xy x y d ,d −`, C: `Z xz d ,d`, D: `d xz , d yz`
    },
    {
        qNo: 14, topic: 'Quantum Mechanical Model', year: '2016',
        text: `How many electrons can fit in the orbital for which: n = 3 and l = 1? (2016 - II)`,
        A: `10`, B: `14`, C: `2`, D: `6`
    },
    {
        qNo: 15, topic: 'Atomic Terms and Quantum Numbers', year: '2016',
        text: `Two electrons occupying the same orbital are distinguished by: (2016 - I)`,
        A: `Spin quantum number`, B: `Principal quantum number`, C: `Magnetic quantum number`, D: `Azimuthal quantum number`
    },
    {
        qNo: 16, topic: 'Bohr\'s Model For Hydrogen Atom', year: '2015 Re',
        text: `Which is the correct order of increasing energy of the listed orbitals in the atom of titanium? (Atomic number Z = 22): (2015 Re)`,
        A: `3s 3p 4s 3d`, B: `3s 4s 3p 3d`, C: `4s 3s 3p 3d`, D: `3s 3p 3d 4s`
    },
    {
        qNo: 17, topic: 'Quantum Mechanical Model', year: '2015',
        text: `The angular momentum of electron in ‘ d ’ orbital is equal to: (2015)`,
        A: `2 3 `, B: `0 `, C: `6 `, D: `2 `
    },
    {
        qNo: 18, topic: 'Atomic Terms and Quantum Numbers', year: '2014',
        text: `What is the maximum number of orbitals that can be identified with the following quantum numbers: n = 3, l = l, m l = 0? (2014)`,
        A: `2`, B: `3`, C: `4`, D: `1`
    },
    {
        qNo: 19, topic: 'Bohr\'s Model For Hydrogen Atom', year: '2020',
        text: `What is the maximum number of electrons that can be associated with the following set of quantum numbers? n = 3, l = 1 and m = –`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 20, topic: 'Quantum Mechanical Model', year: '2013',
        text: `(2013)`,
        A: `10`, B: `6`, C: `4`, D: `2 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 d d b c c b d a d a d a a c a a c 18 19 d d Answer Key`
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
