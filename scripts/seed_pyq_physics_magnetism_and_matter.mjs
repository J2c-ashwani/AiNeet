/**
 * Seed REAL NEET PYQs — Chapter: Magnetism and Matter (Physics)
 * Usage: node scripts/seed_pyq_physics_magnetism_and_matter.mjs
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

const CHAPTER_NAME = 'Magnetism and Matter';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'Magnetic Susceptibility',
    'Magnetic Permeability',
    'Magnetism and Gauss\'s Law',
    'Diamagnetism, Paramagnetism, Ferromagnetism',
    'Bar Magnet (Angular SHM, Tangent Law)',
    'Bar Magnet (Magnetic Dipole Moment, Field)'
];

const ANSWER_KEY = {
    1: 'C', 2: 'C', 3: 'D', 4: 'D', 5: 'C', 6: 'D', 7: 'D', 8: 'C', 9: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Magnetic Susceptibility', year: '2014',
        text: `Following figures show the arrangement of bar magnets in different configurations. Each magnet has magnetic dipole moment m . Which configuration has highest net magnetic dipole moment? (2014) A. B. C. D.`,
        A: `A`, B: `B`, C: `C`, D: `D`
    },
    {
        qNo: 2, topic: 'Magnetic Permeability', year: '2013',
        text: `A bar magnet of length l and magnetic dipole moment M is bent in the form of an arc as shown in figure. The new magnetic dipole moment will be: (2013)`,
        A: `2M`, B: `M`, C: `3M/π`, D: `π/2 M Torque Acting On a Magnetic Dipole and Potential Energy of Dipole in a Magnetic Field`
    },
    {
        qNo: 3, topic: 'Magnetism and Gauss\'s Law', year: '2017',
        text: `A 250 turn rectangular coil of length 2.1 cm and width 1.25 cm carries a current of 85 μA and subjected to a magnetic field of strength 0.85 T. Work done for rotating the coil by 180° against the torque is: (2017-Delhi)`,
        A: `4.55 μJ`, B: `2.3 μJ`, C: `1.15 μJ`, D: `9.1 μJ`
    },
    {
        qNo: 4, topic: 'Diamagnetism, Paramagnetism, Ferromagnetism', year: '2016',
        text: `A bar magnet is hung by a thin cotton thread in a uniform horizontal magnetic field and is in equilibrium state. The energy required to rotate it by 60° is W. Now the torque required to keep the magnet in this new position is: (2016 - II)`,
        A: `3 2 W`, B: `2 3 W`, C: `W 3`, D: `3W Magnetic Elements of Earth`
    },
    {
        qNo: 5, topic: 'Bar Magnet (Angular SHM, Tangent Law)', year: '2019',
        text: `At a point A on the earth’s surface the angle of dip, δ = +25°. At a point B on the earth’s surface the angle of dip, δ = –25°. We can interpret that: [RC] (2019)`,
        A: `A and B are both located in the northern hemisphere.`, B: `A is located in the southern hemisphere and B is located in the northern hemisphere.`, C: `A is located in the northern hemisphere and B is located in the southern hemisphere.`, D: `A and B are both located in the southern hemisphere.`
    },
    {
        qNo: 6, topic: 'Bar Magnet (Magnetic Dipole Moment, Field)', year: '2017',
        text: `If θ 1 and θ 2 be the apparent angles of dip observed in two vertical planes at right angles to each other, then the true angle of dip θ is given by: [RC] (2017-Delhi)`,
        A: `2 2 2 1 2 tan tan tan θ = θ + θ`, B: `2 2 2 1 2 cot cot cot θ = θ − θ`, C: `2 2 2 1 2 tan tan tan θ = θ − θ`, D: `2 2 2 1 2 cot cot cot θ = θ + θ Magnetic Properties of Materials`
    },
    {
        qNo: 7, topic: 'Magnetic Susceptibility', year: '2020',
        text: `An iron rod of susceptibility 599 is subjected to a magnetising field of 1200 A m –1 . The permeability of the material of the rod is : (2020) ( m 0 = 4 p × 10 –7 T m A –1 )`,
        A: `8.0 × 10 –5 T m A –1`, B: `2.4 p × 10 –5 T m A –1`, C: `2.4 p × 10 –7 T m A –1`, D: `2.4 p × 10 –4 T m A –1 5 C H A P T E R Magnetism and Matter Chapter & Topicwise NEET PYQ's P W 2`
    },
    {
        qNo: 8, topic: 'Magnetic Permeability', year: '2018',
        text: `A thin diamagnetic rod is placed vertically between the poles of an electromagnet. When the current in the electromagnet is switched on, then the diamagnetic rod is pushed up, out of the horizontal magnetic field. Hence the rod gains gravitational potential energy. The work required to do this comes from: (2018)`,
        A: `The lattice structure of the material of the rod`, B: `The magnetic field`, C: `The current source`, D: `The induced electric field due to the changing magnetic field`
    },
    {
        qNo: 9, topic: 'Magnetism and Gauss\'s Law', year: '2016',
        text: `The magnetic susceptibility is negative for: (2016 - I)`,
        A: `Diamagnetic material only`, B: `Paramagnetic material only`, C: `Ferromagnetic material only`, D: `Paramagnetic and ferromagnetic materials 1 2 3 4 5 6 7 8 9 c c d d c d d c a Answer Key`
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
