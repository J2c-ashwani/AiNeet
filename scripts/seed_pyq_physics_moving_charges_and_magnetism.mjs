/**
 * Seed REAL NEET PYQs — Chapter: Moving Charges and Magnetism (Physics)
 * Usage: node scripts/seed_pyq_physics_moving_charges_and_magnetism.mjs
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

const CHAPTER_NAME = 'Moving Charges and Magnetism';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'Solenoid and Toroid',
    'Magnetic Force (Direction and Properties)',
    'Magnetic Field (Thin Straight Conductor)',
    'Current Loop as Magnetic Dipole',
    'Biot-Savart Law',
    'Ampere\'s Circuital Law',
    'Magnetic Field at Centre of Circular Arc',
    'Magnetic Force on Current-Carrying Conductor',
    'Velocity Selector, Cyclotron'
];

const ANSWER_KEY = {
    1: 'D', 2: 'B', 3: 'C', 4: 'D', 5: 'D', 6: 'C', 7: 'B', 8: 'D', 9: 'C', 10: 'C', 11: 'C', 12: 'D', 13: 'C', 14: 'A', 15: 'C', 16: 'A', 17: 'A', 18: 'C', 19: 'C', 20: 'A', 21: 'A', 22: 'C', 23: 'D', 24: 'C'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Solenoid and Toroid', year: '2022',
        text: `Given below are two statements: Statement-I: Biot-Savart’s law gives us the expression for the magnetic field strength of an infinitesimal current element ( Id ,   ) of the current carrying conductor only. Statement-II: Biot-Savart’s law is analogous to Coulomb’s inverse square law of charge q, with the former being related to the field produced by a scalar source, Id ,   while the latter being produced by a vector source, q. In light of above statements choose the most appropriate answer from the options given below (2022)`,
        A: `Statement-I is incorrect and statement-II is correct`, B: `Both Statement-I and Statement-II are correct`, C: `Both statement-I and Statement-II are incorrect`, D: `Statement-I is correct and Statement-II is incorrect.`
    },
    {
        qNo: 2, topic: 'Magnetic Force (Direction and Properties)', year: '2021',
        text: `A thick current carrying cable of radius ‘R’ carries current ‘I’ uniformly distributed across its cross-section. The variation of magnetic field B(r) due to the cable with the distance ‘r’ from the axis of the cable is represented by: (2021)`,
        A: `B r`, B: `B r`, C: `B r`, D: `B r`
    },
    {
        qNo: 3, topic: 'Magnetic Field (Thin Straight Conductor)', year: '2017',
        text: `An arrangement of three parallel straight wires placed perpendicular to plane of paper carrying same current ‘I’ along the same direction is shown in figure. Magnitude of force per unit length on the middle wire ‘B’ is given by: (2017-Delhi)`,
        A: `2 0 2 i d μ π`, B: `2 0 2 i d μ π`, C: `2 0 i 2 d μ π`, D: `2 0 i 2 d μ π`
    },
    {
        qNo: 4, topic: 'Current Loop as Magnetic Dipole', year: '2014',
        text: `Two identical long conducting wires AOB and COD are placed at right angle to each other, with one above other such that O is their common point for the two. The wires carry I 1 and I 2 currents, respectively. Point P is lying at distance d from O along a direction perpendicular to the plane containing the wires. The magnetic field at the point P will be: (2014)`,
        A: `0 1 2 I 2 d I   μ   π  `, B: `( ) 0 1 2 I I 2 d μ + π`, C: `( ) 2 2 0 1 2 I I 2 d μ + π`, D: `( ) 1/ 2 2 2 0 1 2 I I 2 d μ + π Magnetic Field in Circular Coil`
    },
    {
        qNo: 5, topic: 'Biot-Savart Law', year: '2016',
        text: `A long wire carrying a steady current is bent into a circular loop of one turn. The magnetic field at the center of the loop is B. It is then bent into a circular coil of n turns. The magnetic field at the center of this coil of n turns will be: (2016 - II)`,
        A: `2nB`, B: `2n 2 B`, C: `nB`, D: `n 2 B`
    },
    {
        qNo: 6, topic: 'Ampere\'s Circuital Law', year: '2015',
        text: `An electron moving in a circular orbit of radius r makes n rotations per second. The magnetic field produced at the center has magnitude: (2015)`,
        A: `Zero`, B: `2 0 n e r μ`, C: `0 ne 2r μ`, D: `0 ne 2 r μ π 4 C H A P T E R Moving Charges and Magnetism Chapter & Topicwise NEET PYQ's P W 2 Magnetic Field Due to Current through Both Straight Wire and Circular Wire (Mixed Figure)`
    },
    {
        qNo: 7, topic: 'Magnetic Field at Centre of Circular Arc', year: '2015',
        text: `A wire carrying current I has the shape as shown in adjoining figure. Linear parts of the wire are very long and parallel to X-axis while semicircular portion of radius R is lying in Y-Z plane. Magnetic field at point O is: (2015)`,
        A: `( ) 0 I ˆ ˆ B i 2k 4 R μ =− π − π `, B: `( ) 0 I ˆ ˆ B i 2k 4 R μ =− π + π `, C: `( ) 0 I ˆ ˆ B i 2k 4 R μ = π − π `, D: `( ) 0 I ˆ ˆ B i 2k 4 R μ = π + π  Ampere’s Circuital Law`
    },
    {
        qNo: 8, topic: 'Magnetic Force on Current-Carrying Conductor', year: '2022',
        text: `From Ampere’s circuital law for a long straight wire of circular cross section carrying a steady current, the variation of magnetic field in the inside and outside region of the wire is : (2022)`,
        A: `a linearly decreasing function of distance upto the boundary of the wire and then a linearly increasing one for the outside region.`, B: `uniform and remains constant for both the regions.`, C: `a linearly increasing function of distance upto the boundary of the wire and then decreasing outside region.`, D: `a linearly increasing function of distance r upto the boundary of the wire 1/r dependence for the outside region.`
    },
    {
        qNo: 9, topic: 'Velocity Selector, Cyclotron', year: '2019',
        text: `A cylindrical conductor of radius R is carrying a constant current. The plot of the magnitude of the magnetic field B with the distance d from the centre of the conductor, is correctly represented by the figure: (2019)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 10, topic: 'Solenoid and Toroid', year: '2016',
        text: `A long straight wire of radius a carries a steady current I. The current is uniformly distributed over its cross-section. The ratio of the magnetic fields B and Bʹ at radial distances a 2 and 2a respectively, from the axis of the wire is: (2016 - I)`,
        A: `1 4`, B: `1 2`, C: `1`, D: `4 Magnetic Field Due to Solenoid and Toroid`
    },
    {
        qNo: 11, topic: 'Magnetic Force (Direction and Properties)', year: '2022',
        text: `A long solenoid of radius 1 mm has 100 turns per mm. If 1A current flows in the solenoid, the magnetic field strength at the centre of the solenoid is : (2022)`,
        A: `6.28 × 10 –4 T`, B: `6.28 × 10 –2 T`, C: `12.56 × 10 –2 T`, D: `12.56 × 10 –4 T`
    },
    {
        qNo: 12, topic: 'Magnetic Field (Thin Straight Conductor)', year: '2020',
        text: `A long solenoid of 50 cm length having 100 turns carries a current of 2.5 A. The magnetic field at the centre of the solenoid is : (2020) ( m 0 = 4 p × 10 –7 TmA –1 )`,
        A: `3.14 × 10 –4 T`, B: `6.28 × 10 –5 T`, C: `3.14 × 10 –5 T`, D: `6.28 × 10 –4 T Motion of Charged Particle in (i) Electric Field and (ii) Magnetic Field`
    },
    {
        qNo: 13, topic: 'Current Loop as Magnetic Dipole', year: '2021',
        text: `An infinitely long straight conductor carries a current of 5 A as shown. An electron is moving with a speed of 10 5 m/s parallel to the conductor. The perpendicular distance between the electron and the conductor is 20 cm at an instant. Calculate the magnitude of the force experienced by the electron at that instant. (2021) 20 cm Electron v = 10 5 m/s 5 A Q P`,
        A: `8 p × 10 –20 N`, B: `4 p × 10 –20 N`, C: `8 × 10 –20 N`, D: `4 × 10 –20 N`
    },
    {
        qNo: 14, topic: 'Biot-Savart Law', year: '2019',
        text: `Ionized hydrogen atoms and α-particles with same momenta enters perpendicular to a constant magnetic field, B. The ratio of their radii of their paths r H : r α will be : (2019)`,
        A: `2 : 1`, B: `1 : 2`, C: `4 : 1`, D: `1 : 4`
    },
    {
        qNo: 15, topic: 'Ampere\'s Circuital Law', year: '2016',
        text: `An electron is moving in a circular path under the influence of a transverse magnetic field of 3.57 × 10 –2 T. If the value of e/m is 1.76 × 10 11 C/kg, the frequency of revolution of the electron is: (2016 - II)`,
        A: `62.8 MHz`, B: `6.28 MHz`, C: `1 GHz`, D: `100 MHz Moving Charges and Magnetism 3`
    },
    {
        qNo: 16, topic: 'Magnetic Field at Centre of Circular Arc', year: '2015 Pre',
        text: `A proton and an alpha particle both enter a region of uniform magnetic field, B, moving at right angles to the field B. If the radius of circular orbits for both the particles is equal and the kinetic energy acquired by proton is 1 MeV, the energy acquired by the alpha particle will be: (2015 Pre)`,
        A: `1 MeV`, B: `4 MeV`, C: `0.5 MeV`, D: `1.5 MeV Force in the Presence of Magnetic Field, Lorentz Force and Cyclotron`
    },
    {
        qNo: 17, topic: 'Magnetic Force on Current-Carrying Conductor', year: '2016',
        text: `A square loop ABCD carrying a current i, is placed near and coplanar with a long straight conductor XY carrying a current I, the net force on the loop will be: (2016 - I)`,
        A: `0 2 Ii 3 μ π`, B: `0 Ii 2 μ π`, C: `0 2 IiL 3 μ π`, D: `0 IiL 2 μ π`
    },
    {
        qNo: 18, topic: 'Velocity Selector, Cyclotron', year: '2013',
        text: `When a proton is released from rest in a room, it starts with an initial acceleration a 0 towards west. When it is projected towards north with a speed v 0 it moves with an initial acceleration 3a 0 toward west. The electric and magnetic fields in the room are: [RC] (2013)`,
        A: `0 0 0 ma 3ma east, down e ev`, B: `0 0 0 ma 2ma west, up e ev`, C: `0 0 0 ma 2ma west, down e ev`, D: `0 0 0 ma 3ma east, up e ev Torque on a Current Loop`
    },
    {
        qNo: 19, topic: 'Solenoid and Toroid', year: '2015 Pre',
        text: `A rectangular coil of length 0.12 m and width 0.1 m having 50 turns of wire is suspended vertically in a uniform magnetic field of strength 0.2 Weber/m 2 . The coil carries a current of 2 A. If the plane of the coil is inclined at an angle of 30° with the direction of the field, the torque required to keep the coil in stable equilibrium will be: (2015 Pre)`,
        A: `0.12 Nm`, B: `0.15 Nm`, C: `0.20 Nm`, D: `0.24 Nm`
    },
    {
        qNo: 20, topic: 'Magnetic Force (Direction and Properties)', year: '2013',
        text: `A current loop in a magnetic field: (2013)`,
        A: `Can be in equilibrium in two orientations, one stable while the other is unstable`, B: `Experiences a torque whether the field is uniform or non uniform in all orientations`, C: `Can be in equilibrium in one orientation`, D: `Can be in equilibrium in two orientations, both the equilibrium states are unstable Galvanometer`
    },
    {
        qNo: 21, topic: 'Magnetic Field (Thin Straight Conductor)', year: '2018',
        text: `Current sensitivity of a moving coil galvanometer is 5 div/mA and its voltage sensitivity (angular deflection per unit voltage applied) is 20 div/V. The resistance of the galvanometer is : (2018)`,
        A: `250 Ω`, B: `25 Ω`, C: `40 Ω`, D: `500 Ω Conversion of Galvanometer into (a) Ammeter and (b) Voltmeter`
    },
    {
        qNo: 22, topic: 'Current Loop as Magnetic Dipole', year: '2014',
        text: `In an ammeter 0.2% of main current passes through the galvanometer. If resistance of galvanometer is G, the resistance of ammeter will be: (2014)`,
        A: `1 G 499`, B: `499 G 500`, C: `500`, D: `500 G 499 Magnetic Moment`
    },
    {
        qNo: 23, topic: 'Biot-Savart Law', year: '2021',
        text: `A uniform conducting wire of length 12 a and resistance ‘R’ is wound up as a current carrying coil in the shape of, i. an equilateral triangle of side ‘a’. ii. a square of side ‘a’. The magnetic dipole moments of the coil in each case respectively are: (2021)`,
        A: `3 Ia 2 and Ia 2`, B: `3 Ia 2 and 4 Ia 2`, C: `4 Ia 2 and 3 Ia 2`, D: `2 2 3 Ia and 3Ia`
    },
    {
        qNo: 24, topic: 'Ampere\'s Circuital Law', year: '2020',
        text: `A wire of length L metre carrying a current of I ampere is bent in the form of a circle. its magnetic moment is. (2020-Covid)`,
        A: `I π L 2 /4 Am 2`, B: `2I L 2 /π Am 2`, C: `I L 2 /4 π Am 2`, D: `I L 2 /4 Am 2 Chapter & Topicwise NEET PYQ's P W 4 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 d b c d d c b d c c c d c a c a a 18 19 20 21 22 23 24 c c a a c d c Answer Key`
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
