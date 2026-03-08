/**
 * Seed REAL NEET PYQs — Chapter: Mechanical Properties of Solids (Physics)
 * Usage: node scripts/seed_pyq_physics_mechanical_properties_of_solids.mjs
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

const CHAPTER_NAME = 'Mechanical Properties of Solids';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'Hooke\'s Law',
    'Shear Modulus (Modulus of Rigidity)',
    'Stress and Strain (Tensile/Compressive)',
    'Young\'s Modulus'
];

const ANSWER_KEY = {
    1: 'C', 2: 'C', 3: 'C', 4: 'B', 5: 'B', 6: 'D', 7: 'C', 8: 'B', 9: 'C'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Hooke\'s Law', year: '2020',
        text: `A wire of length L area of cross section A is hanging from a fixed support. The length of the wire changes to L 1 when mass M is suspended from its free end. The expression for Young’s modulus is: (2020)`,
        A: `1 Mg(L – L) AL`, B: `1 MgL AL`, C: `1 MgL A(L – L)`, D: `1 MgL AL`
    },
    {
        qNo: 2, topic: 'Shear Modulus (Modulus of Rigidity)', year: '2018',
        text: `Two wires are made of the same material and have the same volume. The first wire has cross-sectional area A and the second wire has cross-sectional area 3 A. If the length of the first wire is increased by ∆ l on applying a force F, how much force is needed to stretch the second wire by the same amount? (2018)`,
        A: `4 F`, B: `6 F`, C: `9 F`, D: `F`
    },
    {
        qNo: 3, topic: 'Stress and Strain (Tensile/Compressive)', year: '2015 Re',
        text: `The Young’s modulus of steel is twice that of brass. Two wires of same length and of same area of cross section, one of steel and another of brass are suspended from the same roof. If we want the lower ends of the wires to be at the same level, then the weights added to the steel and brass wires must be in the ratio of: (2015 Re)`,
        A: `1 : 1`, B: `1 : 2`, C: `2 : 1`, D: `4 : 1`
    },
    {
        qNo: 4, topic: 'Young\'s Modulus', year: '2014',
        text: `Copper of fixed volume V is drawn into wire of length L. When this wire is subjected to a constant force F, the extension produced in the wire is D l . Which of the following graphs is a straight line? (2014)`,
        A: `∆ L versus 1/L`, B: `∆ L versus L 2`, C: `∆ L versus 1/L 2`, D: `∆ L versus L 3`
    },
    {
        qNo: 5, topic: 'Hooke\'s Law', year: '2013',
        text: `The following four wires are made of the same material. Which of these will have the largest extension when the same tension is applied? (2013)`,
        A: `Length = 300 cm, diameter = 3 mm`, B: `Length = 50 cm, diameter = 0.5 mm`, C: `Length = 100 cm, diameter = 1 mm`, D: `Length = 200 cm, diameter = 2 mm Bulk Modulus and Shear Modulus`
    },
    {
        qNo: 6, topic: 'Shear Modulus (Modulus of Rigidity)', year: '2022',
        text: `Given below are two statements : One is labelled as Assertion (A) and the other is labelled as Reason (R) Assertion (A): The stretching of a spring is determined by the shear modulus of the material of the spring Reason (R): A coil spring of copper has more tensile strength than a steel spring of same dimensions. In the light of the above statements, choose the most appropriate answer from the options given below : [RC] (2022)`,
        A: `(A) is false but (R) is true`, B: `Both (A) and (R) are true and (R) is the correct explanation of (A)`, C: `Both (A) and (R) are true and (R) is not the correct explanation of (A)`, D: `(A) is true but (R) is false`
    },
    {
        qNo: 7, topic: 'Stress and Strain (Tensile/Compressive)', year: '2017',
        text: `The bulk modulus of a spherical objects is ‘B’. If it is subjected to uniform pressure ‘P’, the fractional decrease in radius is: (2017-Delhi)`,
        A: `3p Β`, B: `3P B`, C: `P 3B`, D: `P B`
    },
    {
        qNo: 8, topic: 'Young\'s Modulus', year: '2015',
        text: `The approximate depth of an ocean is 2700 m. The compressibility of water is 45.4 × 10 –11 Pa –1 and density of water is 10 3 kg/m 3 . What fractional compression of water will be obtained at the bottom of the ocean? [RC] (2015)`,
        A: `1.0 × 10 –2`, B: `1.2 × 10 –2`, C: `1.4 × 10 –2`, D: `0.8 × 10 –2 Elastic Potential Energy`
    },
    {
        qNo: 9, topic: 'Hooke\'s Law', year: '2019',
        text: `When a block of mass M is suspended by a long wire of length L, the length of the wire becomes (L + l ). The elastic potential energy stored in the extended wire is: [RC] (2019)`,
        A: `Mg l`, B: `MgL`, C: `1 Mg 2 l`, D: `1 MgL 2 8 C H A P T E R Mechanical Properties of Solids Chapter & Topicwise NEET PYQ's P W 2 Answer Key 1 2 3 4 5 6 7 8 9 c c c b b d c b c`
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
