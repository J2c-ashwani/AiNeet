/**
 * Seed REAL NEET PYQs — Chapter: Electric Charges and Fields (Physics)
 * Usage: node scripts/seed_pyq_physics_electric_charges_and_fields.mjs
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

const CHAPTER_NAME = 'Electric Charges and Fields';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'Electric Field',
    'Dipole in Non-Uniform External Field',
    'Electric Dipole (Axis)',
    'Electric Flux',
    'Charging Methods (Induction, Friction, Conduction)'
];

const ANSWER_KEY = {
    1: 'B', 2: 'B', 3: 'C', 4: 'C', 5: 'C', 6: 'A', 7: 'A', 8: 'B', 9: 'B', 10: 'C', 11: 'D', 12: 'D', 13: 'C', 14: 'B'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Electric Field', year: '2020',
        text: `The acceleration of an electron due to the mutual attraction between the electron and a proton when they are 1.6 Å apart is. (2020-Covid) (m e ~ 9 × 10 –31 kg, e = 1.6 × 10 –19 C) 9 2 2 0 1 (Take 9 10 N m C ) 4 − = × π ∈`,
        A: `10 23 m/s 2`, B: `10 22 m/s 2`, C: `10 25 m/s 2`, D: `10 24 m/s 2`
    },
    {
        qNo: 2, topic: 'Dipole in Non-Uniform External Field', year: '2017',
        text: `Suppose the charge of a proton and an electron differ slightly. One of them is –e, the other is (e + ∆e) If the net of electrostatic force and gravitational force between two hydrogen atoms placed at a distance d (much greater than atomic size) apart is zero, then ∆e is of the order of [Given mass of hydrogen m h = 1.67 × 10 –27 kg] (2017-Delhi)`,
        A: `10 –23 C`, B: `10 –37 C`, C: `10 –47 C`, D: `10 –20 C`
    },
    {
        qNo: 3, topic: 'Electric Dipole (Axis)', year: '2016',
        text: `Two identical charged spheres suspended from a common point by two massless strings of lengths l , are initially at a distance d (d << l) apart because of their mutual repulsion. The charges begin to leak from both the spheres at a constant rate. As a result, the spheres approach each other with a velocity V . Then V varies as a function of the distance x between the spheres, as: (2016 - I)`,
        A: `∝ 1 2 V x`, B: `V ∝ x`, C: `− ∝ 1 2 V x`, D: `V ∝ x -1`
    },
    {
        qNo: 4, topic: 'Electric Flux', year: '2013',
        text: `Two pith balls carrying equal charges are suspended from a common point by strings of equal length, the equilibrium separation between them is r. Now the strings are rigidly clamped at half the height. The equilibrium separation between the balls now become: (2013)`,
        A: `2r 3      `, B: `2 1 2      `, C: `3 r 2      `, D: `2r 3       Electric Field and Relation Between Electric Intensity and Force`
    },
    {
        qNo: 5, topic: 'Charging Methods (Induction, Friction, Conduction)', year: '2022',
        text: `Two point charges –q and +q are placed at a distance of L, as shown in the figure –q +q L The magnitude of electric field intensity at a distance R (R >> L) varies as (2022)`,
        A: `6 1 R`, B: `2 1 R`, C: `3 1 R`, D: `4 1 R`
    },
    {
        qNo: 6, topic: 'Electric Field', year: '2021',
        text: `A dipole is placed in an electric field as shown. In which direction will it move? (2021) +q – q E  `,
        A: `towards the right as its potential energy will decrease.`, B: `towards the left as its potential energy will decrease.`, C: `towards the right as its potential energy will increase.`, D: `towards the left as its potential energy will increase.`
    },
    {
        qNo: 7, topic: 'Dipole in Non-Uniform External Field', year: '2020',
        text: `A spherical conductor of radius 10 cm has a charge of 3.2 × 10 –7 C distributed uniformly. What is the magnitude of electric field at a point 15 cm from the centre of the sphere? (2020) 1 C H A P T E R Electric Charges and Fields Chapter & Topicwise NEET PYQ's P W 2 9 2 2 0 1 9 10 N m /C 4   = ×   π ∈  `,
        A: `1.28 × 10 5 N/C`, B: `1.28 × 10 6 N/C`, C: `1.28 × 10 7 N/C`, D: `1.28 × 10 4 N/C`
    },
    {
        qNo: 8, topic: 'Electric Dipole (Axis)', year: '2019',
        text: `A hollow metal sphere of radius R is uniformly charged. The electric field due to the sphere at a distance r from the centre (2019)`,
        A: `Increases as r increases for r < R and for r > R`, B: `Zero as r increases for r < R, decreases as r increases for r > R`, C: `Zero as r increases for r < R, increases as r increases for r > R`, D: `Decreases as r increases for r < R and for r > R`
    },
    {
        qNo: 9, topic: 'Electric Flux', year: '2019',
        text: `Two point charges A and B, having charges +Q and –Q respectively, are placed at certain distance apart and force acting between them is F. If 25% charge of A is transferred to B, then force between the charges becomes: (2019)`,
        A: `F`, B: `9F 16`, C: `16F 9`, D: `4F 3`
    },
    {
        qNo: 10, topic: 'Charging Methods (Induction, Friction, Conduction)', year: '2018',
        text: `An electron falls from rest through a vertical distance h in a uniform and vertically upward directed electric field E. The direction of electric field is now reversed, keeping its magnitude the same. A proton is allowed to fall from rest in it through the same vertical distance h. The time of fall of the electron, in comparison to the time of fall of the proton is (2018)`,
        A: `10 times greater`, B: `5 times greater`, C: `Smaller`, D: `Equal Electric dipole, Dipole Moment`
    },
    {
        qNo: 11, topic: 'Electric Field', year: '2020',
        text: `The electric field at a point on the equatorial plane at a distance r from the centre of a dipole having dipole moment P  is given by, (r >> separation of two charges forming the dipole, ∈ 0 - permittivity of free space) (2020-Covid)`,
        A: `3 0 2P E 4 r = π ∈  `, B: `2 0 P E 4 r = − π ∈  `, C: `4 r = − π ∈  `, D: `3 0 P E 4 r = π ∈  `
    },
    {
        qNo: 12, topic: 'Dipole in Non-Uniform External Field', year: '2016',
        text: `An electric dipole is placed at an angle of 30° with an electric field intensity 2 × 10 5 N/C. It experiences a torque equal to 4 Nm. The charge on the dipole, if the dipole length is 2 cm, is: (2016 - II)`,
        A: `5 mC`, B: `7 mC`, C: `8 mC`, D: `2 mC Electric Flux and Gauss’s Law`
    },
    {
        qNo: 13, topic: 'Electric Dipole (Axis)', year: '2019',
        text: `Two parallel infinite line charges with linear charge densities +λ C/m and –λ C/m are placed at a distance of 2R in free space. What is the electric field mid-way between the two line charges? (2019)`,
        A: `Zero`, B: `0 2 N / C R λ πε`, C: `0 N / C R λ πε`, D: `0 N / C 2 R λ πε`
    },
    {
        qNo: 14, topic: 'Electric Flux', year: '2015',
        text: `The electric field in a certain region is acting radially outward and is given by E = Ar. A charge contained in a sphere of radius ‘a’ centered at the origin of the field, will be given by: (2015)`,
        A: `Aε 0 a 2`, B: `4 π ε 0 Aa 3`, C: `ε 0 Aa 3`, D: `4 π ε 0 Aa 2 1 2 3 4 5 6 7 8 9 10 11 12 13 14 b b c c c a a b b c d d c b Answer Key`
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
