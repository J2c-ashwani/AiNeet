/**
 * Seed REAL NEET PYQs — Chapter: Oscillations (Physics)
 * Usage: node scripts/seed_pyq_physics_oscillations.mjs
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

const CHAPTER_NAME = 'Oscillations';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'Simple Harmonic Motion (Phase)',
    'Oscillations Due to a Spring',
    'Energy in SHM',
    'The Simple Pendulum',
    'Velocity and Acceleration in SHM',
    'SHM (Time Period and Frequency)'
];

const ANSWER_KEY = {
    1: 'D', 2: 'B', 3: 'B', 4: 'D', 5: 'D', 6: 'B', 7: 'B', 8: 'A', 9: 'A', 10: 'C', 11: 'A', 12: 'B', 13: 'C', 14: 'B', 15: 'B', 16: 'B', 17: 'B'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Simple Harmonic Motion (Phase)', year: '2020',
        text: `The phase difference between displacement and acceleration of a particle in a simple harmonic motion is: (2020)`,
        A: `3 2 π rad`, B: `2 π rad`, C: `Zero`, D: `p rad`
    },
    {
        qNo: 2, topic: 'Oscillations Due to a Spring', year: '2020',
        text: `Identify the function which represents a periodic motion. (2020-Covid)`,
        A: `log e (ωt)`, B: `sinωt + cosωt`, C: `e –ωt`, D: `e ωt`
    },
    {
        qNo: 3, topic: 'Energy in SHM', year: '2019',
        text: `The displacement of a particle executing simple harmonic motion is given by y = A 0 + Asinωt + Bcosωt Then the amplitude of its oscillation is given by: (2019)`,
        A: `2 2 0 A A B + +`, B: `2 2 A B +`, C: `( ) 2 2 0 A A B + +`, D: `A + B`
    },
    {
        qNo: 4, topic: 'The Simple Pendulum', year: '2019',
        text: `Average velocity of a particle executing SHM in one complete vibration is: (2019)`,
        A: `A 2 ω`, B: `Aω`, C: `2 A 2 ω`, D: `Zero`
    },
    {
        qNo: 5, topic: 'Velocity and Acceleration in SHM', year: '2019',
        text: `The radius of circle, the period of revolution, initial position and sense of revolution are indicated in the y - projection of the radius vector of rotating particle P is: (2019)`,
        A: `y(t) = –3 cos2πt, where y in m`, B: `y(t) = 4sin t 2 π       ,where y in m`, C: `y(t) = 3cos 3 t 2 π       ,where y in m`, D: `y(t) = 3cos t 2 π       ,where y in m`
    },
    {
        qNo: 6, topic: 'SHM (Time Period and Frequency)', year: '2017',
        text: `A particle executes linear simple harmonic motion with an amplitude of 3 cm. When the particle is at 2 cm from the mean position, the magnitude of its velocity is equal to that of its acceleration. Then its time period in seconds is: (2017-Delhi)`,
        A: `5 2 π`, B: `4 5 π`, C: `2 3 π`, D: `5 π`
    },
    {
        qNo: 7, topic: 'Simple Harmonic Motion (Phase)', year: '2015',
        text: `When two displacements represented by y 1 = a sin(ωt) and y 2 = b cos (ωt) are superimposed, the motion is: (2015)`,
        A: `Simple harmonic with amplitude a b`, B: `Simple harmonic with amplitude 2 2 a b +`, C: `Simple harmonic with amplitude ( ) a b 2 +`, D: `Not a simple harmonic`
    },
    {
        qNo: 8, topic: 'Oscillations Due to a Spring', year: '2015',
        text: `A particle is executing S.H.M. along a straight line. Its velocities at distances x 1 and x 2 from the mean position are v 1 and v 2 respectively. Its time period is: (2015)`,
        A: `2 2 2 1 2 2 1 2 x x 2 v v − π −`, B: `2 2 1 2 2 2 1 2 v v 2 x x − π +`, C: `2 2 1 2 2 2 1 2 v v 2 x x − π −`, D: `2 2 1 2 2 2 1 2 x x 2 v v + π + 13 C H A P T E R Oscillations Chapter & Topicwise NEET PYQ's P W 2`
    },
    {
        qNo: 9, topic: 'Energy in SHM', year: '2015 Re',
        text: `A particle is executing a simple harmonic motion. Its maximum acceleration is α and maximum velocity is β. Then, its time period of vibration will be: (2015 Re)`,
        A: `2 πβ α`, B: `2 2 β α`, C: `α β`, D: `2 β α`
    },
    {
        qNo: 10, topic: 'The Simple Pendulum', year: '2014',
        text: `The oscillation of a body on a smooth horizontal surface is represented by the equation, X = A cos(ωt) Where, X = displacement at time t ω = frequency of oscillation Which one of the following graphs shows correctly the variation a with t? (2014)`,
        A: `a. b. c. d. Here a = acceleration at time t T = time period Energy in SHM (P.E., K.E. and T.E.)`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 11, topic: 'Velocity and Acceleration in SHM', year: '2021',
        text: `A body is executing simple harmonic motion with frequency 'n', the frequency of its potential energy is: (2021)`,
        A: `2n`, B: `3n`, C: `4n`, D: `n Simple Pendulum and Loaded Springs`
    },
    {
        qNo: 12, topic: 'SHM (Time Period and Frequency)', year: '2022',
        text: `Two pendulums of length 121 cm and 100 cm start vibrating in phase. At some instant, the two are at their means position in the same phase. The minimum number of vibrations of the shorter pendulum after which the two are again in phase at the means position is: (2022)`,
        A: `8`, B: `11`, C: `9`, D: `10`
    },
    {
        qNo: 13, topic: 'Simple Harmonic Motion (Phase)', year: '2021',
        text: `A spring is stretched by 5 cm by a force 10 N. The time period of the oscillations when a mass of 2 kg is suspended by it is: (2021)`,
        A: `6.28 s`, B: `3.14 s`, C: `0.628 s`, D: `0.0628 s`
    },
    {
        qNo: 14, topic: 'Oscillations Due to a Spring', year: '2018',
        text: `A pendulum is hung from the roof of a sufficiently high building and is moving freely to and fro like a simple harmonic oscillator. The acceleration of the bob of the pendulum is 20 m/s 2 at a distance of 5 m from the mean position. The time period of oscillation is: (2018)`,
        A: `2s`, B: `π s`, C: `2π s`, D: `1 s`
    },
    {
        qNo: 15, topic: 'Energy in SHM', year: '2020',
        text: `A spring of force constant k is cut into lengths of ratio 1 : 2 :`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 16, topic: 'The Simple Pendulum', year: '2017',
        text: `They are connected in series and the new force constant is Kʹ. Then they are connected in parallel and force constant is Kʹʹ. Then K ʹ : K ʹʹ is: (2017-Delhi)`,
        A: `1 : 9`, B: `1 : 11`, C: `1 : 14`, D: `1 : 6`
    },
    {
        qNo: 17, topic: 'Velocity and Acceleration in SHM', year: '2016',
        text: `A body of mass m is attached to the lower end of a spring whose upper end is fixed. The spring has negligible mass. When the mass m is slightly pulled down and released, it oscillates with a time period of 3 s. When the mass m is increased by 1 kg, the time period of oscillations becomes 5 s. The value of m in kg is: (2016 - II)`,
        A: `16 9`, B: `9 16`, C: `3 4`, D: `4 3 Oscillations 3 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 d b b d d b b a a c a b c b b b Answer Key`
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
