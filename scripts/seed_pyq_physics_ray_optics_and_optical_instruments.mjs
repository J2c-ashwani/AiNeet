/**
 * Seed REAL NEET PYQs — Chapter: Ray Optics and Optical Instruments (Physics)
 * Usage: node scripts/seed_pyq_physics_ray_optics_and_optical_instruments.mjs
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

const CHAPTER_NAME = 'Ray Optics and Optical Instruments';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'General'
];

const ANSWER_KEY = {
    1: 'D', 2: 'B', 3: 'A', 4: 'D', 5: 'D', 6: 'A', 7: 'A', 8: 'A', 9: 'A', 10: 'C', 11: 'A', 12: 'D', 13: 'A', 14: 'A', 15: 'D', 16: 'A', 17: 'B', 18: 'B', 19: 'B', 20: 'A', 21: 'B', 22: 'B', 23: 'B', 24: 'A', 25: 'B', 26: 'C', 27: 'D', 28: 'C', 29: 'D', 30: 'D', 31: 'D', 32: 'D', 33: 'D', 34: 'A', 35: 'C', 36: 'D'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'General', year: '2020',
        text: `An object is placed on the principal axis of a concave mirror at a distance of 1.5 f (f is the focal length). The image will be at, (2020-Covid)`,
        A: `1.5f`, B: `– 1.5f`, C: `3f`, D: `–3f`
    },
    {
        qNo: 2, topic: 'General', year: '2018',
        text: `An object is placed at a distance of 40 cm from a concave mirror of focal length 15 cm. If the object is displaced through a distance of 20 cm towards the mirror, the displacement of the image will be: (2018)`,
        A: `30 cm towards the mirror`, B: `36 cm away from the mirror`, C: `30 cm away the mirror`, D: `36 cm towards the mirror`
    },
    {
        qNo: 3, topic: 'General', year: '2016',
        text: `Match the corresponding entries of column-I with column-I. [where m is the magnification produced by the mirror] (2016 - I) Column-I Column-II (A) m = –2 (1) Convex mirror (B) 1 m = 2 − (2) Concave mirror (C) m = +2 (3) Real image (D) m 2 / 3 = (4) Virtual image`,
        A: `A → 2 and 3; B → 2 and 3; C → 2 and 4; D → 1 and 4`, B: `A → 1 and 3; B → 1 and 4; C → 1 and 2; D → 3 and 4`, C: `A → 1 and 4; B → 2 and 3; C → 2 and 4; D → 2 and 3`, D: `A → 3 and 4; B → 2 and 4; C → 2 and 3; D → 1 and 4 Refraction Through Glass Slab and Lateral Shift`
    },
    {
        qNo: 4, topic: 'General', year: '2022',
        text: `A light ray falls on a glass surface of refractive index 3, at an angle 60°. The angle between the refracted and reflected rays would be: (2022)`,
        A: `120°`, B: `30°`, C: `60°`, D: `90°`
    },
    {
        qNo: 5, topic: 'General', year: '2021',
        text: `Find the value of the angle of emergence from the prism. Refractive index of the glass is 3 . (2021) 60°`,
        A: `30°`, B: `45°`, C: `90°`, D: `60°`
    },
    {
        qNo: 6, topic: 'General', year: '2020',
        text: `A thin prism having refracting angle 10° is made of glass of refractive index 1.`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 7, topic: 'General', year: '2020',
        text: `This prism is combined with another thin prism of glass of refractive index 1.`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 8, topic: 'General', year: '2017',
        text: `This combination produces dispersion without deviation. The refracting angle of second prism should be: (2017-Delhi)`,
        A: `6°`, B: `8°`, C: `10°`, D: `4° Real and Apparent Depths`
    },
    {
        qNo: 9, topic: 'General', year: '2016',
        text: `An air bubble in a glass slab with refractive index 1.5 (near normal incidence) is 5 cm deep when viewed from one surface and 3 cm deep when viewed from the opposite surface. The thickness (in cm) of the slab is: (2016 - II)`,
        A: `12`, B: `16`, C: `8`, D: `10 Total Internal Reflection and Critical Angle`
    },
    {
        qNo: 10, topic: 'General', year: '2022',
        text: `Two transparent media A and B are separated by a plane boundary. The speed of light in those media are 1.5 × 10 8 m/s and 2.0 × 10 8 m/s, respectively. The critical angle for a ray of light for these two media is: (2022)`,
        A: `tan –1 (0.750)`, B: `sin –1 (0.500)`, C: `sin –1 (0.750)`, D: `tan –1 (0.500) 9 C H A P T E R Ray Optics and Optical Instruments Chapter & Topicwise NEET PYQ's P W 2`
    },
    {
        qNo: 11, topic: 'General', year: '2020',
        text: `If the critical angle for total internal reflection from a medium to vacuum is 45°, then velocity of light in the medium is, (2020-Covid)`,
        A: `8 3 10 m/s 2 ×`, B: `8 2 10 m/s ×`, C: `3 × 10 8 m/s`, D: `1.5 × 10 8 m/s`
    },
    {
        qNo: 12, topic: 'General', year: '2019',
        text: `In total internal reflection when the angle of incidence is equal to the critical angle for the pair of media in contact, what will be angle of refraction? (2019)`,
        A: `180°`, B: `0°`, C: `Equal to angle of incidence`, D: `90°`
    },
    {
        qNo: 13, topic: 'General', year: '2015 Pre',
        text: `A beam of light consisting of red, green and blue colors is incident on a right angled prism. The refractive index of the material of the prism for the above red, green and blue wavelengths are 1.39, 1.44 and 1.47, respectively The prism will: (2015 Pre)`,
        A: `Separate the red color part from the green and blue colors`, B: `Separate the blue color part from the red and green colors`, C: `Separate all the three colors from one another`, D: `Not separate the three colors at all Refraction at Spherical Surfaces`
    },
    {
        qNo: 14, topic: 'General', year: '2020',
        text: `A plano-convex lens of unknown material and unknown focal length is given. With the help of a spherometer we can measure the, (2020-Covid)`,
        A: `Radius of curvature of the curved surface`, B: `Aperture of the lens`, C: `Refractive index of the material`, D: `Focal length of the lens Lens Formula and Lens Maker’s Formula`
    },
    {
        qNo: 15, topic: 'General', year: '2013',
        text: `A plano-convex lens fits exactly into a planoconcave lens. Their plane surfaces are parallel to each other. If lenses are made of different materials of refractive indices μ 1 and μ 2 and R is the radius of curvature of the curved surface of the lenses, then the focal length of the combination is: (2013)`,
        A: `( ) 2 1 2R μ − μ`, B: `( ) 1 2 R 2 μ + μ`, C: `( ) 1 2 R 2 μ − μ`, D: `( ) 1 2 R μ − μ Combination of Lenses`
    },
    {
        qNo: 16, topic: 'General', year: '2021',
        text: `A convex lens ‘A’ of focal length 20 cm and a concave lens ‘B’ of focal length 5 cm are kept along the same axis with a distance ‘d’ between them. If a parallel beam of light falling on ‘A’ leaves ‘B’ as a parallel beam, then the distance ‘d’ in cm will be: (2021)`,
        A: `15`, B: `50`, C: `30`, D: `25`
    },
    {
        qNo: 17, topic: 'General', year: '2019',
        text: `Two similar thin equi-convex lenses, of focal length f each, are kept coaxially in contact with each other such that the focal length of the combination is F 1 . When the space between the two lenses is filled with glycerine (which has the same refractive index (μ = 1.5) as that of glass) then the equivalent focal length is F 2 . The ratio F 1 : F 2 will be : (2019)`,
        A: `2 : 1`, B: `1 : 2`, C: `2 : 3`, D: `3 : 4`
    },
    {
        qNo: 18, topic: 'General', year: '2016',
        text: `Two identical glass (μ g = 3/2) equiconvex lenses of focal length f each are kept in contact. The space between the two lenses is filled with water (μ w = 4/3). The focal length of the combination is: (2016 - II)`,
        A: `4f/3`, B: `3f/4`, C: `f/3`, D: `f`
    },
    {
        qNo: 19, topic: 'General', year: '2020',
        text: `Two identical thin plano-convex glass lenses (refractive index 1.5) each having radius of curvature of 20 cm are placed with their convex surfaces in contact at the center. The intervening space is filled with oil of refractive index 1.`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 20, topic: 'General', year: '2015',
        text: `The focal length of the combination is: (2015)`,
        A: `–25 cm`, B: `–50 cm`, C: `50 cm`, D: `–20 cm Refraction Through Prism and Dispersion Through Prism`
    },
    {
        qNo: 21, topic: 'General', year: '2020',
        text: `A ray is incident at an angle of incidence i on one surface of a small angle prism (with angle of prism A) and emerges normally from the opposite surface. If the refractive index of the material of the prism is m, then the angle of incidence is nearly equal to : (2020)`,
        A: `2A μ`, B: `m A`, C: `2A 2`, D: `A 2 μ`
    },
    {
        qNo: 22, topic: 'General', year: '2018',
        text: `The refractive index of the material of a prism is 2 and the angle of the prism is 30º. One of the two refracting surfaces of the prism is made a mirror inwards, by silver coating. A beam of monochromatic light entering the prism from the other face will retrace its path (after reflection from the silvered surface) if its angle of incidence on the prism is: (2018)`,
        A: `30º`, B: `45º`, C: `60º`, D: `Zero Ray Optics and Optical Instruments 3`
    },
    {
        qNo: 23, topic: 'General', year: '2016',
        text: `The angle of incidence for a ray of light at a refracting surface of a prism is 45°. The angle of prism is 60°. If the ray suffers minimum deviation through the prism, the angle of minimum deviation and refractive index of the material of the prism respectively, are: (2016 - I)`,
        A: `1 45 ; 2 °`, B: `30 ; 2 °`, C: `45 ; 2 °`, D: `1 30 ; 2 °`
    },
    {
        qNo: 24, topic: 'General', year: '2015',
        text: `The refracting angle of a prism is A, and refractive index of the material of the prism is cot(A/2). The angle of minimum deviation is: (2015)`,
        A: `180 ° – 2 A`, B: `90° – A`, C: `180° + 2 A`, D: `180° – 3 A`
    },
    {
        qNo: 25, topic: 'General', year: '2014',
        text: `The angle of a prism is A. One of its refracting surfaces is silvered. Light rays falling at an angle of incidence 2A on the first surface returns back through the same path after suffering reflection at the silvered surface. The refractive index μ, of the prism is: (2014)`,
        A: `2sin A`, B: `2 cos A`, C: `1/2 cos A`, D: `tan A Natural Phenomenon`
    },
    {
        qNo: 26, topic: 'General', year: '2019',
        text: `Pick the wrong answer in the context with rainbow. (2019)`,
        A: `When the light rays undergo two internal reflections in a water drop, a secondary rainbow is formed`, B: `The order of colours is reversed in the secondary rainbow`, C: `An observer can see a rainbow when his front is towards the sun`, D: `Rainbow is a combined effect of dispersion refraction and reflection of sunlight Defects of Vision and Power of Lens`
    },
    {
        qNo: 27, topic: 'General', year: '2022',
        text: `A biconvex lens has radii of curvature, 20 cm each. If the refractive index of the material of the lens is 1.5, the power of the lens is : (2022)`,
        A: `Infinity`, B: `+2D`, C: `+20D`, D: `+5D`
    },
    {
        qNo: 28, topic: 'General', year: '2020',
        text: `The power of a biconvex lens is 10 dioptre and the radius of curvature of each surface is 10 cm. Then the refractive index of the material of the lens is, (2020-Covid)`,
        A: `9 8`, B: `5 3`, C: `3 2`, D: `4 3`
    },
    {
        qNo: 29, topic: 'General', year: '2016',
        text: `A person can see clearly objects only when they lie between 50 cm and 400 cm from his eyes. In order to increase the maximum distance of distinct vision to infinity, the type and power of the correcting lens, the person has to use, will be: [RC] (2016 - II)`,
        A: `Concave, – 0.2 diopter`, B: `Convex, + 0.15 diopter`, C: `Convex, + 2.25 diopter`, D: `Concave, – 0.25 diopter`
    },
    {
        qNo: 30, topic: 'General', year: '2013',
        text: `For a normal eye, the cornea of eye provides a converging power of 40 D and the least converging power of the eye lens behind the cornea is 20 D. Using this information, the distance between the retina and the cornea of eye lens can be estimated to be: [RC] (2013)`,
        A: `1.5 cm`, B: `5 cm`, C: `2.5 cm`, D: `1.67 cm Simple and Compound Microscope`
    },
    {
        qNo: 31, topic: 'General', year: '2014',
        text: `If the focal length of objective lens is increased then magnifying power of: (2014)`,
        A: `Microscope will increase but that of telescope decrease`, B: `Microscope and telescope both will increase`, C: `Microscope and telescope both will decrease`, D: `Microscope will decrease but that of telescope will increase Telescope`
    },
    {
        qNo: 32, topic: 'General', year: '2021',
        text: `A lens of large focal length and large aperture is best suited as an objective of an astronomical telescope since: (2021)`,
        A: `a large aperture contributes to the quality and visibility of the images.`, B: `a large area of the objective ensures better light gathering power.`, C: `a large aperture provides a better resolution.`, D: `all of the above.`
    },
    {
        qNo: 33, topic: 'General', year: '2016',
        text: `An astronomical telescope has objective and eyepiece of focal length 40 cm and 4 cm respectively. To view an object 200 cm away from the objective, the lenses must be separated by a distance: (2016 - I)`,
        A: `37.3 cm`, B: `46.0 cm`, C: `50.0 cm`, D: `54.0 cm`
    },
    {
        qNo: 34, topic: 'General', year: '2015 Pre',
        text: `In an astronomical telescope in normal adjustment a straight black line of length L is drawn on inside part of objective lens. The eye-piece forms a real image of this line. The length of this image is I. The magnification of the telescope is: (2015 Pre)`,
        A: `L I`, B: `L 1 I +`, C: `L 1 I −`, D: `L 1 I 1 + − Chapter & Topicwise NEET PYQ's P W 4 Miscellaneous`
    },
    {
        qNo: 35, topic: 'General', year: '2021',
        text: `A point object is placed at a distance of 60 cm from a convex lens of focal length 30 cm. If a plane mirror were put perpendicular to the principal axis of the lens and at a distance of 40 cm from it, the final image would be formed at a distance of: (2021) 60 cm 40 cm`,
        A: `30 cm from the lens, it would be a real image.`, B: `30 cm from the plane mirror, it would be a virtual image.`, C: `20 cm from the plane mirror, it would be a virtual image.`, D: `20 cm from the lens, it would be a real image.`
    },
    {
        qNo: 36, topic: 'General', year: '2017',
        text: `A beam of light from a source L is incident normally on a plane mirror fixed at a certain distance x from the source. The beam is reflected back as a spot on a scale placed just above the source L. When the mirror is rotated through a small angle θ , the spot of the light is found to move through a distance y on the scale. The angle θ is given by: (2017-Delhi)`,
        A: `y x`, B: `2 x y`, C: `x y`, D: `y 2x 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 d b a d d a a c a d a a d a b b b 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 b b b a b c d c d d d d d a c d Answer Key`
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
