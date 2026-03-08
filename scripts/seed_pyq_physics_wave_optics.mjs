/**
 * Seed REAL NEET PYQs — Chapter: Wave Optics (Physics)
 * Usage: node scripts/seed_pyq_physics_wave_optics.mjs
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

const CHAPTER_NAME = 'Wave Optics';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'Polarisation by Reflection (Brewster\'s Law)',
    'Interference (YDSE - Positions of Fringes)',
    'YDSE Fringe Width',
    'Interference (YDSE - Shape of Fringes)'
];

const ANSWER_KEY = {
    1: 'D', 2: 'A', 3: 'B', 4: 'D', 5: 'B', 6: 'B', 7: 'C', 8: 'D', 9: 'B', 10: 'A', 11: 'C', 12: 'D', 13: 'D', 14: 'B', 15: 'D', 16: 'D', 17: 'D', 18: 'D', 19: 'D', 20: 'D', 21: 'A', 22: 'B', 23: 'B', 24: 'B', 25: 'B'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Polarisation by Reflection (Brewster\'s Law)', year: '2016',
        text: `The interference pattern is obtained with two coherent light sources of intensity ratio n. In the interference pattern, the ratio max min max min I I I + I − will be: (2016 - II)`,
        A: `( ) 2 n n 1 +`, B: `( ) 2 2 n n 1 +`, C: `n n 1 +`, D: `2 n n 1 + Interference and Young’s Double Slit Experiment`
    },
    {
        qNo: 2, topic: 'Interference (YDSE - Positions of Fringes)', year: '2022',
        text: `In a Young’s double slit experiment, a student observes 8 fringes in a certain segment of screen when a monochromatic light of 600 nn wavelength is used. If the wavelength of light is changed to 400 nm, then the number of fringes he would observe in the same region of the screen is (2022)`,
        A: `12`, B: `6`, C: `8`, D: `9`
    },
    {
        qNo: 3, topic: 'YDSE Fringe Width', year: '2020',
        text: `In Young’s double slit experiment, if the separation between coherent sources is halved and the distance of the screen from the coherent sources is doubled, then the fringe width becomes: (2020)`,
        A: `Half`, B: `Four times`, C: `One-fourth`, D: `Double`
    },
    {
        qNo: 4, topic: 'Interference (YDSE - Shape of Fringes)', year: '2020',
        text: `Two coherent sources of light interfere and produce fringe pattern on a screen. For central maximum, the phase difference between the two waves will be. (2020-Covid)`,
        A: `π`, B: `3π/2`, C: `π/2`, D: `Zero`
    },
    {
        qNo: 5, topic: 'Polarisation by Reflection (Brewster\'s Law)', year: '2019',
        text: `In a double slit experiment, when light of wavelength 400 nm was used, the angular width of the first minima formed on a screen placed 1 m away, was found to be 0.2°. What will be the angular width of the first minima, if the entire experimental apparatus is immersed in water? (μ water = 4/3) (2019)`,
        A: `0.266°`, B: `0.15°`, C: `0.05°`, D: `0.1°`
    },
    {
        qNo: 6, topic: 'Interference (YDSE - Positions of Fringes)', year: '2018',
        text: `In Young’s double slit experiment the separation d between the slits is 2 mm, the wavelength λ of the light used is 5896 Å and distance D between the screen and slits is 100 cm. It is found that the angular width of the fringes is 0.20°. To increase the fringe angular width to 0.21° (with same λ and D) the separation between the slits needs to be changed to (2018)`,
        A: `2.1 mm`, B: `1.9 mm`, C: `1.8 mm`, D: `1.7 mm`
    },
    {
        qNo: 7, topic: 'YDSE Fringe Width', year: '2017',
        text: `Young’s double slit experiment is first performed in air and then in a medium other than air. It is found that 8 th bright fringe in the medium lies where 5 th dark fringe lies in air. The refractive index of the medium is nearly: (2017-Delhi)`,
        A: `1.59`, B: `1.69`, C: `1.78`, D: `1.25`
    },
    {
        qNo: 8, topic: 'Interference (YDSE - Shape of Fringes)', year: '2016',
        text: `The intensity at the maximum in a Young’s double slit experiment is I 0 . Distance between two slits is d = 5λ, where λ is the wavelength of light used in the experiment. What will be the intensity in front of one of the slits on the screen placed at a distance D = 10d? (2016 - I)`,
        A: `I 0`, B: `0 I 4`, C: `0 3 I 4`, D: `0 I 2`
    },
    {
        qNo: 9, topic: 'Polarisation by Reflection (Brewster\'s Law)', year: '2020',
        text: `Two slits in Young’s experiment have widths in the ratio 1 :`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 10, topic: 'Interference (YDSE - Positions of Fringes)', year: '2015 Re',
        text: `The ratio of intensity at the maxima and minima in the interference pattern, max min I I is: (2015 Re)`,
        A: `4/9`, B: `9/4`, C: `12/149`, D: `49/121 10 C H A P T E R Wave Optics Chapter & Topicwise NEET PYQ's P W 2`
    },
    {
        qNo: 11, topic: 'YDSE Fringe Width', year: '2014',
        text: `In the Young’s double-slit experiment, the intensity of light at a point on the screen where the path difference is λ is K, (λ being the wavelength of light used). The intensity at a point where the path difference is λ/4,will be: (2014)`,
        A: `K`, B: `4K`, C: `K /2`, D: `Zero`
    },
    {
        qNo: 12, topic: 'Interference (YDSE - Shape of Fringes)', year: '2013',
        text: `In Young’s double slit experiment, the slits are 2 mm apart and are illuminated by photons of two wavelengths λ 1 = 12000 o A and λ 2 = 10000 o A . At what minimum distance from the common central bright fringe on the screen 2 m from the slit will a bright fringe from one interference pattern coincide with a bright fringe from the other? (2013)`,
        A: `4 mm`, B: `3 m`, C: `8 mm`, D: `6 mm Diffraction of Light From a Narrow Slit`
    },
    {
        qNo: 13, topic: 'Polarisation by Reflection (Brewster\'s Law)', year: '2016',
        text: `In a diffraction pattern due to a single slit of width a, the first minima is observed at an angle 30° when light of wavelength 5000 Å is incident on the slit. The first secondary maximum is observed at an angle of: (2016 - I)`,
        A: `1 1 sin 4 −      `, B: `sin 3 −      `, C: `1 1 sin 2 −      `, D: `1 3 sin 4 −      `
    },
    {
        qNo: 14, topic: 'Interference (YDSE - Positions of Fringes)', year: '2016',
        text: `A linear aperture whose width is 0.02 cm is placed immediately in front of a lens of focal length 60 cm. The aperture is illuminated normally by a parallel beam of wavelength 5 × 10 –5 cm. The distance of the first dark band of the diffraction pattern from the center of the screen is: (2016 - II)`,
        A: `0.20 cm`, B: `0.15 cm`, C: `0.10 cm`, D: `0.25 cm`
    },
    {
        qNo: 15, topic: 'YDSE Fringe Width', year: '2015',
        text: `For a parallel beam of monochromatic light of wavelength ‘λ’, diffraction is produced by a single slit whose width ‘ a’ is of the order of the wavelength of the light. If ‘D’ is the distance of the screen from the slit, the width of the central maxima will be: (2015)`,
        A: `D a λ`, B: `Da / λ`, C: `l2D/a`, D: `2D a λ`
    },
    {
        qNo: 16, topic: 'Interference (YDSE - Shape of Fringes)', year: '2015',
        text: `In a double slit experiment, the two slits are 1 mm apart and the screen is placed 1 m away. A monochromatic light of wavelength 500 nm is used. What will be the width of each slit for obtaining ten maxima of double slit within the central maxima of single slit pattern? (2015)`,
        A: `0.1 mm`, B: `0.5 mm`, C: `0.02 mm`, D: `0.2 mm`
    },
    {
        qNo: 17, topic: 'Polarisation by Reflection (Brewster\'s Law)', year: '2015 Re',
        text: `At the first minimum adjacent to the central maximum of a single-slit diffraction pattern the phase difference between the Huygens’s wavelength from the edge of the slit and the wavelet from the mid point of the slit is: (2015 Re)`,
        A: `8 π`, B: `4 π`, C: `2`, D: `π`
    },
    {
        qNo: 18, topic: 'Interference (YDSE - Positions of Fringes)', year: '2014',
        text: `A beam of light of λ = 600 nm from a distant source falls on a single slit 1 mm wide and the resulting diffraction pattern is observed on a screen 2 m away. The distance between first dark fringes on either side of the central bright fringe is: (2014)`,
        A: `1.2 cm`, B: `1.2 mm`, C: `2.4 cm`, D: `2.4 mm`
    },
    {
        qNo: 19, topic: 'YDSE Fringe Width', year: '2013',
        text: `A parallel beam of fast moving electrons is incident normally on a narrow slit. A fluorescent screen is placed at a large distance from the slit. If the speed of the electrons is increased, which of the following statements is correct? (2013)`,
        A: `The angular width of the central maximum will be unaffected`, B: `Diffraction pattern is not observed on the screen in the case of electrons`, C: `The angular width of the central maximum of the diffraction pattern will increase`, D: `The angular width of the central maximum will decrease Resolving Power of Optical Instrument`
    },
    {
        qNo: 20, topic: 'Interference (YDSE - Shape of Fringes)', year: '2020',
        text: `Assume that light of wavelength 600 nm is coming from a star. The limit of resolution of telescope whose objective has a diameter of 2 m is: [RC] (2020)`,
        A: `1.83 × 10 –7 rad`, B: `7.32 × 10 –7 rad`, C: `6.00 × 10 –7 rad`, D: `3.66 × 10 –7 rad`
    },
    {
        qNo: 21, topic: 'Polarisation by Reflection (Brewster\'s Law)', year: '2018',
        text: `An astronomical refracting telescope will have large angular magnification and high angular resolution, when it has an objective lens of [RC] (2018)`,
        A: `Large focal length and large diameter`, B: `Large focal length and small diameter`, C: `Small focal length and large diameter`, D: `Small focal length and small diameter`
    },
    {
        qNo: 22, topic: 'Interference (YDSE - Positions of Fringes)', year: '2017',
        text: `The ratio of resolving powers of an optical microscope for two wavelengths λ 1 = 4000 Å and λ 2 = 6000 Å is [RC] (2017-Delhi)`,
        A: `9 : 4`, B: `3 : 2`, C: `16 : 81`, D: `8 : 27 Wave Optics 3 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 d a b d b b c d b c d d b d d d d 18 19 20 21 22 23 24 d d a b b b b Answer Key Polarization Phenomenon, Law of Malus and Brewster’s Law`
    },
    {
        qNo: 23, topic: 'YDSE Fringe Width', year: '2020',
        text: `The Brewsters angle i b for an interface should be : (2020)`,
        A: `30° < i b < 45°`, B: `45° < i b < 90°`, C: `i b =90°`, D: `0° < i b < 30°`
    },
    {
        qNo: 24, topic: 'Interference (YDSE - Shape of Fringes)', year: '2018',
        text: `Unpolarised light is incident from air on a plane surface of a material of refractive index ‘μ’. At a particular angle of incidence ‘i’, it is found that the reflected and refracted rays are perpendicular to each other. Which of the following options is correct for this situation? (2018)`,
        A: `1 1 i sin −   =   μ  `, B: `Reflected light is polarised with its electric vector perpendicular to the plane of incidence`, C: `Reflected light is polarised with its electric vector parallel to the plane incidence`, D: `1 1 i tan −   =   μ  `
    },
    {
        qNo: 25, topic: 'Polarisation by Reflection (Brewster\'s Law)', year: '2017',
        text: `Two Polaroids P 1 and P 2 are placed with their axis perpendicular to each other. Unpolarised light I 0 is incident on P 1 . A third polaroid P 3 is kept in between P 1 and P 2 such that its axis makes an angle 45 o with that of P 1 . The intensity of transmitted light through P 2 is: (2017-Delhi)`,
        A: `0 I 4`, B: `0 I 8`, C: `0 I 16`, D: `0 I 2`
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
