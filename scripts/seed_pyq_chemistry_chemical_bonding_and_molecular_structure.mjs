/**
 * Seed REAL NEET PYQs — Chapter: Chemical Bonding and Molecular Structure (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_chemical_bonding_and_molecular_structure.mjs
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

const CHAPTER_NAME = 'Chemical Bonding and Molecular Structure';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Bond Parameters',
    'Dipole Moment',
    'Kossel-Lewis Approach',
    'VSEPR Theory',
    'Hybridisation',
    'Hydrogen Bonds',
    'Molecular Orbital Theory'
];

const ANSWER_KEY = {
    1: 'D', 2: 'D', 3: 'C', 4: 'B', 5: 'C', 6: 'D', 7: 'C', 8: 'B', 9: 'A', 10: 'D', 11: 'D', 12: 'D', 13: 'A', 14: 'A', 15: 'B', 16: 'A', 17: 'C', 18: 'B', 19: 'A', 20: 'B', 21: 'D', 22: 'B', 23: 'B', 24: 'D', 25: 'C', 26: 'C', 27: 'A', 28: 'A', 29: 'A', 30: 'D', 31: 'C', 32: 'B', 33: 'B', 34: 'A', 35: 'C', 36: 'B', 37: 'A', 38: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Bond Parameters', year: '2015 Re',
        text: `Which of the following species contains equal number of s and p -bonds? (2015 Re)`,
        A: `(CN) 2`, B: `(CH) 2 (CN) 2`, C: `HCO 3 –`, D: `XeO 4`
    },
    {
        qNo: 2, topic: 'Dipole Moment', year: '2013',
        text: `Which one of the following molecules contains no p bond? (2013)`,
        A: `SO 2`, B: `NO 2`, C: `CO 2`, D: `H 2 O`
    },
    {
        qNo: 3, topic: 'Kossel-Lewis Approach', year: '2013',
        text: `Which of the following is electron-deficient? (2013)`,
        A: `(CH 3 ) 2`, B: `(SiH 3 ) 2`, C: `(BH 3 ) 2`, D: `PH 3 Bond Parameters and Dipole Moment`
    },
    {
        qNo: 4, topic: 'VSEPR Theory', year: '2021',
        text: `Which of the following molecules is non-polar in nature? (2021)`,
        A: `CH 2 O`, B: `SbCl 5`, C: `NO 2`, D: `POCl 3`
    },
    {
        qNo: 5, topic: 'Hybridisation', year: '2020',
        text: `Which of the following set of molecules will have zero dipole moment? (2020)`,
        A: `Boron trifluoride, hydrogen fluoride, carbon dioxide, 1,3-dichlorobenzene`, B: `Nitrogen trifluoride, beryllium difluoride, water 1,3-dichlorobenzzene`, C: `Boron trifluoride, berylium difluoride, carbon dioxide, 1,4-dichlorobenzene`, D: `Ammonia, beryllium difluoride, water, 1,4-dichlorobenzene`
    },
    {
        qNo: 6, topic: 'Hydrogen Bonds', year: '2017',
        text: `Which one of the following pair of species have the same bond order? (2017-Delhi)`,
        A: `2 2 N ,O −`, B: `CO, NO`, C: `O 2 , NO +`, D: `CN – , CO`
    },
    {
        qNo: 7, topic: 'Molecular Orbital Theory', year: '2016',
        text: `Consider the molecules CH 4 , NH 3 and H 2 O. Which of the given statement is false? (2016 - I)`,
        A: `The H─C─H bond angle in CH 4 is larger than the H─N─H bond angle in NH 3`, B: `The H─C─H bond angle in CH 4 , the H─N─H bond angle in NH 3 , and the H─O─H bond angle in H 2 O are all greater than 90º.`, C: `Then H─O─H bond angle in H 2 O is larger than the H─C─H bond angle in CH 4`, D: `The H─O─H bond angle in H 2 O is smaller than the H─N─H bond angle in NH 3`
    },
    {
        qNo: 8, topic: 'Bond Parameters', year: '2014',
        text: `Which of the following molecules has the maximum dipole moment? (2014)`,
        A: `CH 4`, B: `NH 3`, C: `NF 3`, D: `CO 2 VSEPR Theory`
    },
    {
        qNo: 9, topic: 'Dipole Moment', year: '2022',
        text: `Amongst the following, which one will have maximum ‘lone pair-lone pair’ electron repulsions? (2022)`,
        A: `XeF 2`, B: `ClF 3`, C: `IF 5`, D: `SF 4`
    },
    {
        qNo: 10, topic: 'Kossel-Lewis Approach', year: '2020',
        text: `Match List-I with List-II. List-I List-II`,
        A: `PCl 5 (i) Square pyramidal`, B: `SF 6 (ii) Trigonal planar`, C: `BrF 5 (iii) Octahedral`, D: `BF 3 (iv) Trigonal bipyramidal Choose the correct answer from the options given below. (2021) a. A-ii B-iii C-iv D-i b. A-iii B-i C-iv D-ii c. A-iv B-iii C-ii D-i d. A-iv B-iii C-i D-ii`
    },
    {
        qNo: 11, topic: 'VSEPR Theory', year: '2020',
        text: `Identify the wrongly matched pair. (2020-Covid) Molecule Shape or geometry of molecule`,
        A: `SF 6 Octahedral`, B: `BeCl 2 Linear`, C: `NH 3 Trigonal pyramidal`, D: `PCl 5 Trigonal planar 4 C H A P T E R Chemical Bonding and Molecular Structure Chapter & Topicwise NEET PYQ's P W 2`
    },
    {
        qNo: 12, topic: 'Hybridisation', year: '2019',
        text: `Identify the incorrect statement related to PCl 5 from the following: (2019)`,
        A: `Three equatorial P-Cl bonds make an angle of 120° with each other`, B: `Two axial P-Cl bonds make an angle of 180° with each other`, C: `Axial P-Cl bonds are longer than equatorial P-Cl bonds`, D: `PCl 5 molecule is non-reactive`
    },
    {
        qNo: 13, topic: 'Hydrogen Bonds', year: '2017',
        text: `The species, having bond angles of 120° is (2017-Delhi)`,
        A: `BCl 3`, B: `PH 3`, C: `ClF 3`, D: `NCl 3`
    },
    {
        qNo: 14, topic: 'Molecular Orbital Theory', year: '2016',
        text: `Among the following which one is a wrong statement? (2016 - II)`,
        A: `SeF 4 and CH 4 have same shape`, B: `I 3 + has bent geometry`, C: `PH 5 and BiCl 5 do not exist`, D: `p� - d� bonds are present in SO 2`
    },
    {
        qNo: 15, topic: 'Bond Parameters', year: '2016',
        text: `Which of the following pairs of ions is isoelectronic and isostructural? (2016-II)`,
        A: `CO 3 2– , NO 3 –`, B: `ClO 3 – , CO 3 2–`, C: `SO 3 2– , NO 3 –`, D: `ClO 3 – , SO 3 2–`
    },
    {
        qNo: 16, topic: 'Dipole Moment', year: '2016',
        text: `Predict the correct order among the following: (2016 - I)`,
        A: `Lone pair ─ bond pair > bond pair ─ bond pair > lone pair ─ lone pair`, B: `Lone pair ─ lone pair > lone pair ─ bond pair > bond pair ─ bond pair`, C: `Lone pair ─ lone pair > bond pair ─ bond pair > lone pair ─ bond pair`, D: `Bond pair ─ bond pair > lone pair ─ bond pair > lone pair ─ lone pair`
    },
    {
        qNo: 17, topic: 'Kossel-Lewis Approach', year: '2015',
        text: `Maximum bond angle at nitrogen is present in which of the following? (2015)`,
        A: `NO 2 +`, B: `NO 3 –`, C: `NO 2`, D: `NO 2 –`
    },
    {
        qNo: 18, topic: 'VSEPR Theory', year: '2015',
        text: `In which of the following pairs, both the species are not isostructural? (2015)`,
        A: `Diamond, Silicon carbide`, B: `NH 3 , PH 3`, C: `XeF 4 , XeO 4`, D: `SiCl 4 , PCl 4 +`
    },
    {
        qNo: 19, topic: 'Hybridisation', year: '2015',
        text: `Which of the following pairs of ions are isoelectronic and isostructural? (2015)`,
        A: `SO 3 2– , NO 3 –`, B: `ClO 3 – , SO 3 2–`, C: `CO 3 2– , SO 3 2–`, D: `ClO 3 – , CO 3 2–`
    },
    {
        qNo: 20, topic: 'Hydrogen Bonds', year: '2014',
        text: `Which one of the following species has planar triangular shape? (2014)`,
        A: `NO 3 –`, B: `NO 2 –`, C: `CO 2`, D: `N 3 –`
    },
    {
        qNo: 21, topic: 'Molecular Orbital Theory', year: '2013',
        text: `Which of the following is a polar molecule? (2013)`,
        A: `BF 3`, B: `SF 4`, C: `SiF 4`, D: `XeF 4`
    },
    {
        qNo: 22, topic: 'Bond Parameters', year: '2013',
        text: `XeF 2 is isostructural with (2013)`,
        A: `SbCl 3`, B: `BaCl 2`, C: `TeF 2`, D: `ICl 2 – Valence Bond Theory, Hybridisation`
    },
    {
        qNo: 23, topic: 'Dipole Moment', year: '2021',
        text: `BF 3 is planar and electron deficient compound. Hybridization and number of electrons around the central atom, respectively are: (2021)`,
        A: `sp 3 and 6`, B: `sp 2 and 6`, C: `sp 2 and 8`, D: `sp 3 and 4`
    },
    {
        qNo: 24, topic: 'Kossel-Lewis Approach', year: '2020',
        text: `How many (i) sp 2 hybridised carbon atoms and (ii) π bonds are present in the following compound? (2020-Covid)`,
        A: `8, 6`, B: `7, 6`, C: `8, 5`, D: `7, 5`
    },
    {
        qNo: 25, topic: 'VSEPR Theory', year: '2020',
        text: `The potential energy (y) curve for H 2 formation as a function of internuclear distance (x) of the H atoms is shown below. (2020-Covid) The bond energy of H 2 is`,
        A: `(c a) 2 −`, B: `(b a) 2 −`, C: `(c – a)`, D: `(b – a)`
    },
    {
        qNo: 26, topic: 'Hybridisation', year: '2016',
        text: `The hybridisations of atomic orbitals of nitrogen in NO 2 + , NO 3 – and NH 4 + respectively are: (2016-II)`,
        A: `sp , sp 3 and sp 2`, B: `sp 2 , sp 3 and sp`, C: `sp , sp 2 and sp 3`, D: `sp 2 , sp and sp 3`
    },
    {
        qNo: 27, topic: 'Hydrogen Bonds', year: '2016',
        text: `In which of the following molecules, all atoms are coplanar? (2016 - II)`,
        A: `a. b. c. d. Chemical Bonding and Molecular Structure 3`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 28, topic: 'Molecular Orbital Theory', year: '2016',
        text: `The correct geometry and hybridization for XeF 4 are (2016 - II)`,
        A: `Octahedral, sp 3 d 2`, B: `Trigonal bipyramidal, sp 3 d`, C: `Planar triangle, sp 3 d 3`, D: `Square planar, sp 3 d 2`
    },
    {
        qNo: 29, topic: 'Bond Parameters', year: '2014',
        text: `Which of the following organic compounds has same hybridisation as its combustion product (CO 2 )? (2014)`,
        A: `Ethyne`, B: `Ethene`, C: `Ethanol`, D: `Ethane MOT, Bonding in Some Homonuclear Diatomic Molecule`
    },
    {
        qNo: 30, topic: 'Dipole Moment', year: '2022',
        text: `Which amongst the following is incorrect statement (2022)`,
        A: `O + 2 ion is diamagnetic.`, B: `The bond orders of O + 2 , O 2 , O – 2 and O 2– 2 are 2.5, 2, 1.5 and 1, respectively`, C: `C 2 molecule has four electrons in its two degenerate p molecular orbitals.`, D: `H + 2 ion has one electron.`
    },
    {
        qNo: 31, topic: 'Kossel-Lewis Approach', year: '2020',
        text: `Identify a molecule which does not exist. (2020)`,
        A: `Li 2`, B: `C 2`, C: `O 2`, D: `He 2`
    },
    {
        qNo: 32, topic: 'VSEPR Theory', year: '2019',
        text: `Which of the following diatomic molecular species has only π bonds according to Molecular Orbital Theory? (2019)`,
        A: `O 2`, B: `N 2`, C: `C 2`, D: `Be 2`
    },
    {
        qNo: 33, topic: 'Hybridisation', year: '2018',
        text: `Consider the following species: (2018) CN + , CN – , NO and CN Which one of these will have the highest bond order?`,
        A: `NO`, B: `CN –`, C: `CN`, D: `CN +`
    },
    {
        qNo: 34, topic: 'Hydrogen Bonds', year: '2015 Re',
        text: `Decreasing order of stability of O 2 , O 2 – , O 2 + and O 2 2– is: (2015 Re)`,
        A: `O 2 – > O 2 2– > O 2 + > O 2`, B: `O 2 + > O 2 > O 2 – > O 2 2–`, C: `O 2 2– > O 2 – > O 2 > O 2 +`, D: `O 2 > O 2 + > O 2 2– > O 2 –`
    },
    {
        qNo: 35, topic: 'Molecular Orbital Theory', year: '2015',
        text: `Which of the following options represents the correct bond order? (2015)`,
        A: `O 2 – < O 2 < O 2 +`, B: `O 2 – > O 2 < O 2 +`, C: `O 2 – < O 2 > O 2 +`, D: `O 2 – > O 2 > O 2 +`
    },
    {
        qNo: 36, topic: 'Bond Parameters', year: '2015',
        text: `The correct bond order in the following species is: (2015)`,
        A: `O 2 2+ < O 2 – < O 2 +`, B: `O 2 2+ < O 2 – < O 2 +`, C: `O 2 – < O 2 + < O 2 2+`, D: `O 2 2+ < O 2 + < O 2 –`
    },
    {
        qNo: 37, topic: 'Dipole Moment', year: '2013',
        text: `Which of the following is paramagnetic? (2013)`,
        A: `CO`, B: `2 O −`, C: `CN –`, D: `NO + Hydrogen Bonds`
    },
    {
        qNo: 38, topic: 'Kossel-Lewis Approach', year: '2016',
        text: `Which one of the following compounds shows the presence of intramolecular hydrogen bond? (2016 - II)`,
        A: `Cellulose`, B: `Concentrated acetic acid`, C: `H 2 O 2`, D: `HCN 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 d d c b c d c b a d d d a a a,d b a 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 c b a b d b b d c c a a a d c b b 35 36 37 38 a c b a Answer Key`
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
