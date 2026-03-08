/**
 * Seed REAL NEET PYQs — Chapter: Centre of Mass and System of Particles & Rotational Motion (Physics)
 * Usage: node scripts/seed_pyq_physics_centre_of_mass_and_system_of_particles_rotational_motion.mjs
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

const CHAPTER_NAME = 'Centre of Mass and System of Particles & Rotational Motion';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'General'
];

const ANSWER_KEY = {
    1: 'C', 2: 'B', 3: 'B', 4: 'D', 5: 'B', 6: 'C', 7: 'D', 8: 'A', 9: 'A', 10: 'C', 11: 'D', 12: 'C', 13: 'C', 14: 'D', 15: 'B', 16: 'C', 17: 'B', 18: 'A', 19: 'A', 20: 'A', 21: 'A', 22: 'A', 23: 'A', 24: 'A', 25: 'A', 26: 'A', 27: 'A', 28: 'A', 29: 'A', 30: 'A', 31: 'A', 32: 'A', 33: 'A', 34: 'A', 35: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'General', year: '2022',
        text: `Two objects of mass 10 kg and 20 kg respectively are connected to the two ends of a rigid rod of length 10 m with negligible mass. The distance of the centre of mass of the system from the 10 kg mass is: (2022)`,
        A: `5m`, B: `10 m 3`, C: `20 m 3`, D: `10 m`
    },
    {
        qNo: 2, topic: 'General', year: '2020',
        text: `Two particles of mass 5 kg and 10 kg respectively are attached to the two ends of a rigid rod of length 1 m with negligible mass. The centre of mass of the system from the 5 kg particle is nearly at a distance of: (2020)`,
        A: `50 cm`, B: `67 cm`, C: `80 cm`, D: `33 cm`
    },
    {
        qNo: 3, topic: 'General', year: '2020',
        text: `Three identical spheres, each of mass M, are placed at the corners of a right angle triangle with mutually perpendicular sides equal to 2 m (see figure). Taking the point of intersection of the two mutually perpendicular sides as the origin, find the position vector of centre of mass. (2020-Covid)`,
        A: `( ) ˆ ˆ i j +`, B: `( ) 2 ˆ ˆ i j 3 +`, C: `( ) 4 ˆ ˆ i j 3 +`, D: `( ) ˆ ˆ 2 i j +`
    },
    {
        qNo: 4, topic: 'General', year: '2020',
        text: `Which of the following statements are correct?`,
        A: `Centre of mass of a body always coincides with the centre of gravity of the body`, B: `Centre of gravity of a body is the point at which the total gravitational torque on the body is zero`, C: `A couple on a body produce both translational and rotational motion in a body.`, D: `Mechanical advantage greater than one means that small effort can be used to lift a large load (2017-Delhi)`
    },
    {
        qNo: 5, topic: 'General', year: '2015',
        text: `Two spherical bodies of mass M and 5M and radii R and 2R are released in free space with initial separation between their centers equal to 12R. If they attract each other due to gravitational force only, then the distance covered by the smaller body before collision is: (2015)`,
        A: `4.5R`, B: `7.5R`, C: `1.5R`, D: `2.5R Angular Displacement Velocity and Acceleration`
    },
    {
        qNo: 6, topic: 'General', year: '2022',
        text: `The angular speed of a fly wheel moving with uniform angular acceleration changes from 1200 rpm to 3120 rpm in 16 seconds. The angular acceleration in rad/s 2 is: (2022)`,
        A: `104 p`, B: `2 p`, C: `4 p`, D: `12 p`
    },
    {
        qNo: 7, topic: 'General', year: '2020',
        text: `The angular speed of the wheel of a vehicle is increased from 360 rpm to 1200 rpm in 14 second. Its angular acceleration is. (2020-Covid)`,
        A: `28π rad/s 2`, B: `120π rad/s 2`, C: `1 rad/s 2`, D: `2π rad/s 2`
    },
    {
        qNo: 8, topic: 'General', year: '2016',
        text: `A uniform circular disc of radius 50 cm at rest is free to turn about an axis which is perpendicular to its plane and passes through its center. It is subjected to a torque which produces a constant angular acceleration of 2.0 rad s –2 . Its net acceleration in ms –2 at the end of 2.0 s is approximately: (2016 - I)`,
        A: `8.0`, B: `7.0`, C: `6.0`, D: `3.0 6 C H A P T E R System of Particles and Rotational Motion Chapter & Topicwise NEET PYQ's P W 2`
    },
    {
        qNo: 9, topic: 'General', year: '2015 Re',
        text: `Point masses m 1 and m 2 are placed at the opposite ends of a rigid rod of length L, and negligible mass. The rod is to be set rotating about an axis perpendicular to it. The position of point P on this rod through which the axis should pass so that the work required to set the rod rotating with angular velocity ω 0 is minimum, is given by: (2015 Re)`,
        A: `2 1 2 m L x m m = +`, B: `1 1 2 m L x m m = +`, C: `1 2 m x L m =`, D: `2 1 m x L m = Moment of Inertia, Theorem of Parallel and Perpendicular Axis and Energy in Rotation`
    },
    {
        qNo: 10, topic: 'General', year: '2022',
        text: `The ratio of the radius of gyration of a thin uniform disc about an axis passing through it centre and normal to its plane to the radius of gyration of the disc about its diameter is: (2022)`,
        A: `1: 2`, B: `2 : 1`, C: `2 :1`, D: `4 : 1`
    },
    {
        qNo: 11, topic: 'General', year: '2021',
        text: `From a circular ring of mass 'M' and radius 'R' an arc corresponding to a 90° sector is removed. The moment of inertia of the remaining part of the ring about an axis passing through the centre of the ring and perpendicular to the plane of the ring is 'K' times 'MR 2 '. Then the value of 'K' is: (2021)`,
        A: `7 8`, B: `1 4`, C: `1 8`, D: `3 4`
    },
    {
        qNo: 12, topic: 'General', year: '2018',
        text: `Three objects, A: (a solid sphere), B: (a thin circular disk) and C: (a circular ring), each have the same mass M and radius R. They all spin with the same angular speed ω about their own symmetry axes. The amounts of work (W) required to bring them to rest, would satisfy the relation (2018)`,
        A: `W B > W A > W C`, B: `W A > W B > W C`, C: `W C > W B > W A`, D: `W A > W C > W B`
    },
    {
        qNo: 13, topic: 'General', year: '2020',
        text: `A light rod of length l has two masses m 1 and m 2 attached to its two ends. The moment of inertia of the system about an axis perpendicular to the rod and passing through the centre of mass is: 2016 - II)`,
        A: `(m 1 + m 2 ) l 2`, B: `2 1 2 m m `, C: `2 1 2 1 2 m m m m + `, D: `2 1 2 1 2 m m m m + `
    },
    {
        qNo: 14, topic: 'General', year: '2016',
        text: `A solid sphere of mass m and radius R is rotating about its diameter. A solid cylinder of the same mass and same radius is also rotating about its geometrical axis with an angular speed twice that of the sphere. The ratio of their kinetic energies of rotation (E sphere / E cylinder ) will be: (2016 - II)`,
        A: `1 : 4`, B: `3 : 1`, C: `2 : 3`, D: `1 : 5`
    },
    {
        qNo: 15, topic: 'General', year: '2016',
        text: `From a disc of radius R and mass M, a circular hole of diameter R, whose rim passes through the centre is cut. What is the moment of inertia of the remaining part of the disc about a perpendicular axis, passing through the centre? (2016 - I)`,
        A: `15MR 2 /32`, B: `13MR 2 /32`, C: `11MR 2 /32`, D: `9MR 2 /32`
    },
    {
        qNo: 16, topic: 'General', year: '2015',
        text: `Three identical spherical shells, each of mass m and radius r are placed as shown in figure. Consider an axis XX ʹ which is touching to two shells and passing through diameter to third shell. Moment of inertia of the system consisting of these three spherical shells about XX ʹ axis is: (2015)`,
        A: `3mr 2`, B: `16 /5mr 2`, C: `4mr 2`, D: `11/5 mr 2`
    },
    {
        qNo: 17, topic: 'General', year: '2013',
        text: `A rod PQ of mass M and length L is hinged at end P. The rod is kept horizontal by a massless string tied to point Q as shown in figure. When string is cut, the initial angular acceleration of the rod is: (2013)`,
        A: `2g 3L`, B: `3g 2L`, C: `g L`, D: `2g L Torque, Angular Momentum and its Conservation`
    },
    {
        qNo: 18, topic: 'General', year: '2021',
        text: `A uniform rod of length 200 cm and mass 500 g is balanced on a wedge placed at 40 cm mark. A mass of 2 kg is suspended from the rod at 20 cm and another unknown mass 'm' is suspended from the rod at 160 cm mark as shown in the figure. Find the value of 'm' such that the rod is in equilibrium. (g = 10 m/s 2 ) (2021) System of Particles and Rotational Motion 3 2 kg m 0 20 cm 40 cm 160 cm`,
        A: `1 kg 3`, B: `1 kg 6`, C: `1 kg 12`, D: `1 kg 2`
    },
    {
        qNo: 19, topic: 'General', year: '2020',
        text: `Find the torque about the origin when a force of 3 ˆ j N acts on a particle whose position vector is 2 ˆ k m. (2020)`,
        A: `6 ˆ j N m`, B: `–6 ˆ i N m`, C: `6 ˆ k N m`, D: `6 ˆ i N m`
    },
    {
        qNo: 20, topic: 'General', year: '2019',
        text: `A solid cylinder of mass 2 kg and radius 4 cm is rotating about its axis at the rate of 3 rpm. The torque required to stop after 2π revolutions is (2019)`,
        A: `2 × 10 –6 N m`, B: `2 × 10 –3 N m`, C: `12 × 10 –4 N m`, D: `2 × 10 6 N m`
    },
    {
        qNo: 21, topic: 'General', year: '2018',
        text: `A solid sphere is rotating freely about its symmetry axis in free space. The radius of the sphere is increased keeping its mass same. Which of the following physical quantities would remain constant for the sphere? (2018)`,
        A: `Rotational kinetic energy`, B: `Moment of inertia`, C: `Angular velocity`, D: `Angular momentum`
    },
    {
        qNo: 22, topic: 'General', year: '2018',
        text: `The moment of the force, ˆ ˆ ˆ F 4i 5j 6k = + −  at (2, 0, –3), about the point (2, –2, –2) is given by (2018)`,
        A: `ˆ ˆ ˆ 7i 8j 4k − − −`, B: `ˆ ˆ ˆ 4i j 8k − − −`, C: `ˆ ˆ ˆ 8i 4 j 7k − − −`, D: `ˆ ˆ ˆ 7i 4 j 8k − − −`
    },
    {
        qNo: 23, topic: 'General', year: '2017',
        text: `A rope is wound around a hollow cylinder of mass 3 kg and radius 40 cm. What is the angular acceleration of the cylinder if the rope is pulled with a force of 30 N? (2017-Delhi)`,
        A: `0.25 rad/s 2`, B: `25 rad/s 2`, C: `5 m/s 2`, D: `25 m/s 2`
    },
    {
        qNo: 24, topic: 'General', year: '2016',
        text: `Two rotating bodies A and B of masses m and 2m with moments of inertia I A and I B (I B > I A ) have equal kinetic energy of rotation. If L A and L B be their angular momenta respectively, then: (2016 - II)`,
        A: `L B > L A`, B: `L A > L B`, C: `B A L L 2 =`, D: `L A = 2L B`
    },
    {
        qNo: 25, topic: 'General', year: '2015 Re',
        text: `An automobile moves on a road with a speed of 54 km/h. The radius of its wheels is 0.45 m and the moment of inertia of the wheel about its axis of rotation is 3 kgm 2 . If the vehicle is brought to rest in 15 s, the magnitude of average torque transmitted by its brakes to wheel is: (2015 Re)`,
        A: `2.86 kg m 2 /s 2`, B: `6.66 kg m 2 /s 2`, C: `8.58 kg m 2 /s 2`, D: `10.86 kg m 2 /s 2`
    },
    {
        qNo: 26, topic: 'General', year: '2015 Re',
        text: `A force ˆ ˆ ˆ F i 3j 9k =α + +  is acting at a point ˆ ˆ ˆ r 2i 6 j 12k = − −  . The value of α for which angular momentum about origin is conserved is: (2015 Re)`,
        A: `1`, B: `–1`, C: `2`, D: `Zero`
    },
    {
        qNo: 27, topic: 'General', year: '2015',
        text: `A rod of weight W is supported by two parallel knife edges A and B and is in equilibrium in a horizontal position. The knives are at a distance d from each other. The center of mass of the rod is at distance x from A. The normal reaction on A is: (2015)`,
        A: `Wd x`, B: `( ) W d x x −`, C: `( ) W d x d −`, D: `Wx d`
    },
    {
        qNo: 28, topic: 'General', year: '2015',
        text: `A mass m moves in a circle on a smooth horizontal plane with velocity v 0 at a radius R 0 . The mass is attached to a string which passes through a smooth hole in the plane as shown. The tension in the string is increased gradually and finally m moves in a circle of radius 0 R 2 . The final value of the kinetic energy is: (2015)`,
        A: `2 0 1 m 4 ν`, B: `2 0 2mv`, C: `mv 2`, D: `2 0 mv`
    },
    {
        qNo: 29, topic: 'General', year: '2014',
        text: `A solid cylinder of mass 50 kg and radius 0.5 m is free to rotate about the horizontal axis. A massless string is wound round the cylinder with one end attached to it and other hanging freely. Tension in the string required to produce an angular acceleration of 2 rev/s -2 is: (2014)`,
        A: `25 N`, B: `50 N`, C: `78.5 N`, D: `157 N Rolling Motion`
    },
    {
        qNo: 30, topic: 'General', year: '2019',
        text: `A disc of radius 2 m and mass 100 kg rolls on a horizontal floor. Its centre of mass has speed of 20 cm/s. How much work is needed to stop it? (2019)`,
        A: `3 J`, B: `30 kJ`, C: `2 J`, D: `1 J`
    },
    {
        qNo: 31, topic: 'General', year: '2018',
        text: `A solid sphere is in rolling motion. In rolling motion a body possesses translational kinetic energy (K t ) as well as rotational kinetic energy (K r ) simultaneously. The ratio K t : (K t + K r ) for the sphere is: (2018)`,
        A: `10 : 7`, B: `5 : 7`, C: `7 : 10`, D: `2 : 5 Chapter & Topicwise NEET PYQ's P W 4`
    },
    {
        qNo: 32, topic: 'General', year: '2017',
        text: `Two discs of same moment of inertia rotating about their regular axis passing through centre and perpendicular to the plane of disc with angular velocities ω 1 and ω 2 . They are brought into contact face to face coinciding the axis of rotation. The expression for loss of energy during this process is: (2017-Delhi)`,
        A: `( ) 2 1 2 1 I 4 ω − ω`, B: `I(ω 1 – ω 2 ) 2`, C: `( ) 2 1 2 1 I 8 ω − ω`, D: `( ) 2 1 2 1 I 2 ω − ω`
    },
    {
        qNo: 33, topic: 'General', year: '2016',
        text: `A disk and a sphere of same radius but different masses roll off on two inclined planes of the same altitude and length. Which one of the two objects gets to the bottom of the plane first? (2016 - I)`,
        A: `Disk`, B: `Sphere`, C: `Both reach at the same time`, D: `Depends on their masses`
    },
    {
        qNo: 34, topic: 'General', year: '2014',
        text: `The ratio of the accelerations for a solid sphere (mass m and radius R) rolling down an incline of angle ‘θ’ without slipping and slipping down the incline without rolling is: (2014)`,
        A: `5 : 7`, B: `2 : 3`, C: `2 : 5`, D: `7 : 5`
    },
    {
        qNo: 35, topic: 'General', year: '2013',
        text: `Small object of uniform density rolls up a curved surface with an initial velocity v. It reaches up to a maximum height of 2 3v 4g with respect to the initial position. The object is: (2013)`,
        A: `Disc`, B: `Ring`, C: `Solid sphere`, D: `Hollow sphere Answer Key 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 c b b d b c d a a c d c c d b c b 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 c b a d d b a b b c b d a b a b a 35 a`
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
