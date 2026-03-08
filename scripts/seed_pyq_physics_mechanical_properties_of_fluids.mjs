/**
 * Seed REAL NEET PYQs — Chapter: Mechanical Properties of Fluids (Physics)
 * Usage: node scripts/seed_pyq_physics_mechanical_properties_of_fluids.mjs
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

const CHAPTER_NAME = 'Mechanical Properties of Fluids';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'Surface Tension (Capillary Rise)',
    'Viscosity (Terminal Velocity)',
    'Surface Tension (Bubbles Excess Pressure)',
    'Surface Tension (Surface Energy)',
    'Bernoulli\'s Equation (Pitot Tube)',
    'Surface Tension'
];

const ANSWER_KEY = {
    1: 'B', 2: 'B', 3: 'D', 4: 'C', 5: 'A', 6: 'C', 7: 'D', 8: 'A', 9: 'A', 10: 'A', 11: 'A', 12: 'A', 13: 'A', 14: 'A', 15: 'A', 16: 'A', 17: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Surface Tension (Capillary Rise)', year: '2020',
        text: `A barometer is constructed using a liquid (density = 760 kg/ m 3 ). What would be the height of the liquid column, when a mercury barometer reads 76 cm? (density of mercury = 13600 kg/m 3 ) (2020-Covid)`,
        A: `13.6 m`, B: `136 m`, C: `0.76 m`, D: `1.36 m`
    },
    {
        qNo: 2, topic: 'Viscosity (Terminal Velocity)', year: '2017',
        text: `A U tube with both ends open to the atmosphere, is partially filled with water. Oil, which is immiscible with water, is poured into one side until it stands at a distance of 10 mm above the water level on the other side. Meanwhile the water rises by 65 mm from its original level (see diagram). The density of the oil is: (2017-Delhi)`,
        A: `425 kg m –3`, B: `800 kg m –3`, C: `928 kg m –3`, D: `650 kg m –3`
    },
    {
        qNo: 3, topic: 'Surface Tension (Bubbles Excess Pressure)', year: '2016',
        text: `Two non-mixing liquids of densities ρ and n ρ (n > 1) are put in a container. The height of each liquid is h. A solid cylinder of length L and density d is put in this container. The cylinder floats with its axis vertical and length pL (p < 1) in the denser liquid. The density d is equal to: (2016 - I)`,
        A: `{1 + (n + 1)p} ρ`, B: `{2 + (n + 1)p} ρ`, C: `{2 + (n – 1)p} ρ`, D: `{1 + (n – 1)p} ρ Bernoulli's Theorem and its Application`
    },
    {
        qNo: 4, topic: 'Surface Tension (Surface Energy)', year: '2019',
        text: `A small hole of area of cross-section 2 mm 2 is present near the bottom of a fully filled open tank of height 2 m. Taking g = 10 m/s 2 , the rate of flow of water through the open hole would be nearly (2019)`,
        A: `12.6 × 10 –6 m 3 /s`, B: `8.9 × 10 –6 m 3 /s`, C: `2.23 × 10 –6 m 3 /s`, D: `6.4 × 10 –6 m 3 /s`
    },
    {
        qNo: 5, topic: 'Bernoulli\'s Equation (Pitot Tube)', year: '2015',
        text: `A wind with speed 40 m/s blows parallel to the roof of a house. The area of the roof is 250 m 2 . Assuming that the pressure inside the house is atmospheric pressure, the force exerted by the wind on the roof and the direction of the force will be (P air = 1.2 kg/m 3 ): (2015)`,
        A: `4.8 × 10 5 N, upwards`, B: `2.4 × 10 5 N, upwards`, C: `2.4 × 10 5 N, downwards`, D: `4.8 × 10 5 N, downwards Surface Tension and Surface Energy`
    },
    {
        qNo: 6, topic: 'Surface Tension', year: '2022',
        text: `If a soap bubble expands, the pressure inside the bubble: (2022)`,
        A: `is equal to the atmospheric pressure`, B: `decreases`, C: `increases`, D: `remains the same`
    },
    {
        qNo: 7, topic: 'Surface Tension (Capillary Rise)', year: '2019',
        text: `A soap bubble, having radius of 1 mm, is blown from a detergent solution having a surface tension of 2.5 × 10 –2 N/m. The pressure inside the bubble equals at a point Z 0 below the free surface of water in a container. Taking g = 10 m/s 2 , density of water = 10 3 kg/m 3 , the value of Z 0 is: (2019)`,
        A: `100 cm`, B: `10 cm`, C: `1 cm`, D: `0.5 cm`
    },
    {
        qNo: 8, topic: 'Viscosity (Terminal Velocity)', year: '2016',
        text: `A rectangular film of liquid is extended from (4 cm × 2 cm) to (5 cm × 4 cm). If the work done is 3 × 10 –4 J, the value of the surface tension of the liquid is: (2016 - II)`,
        A: `0.2 Nm –1`, B: `8.0 Nm –1`, C: `0.250 Nm –1`, D: `0.125 Nm –1 9 C H A P T E R Mechanical Properties of Fluids Mechanical Properties of Fluids 2`
    },
    {
        qNo: 9, topic: 'Surface Tension (Bubbles Excess Pressure)', year: '2014',
        text: `A certain number of spherical drops of a liquid of radius r coalesce to form a single drop of radius R and volume V. If ‘T’ is the surface tension of the liquid, then: (2014)`,
        A: `Energy 1 1 4VT r R   = −     is released`, B: `Energy 1 1 3VT r R   = +     is absorbed`, C: `Energy 1 1 3VT r R   = −     is released`, D: `Energy is neither released nor absorbed Angle of Contacts and Ascent/ Descent Formula`
    },
    {
        qNo: 10, topic: 'Surface Tension (Surface Energy)', year: '2020',
        text: `A liquid does not wet the solid surface if angle of contact is: (2020-Covid)`,
        A: `Equal to 60°`, B: `Greater than 90°`, C: `Zero`, D: `Equal to 45°`
    },
    {
        qNo: 11, topic: 'Bernoulli\'s Equation (Pitot Tube)', year: '2020',
        text: `A capillary tube of radius r is immersed in water and water rises in it to a height h . The mass of the water in the capillary is 5g. Another capillary tube of radius 2 r is immersed in water. The mass of water that will rise in this tube is: (2020)`,
        A: `5.0 g`, B: `10.0 g`, C: `20.0 g`, D: `2.5 g`
    },
    {
        qNo: 12, topic: 'Surface Tension', year: '2016',
        text: `Three liquids of densities ρ 1 , ρ 2 and ρ 3 (with ρ 1 > ρ 2 > ρ 3 ) having the same value of surface tension T, rise to the same height in three identical capillaries. The angles of contact obey: (2016 - II)`,
        A: `1 2 3 2 π < θ < θ < θ < π`, B: `1 2 3 2 π π > θ > θ > θ >`, C: `1 2 3 0 2 π > θ > θ > θ ≥`, D: `1 2 3 0 2 π ≤ θ < θ < θ <`
    },
    {
        qNo: 13, topic: 'Surface Tension (Capillary Rise)', year: '2015 Re',
        text: `Water rises to height ‘h’ in capillary tube. If the length of capillary tube above the surface of water is made less than ‘h’, then: (2015 Re)`,
        A: `Water does not rise at all.`, B: `Water rises up to the tip of capillary tube and then starts overflowing like a fountain.`, C: `Water rises up to the top of capillary tube and stays there without overflowing.`, D: `Water rises up to a point a little below the top and stays there.`
    },
    {
        qNo: 14, topic: 'Viscosity (Terminal Velocity)', year: '2013',
        text: `The wettability of a surface by a liquid depends primarily on: (2013)`,
        A: `Angle of contact between the surface and the liquid`, B: `Viscosity`, C: `Surface tension`, D: `Density Viscosity, Stoke's Law and Terminal Velocity`
    },
    {
        qNo: 15, topic: 'Surface Tension (Bubbles Excess Pressure)', year: '2022',
        text: `A spherical ball is dropped in a long column of a highly viscous liquid. The curve in the graph shown which represents the speed of the ball (v) as a function of time (t) is: (2022) C D A B v t`,
        A: `D`, B: `A`, C: `B`, D: `C`
    },
    {
        qNo: 16, topic: 'Surface Tension (Surface Energy)', year: '2021',
        text: `The velocity of a small ball of mass M and density d, when dropped in a container filled with glycerine becomes constant after some time. If the density of glycerine is d 2 , then the viscous force acting on the ball will be: (2021)`,
        A: `Mg`, B: `3 Mg 2`, C: `2 Mg`, D: `Mg 2`
    },
    {
        qNo: 17, topic: 'Bernoulli\'s Equation (Pitot Tube)', year: '2018',
        text: `A small sphere of radius ‘r’ falls from rest in a viscous liquid. As a result, heat is produced due to viscous force. The rate of production of heat when the sphere attains its terminal velocity, is proportional to: (2018)`,
        A: `r 5`, B: `r 2`, C: `r 3`, D: `r 4 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 a c d a b b c d c b b d c a c d a Answer Key`
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
