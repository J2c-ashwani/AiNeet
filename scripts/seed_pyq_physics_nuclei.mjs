/**
 * Seed REAL NEET PYQs — Chapter: Nuclei (Physics)
 * Usage: node scripts/seed_pyq_physics_nuclei.mjs
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

const CHAPTER_NAME = 'Nuclei';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'Mass-Energy and Nuclear Binding Energy',
    'Nuclear Energy (Fission)',
    'Atomic Masses (Electron Volt)',
    'Radioactivity (Alpha/Beta Decay)',
    'Radioactivity (Half-Life/Mean-Life)',
    'Composition of Nucleus',
    'Nuclear Density',
    'Nuclear Energy (Chain Reaction)'
];

const ANSWER_KEY = {
    1: 'D', 2: 'A', 3: 'A', 4: 'A', 5: 'C', 6: 'D', 7: 'C', 8: 'A', 9: 'B', 10: 'C', 11: 'A', 12: 'C', 13: 'A', 14: 'A', 15: 'D', 16: 'B', 17: 'D', 18: 'D', 19: 'D'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Mass-Energy and Nuclear Binding Energy', year: '2020',
        text: `A nucleus of mass number 189 splits into two nuclei having mass number 125 and`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 2, topic: 'Nuclear Energy (Fission)', year: '2022',
        text: `The ratio of radius of two daughter nuclei respectively is : (2022)`,
        A: `25 : 16`, B: `1 : 1`, C: `4 : 5`, D: `5 : 4`
    },
    {
        qNo: 3, topic: 'Atomic Masses (Electron Volt)', year: '2020',
        text: `The energy equivalent of 0.5 g of a substance is : (2020)`,
        A: `4.5 × 10 13 J`, B: `1.5 × 10 13 J`, C: `0.5 × 10 13 J`, D: `4.5 × 10 16 J`
    },
    {
        qNo: 4, topic: 'Radioactivity (Alpha/Beta Decay)', year: '2015',
        text: `If radius of the 12 27 Al nucleus is taken to be R Al , then the radius of 53 125 Te nucleus is nearly: (2015)`,
        A: `Al 5 R 3`, B: `Al 3 R 5`, C: `1 3 Al 13 R 53      `, D: `1 3 Al 53 R 13       Mass Energy, Nuclear Binding Energy and Nuclear Force`
    },
    {
        qNo: 5, topic: 'Radioactivity (Half-Life/Mean-Life)', year: '2021',
        text: `A nucleus with mass number 240 breaks into two fragments each of mass number 120, the binding energy per nucleon of unfragmented nuclei is 7.6 MeV while that of fragments is 8.5 MeV. The total gain in the Binding Energy in the process is: (2021)`,
        A: `9.4 MeV`, B: `804 MeV`, C: `216 MeV`, D: `0.9 MeV Radioactive Decay Law, Half-Life and Average Life and Activity of a Radioactive Substance`
    },
    {
        qNo: 6, topic: 'Composition of Nucleus', year: '2020',
        text: `The half life of a radioactive sample undergoing α-decay is 1.4 × 10 17 s. If the number of nuclei in the sample is 2.0 × 10 21 , the activity of the sample is nearly. [RC] (2020-Covid)`,
        A: `10 5 Bq`, B: `10 6 Bq`, C: `10 3 Bq`, D: `10 4 Bq`
    },
    {
        qNo: 7, topic: 'Nuclear Density', year: '2018',
        text: `For a radioactive material, half-life is 10 minutes. If initially there are 600 number of nuclei, the time taken (in minutes) for the distintegration of 450 nuclei is [RC] (2018)`,
        A: `30`, B: `10`, C: `20`, D: `15`
    },
    {
        qNo: 8, topic: 'Nuclear Energy (Chain Reaction)', year: '2017',
        text: `Radioactive material ‘A’ has decay constant ‘8λ’ and material ‘B’ has decay constant ‘λ’. Initially they have same number of nuclei. After what time, the ratio of number of nuclei of material ‘A’ to that of ‘B’ will be 1/e? [RC] (2017-Delhi)`,
        A: `1 7 λ`, B: `1 8 λ`, C: `1 9 λ`, D: `1 λ`
    },
    {
        qNo: 9, topic: 'Mass-Energy and Nuclear Binding Energy', year: '2016',
        text: `The half-life of a radioactive substance is 30 minutes. The time (in minutes) taken between 40% decay and 85% decay of the same radioactive substance is: [RC] (2016 - II)`,
        A: `45`, B: `60`, C: `15`, D: `30`
    },
    {
        qNo: 10, topic: 'Nuclear Energy (Fission)', year: '2020',
        text: `A radio isotope X with a half life of 1.4 × 10 9 years decays to Y which is stable. A sample of the rock from a cave was found to contain X and Y in the ratio 1 :`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 11, topic: 'Atomic Masses (Electron Volt)', year: '2014',
        text: `The age of the rock is: [RC] (2014)`,
        A: `1.96 × 10 9 years`, B: `3.92 × 10 9 years`, C: `4.20 × 10 9 years`, D: `8.40 × 10 9 years 13 C H A P T E R Nuclei Nuclei 2`
    },
    {
        qNo: 12, topic: 'Radioactivity (Alpha/Beta Decay)', year: '2013',
        text: `The half life of a radioactive isotope ‘ X ’ is 20 years. It decays to another element ‘ Y ’ which is stable. The two elements ‘ X ’ and ‘ Y ’ were found to be in the ratio 1 : 7 in a sample of a given rock. The age of the rock is estimated to be: [RC] (2013)`,
        A: `100 years`, B: `40 years`, C: `60 years`, D: `80 years Alpha, Beta and Gamma Decay`
    },
    {
        qNo: 13, topic: 'Radioactivity (Half-Life/Mean-Life)', year: '2020',
        text: `What happens to the mass number and atomic number of an element when it emits γ-radiation ? [RC] (2020-Covid)`,
        A: `Mass number and atomic number remain unchanged.`, B: `Mass number remains unchanged while atomic number decreases by one`, C: `Mass number increases by four and atomic number increases by two`, D: `Mass number decreases by four and atomic number decreases by two`
    },
    {
        qNo: 14, topic: 'Composition of Nucleus', year: '2019',
        text: `α-particle consists of : [RC] (2019)`,
        A: `2 protons and 2 neutrons only`, B: `2 electrons, 2 protons and 2 neutrons`, C: `2 electrons and 4 protons only`, D: `2 protons only Nuclear Reactions`
    },
    {
        qNo: 15, topic: 'Nuclear Density', year: '2022',
        text: `In the given nuclear reaction, the element X is : 22 11 Na → X + e + + ν (2022)`,
        A: `22 12 Mg`, B: `22 11 Na`, C: `22 10 Ne`, D: `22 10 Ne`
    },
    {
        qNo: 16, topic: 'Nuclear Energy (Chain Reaction)', year: '2021',
        text: `A radioactive nucleus A Z X undergoes spontaneous decay in the sequence A Z Z 1 Z 3 Z 2 X B C D − − − → → → , where Z is the atomic number of element X. The possible decay particles in the sequence are: (2021)`,
        A: `a , b + , b –`, B: `b + , a , b –`, C: `b – , a , b +`, D: `a , b – , b +`
    },
    {
        qNo: 17, topic: 'Mass-Energy and Nuclear Binding Energy', year: '2020',
        text: `When a uranium isotope 235 92 U is bombarded with a neutron, it generates 89 36 Kr, three neutrons and : (2020)`,
        A: `91 40 Zr`, B: `101 36 Kr`, C: `103 36 Kr`, D: `144 56 Br`
    },
    {
        qNo: 18, topic: 'Nuclear Energy (Fission)', year: '2014',
        text: `The binding energy per nucleon of 7 3 Li and 4 2 He nuclei are 5.60 MeV and 7.06 MeV, respectively. In the nuclear reaction 7 3 Li + 1 1 H → 4 2 He + 4 2 He + Q the value of energy Q released is: (2014)`,
        A: `19.6 MeV`, B: `–2.4 MeV`, C: `8.4 MeV`, D: `17.3 MeV Nuclear Fission and Nuclear Fusion`
    },
    {
        qNo: 19, topic: 'Atomic Masses (Electron Volt)', year: '2013',
        text: `A certain mass of Hydrogen is changed to Helium by the process of fusion. The mass defect in fusion reaction is 0.02866 u. The energy liberated per u is (given 1 u = 931 MeV): (2013)`,
        A: `13.35 MeV`, B: `2.67 MeV`, C: `26.7 MeV`, D: `6.675 MeV 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 d a a c d c a b c c a a d b d d d Answer Key`
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
