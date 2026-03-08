/**
 * Seed REAL NEET PYQs — Chapter: Redox Reactions (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_redox_reactions.mjs
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

const CHAPTER_NAME = 'Redox Reactions';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Oxidation Number',
    'Types of Redox Reaction',
    'Balancing of Redox Reaction'
];

const ANSWER_KEY = {
    1: 'B', 2: 'D', 3: 'A', 4: 'B', 5: 'B', 6: 'C', 7: 'C', 8: 'A', 9: 'A', 10: 'B'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Oxidation Number', year: '2020',
        text: `What is the change in oxidation number of carbon in the following reaction? (2020) CH 4 (g) + 4Cl 2 (g) → CCl 4 (l) + 4HCl(g)`,
        A: `0 to + 4`, B: `–4 to + 4`, C: `0 to –4`, D: `+4 to + 4`
    },
    {
        qNo: 2, topic: 'Types of Redox Reaction', year: '2020',
        text: `The oxidation number of the underlined atom in the following species (2020-Covid)`,
        A: `ClO 3 – is +5`, B: `K 2 Cr 2 O 7 is +6`, C: `HAuCl 4 is +3`, D: `Cu 2 O is –1 Identify the incorrect option`
    },
    {
        qNo: 3, topic: 'Balancing of Redox Reaction', year: '2019',
        text: `The correct structure of tribromooctaoxide is (2019)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 4, topic: 'Oxidation Number', year: '2016',
        text: `Hot concentrated sulphuric acid is a moderately strong oxidising agent. Which of the following reactions does not show oxidising behaviour? (2016 - I)`,
        A: `C + 2H 2 SO 4 → CO 2 + 2SO 2 + 2H 2 O`, B: `CaF 2 + H 2 SO 4 → CaSO 4 + 2HF`, C: `Cu + 2H 2 SO 4 → CuSO 4 + SO 2 + 2H 2 O`, D: `3S + 2H 2 SO 4 → 3SO 2 + 2H 2 O`
    },
    {
        qNo: 5, topic: 'Types of Redox Reaction', year: '2014',
        text: `In acidic medium, H 2 O 2 changes Cr 2 2 7 O − to CrO 5 which has two (—O—O—) bonds. Oxidation state of Cr in CrO 5 is: (2014)`,
        A: `+3`, B: `+6`, C: `–10`, D: `+5`
    },
    {
        qNo: 6, topic: 'Balancing of Redox Reaction', year: '2014',
        text: `The pair of compounds that can exist together is (2014)`,
        A: `FeCl 3 , SnCl 2`, B: `HgCl 2 , SnCl 2`, C: `FeCl 2 , SnCl 2`, D: `FeCl 3 , KI`
    },
    {
        qNo: 7, topic: 'Oxidation Number', year: '2014',
        text: `The oxidation state of Cr in CrO 5 is (2014)`,
        A: `–6`, B: `+12`, C: `+6`, D: `+4 Types of Redox Reactions and Balancing of Redox Reactions`
    },
    {
        qNo: 8, topic: 'Types of Redox Reaction', year: '2021',
        text: `Which of the following reactions is the metal displacement reaction? Choose the right option. (2021)`,
        A: `2 3 2 3 Cr O 2Al Al O 2Cr ∆ +  → +`, B: `2 2 Fe 2HCl FeCl H +  → + ↑`, C: `( ) 3 2 2 2 2Pb NO 2PbO 4NO O  → + + ↑`, D: `3 2 2KClO 2KCl 3O ∆  → +`
    },
    {
        qNo: 9, topic: 'Balancing of Redox Reaction', year: '2019',
        text: `Which of the following reactions are disproportionation reaction? (2019) A. 2 0 2Cu Cu Cu + +  → + B. 2 4 4 2 2 3MnO 4H 2MnO MnO 2H O − + − +  → + + C. 4 2 4 2 2 2KMnO K MnO MnO O ∆  → + + D. 2 ü 2MnO 3Mn 2H O 5MnO 4H − + ⊕ + +  → + Select the correct option from the following a.`,
        A: `and`, B: `only b.`, C: `,`, D: `and`
    },
    {
        qNo: 10, topic: 'Oxidation Number', year: '2018',
        text: `For the redox reaction 2 2 4 2 4 2 2 MnO C O H Mn CO H O − − + + + + → + + The correct coefficients of the reactants for the balanced equation are: (2018) MnO 4 – C 2 O 4 2– H +`,
        A: `16 5 2`, B: `2 5 16`, C: `5 16 2`, D: `2 16 5`
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
