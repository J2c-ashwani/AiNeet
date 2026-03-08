/**
 * Seed REAL NEET PYQs — Chapter: Dual Nature of Radiation and Matter (Physics)
 * Usage: node scripts/seed_pyq_physics_dual_nature_of_radiation_and_matter.mjs
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

const CHAPTER_NAME = 'Dual Nature of Radiation and Matter';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'General'
];

const ANSWER_KEY = {
    1: 'A', 2: 'B', 3: 'C', 4: 'C', 5: 'D', 6: 'B', 7: 'C', 8: 'A', 9: 'B', 10: 'B', 11: 'B', 12: 'D', 13: 'B', 14: 'B', 15: 'C', 16: 'D', 17: 'B', 18: 'C', 19: 'A', 20: 'A', 21: 'A', 22: 'C', 23: 'A', 24: 'B', 25: 'B', 26: 'D', 27: 'C', 28: 'A', 29: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'General', year: '2020',
        text: `The graph which shows the variation of the de-Broglie wavelength ( l ) of a particle and its associated momentum (P) is: ( 2022 )`,
        A: `P l`, B: `P l`, C: `P l`, D: `P l`
    },
    {
        qNo: 2, topic: 'General', year: '2020',
        text: `The number of photons per second on an average emitted by the source of monochromatic light of wavelength 600 nm, when it delivers the power of 3.3 × 10 –3 watt will be: (h = 6.6 × 10 –34 Js) ( 2021 )`,
        A: `10 17`, B: `10 16`, C: `10 15`, D: `10 18`
    },
    {
        qNo: 3, topic: 'General', year: '2020',
        text: `Light of frequency 1.5 times the threshold frequency is incident on a photosensitive material. What will be the photoelectric current if the frequency is halved and intensity is doubled? ( 2020 )`,
        A: `Four times`, B: `One-fourth`, C: `Zero`, D: `Doubled`
    },
    {
        qNo: 4, topic: 'General', year: '2020',
        text: `When the light of frequency 2ν 0 (where ν 0 is threshold frequency), is incident on a metal plate, the maximum velocity of electrons emitted is v 1 . When the frequency of the incident radiation is increased to 5v 0 , the maximum velocity of electrons emitted from the same plate is v 2 . The ratio of v 1 to v 2 is: ( 2018 )`,
        A: `4 : 1`, B: `1 : 4`, C: `1 : 2`, D: `2 : 1`
    },
    {
        qNo: 5, topic: 'General', year: '2020',
        text: `The photoelectric threshold wavelength of silver is 3250 × 10 –10 m. The velocity of the electron ejected from a silver surface by ultraviolet light of wavelength 2536 × 10 –10 m is: ( 2017-Delhi ) (Given h = 4.14 × 10 –15 eV and c = 3 × 10 8 ms –1 )`,
        A: `≈ 0.6 × 10 6 ms –1`, B: `≈ 61 × 10 3 ms –1`, C: `≈ 0.3 × 10 6 ms –1`, D: `≈ 6 × 10 5 ms –1`
    },
    {
        qNo: 6, topic: 'General', year: '2020',
        text: `When a metallic surface is illuminated with radiation of wavelength λ, the stopping potential is V. If the same surface is illuminated with radiation of wavelength 2λ, the stopping potential is V/`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 7, topic: 'General', year: '2020',
        text: `The threshold wavelength for the metallic surface is: ( 2016-I )`,
        A: `4λ`, B: `5λ`, C: `5 2 λ`, D: `3λ`
    },
    {
        qNo: 8, topic: 'General', year: '2020',
        text: `Photons with energy 5 eV are incident on a cathode C in a photoelectric cell. The maximum energy of emitted photoelectrons is 2 eV. When photons of energy 6 eV are incident on C, no photoelectrons will reach the anode A, if the stopping potential of A relative to C is: ( 2016-II )`,
        A: `– 1 V`, B: `– 3 V`, C: `+ 3 V`, D: `+ 4 V`
    },
    {
        qNo: 9, topic: 'General', year: '2020',
        text: `A certain metallic surface is illuminated with monochromatic light of wavelength λ. The stopping potential for photo- electric current for this light is 3 V 0 . If the same surface is illuminated with light of wavelength 2λ, the stopping potential is V 0 . The threshold wavelength for this surface for photoelectric effect is: ( 2015 )`,
        A: `4λ`, B: `4 λ`, C: `6 λ`, D: `6 l`
    },
    {
        qNo: 10, topic: 'General', year: '2020',
        text: `A photoelectric surface is illuminated successively by monochromatic light of wavelength λ and λ/`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 11, topic: 'General', year: '2020',
        text: `If the maximum kinetic energy of the emitted photoelectrons in the second case is 3 times that in the first case, the work function of the surface of the material is: (h = Plank’s constant, c = speed of light) ( 2015 Re )`,
        A: `hc 3 λ`, B: `hc 2 λ`, C: `hc λ`, D: `2hc λ`
    },
    {
        qNo: 12, topic: 'General', year: '2020',
        text: `When the energy of the incident radiation is increased by 20%, the kinetic energy of the photoelectrons emitted from a metal surface increased from 0.5 eV to 0.8 eV. The work function of the metal is: ( 2014 )`,
        A: `0.65 eV`, B: `1.0 eV`, C: `1.3 eV`, D: `1.5 eV 11 C H A P T E R Dual Nature of Radiation and Matter Dual Nature of Radiation and Matter 2`
    },
    {
        qNo: 13, topic: 'General', year: '2020',
        text: `For photoelectric emission from certain metal the cut-off frequency is ν . If radiation of frequency 2 ν impinges on the metal plate, the maximum possible velocity of the emitted electron will be: (m is the electron mass) ( 2013 )`,
        A: `h 2 m ν`, B: `( ) h 2m ν`, C: `h m ν`, D: `2h m ν Unit Conversion`
    },
    {
        qNo: 14, topic: 'General', year: '2020',
        text: `The energy required to break one bond in DNA is 10 –20 J. This value in eV is nearly. (2020)`,
        A: `0.6`, B: `0.06`, C: `0.006`, D: `6 Wave Nature of Matter (De-Broglie Wavelength)`
    },
    {
        qNo: 15, topic: 'General', year: '2020',
        text: `When two monochromatic light of frequency, n and n are incident on a photoelectric metal, their stopping potential becomes V s /2 and V s respectively. The threshold frequency for this metal is: ( 2022 )`,
        A: `3 2 ν`, B: `2 n`, C: `3 n`, D: `2 3 ν`
    },
    {
        qNo: 16, topic: 'General', year: '2020',
        text: `An electromagnetic wave of wavelength ‘ l ’ is incident on a photosensitive surface of negligible work function. If ‘m’ mass is of photoelectron emitted from the surface has de-Broglie wavelength l d , then: ( 2021 )`,
        A: `2 d 2mc h   λ = λ    `, B: `2 d 2mc h   λ = λ    `, C: `2 d 2h mc   λ = λ    `, D: `2 d 2m hc   λ = λ    `
    },
    {
        qNo: 17, topic: 'General', year: '2020',
        text: `An electron is accelerated from rest through a potential difference of V volt. If the de Broglie wavelength of the electron is 1.227 × 10 –2 nm, the potential difference is : (2020)`,
        A: `10 2 V`, B: `10 3 V`, C: `10 4 V`, D: `10 V`
    },
    {
        qNo: 18, topic: 'General', year: '2020',
        text: `The de Broglie wavelength of an electron moving with kinetic energy of 144 eV is nearly, ( 2020-Covid )`,
        A: `102 × 10 –4 nm`, B: `102 × 10 –5 nm`, C: `102 × 10 –2 nm`, D: `102 × 10 –3 nm`
    },
    {
        qNo: 19, topic: 'General', year: '2020',
        text: `An electron is accelerated through a potential difference of 10,000 V. Its de Broglie wavelength is, (nearly) : (m e = 9 × 10 –31 kg) ( 2019 )`,
        A: `12.2 × 10 –13 m`, B: `12.2 × 10 –12 m`, C: `12.2 × 10 –14 m`, D: `12.2 nm`
    },
    {
        qNo: 20, topic: 'General', year: '2020',
        text: `An electron of mass m with an initial velocity ( ) 0 0 ˆ V V i V 0 = >  enters an electric field ( ) 0 0 ˆ E E i E constant 0 = − = >  at t =`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 21, topic: 'General', year: '2020',
        text: `If λ 0 is its de-Broglie wavelength initially, then its de-Broglie wavelength at time t is ( 2018 )`,
        A: `λ 0 t`, B: `0 0 0 eE 1 t mVf   λ +    `, C: `0 0 0 eE 1 t mV λ   +    `, D: `λ 0`
    },
    {
        qNo: 22, topic: 'General', year: '2020',
        text: `The de-Broglie wavelength of a neutron in thermal equilibrium with heavy water at a temperature T (Kelvin) and mass m, is: ( 2017-Delhi )`,
        A: `h 3mkT`, B: `2h 3mkT`, C: `2h mkT`, D: `h mkT`
    },
    {
        qNo: 23, topic: 'General', year: '2020',
        text: `An electron of mass m and a photon have same energy E. The ratio of de-Broglie wavelengths associated with them is (c being velocity of light) ( 2016-I )`,
        A: `1 2 1 E c 2m      `, B: `1 2 E 2m      `, C: `( ) 1 2 c 2mE`, D: `1 2 1 2m c E      `
    },
    {
        qNo: 24, topic: 'General', year: '2020',
        text: `Electrons of mass m with de-Broglie wavelength λ fall on the target in an X-ray tube. The cutoff wavelength ( λ 0 ) of the emitted X-ray is: ( 2016-II )`,
        A: `2 2 2 0 2 2m c h λ λ =`, B: `λ 0 = λ`, C: `2 0 2mc h λ λ =`, D: `0 2h mc λ =`
    },
    {
        qNo: 25, topic: 'General', year: '2020',
        text: `Which of the following figures represent the variation of particle momentum and the associated de-Broglie wavelength? ( 2015 )`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 26, topic: 'General', year: '2020',
        text: `If the kinetic energy of the particle is increased to 16 times its previous value, the percentage change in the de-Broglie wavelength of the particle is ( 2014 )`,
        A: `25`, B: `75`, C: `60`, D: `50`
    },
    {
        qNo: 27, topic: 'General', year: '2020',
        text: `The wavelength λ e of an electron and λ p of a photon of same energy E are related by: ( 2013 )`,
        A: `p e 1 λ ∝ λ`, B: `2 p e λ ∝ λ`, C: `λ p ∝ λ e`, D: `p e λ ∝ λ Chapter & Topicwise NEET PYQ's P W 3 Parameters of Photon (Momentum, Pressure and Energy)`
    },
    {
        qNo: 28, topic: 'General', year: '2020',
        text: `Light of wavelength 5000 nm is incident on a metal with work function 2.28 eV. The de-Broglie wavelength of the emitted electron is: ( 2015 Re )`,
        A: `≤ 2.8 × 10 –12 m`, B: `< 2.8 × 10 –10 m`, C: `< 2.8 × 10 –9 m`, D: `≥ 2.8 × 10 –9 m Davisson and Germer Experiment`
    },
    {
        qNo: 29, topic: 'General', year: '2020',
        text: `The wave nature of electrons was experimentally verified by. [RC] ( 2020-Covid )`,
        A: `Hertz`, B: `Einstein`, C: `Davisson and Germer`, D: `de-Broglie 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 a b c c a,d d b a b b d b None b c d b 18 19 20 21 22 23 24 25 26 c a a c a b b d c Answer Key`
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
