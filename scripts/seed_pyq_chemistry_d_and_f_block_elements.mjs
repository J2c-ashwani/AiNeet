/**
 * Seed REAL NEET PYQs — Chapter: d- and f- Block Elements (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_d_and_f_block_elements.mjs
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

const CHAPTER_NAME = 'd- and f- Block Elements';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'General Properties of Transition Elements',
    'Inner Transition Elements',
    'Chemical Properties',
    'The Lanthanoids'
];

const ANSWER_KEY = {
    1: 'B', 2: 'A', 3: 'A', 4: 'A', 5: 'D', 6: 'B', 7: 'D', 8: 'B', 9: 'A', 10: 'B', 11: 'B', 12: 'C', 13: 'A', 14: 'C', 15: 'C', 16: 'B', 17: 'B', 18: 'C', 19: 'A', 20: 'A', 21: 'C', 22: 'D', 23: 'A', 24: 'A', 25: 'D', 26: 'A', 27: 'D', 28: 'D'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'General Properties of Transition Elements', year: '2021',
        text: `Zr (Z = 40) and Hf (Z = 72) have similar atomic and ionic radii because of: (2021)`,
        A: `Diagonal relationship`, B: `Lanthanoid contraction`, C: `Having similar chemical properties`, D: `Belonging to same group`
    },
    {
        qNo: 2, topic: 'Inner Transition Elements', year: '2020',
        text: `The calculated spin only magnetic moment of Cr 2+ ion is (2020)`,
        A: `4.90 BM`, B: `5.92 BM`, C: `2.84 BM`, D: `3.87 BM`
    },
    {
        qNo: 3, topic: 'Chemical Properties', year: '2020',
        text: `Match the following aspects with the respective metal. (2020-Covid) Aspects Metal A. The metal which reveals a maximum number of oxidation states i. Scandium B. The metal although placed in 3d block is considered not as a transition element ii. Copper C. The metal which does not exhibit variable oxidation states iii. Manganese D. The metal which in +1 oxidation state in aqueous solution undergoes disproportionation iv. Zinc Select the correct option:`,
        A: `A-iii B-iv C-i D-ii`, B: `A-iii B-i C-iv D-ii`, C: `A-ii B-iv C-i D-iii`, D: `A-i B-iv C-ii D-iii`
    },
    {
        qNo: 4, topic: 'The Lanthanoids', year: '2018',
        text: `Match the metal ions given in Column I with the spin magnetic moments of the ions given in Column II and assign the correct code: (2018) Column-I Column-II A. Co 3+ i. 8 B.M B. Cr 3+ ii. 35 B.M C. Fe 3+ iii. 3 B.M D. Ni 2+ iv. 24 B.M v. 15 B.M`,
        A: `A-iv B-v C-ii D-i`, B: `A-i B-ii C-iii D-iv`, C: `A-iii B-v C-i D-ii`, D: `A-iv B-i C-ii D-iii`
    },
    {
        qNo: 5, topic: 'General Properties of Transition Elements', year: '2017',
        text: `HgCl 2 and I 2 both when dissolved in water containing I – ions the pair of species formed is: (2017-Delhi)`,
        A: `Hg 2 I 2 , I –`, B: `2 3 Hg I ,I −`, C: `HgI 2 , I –`, D: `2 4 3 Hg I ,I − −`
    },
    {
        qNo: 6, topic: 'Inner Transition Elements', year: '2015',
        text: `Which of the following processes does not involve oxidation of iron? (2015)`,
        A: `Decolourisation of blue CuSO 4 solution by iron`, B: `Formation of Fe(CO) 5 from Fe`, C: `Liberation of H 2 from steam by iron at high temperature`, D: `Rusting of iron sheets`
    },
    {
        qNo: 7, topic: 'Chemical Properties', year: '2015',
        text: `Magnetic moment 2.84 B.M. is given by: (Atomic numbers, Ni = 28, Ti = 22, Cr = 24, Co = 27) (2015)`,
        A: `Ti 3+`, B: `Cr 2+`, C: `Co 2+`, D: `Ni 2+`
    },
    {
        qNo: 8, topic: 'The Lanthanoids', year: '2015',
        text: `Because of lanthanoid contraction, which of the following pairs of elements have nearly same atomic radii? (Numbers in the parenthesis are atomic numbers) (2015)`,
        A: `Zr (40) and Nb (41)`, B: `Zr (40) and Hf (72)`, C: `Zr (40) and Ta (73)`, D: `Ti (22) and Zr (40)`
    },
    {
        qNo: 9, topic: 'General Properties of Transition Elements', year: '2014',
        text: `Magnetic moment 2.83 BM is given by which of the following ions? (2014) (Atomic Number Ti = 22, Cr = 24, Mn = 25, Ni = 28)`,
        A: `Ni 2+`, B: `Cr 3+`, C: `Mn 2+`, D: `Ti 3+ 5 C H A P T E R The d- and f-Block Elements Chapter & Topicwise NEET PYQ’s P W 2`
    },
    {
        qNo: 10, topic: 'Inner Transition Elements', year: '2013',
        text: `Which of the following statements about the interstitial compounds is incorrect? (2013)`,
        A: `They retain metallic conductivity`, B: `They are chemically reactive`, C: `They are much harder than the pure metal`, D: `They have higher melting points than the pure metal Compounds of Transition Elements`
    },
    {
        qNo: 11, topic: 'Chemical Properties', year: '2022',
        text: `In the neutral or faintly alkaline medium, KMnO 4 oxidises iodide into iodate. The change in oxidation state of manganese in this reaction is from (2022)`,
        A: `+ 6 to + 5`, B: `+ 7 to + 4`, C: `+ 6 to + 4`, D: `+ 7 to + 3`
    },
    {
        qNo: 12, topic: 'The Lanthanoids', year: '2020',
        text: `Identify the incorrect statement. (2020)`,
        A: `The transition metals and their compounds are known for their catalytic activity due to their ability to adopt multiple oxidation states and to form complexes.`, B: `Interstitial compounds are those that are formed when small atoms like H, C or N are trapped inside the crystal lattices of metals.`, C: `The oxidation states of chromium in CrO 4 2– and Cr 2 O 7 2– are not the same.`, D: `Cr 2+ (d 4 ) is a stronger reducing agent than Fe 2+ (d 6 ) in water.`
    },
    {
        qNo: 13, topic: 'General Properties of Transition Elements', year: '2019',
        text: `The manganate and permanganate ions are tetrahedral, due to: (2019)`,
        A: `The p-bonding involves overlap of p-orbitals of oxygen with d-orbitals of manganese`, B: `There is no p-bonding`, C: `The p-bonding involves overlap of p-orbitals of oxygen with p-orbitals of manganese`, D: `The p-bonding involves overlap of d-orbitals of oxygen with d-orbitals of manganese`
    },
    {
        qNo: 14, topic: 'Inner Transition Elements', year: '2018',
        text: `Which one of the following ions exhibits d-d transition and paramagnetism as well? (2018)`,
        A: `CrO 4 2–`, B: `Cr 2 O 7 2–`, C: `MnO 4 2–`, D: `MnO 4 –`
    },
    {
        qNo: 15, topic: 'Chemical Properties', year: '2017',
        text: `Name the gas that can readily decolourise acidified KMnO 4 solution: (2017-Delhi)`,
        A: `P 2 O 5`, B: `CO 2`, C: `SO 2`, D: `NO 2`
    },
    {
        qNo: 16, topic: 'The Lanthanoids', year: '2016',
        text: `Which one of the following statements is correct when SO 2 is passed through acidified K 2 Cr 2 O 7 solution? (2016-I)`,
        A: `SO 2 is reduced`, B: `Green Cr 2 (SO 4 ) 3 is formed`, C: `The solution turns blue`, D: `The solution is decolourised`
    },
    {
        qNo: 17, topic: 'General Properties of Transition Elements', year: '2015 Re',
        text: `Assuming complete ionisation, same moles of which of the following compounds will require the least amount of acidified KMnO 4 for complete oxidation? (2015 Re)`,
        A: `Fe(NO 2 ) 2`, B: `FeSO 4`, C: `FeSO 3`, D: `FeC 2 O 4 Inner Transition Elements (Lanthanoids and Actinoids)`
    },
    {
        qNo: 18, topic: 'Inner Transition Elements', year: '2022',
        text: `Gadolinium has a low value of third ionisation enthalpy because of (2022) a . High basic character b. Small size c . High exchange enthalpy d. Hight electronegativity`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 19, topic: 'Chemical Properties', year: '2021',
        text: `The incorrect statement among the following is: (2021)`,
        A: `Most of the trivalent Lanthanoid ions are colorless in the solid state`, B: `Lanthanoids are good conductors of heat and electricity`, C: `Actinoids are highly reactive metals, especially when finely divided`, D: `Actinoid contraction is greater for element to element than Lanthanoid contraction`
    },
    {
        qNo: 20, topic: 'The Lanthanoids', year: '2020',
        text: `Identify the incorrect statement from the following: (2020-Covid)`,
        A: `Lanthanoids reveal only +3 oxidation state.`, B: `The lanthanoid ions other than the f 0 type and the f 14 type are all paramagnetic.`, C: `The overall decreases in atomic and ionic radii from lanthanum to lutetium is called lanthanoid contraction.`, D: `Zirconium and Hafnium have identical radii of 160 pm and 159 pm, respectively as a consequence of lanthanoid contraction.`
    },
    {
        qNo: 21, topic: 'General Properties of Transition Elements', year: '2020',
        text: `Match the element in Column-I with that in Column-II. (2020-Covid) Column-I Column-II A. Copper i. Non-metal B. Fluorine ii. Transition metal C. Silicon iii. Lanthanoid D. Cerium iv. Metalloid Select the correct option:`,
        A: `A-i B-ii C-iii D-iv`, B: `A-ii B-iv C-i D-iii`, C: `A-ii B-i C-iv D-iii`, D: `A-iv B-iii C-i D-ii`
    },
    {
        qNo: 22, topic: 'Inner Transition Elements', year: '2017',
        text: `The reason for greater range of oxidation states in actinoids is attributed to: (2017-Delhi)`,
        A: `4 f and 5 d levels being close in energies`, B: `The radioactive nature of actinoids`, C: `Actinoid contraction`, D: `5 f, 6 d and 7 s levels having comparable energies`
    },
    {
        qNo: 23, topic: 'Chemical Properties', year: '2016',
        text: `Which one of the following statements related to lanthanons is incorrect? (2016-II)`,
        A: `All the lanthanons are much more reactive than aluminium`, B: `Ce(+4) solutions are widely used as oxidizing agent in volumetric analysis`, C: `Europium shows +2 oxidation state.`, D: `The basicity decreases as the ionic radius decreases from Pr to Lu. The d- and f-Block Elements 3`
    },
    {
        qNo: 24, topic: 'The Lanthanoids', year: '2016',
        text: `The electronic configurations of Eu (Atomic Number 63) Gd (Atomic Number 64) and Tb (Atomic Number 65) are: (2016-I)`,
        A: `[Xe]4f 7 6s 2 , [Xe]4f 7 5d 1 6s 2 and [Xe]4f 9 6s 2`, B: `[Xe]4f 7 6s 2 , [Xe]4f 8 6s 2 and [Xe]4f 8 5d 1 6s 2`, C: `[Xe]4f 6 5d 1 6s 2 , [Xe]4f 7 5d 1 6s 2 and [Xe]4f 9 5d 1 6s 2`, D: `[Xe]4f 6 5d 1 6s 2 , [Xe]4f 7 5d 1 6s 2 and [Xe]4f 8 5d 1 6s 2`
    },
    {
        qNo: 25, topic: 'General Properties of Transition Elements', year: '2020',
        text: `Gadolinium belongs to 4f series. Its atomic number is`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 26, topic: 'Inner Transition Elements', year: '2015 Re',
        text: `Which of the following is the correct electronic configuration of gadolinium? (2015 Re)`,
        A: `[Xe]4f 6 5d 2 6s 2`, B: `[Xe]4f 8 6d 2`, C: `[Xe]4f 9 5s 1`, D: `[Xe]4f 7 5d 1 6s 2`
    },
    {
        qNo: 27, topic: 'Chemical Properties', year: '2014',
        text: `Reason of lanthanoid contraction is: (2014)`,
        A: `Increasing nuclear charge`, B: `Decreasing nuclear charge`, C: `Decreasing screening effect`, D: `Negligible screening effect of ‘ f ‘ orbitals`
    },
    {
        qNo: 28, topic: 'The Lanthanoids', year: '2013',
        text: `Which of the following lanthanoid ions is diamagnetic? (Atomic Number Ce = 58, Sm = 62, Eu = 63, Yb = 70) (2013)`,
        A: `Ce 2+`, B: `Sm 2+`, C: `Eu 2+`, D: `Yb 2+ 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 b a a a d b d b a b b c a c c b b 18 19 20 21 22 23 24 25 26 27 c a a c d a a d d d Answer Key`
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
