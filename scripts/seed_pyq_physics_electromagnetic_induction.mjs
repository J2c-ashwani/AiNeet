/**
 * Seed REAL NEET PYQs — Chapter: Electromagnetic Induction (Physics)
 * Usage: node scripts/seed_pyq_physics_electromagnetic_induction.mjs
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

const CHAPTER_NAME = 'Electromagnetic Induction';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'Mutual Inductance (Coaxial Solenoids)',
    'Magnetic Flux',
    'Faraday\'s Law (Lenz\'s Law)',
    'Inductor (Energy Stored)',
    'Self-Inductance'
];

const ANSWER_KEY = {
    1: 'C', 2: 'A', 3: 'D', 4: 'B', 5: 'D', 6: 'C', 7: 'D', 8: 'D', 9: 'D', 10: 'B', 11: 'D', 12: 'D', 13: 'D', 14: 'D', 15: 'C', 16: 'B'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Mutual Inductance (Coaxial Solenoids)', year: '2022',
        text: `A square loop of side 1 m and resistance 1 W is placed in a magnetic field of 0.5T. If the plane of loop of perpendicular to the direction of a magnetic field, the magnetic flux through the loop is: (2022)`,
        A: `zero weber`, B: `2 weber`, C: `0.5 weber`, D: `1 weber`
    },
    {
        qNo: 2, topic: 'Magnetic Flux', year: '2020',
        text: `The magnetic flux linked with a coil (in Wb) is given by the equation ϕ = 5t 2 + 3t + 16 The magnitude of induced emf in the coil at the fourth second will be (2020-Covid)`,
        A: `43 V`, B: `108 V`, C: `10 V`, D: `33 V`
    },
    {
        qNo: 3, topic: 'Faraday\'s Law (Lenz\'s Law)', year: '2019',
        text: `A 800 turn coil of effective area 0.05 m 2 is kept perpendicular to a magnetic field of 5 × 10 –5 T. When the plane of the coil is rotated by 90° around any of its coplanar axis in 0.1 s, the emf induced in the coil will be: (2019)`,
        A: `2 V`, B: `0.2 V`, C: `2 × 10 –3 V`, D: `0.02 V`
    },
    {
        qNo: 4, topic: 'Inductor (Energy Stored)', year: '2015',
        text: `A conducting square frame of side a and a long straight wire carrying current I are located in the same plane as shown in the figure. The frame moves to the right with a constant velocity V. The emf induced in the frame will be proportional to: (2015)`,
        A: `( ) 2 1 2x a −`, B: `( )( ) 1 2x a 2x a − +`, C: `( )( ) 1 2x 2a 2x a + +`, D: `2 1 x Lenz’s Law`
    },
    {
        qNo: 5, topic: 'Self-Inductance', year: '2015 Pre',
        text: `An electron moves on a straight line path XY as shown. The abcd is a coil adjacent to the path of electron. What will be the direction of current, if any, induced in the coil? (2015 Pre)`,
        A: `No current induced`, B: `abcd`, C: `adcd`, D: `The current will reverse its direction as the electron goes past the coil`
    },
    {
        qNo: 6, topic: 'Mutual Inductance (Coaxial Solenoids)', year: '2013',
        text: `A wire loop is rotated in a magnetic field. The frequency of change of direction of the induced e.m.f. is: (2013)`,
        A: `Six times per revolution`, B: `Once per revolution`, C: `Twice per revolution`, D: `Four times per revolution Motional E.M.F.`
    },
    {
        qNo: 7, topic: 'Magnetic Flux', year: '2022',
        text: `A big circular coil of 100 turns and average radius 10 m is rotating about its horizontal diameter at 2 rad s –1 . If the vertical component of earth’s magnetic field at that place is 2 × 10 –5 T and electrical resistance of the coil is 12.56 W , then the maximum induced current in the coil will be : (2022)`,
        A: `2A`, B: `0.25 A`, C: `1.5 A`, D: `1 A`
    },
    {
        qNo: 8, topic: 'Faraday\'s Law (Lenz\'s Law)', year: '2020',
        text: `A wheel with 20 metallic spokes each 1 m long is rotated with a speed of 120 rpm in a plane perpendicular to a magnetic field of 0.4 G. The induced emf between the axle and rim of the wheel will be. (1 G = 10 –4 T) (2020-Covid)`,
        A: `2.51 × 10 –5 V`, B: `4.0 × 10 –5 V`, C: `2.51 V`, D: `2.51 × 10 –4 V 6 C H A P T E R Electromagnetic Induction Chapter & Topicwise NEET PYQ's P W 2`
    },
    {
        qNo: 9, topic: 'Inductor (Energy Stored)', year: '2018',
        text: `A metallic rod of mass per unit length 0.5 kg m –1 is lying horizontally on a smooth inclined plane which makes an angle of 30° with the horizontal. The rod is not allowed to slide down by flowing a current through it when a magnetic field of induction 0.25 T is acting on it in the vertical direction. The current flowing in the rod to keep it stationary is (2018)`,
        A: `14.76 A`, B: `5.98 A`, C: `7.14 A`, D: `11.32 A`
    },
    {
        qNo: 10, topic: 'Self-Inductance', year: '2016',
        text: `A uniform magnetic field is restricted within a region of radius r. The magnetic field changes with time at a rate dB . dt  Loop 1 of radius R > r encloses the region r and loop 2 of radius R is outside the region of magnetic field as shown in the figure below. Then the e.m.f generated is: (2016-II)`,
        A: `2 dB R dt − π  in loop 1 and zero in loop 2`, B: `2 dB r dt − π  in loop 1 and zero in loop 2`, C: `Zero in loop 1 and zero in loop 2`, D: `2 dB r dt − π  in loop 1 and 2 dB r dt − π  in loop 2`
    },
    {
        qNo: 11, topic: 'Mutual Inductance (Coaxial Solenoids)', year: '2014',
        text: `A thin semicircular conducting ring (PQR) of radius r is falling with its plane vertical in a horizontal magnetic field B, as shown in figure. The potential difference developed across the ring when its speed is v, is: (2014)`,
        A: `Zero`, B: `Bv π r 2 /2 and P is at higher potential`, C: `π rBv and R is at higher potential`, D: `2rBv and R is at higher potential Eddy Currents`
    },
    {
        qNo: 12, topic: 'Magnetic Flux', year: '2019',
        text: `In which of the following devices, the eddy current effect is not used? (2019)`,
        A: `Induction furnace`, B: `Magnetic braking in train`, C: `Electromagnet`, D: `Electric heater Self Induction`
    },
    {
        qNo: 13, topic: 'Faraday\'s Law (Lenz\'s Law)', year: '2016',
        text: `A long solenoid has 1000 turns. When a current of 4 A flows through it, the magnetic flux linked with each turn of the solenoid is 4 × 10 –3 Wb. The self inductance of the solenoid is: (2016-I)`,
        A: `4 H`, B: `3 H`, C: `2 H`, D: `1 H Energy Stored or Work Done in Inductor`
    },
    {
        qNo: 14, topic: 'Inductor (Energy Stored)', year: '2018',
        text: `The magnetic potential energy stored in a certain inductor is 25 mJ, when the current in the inductor is 60 mA. This inductor is of inductance: (2018)`,
        A: `1.389 H`, B: `138.88 H`, C: `0.138 H`, D: `13.89 H Mutual Induction`
    },
    {
        qNo: 15, topic: 'Self-Inductance', year: '2021',
        text: `Two conducting circular loops of radii R 1 and R 2 are placed in the same plane with their centres coinciding. If R 1 > > R 2 , the mutual inductance M between them will be directly proportional to: (2021)`,
        A: `2 1 R R`, B: `2 1 2 R R`, C: `2 2 1 R R`, D: `1 2 R R`
    },
    {
        qNo: 16, topic: 'Mutual Inductance (Coaxial Solenoids)', year: '2017',
        text: `A long solenoid of diameter 0.1 m has 2 × 10 4 turns per metre. At the centre of solenoid, a coil of 100 turns and radius 0.01 m is placed with its axis coinciding with the solenoid axis. The current in the solenoid reduces at a constant rate to 0 A from 4 A in 0.05 s. If the resistance of the coil is 10π 2 Ω, the total charge flowing through the coil during this time is: (2017-Delhi)`,
        A: `16 μC`, B: `32 μC`, C: `16π μC`, D: `32π μC Electromagnetic Induction 3 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 c a d b d c d d d b d d d d c b Answer Key`
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
