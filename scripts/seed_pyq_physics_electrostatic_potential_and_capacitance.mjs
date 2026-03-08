/**
 * Seed REAL NEET PYQs — Chapter: Electrostatic Potential and Capacitance (Physics)
 * Usage: node scripts/seed_pyq_physics_electrostatic_potential_and_capacitance.mjs
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

const CHAPTER_NAME = 'Electrostatic Potential and Capacitance';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'General'
];

const ANSWER_KEY = {
    1: 'A', 2: 'D', 3: 'C', 4: 'D', 5: 'A', 6: 'A', 7: 'A', 8: 'A', 9: 'A', 10: 'B', 11: 'A', 12: 'A', 13: 'A', 14: 'A', 15: 'A', 16: 'A', 17: 'A', 18: 'A', 19: 'A', 20: 'A', 21: 'A', 22: 'A', 23: 'A', 24: 'A', 25: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'General', year: '2022',
        text: `Two hollow conducting sphere of radii R 1 and R 2 (R 1 >> R 2 ) have equal charges. The potential would be: (2022)`,
        A: `dependent on the material property of the sphere`, B: `more on bigger sphere`, C: `more on smaller sphere`, D: `equal on both the sphere`
    },
    {
        qNo: 2, topic: 'General', year: '2021',
        text: `Twenty seven drops of same size are charged at 220 V each. They combine to form a bigger drop. Calculate the potential of the bigger drop. (2021)`,
        A: `1320 V`, B: `1520 V`, C: `1980 V`, D: `660 V`
    },
    {
        qNo: 3, topic: 'General', year: '2020',
        text: `A short electric dipole has a dipole moment of 16 × 10 –9 C m. The electric potential due to the dipole at a point at a distance of 0.6 m from the centre of the dipole, situated on a line making an angle of 60° with the dipole axis is: [RC] (2020) 9 2 2 0 1 9 10 N m /C 4   = ×   π ∈  `,
        A: `200 V`, B: `400 V`, C: `Zero`, D: `50 V`
    },
    {
        qNo: 4, topic: 'General', year: '2020',
        text: `The variation of electrostatic potential with radial distance r from the centre of a positively charged metallic thin shell of radius R is given by the graph. [RC] (2020-Covid)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 5, topic: 'General', year: '2013',
        text: `A, B and C are three points in a uniform electric field. The electric potential is: (2013)`,
        A: `Same at all the three points A, B and C`, B: `Maximum at A`, C: `Maximum at B`, D: `Maximum at C Potential Difference and Work Done`
    },
    {
        qNo: 6, topic: 'General', year: '2017',
        text: `The diagrams below show regions of equipotentials (2017-Delhi) A positive charge is moved from A to B in each diagram.`,
        A: `In all the four cases the work done is the same.`, B: `Minimum work is required to move q in figure (a)`, C: `Maximum work is required to move q in figure (b)`, D: `Maximum work is required to move q in figure (c) Potential Gradient and Electric Field`
    },
    {
        qNo: 7, topic: 'General', year: '2022',
        text: `The angle between the electric lines of force and the equipotential surface is: (2022)`,
        A: `180°`, B: `0°`, C: `45°`, D: `90°`
    },
    {
        qNo: 8, topic: 'General', year: '2020',
        text: `In a certain region of space with volume 0.2 m 3 , the electric potential is found to be 5V throughout. The magnitude of electric field in this region is: (2020)`,
        A: `0.5 N/C`, B: `1 N/C`, C: `5 N/C`, D: `Zero 2 C H A P T E R Electrostatic Potential and Capacitance Chapter & Topicwise NEET PYQ's P W 2`
    },
    {
        qNo: 9, topic: 'General', year: '2015 Re',
        text: `If potential (in volts) in a region is expressed as V (x, y, z) = 6xy – y + 2yz, the electric field (in N/C) at point (1, 1, 0) is: (2015 Re)`,
        A: `( ) ˆ ˆ ˆ 6i 9 j k − + +`, B: `( ) ˆ ˆ ˆ 3i 5j 3k − + +`, C: `( ) ˆ ˆ ˆ 6i 5j 2k − + +`, D: `( ) ˆ ˆ ˆ 2i 3j k − + +`
    },
    {
        qNo: 10, topic: 'General', year: '2014',
        text: `In a region, the potential is represented by V(x, y, z) = 6x – 8xy – 8y + 6yz, where V is in volts and x, y, z are in meters. The electric force experienced by a charge of 2 coulomb situated at point (1, 1, 1) is: (2014)`,
        A: `6 5 N`, B: `30 N`, C: `24 N`, D: `4 35 N Electrostatics of Conductors`
    },
    {
        qNo: 11, topic: 'General', year: '2021',
        text: `Two charged spherical conductors of radius R 1 and R 2 are connected by a wire. Then the ratio of surface charge densities of the spheres ( s 1 / s 2 ) is: [RC] (2021)`,
        A: `2 1 R R`, B: `1 2 R R      `, C: `2 1 2 2 R R`, D: `1 2 R R`
    },
    {
        qNo: 12, topic: 'General', year: '2014',
        text: `A conducting sphere of radius R is given a charge Q. The electric potential and the electric field at the center of the sphere respectively are: [RC] (2014)`,
        A: `Zero and 2 0 Q 4 R πε`, B: `0 Q 4 R πε and Zero`, C: `2 0 0 Q Q and 4 R 4 R πε πε`, D: `Both are zero Capacitance and Parallel Plate Capacitor`
    },
    {
        qNo: 13, topic: 'General', year: '2018',
        text: `The electrostatic force between the metal plates of an isolated parallel plate capacitor C having a charge Q and area A, is (2018)`,
        A: `Proportional to the square root of the distance between the plates.`, B: `Linearly proportional to the distance between the plates.`, C: `Independent of the distance between the plates.`, D: `Inversely proportional to the distance between the plates.`
    },
    {
        qNo: 14, topic: 'General', year: '2015 Pre',
        text: `A parallel plate air capacitor has capacity ‘C’ distance of separation between plates is ‘d’ and potential difference ‘V’ is applied between the plates force of attraction between the plates of the parallel plate air capacitor is: (2015 Pre)`,
        A: `2 2 2 C V 2d`, B: `2 2 C V 2d`, C: `2 CV 2d`, D: `2 CV d Effect of Dielectric on Capacitance and Polarization`
    },
    {
        qNo: 15, topic: 'General', year: '2021',
        text: `Polar molecules are the molecules: (2021)`,
        A: `Acquire a dipole moment only in the presence of electric field due to displacement of charges.`, B: `Acquire a dipole moment only when magnetic field is absen t .`, C: `Having a permanent electric dipole moment.`, D: `Having zero dipole moment.`
    },
    {
        qNo: 16, topic: 'General', year: '2020',
        text: `The capacitance of a parallel plate capacitor with air as medium is 6mF. With the introduction of a dielectric medium, the capacitance becomes 30 mF. The permittivity of the medium is : (2020) ( e 0 = 8.85 × 10 –12 C 2 N –1 m –2 )`,
        A: `1.77 × 10 –12 C 2 N –1 m –2`, B: `0.44 × 10 –10 C 2 N –1 m –2`, C: `5.00 C 2 N –1 m –2`, D: `0.44 × 10 –13 C 2 N –1 m –2`
    },
    {
        qNo: 17, topic: 'General', year: '2020',
        text: `A parallel plate capacitor having cross-sectional area A and separation d has air in between the plates. Now an insulating slab of same area but thickness d/2 is inserted between the plates as shown in figure having dielectric constant K ( = 4). The ratio of new capacitance to its original capacitance will be, (2020-Covid)`,
        A: `8 : 5`, B: `6 : 5`, C: `4 : 1`, D: `2 : 1`
    },
    {
        qNo: 18, topic: 'General', year: '2015',
        text: `A parallel plate air capacitor of capacitance C is connected to a cell of emf V and then disconnected from it. A dielectric slab of dielectric constant K, which can just fill the air gap of the capacitor, is now inserted in it. Which of the following is incorrect? (2015)`,
        A: `The energy stored in the capacitor decreases K times`, B: `The change in energy stored is 2 1 1 CV 1 2 K   −    `, C: `The charge on the capacitor is not conserved`, D: `The potential difference between the plates decreases K times`
    },
    {
        qNo: 19, topic: 'General', year: '2014',
        text: `Two thin dielectric slabs of dielectric constants K 1 and K 2 (K 1 < K 2 ) are inserted between plates of a parallel plate capacitor, as shown in the figure. The variation of electric field E between the plates with distance d as measured from plate P is correctly shown by: (2014) Electrostatic Potential and Capacitance 3`,
        A: `a. b. c. d. Grouping of Capacitors`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 20, topic: 'General', year: '2021',
        text: `The equivalent capacitance of the combination shown in the figure is: (2021) C C C`,
        A: `2C`, B: `C/2`, C: `3C/2`, D: `3C`
    },
    {
        qNo: 21, topic: 'General', year: '2016',
        text: `A parallel-plate capacitor of area A, plate separation d and capacitance C is filled with four dielectric materials having dielectric constants k 1 , k 2 , k 3 and k 4 as shown in the figure below. If a single dielectric material is to be used to have the same capacitance C in this capacitor, then its dielectric constant k is given by: (2016 - II)`,
        A: `1 2 3 4 2 3 1 k k k k k = + + +`, B: `1 2 3 4 1 1 1 1 3 k k k k 2k = + + +`, C: `k = k 1 + k 2 + k 3 + 3k 4`, D: `( ) 1 2 3 4 2 k k k k 2k 3 = + + + Energy Stored in a Capacitor and Loss of Energy on Sharing Charges`
    },
    {
        qNo: 22, topic: 'General', year: '2022',
        text: `A capacitor of capacitance C = 900 pF is charged fully by 100 53 battery B as shown in figure (a). Then it is disconnected from the battery and connected to another uncharged capacitor of capacitance C = 900 pF as shown in figure (b). The electrostatic energy stored by the system (b) is (2022) B + – – – – – C 100 V + + + + (a) C + + + – C + + + – + + + – (b)`,
        A: `1.5 × 10 –6 J`, B: `4.5 × 10 –6 J`, C: `3.25 × 10 –6 J`, D: `2.25 × 10 –6 J`
    },
    {
        qNo: 23, topic: 'General', year: '2021, 2012 Mains, 2011 pre, 2008',
        text: `A parallel plate capacitor has a uniform electric field 'E '   in the space between the plates. If the distance between the plates is ‘d’ and the area of each plate is ‘A’, the energy stored in the capacitor is: (2021, 2012 Mains, 2011 pre, 2008) ( e 0 = permittivity of free space)`,
        A: `e 0 EAd`, B: `2 0 1 E Ad 2 ε`, C: `2 0 E Ad ε`, D: `2 0 1 E 2 ε`
    },
    {
        qNo: 24, topic: 'General', year: '2017',
        text: `A capacitor is charged by a battery. The battery is removed and another identical uncharged capacitor is connected in parallel. The total electrostatic energy of resulting system: (2017-Delhi)`,
        A: `Decreases by a factor of 2`, B: `Remains the same`, C: `Increases by a factor of 2`, D: `Increases by a factor of 4`
    },
    {
        qNo: 25, topic: 'General', year: '2016',
        text: `A capacitor of 2 μF is charged as shown in the diagram. When the switch S is turned to position 2, the percentage of its stored energy dissipated is: (2016 - I)`,
        A: `0%`, B: `20%`, C: `75%`, D: `80% Chapter & Topicwise NEET PYQ's P W 4 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 c c a a c a d d c d a b c c c b a 18 19 20 21 22 23 24 25 c c a a d b a d Answer Key`
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
