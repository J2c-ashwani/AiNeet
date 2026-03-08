/**
 * Seed REAL NEET PYQs — Chapter: Wave Motion (Physics)
 * Usage: node scripts/seed_pyq_physics_wave_motion.mjs
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

const CHAPTER_NAME = 'Wave Motion';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'General'
];

const ANSWER_KEY = {
    1: 'B', 2: 'B', 3: 'D', 4: 'A', 5: 'C', 6: 'B', 7: 'A', 8: 'D', 9: 'C', 10: 'B', 11: 'A', 12: 'D', 13: 'A', 14: 'A', 15: 'A', 16: 'B', 17: 'B', 18: 'A', 19: 'A', 20: 'A', 21: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'General', year: '2013',
        text: `A wave travelling in the +ve x-direction having displacement along y-direction as 1 m, wavelength 2 π m and frequency of 1/ π Hz is represented by: (2013)`,
        A: `y = sin(2 π x + 2 π t)`, B: `y = sin(x – 2t)`, C: `y = sin (2 π x – 2 π t)`, D: `y = sin(10 π x – 20 π t) Superposition of Waves, Interference and Reflection of Wave`
    },
    {
        qNo: 2, topic: 'General', year: '2016',
        text: `A uniform rope of length L and mass m 1 hangs vertically from a rigid support. A block of mass m 2 is attached to the free end of the rope. A transverse pulse of wavelength λ 1 is produced at the lower end of the rope. The wavelength of the pulse when it reaches the top of the rope is λ 2 . The ratio λ 2 /λ 1 is: (2016 - I)`,
        A: `1 2 m m`, B: `1 2 2 m m m +`, C: `2 2 m m`, D: `1 2 1 m m m + Vibration of String and Organ Pipe`
    },
    {
        qNo: 3, topic: 'General', year: '2022',
        text: `If the initial tension on a stretched string is doubled, then the ratio of the initial and final speed of a transverse wave along the string is: (2022)`,
        A: `1 : 2`, B: `1 : 1`, C: `2 :1`, D: `1: 2`
    },
    {
        qNo: 4, topic: 'General', year: '2020',
        text: `The length of the string of a musical instrument is 90 cm and has a fundamental frequency of 120 Hz. Where should it be pressed to produce fundamental frequency of 180 Hz? (2020-Covid)`,
        A: `60 cm`, B: `45 cm`, C: `80 cm`, D: `75 cm`
    },
    {
        qNo: 5, topic: 'General', year: '2018',
        text: `The fundamental frequency in an open organ pipe is equal to the third harmonic of a closed organ pipe. If the length of the closed organ pipe is 20 cm, the length of the open organ pipe is: (2018)`,
        A: `12.5 cm`, B: `8 cm`, C: `13.2 cm`, D: `16 cm`
    },
    {
        qNo: 6, topic: 'General', year: '2018',
        text: `A tuning fork is used to produce resonance in a glass tube. The length of the air column in this tube can be adjusted by a variable piston. At room temperature of 27°C two successive resonances are produced at 20 cm and 73 cm of column length. If the frequency of the tuning fork is 320 Hz, the velocity of sound in air at 27°C is: (2018)`,
        A: `350 m/s`, B: `339 m/s`, C: `330 m/s`, D: `350 m/s`
    },
    {
        qNo: 7, topic: 'General', year: '2017',
        text: `The two nearest harmonics of a tube closed at one end and open at other end are 220 Hz and 260 Hz. What is the fundamental frequency of the system? (2017-Delhi)`,
        A: `20 Hz`, B: `30 Hz`, C: `40 Hz`, D: `10 Hz`
    },
    {
        qNo: 8, topic: 'General', year: '2016',
        text: `The second overtone of an open organ pipe has the same frequency as the first overtone of a closed pipe L meter long. The length of the open pipe will be: (2016 - II)`,
        A: `L 2`, B: `4 L`, C: `L`, D: `2 L`
    },
    {
        qNo: 9, topic: 'General', year: '2016',
        text: `An air column, closed at one end and open at the other, resonates with a tuning fork when the smallest length of the column is 50 cm. The next larger length of the column resonating with the same tuning fork is: (2016 - I)`,
        A: `66.7 cm`, B: `100 cm`, C: `150 cm`, D: `200 cm`
    },
    {
        qNo: 10, topic: 'General', year: '2015',
        text: `The fundamental frequency of a closed organ pipe of length 20 cm is equal to the second overtone of an organ pipe open at both the ends. The length of organ pipe open at both the ends is: (2015)`,
        A: `100 cm`, B: `120 cm`, C: `140 cm`, D: `80 cm 14 C H A P T E R Waves Waves 2`
    },
    {
        qNo: 11, topic: 'General', year: '2015 Re',
        text: `A string is stretched between fixed points separated by 75.0 cm. It is observed to have resonant frequencies of 420 Hz and 315 Hz. There are no other resonant frequencies between these two. The lowest resonant frequencies for this string is: (2015 Re)`,
        A: `105 Hz`, B: `155 Hz`, C: `205 Hz`, D: `10.5 Hz`
    },
    {
        qNo: 12, topic: 'General', year: '2014',
        text: `The number of possible natural oscillations of air column in a pipe closed at one end of length 85 cm whose frequencies lie below 1250 Hz are (velocity of sound = 340 ms –1 ): (2014)`,
        A: `4`, B: `5`, C: `7`, D: `6`
    },
    {
        qNo: 13, topic: 'General', year: '2014',
        text: `If n 1 , n 2 and n 3 are the fundamental frequencies of three segments into which a string is divided, then the original fundamental frequency n of the string is given by: (2014)`,
        A: `1 2 3 1 1 1 1 n n n n = + +`, B: `1 2 3 1 1 1 1 n n n n = + +`, C: `1 2 3 n n n n = + +`, D: `n = n 1 + n 2 + n 3`
    },
    {
        qNo: 14, topic: 'General', year: '2013',
        text: `If we study the vibration of a pipe open at both ends, then the following statement is not true: (2013)`,
        A: `Pressure change will be maximum at both ends`, B: `Open end will be anti-node`, C: `Odd harmonics of the fundamental frequency will be generated`, D: `All harmonics of the fundamental frequency will be generated Beats`
    },
    {
        qNo: 15, topic: 'General', year: '2020',
        text: `In a guitar, two strings A and B made of same material are slightly out of tune and produce beats of frequency 6 Hz. When tension in B is slightly decreased, the beat frequency increases to 7 Hz. If the frequency of A is 530 Hz, the original frequency of B will be: (2020)`,
        A: `524 Hz`, B: `536 Hz`, C: `537 Hz`, D: `523 Hz`
    },
    {
        qNo: 16, topic: 'General', year: '2016',
        text: `Three sound waves of equal amplitudes have frequencies (n – 1), n, (n + 1). They superimpose to give beats. The number of beats produced per second will be: (2016 - II)`,
        A: `3`, B: `2`, C: `1`, D: `4`
    },
    {
        qNo: 17, topic: 'General', year: '2013',
        text: `A source of unknown frequency gives 4 beats/s, when sounded with a source of known frequency 250 Hz. The second harmonic of the source of unknown frequency gives five beats per second, when sounded with a source of frequency 513 Hz. The unknown frequency is: (2013)`,
        A: `260 Hz`, B: `254 Hz`, C: `246 Hz`, D: `240 Hz Musical Sound and Doppler’s Effect`
    },
    {
        qNo: 18, topic: 'General', year: '2017',
        text: `Two cars moving in opposite directions approach each other with speed of 22 m/s and 16.5 m/s respectively. The driver of the first car blows a horn having a frequency 400 Hz. The frequency heard by the driver of the second car is [velocity of sound 340 m/s]: [RC] (2017-Delhi)`,
        A: `361 Hz`, B: `411 Hz`, C: `448 Hz`, D: `350 Hz`
    },
    {
        qNo: 19, topic: 'General', year: '2016',
        text: `A siren emitting a sound of frequency 800 Hz moves away from an observer towards a cliff at a speed of 15 ms –1 . Then, the frequency of sound that the observer hears in the echo reflected from the cliff is: [RC] (2016 - I) (Take velocity of sound in air = 330 ms –1 )`,
        A: `765 Hz`, B: `800 Hz`, C: `838 Hz`, D: `885 Hz`
    },
    {
        qNo: 20, topic: 'General', year: '2015 Re',
        text: `A source of sound S emitting waves of frequency 100 Hz and an observer O are located at some distance from each other. The source is moving with a speed of 19.4 ms –1 at an angle of 60° with the source observer line as shown in the figure. The observer is at rest. The apparent frequency observed by the observer (velocity of sound in air 330 ms –1 ) is: [RC] (2015 Re)`,
        A: `106 Hz`, B: `97 Hz`, C: `103 Hz`, D: `100 Hz`
    },
    {
        qNo: 21, topic: 'General', year: '2014',
        text: `A speeding motorcyclist sees traffic jam ahead him. He slows down to 36 km hour –1 . He finds that traffic has eased and a car moving ahead of him at 18 km hour –1 is honking at a frequency of 1392 Hz. If the speed of sound is 343 ms –1 , the frequency of the honk as heard by him will be [RC] (2014)`,
        A: `1332 Hz`, B: `1372 Hz`, C: `1412 Hz`, D: `1454 Hz Answer Key 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 b b d a c b a d c b a d a a a b b 18 19 20 21 c c c c`
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
