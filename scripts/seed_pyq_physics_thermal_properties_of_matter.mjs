/**
 * Seed REAL NEET PYQs — Chapter: Thermal Properties of Matter (Physics)
 * Usage: node scripts/seed_pyq_physics_thermal_properties_of_matter.mjs
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

const CHAPTER_NAME = 'Thermal Properties of Matter';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'Heat Transfer (Conduction)',
    'Calorimetry (Principle of Calorimetry)'
];

const ANSWER_KEY = {
    1: 'A', 2: 'D', 3: 'A', 4: 'C', 5: 'D', 6: 'A', 7: 'B', 8: 'A', 9: 'A', 10: 'A', 11: 'A', 12: 'A', 13: 'B', 14: 'A', 15: 'A', 16: 'A', 17: 'A', 18: 'A', 19: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Heat Transfer (Conduction)', year: '2019',
        text: `A copper rod of 88 cm and an aluminium rod of unknown length have their increase in length independent of increase in temperature. The length of aluminium rod is : (2019) (α Cu =1.7 × 10 –5 K –1 and α Al = 2.2 × 10 –5 K –1 )`,
        A: `6.8 cm`, B: `113.9 cm`, C: `88 cm`, D: `68 cm`
    },
    {
        qNo: 2, topic: 'Calorimetry (Principle of Calorimetry)', year: '2016',
        text: `Coefficient of linear expansion of brass and steel rods are α 1 and α 2 . Lengths of brass and steel rods are l 1 and l 2 respectively. If ( l 2 – l 1 ) is maintained same at all temperatures, which one of the following relations holds good? (2016 - I)`,
        A: `α 1 l 2 = α 2 l 1`, B: `2 2 1 2 2 1 α = α l l`, C: `2 2 1 2 2 1 α = α l l`, D: `α 1 l 1 = α 2 l 2`
    },
    {
        qNo: 3, topic: 'Heat Transfer (Conduction)', year: '2015 Re',
        text: `The value of coefficient of volume expansion of glycerin is 5 × 10 -4 /K. The fractional change in the density of glycerin for a rise of 40°C in its temperature, is: (2015 Re)`,
        A: `0.010`, B: `0.015`, C: `0.020`, D: `0.025 Specific Heat, Latent Heat and Calorimetry`
    },
    {
        qNo: 4, topic: 'Calorimetry (Principle of Calorimetry)', year: '2020',
        text: `The quantities of heat required to raise the temperature of two solid copper spheres of radii r 1 and r 2 (r 1 = 1.5 r 2 ) through 1 K are in the ratio: (2020)`,
        A: `9 4`, B: `3 2`, C: `5 3`, D: `27 8`
    },
    {
        qNo: 5, topic: 'Heat Transfer (Conduction)', year: '2016',
        text: `A piece of ice falls from a height h so that it melts completely. Only one-quarter of the heat produced is absorbed by the ice and all energy of ice gets converted into heat during its fall. The value of h is [Latent heat of ice is 3.4 × 10 5 J/kg and g = 10 N/kg]: (2016 - I)`,
        A: `34 km`, B: `544 km`, C: `136 km`, D: `68 km`
    },
    {
        qNo: 6, topic: 'Calorimetry (Principle of Calorimetry)', year: '2016',
        text: `Two identical bodies are made of a material for which the heat capacity increases with temperature. One of these is at 100°C, while the other one is at 0°C. If the two bodies are brought into contact, then, assuming no heat loss, the final common temperature is: (2016 - II)`,
        A: `Less than 50°C but greater than 0°C`, B: `0°C`, C: `50°C`, D: `More than 50°C`
    },
    {
        qNo: 7, topic: 'Heat Transfer (Conduction)', year: '2014',
        text: `Steam at 100°C is passed into 20 g of water at 10°C. When water acquires a temperature of 80°C, the mass of water present will be: [Take specific heat of water = 1 cal /g /°C and latent heat of steam = 540 cal g –1 ]: (2014)`,
        A: `24 g`, B: `31.5 g`, C: `42.5 g`, D: `22.5 g Heat Transfer and Thermal Conductivity`
    },
    {
        qNo: 8, topic: 'Calorimetry (Principle of Calorimetry)', year: '2019',
        text: `The unit of thermal conductivity is : (2019)`,
        A: `J m K –1`, B: `J m –1 K –1`, C: `W m K –1`, D: `W m –1 K –1`
    },
    {
        qNo: 9, topic: 'Heat Transfer (Conduction)', year: '2017',
        text: `Two rods A and B of different material are welded together as shown in figure. Their thermal conductivities are K 1 and K 2 . The thermal conductivity of the composite rod will be: (2017-Delhi)`,
        A: `( ) 1 2 3 K K 2 +`, B: `K 1 + K 2`, C: `2(K 1 + K 2 )`, D: `1 2 K K 2 +`
    },
    {
        qNo: 10, topic: 'Calorimetry (Principle of Calorimetry)', year: '2015',
        text: `The two ends of a metal rod are maintained at temperatures 100°C and 110°C. The rate of heat flow in the rod is found to be 4.0 J/s. If the ends are maintained at temperatures 200°C and 210°C, the rate of heat flow will be: (2015)`,
        A: `16.8 J/s`, B: `8.0 J/s`, C: `4.0 J/s`, D: `44.0 J/s 10 C H A P T E R Thermal Properties of Matter Thermal Properties of Matter 2 Newton's Law of Cooling`
    },
    {
        qNo: 11, topic: 'Heat Transfer (Conduction)', year: '2021',
        text: `A cup of coffee cools from 90°C to 80°C in t minutes, when the room temperature is 20°C. The time taken by a similar cup of coffee to cool from 80° C to 60°C at a room temperature same at 20°C is: [RC] (2021)`,
        A: `13 t 5`, B: `10 t 13`, C: `5 t 13`, D: `13 t 10`
    },
    {
        qNo: 12, topic: 'Calorimetry (Principle of Calorimetry)', year: '2016',
        text: `A body cools from a temperature 3T to 2T in 10 minutes. The room temperature is T. Assume that Newton’s law of cooling is applicable. The temperature of the body at the end of next 10 minutes will be: [RC] (2016 - II)`,
        A: `4 T 3`, B: `T`, C: `7 T 4`, D: `3 T 2`
    },
    {
        qNo: 13, topic: 'Heat Transfer (Conduction)', year: '2014',
        text: `Certain quantity of water cools from 70°C to 60°C in the first 5 minutes and to 54°C in the next 5 minutes. The temperature of the surroundings is: [RC] (2014)`,
        A: `45°C`, B: `20°C`, C: `42°C`, D: `10°C Stefan's Law, Wien's Displacement Law, Kirchhoff's Law and Black Body`
    },
    {
        qNo: 14, topic: 'Calorimetry (Principle of Calorimetry)', year: '2020',
        text: `Three stars A, B, C have surface temperatures T A , T B , T C respectively. Star A appears bluish, star B appears reddish and star C yellowish. Hence, [RC] (2020-Covid)`,
        A: `T B > T C > T A`, B: `T C > T B > T A`, C: `T A > T C > T B`, D: `T A > T B > T C`
    },
    {
        qNo: 15, topic: 'Heat Transfer (Conduction)', year: '2018',
        text: `The power radiated by a black body is P and it radiates maximum energy at wavelength, λ 0 . If the temperature of the black body is now changed so that it radiates maximum energy at wavelength 0 3 4 λ , the power radiated by it becomes nP. The value of n is: [RC] (2018)`,
        A: `256 81`, B: `4 3`, C: `3 4`, D: `81 256`
    },
    {
        qNo: 16, topic: 'Calorimetry (Principle of Calorimetry)', year: '2017',
        text: `A spherical black body with a radius of 12 cm radiates 450 watt power at 500 K. If the radius were halved and the temperature doubled, the power radiated in watt would be: (2017-Delhi)`,
        A: `450`, B: `1000`, C: `1800`, D: `225`
    },
    {
        qNo: 17, topic: 'Heat Transfer (Conduction)', year: '2016',
        text: `A black body is at a temperature of 5760 K. The energy of radiation emitted by the body at wavelength 250 nm is U 1 , at wavelength 500 nm is U 2 and that at 1000 nm is U 3 . Wien’s constant, b = 2.88 × 10 6 nmK. Which of the following is correct? [RC] (2016 - I)`,
        A: `U 1 = 0`, B: `U 3 = 0`, C: `U 1 > U 2`, D: `U 2 > U 1`
    },
    {
        qNo: 18, topic: 'Calorimetry (Principle of Calorimetry)', year: '2015',
        text: `On observing light from three different stars P, Q and R, it was found that intensity of violet color is maximum in the spectrum of P, the intensity of green color is maximum in the spectrum of R and the intensity of red color is maximum in the spectrum of Q. If T P , T Q and T R are the respective absolute temperatures of P, Q and R then it can be concluded from the above observations that: [RC] (2015)`,
        A: `T P > T R > T Q`, B: `T P < T R < T Q`, C: `T P < T Q < T R`, D: `T P > T Q > T R`
    },
    {
        qNo: 19, topic: 'Heat Transfer (Conduction)', year: '2013',
        text: `A piece of iron is heated in a flame. It first becomes dull red then becomes reddish yellow and finally turns to white hot. The correct explanation for the above observation is possible by using: [RC] (2013)`,
        A: `Newton’s Law of cooling`, B: `Stefan’s Law`, C: `Wien’s displacement Law`, D: `Kirchoff’s Law 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 d d c d c d d d d c a d a c a c d 18 19 a c Answer Key`
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
