/**
 * Seed REAL NEET PYQs — Chapter: Classification of Elements and Periodicity in Properties (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_classification_of_elements_and_periodicity_in_properties.mjs
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

const CHAPTER_NAME = 'Classification of Elements and Periodicity in Properties';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Nomenclature of Elements',
    'Periodic Properties',
    'Electronic Configuration'
];

const ANSWER_KEY = {
    1: 'B', 2: 'C', 3: 'C', 4: 'A', 5: 'C', 6: 'B', 7: 'D', 8: 'B', 9: 'A', 10: 'B', 11: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Nomenclature of Elements', year: '2022',
        text: `The IUPAC name of an element with atomic number 119 is. (2022) a . ununcotium b. ununennium c. unnilennium d. unununnium`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 2, topic: 'Periodic Properties', year: '2020',
        text: `Identify the incorrect match (2020) Name IUPAC Official Name`,
        A: `Unnilunium (i) Mendelevium`, B: `Unniltrium (ii) Lawrencium`, C: `Unnilhexium (iii) Seaborgium`, D: `Unununnium (iv) Darmstadtium a.`
    },
    {
        qNo: 3, topic: 'Electronic Configuration', year: '2017',
        text: `The element Z = 114 has been discovered recently. It will belong to which of the following family group and electronic configuration? (2017-Delhi)`,
        A: `Nitrogen family, [Rn] 5 f 14 6 d 10 7 s 2 7 p 6`, B: `Halogen family, [Rn] 5 f 14 6 d 10 7 s 2 7 p 5`, C: `Carbon family, [Rn] 5 f 14 6 d 10 7 s 2 7 p 2`, D: `Oxygen family, [Rn] 5 f 14 6 d 10 7 s 2 7 p 4`
    },
    {
        qNo: 4, topic: 'Nomenclature of Elements', year: '2015',
        text: `The number of d-electrons in Fe 2+ (Z = 26) is not equal to the number of electrons in which one of the following? (2015)`,
        A: `p-electrons in Cl (Z = 17)`, B: `d-electrons in Fe (Z = 26)`, C: `p-electrons in Ne (Z = 10)`, D: `s-electrons in Mg (Z = 12) Periodic Trends in Properties of Elements`
    },
    {
        qNo: 5, topic: 'Periodic Properties', year: '2021',
        text: `From the following pairs of ions, which one is not an iso- electronic pair? (2021)`,
        A: `Na + , Mg 2+`, B: `Mn 2+ , Fe 3+`, C: `Fe 2+ , Mn 2+`, D: `O 2– , F –`
    },
    {
        qNo: 6, topic: 'Electronic Configuration', year: '2019',
        text: `For the second period elements, the correct increasing order of first ionisation enthalpy is: (2019)`,
        A: `Li < Be < B < C < N < C < F < Ne`, B: `Li < B < Be < C < O < N < F < Ne`, C: `Li < B < Be < C < N < O < F < Ne`, D: `Li < Be < B < C < O < N < F < Ne`
    },
    {
        qNo: 7, topic: 'Nomenclature of Elements', year: '2016',
        text: `In which of the following options, the order of arrangement does not agree with the variation of property indicated against it? (2016 - I)`,
        A: `Li < Na < K < Rb (increasing metallic radius)`, B: `Al 3+ < Mg 2+ < Na + < F ─ (increasing ionic size)`, C: `B < C < N < O (increasing first ionization enthalpy)`, D: `I < Br < Cl < F (increasing electron gain enthalpy)`
    },
    {
        qNo: 8, topic: 'Periodic Properties', year: '2015 Re',
        text: `The formation of the oxide ion, O 2– (g) from oxygen atom requires first an exothermic step and then an endothermic step as shown below: O (g) + e – → O – (g) ; Δ f H o = –141 kJ mol –1 O – (g) + e – → O 2– (g) ; Δ f H o = +780 kJ mol –1 Thus, process of formation of O 2– in gas phase is unfavourable even though O 2– is isoelectronic with neon. It is due to the fact that, (2015 Re)`,
        A: `O – ion has comparatively smaller size than oxygen atom`, B: `Oxygen is more electronegative`, C: `Addition of electron in oxygen results in larger size of the ion`, D: `Electron repulsion outweighs the stability gained by achieving noble gas configuration`
    },
    {
        qNo: 9, topic: 'Electronic Configuration', year: '2015',
        text: `The species Ar, K + and Ca 2+ contain the same number of electrons. In which order do their radii increase? (2015)`,
        A: `Ca 2+ < Ar < K +`, B: `Ca 2+ < K + < Ar`, C: `K + < Ar < Ca 2+`, D: `Ar < K + < Ca 2+ 3 C H A P T E R Classification of Elements and Periodicity in Properties Chapter & Topicwise NEET PYQ's P W 2`
    },
    {
        qNo: 10, topic: 'Nomenclature of Elements', year: '2014',
        text: `Be 2+ is isoelectronic with which of the following ions? (2014)`,
        A: `Li +`, B: `Na +`, C: `Mg 2+`, D: `H +`
    },
    {
        qNo: 11, topic: 'Periodic Properties', year: '2014',
        text: `Which of the following orders of ionic radii is correctly represented? (2014)`,
        A: `Na + > F – > O 2–`, B: `O 2– > F – > Na +`, C: `Al 3+ > Mg 2+ > N 3–`, D: `H – > H + > H 1 2 3 4 5 6 7 8 9 10 11 b c c a c b c,d d b a b Answer Key`
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
                correctOption, 'neet', 'Chemistry PYQ', q.year, 1, examName
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
