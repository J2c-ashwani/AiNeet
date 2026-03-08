/**
 * Seed REAL NEET PYQs — Chapter: Biomolecules (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_biomolecules.mjs
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

const CHAPTER_NAME = 'Biomolecules';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Disaccharides',
    'Proteins',
    'Vitamins',
    'Enzymes',
    'Nucleic Acids',
    'Glucose',
    'Monosaccharides'
];

const ANSWER_KEY = {
    1: 'B', 2: 'C', 3: 'A', 4: 'D', 5: 'A', 6: 'C', 7: 'C', 8: 'C', 9: 'C', 10: 'D', 11: 'D', 12: 'D', 13: 'A', 14: 'C', 15: 'C', 16: 'C'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Disaccharides', year: '2020',
        text: `Sucrose on hydrolysis gives: (2020)`,
        A: `a -D-Glucose + b -D-Glucose`, B: `a -D-Glucose + b -D-Fructose`, C: `a -D-Fructose + b -D-Fructose`, D: `b -D-Glucose + a -D-Fructose`
    },
    {
        qNo: 2, topic: 'Proteins', year: '2020',
        text: `Which of the following statement is not true about glucose? (2020-Covid)`,
        A: `It contains five hydroxyl groups`, B: `It is a reducing sugar`, C: `It is an aldopentose`, D: `It is an aldohexose`
    },
    {
        qNo: 3, topic: 'Vitamins', year: '2018',
        text: `The difference between amylose and amylopectin is (2018)`,
        A: `Amylopectin have 1 → 4 α-linkage and 1 → 6 α-linkage`, B: `Amylose have 1 → 4 α-linkage and 1 → 6 β-linkage`, C: `Amylose is made up of glucose and galactose`, D: `Amylopectin have 1 → 4 α-linkage and 1 → 6 β-linkage`
    },
    {
        qNo: 4, topic: 'Enzymes', year: '2016',
        text: `The correct corresponding order of names of four aldoses with configuration given below: (2016 - II)`,
        A: `L-erythrose, L-threose, L-erythrose, D-threose`, B: `D-threose, D-erythrose, L-threose, L-erythrose`, C: `L-erythrose, L-threose, D-erythrose, D-threose`, D: `D-erythrose, D-threose, L-erythrose, L-threose`
    },
    {
        qNo: 5, topic: 'Nucleic Acids', year: '2016',
        text: `Which one given below is a non-reducing sugar? (2016 - I)`,
        A: `Sucrose`, B: `Maltose`, C: `Lactose`, D: `Glucose`
    },
    {
        qNo: 6, topic: 'Glucose', year: '2014',
        text: `D(+) glucose reacts with hydroxyl amine and yields an oxime. The structure of the oxime would be: (2014)`,
        A: `a. b. c. d. Proteins`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 7, topic: 'Monosaccharides', year: '2020',
        text: `Which of the following is a basic amino acid? (2020)`,
        A: `Alanine`, B: `Tyrosine`, C: `Lysine`, D: `Serine`
    },
    {
        qNo: 8, topic: 'Disaccharides', year: '2019',
        text: `The non-essential amino acid among the following is: (2019)`,
        A: `Valine`, B: `Leucine`, C: `Alanine`, D: `Lysine`
    },
    {
        qNo: 9, topic: 'Proteins', year: '2018',
        text: `Which of the following compounds can form a zwitter ion? (2018)`,
        A: `Aniline`, B: `Acetanilide`, C: `Glycine`, D: `Benzoic acid`
    },
    {
        qNo: 10, topic: 'Vitamins', year: '2016',
        text: `In a protein molecule, various amino acids are linked together by: (2016 - I)`,
        A: `Dative bond`, B: `α-glycosidic bond`, C: `β-glycosidic bond`, D: `Peptide bond 11 C H A P T E R Biomolecules Chapter & Topicwise NEET PYQ’s P W 2 Enzymes and Vitamins`
    },
    {
        qNo: 11, topic: 'Enzymes', year: '2022',
        text: `The incorrect statement regarding enzymes is (2022) a . Enzymes are very specific for a particular reaction and substrate b. Enzymes are biocatalysts c. Like chemical catalysts enzymes reduce the activation energy of bio process. d. Enzymes are polyssaccharides.`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 12, topic: 'Nucleic Acids', year: '2021',
        text: `The RBC deficiency is deficiency disease of: (2021)`,
        A: `Vitamin B 6`, B: `Vitamin B 1`, C: `Vitamin B 2`, D: `Vitamin B 12`
    },
    {
        qNo: 13, topic: 'Glucose', year: '2020',
        text: `Deficiency of which vitamin causes osteomalacia? (2020-Covid)`,
        A: `Vitamin D`, B: `Vitamin K`, C: `Vitamin E`, D: `Vitamin A Nucleic Acids`
    },
    {
        qNo: 14, topic: 'Monosaccharides', year: '2016',
        text: `The central dogma of molecular genetics states that the genetic information flows from: (2016 - II)`,
        A: `Amino acids → Proteins → DNA`, B: `DNA → Carbohydrates → Proteins`, C: `DNA → RNA → Proteins`, D: `DNA → RNA → Carbohydrates`
    },
    {
        qNo: 15, topic: 'Disaccharides', year: '2016',
        text: `The correct statement regarding RNA and DNA, respectively is: (2016 - I)`,
        A: `The sugar component in RNA is 2ʹ-deoxyribose and the sugar component in DNA is arabinose`, B: `The sugar component in RNA is arabinose and the sugar component in DNA is 2ʹ-deoxyribose`, C: `The sugar component in RNA is ribose and the sugar component in DNA is 2ʹ-deoxyribose`, D: `The sugar component in RNA is arabinose and the sugar component in DNA is ribose Hormones`
    },
    {
        qNo: 16, topic: 'Proteins', year: '2014',
        text: `Which of the following hormones is produced under the conditions of stress which stimulate glycogenolysis in the liver of human beings? (2014)`,
        A: `Thyroxin`, B: `Insulin`, C: `Adrenaline`, D: `Estradiol 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 b c a d a c c c c d d d a c c c Answer Key`
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
