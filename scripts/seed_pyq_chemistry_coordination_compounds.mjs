/**
 * Seed REAL NEET PYQs — Chapter: Coordination Compounds (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_coordination_compounds.mjs
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables before getting the DB
dotenv.config({ path: path.join(__dirname, '../.env') });
// We also try .env.local just in case
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { getDb } from '../lib/db.js';

const db = getDb();

const CHAPTER_NAME = 'Coordination Compounds';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Ligand Field Theory',
    'Chelation and Denticity',
    'Magnetism',
    'Nomenclature of Coordination Compounds',
    'Coordination Compounds',
    'Stability of Coordination Compounds',
    'Isomerism In Coordination Compounds',
    'Important Terms in Coordination Compounds',
    'Werner\'s Theory',
    'Application of Coordination Compounds'
];

const ANSWER_KEY = {
    1: 'D', 2: 'D', 3: 'D', 4: 'D', 5: 'A', 6: 'A', 7: 'A', 8: 'D', 9: 'D', 10: 'C', 11: 'D', 12: 'A', 13: 'B', 14: 'B', 15: 'B', 16: 'D', 17: 'B', 18: 'A', 19: 'A', 20: 'A', 21: 'A', 22: 'A', 23: 'A', 24: 'A', 25: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Ligand Field Theory', year: '2021',
        text: `Ethylene diaminetetraacetate (EDTA) ion is: (2021)`,
        A: `Unidentate ligand`, B: `Bidentate ligand with two “N” donor atoms`, C: `Tridentate ligand with three “N” donor atoms`, D: `Hexadentate ligand with four “O” and two “N” donor atoms`
    },
    {
        qNo: 2, topic: 'Chelation and Denticity', year: '2017',
        text: `The correct order of the stoichiometries of AgCl formed when AgNO 3 in excess is treated with the complexes: CoCl 3 .6NH 3 , CoCl 3 .5NH 3 CoCl 3 . 4NH 3 respectively is: (2017-Delhi)`,
        A: `2AgCl, 3AgCl, 1AgCl`, B: `1AgCl, 3AgCl, 2AgCl`, C: `3AgCl, 1AgCl, 2AgCl`, D: `3AgCl, 2AgCl, 1AgCl`
    },
    {
        qNo: 3, topic: 'Magnetism', year: '2015',
        text: `Cobalt(III) chloride forms several octahedral complexes with ammonia. Which of the following will not give test for chloride ions with silver nitrate at 25°C? (2015)`,
        A: `CoCl 3 .4NH 3`, B: `CoCl 3 .5NH 3`, C: `CoCl 3 .6NH 3`, D: `CoCl 3 .3NH 3`
    },
    {
        qNo: 4, topic: 'Nomenclature of Coordination Compounds', year: '2015 Re',
        text: `The sum of coordination number and oxidation number of the metal M in the complex [M(en) 2 (C 2 O 4 )]Cl (where en is ethylenediamine) is: (2015 Re)`,
        A: `6`, B: `7`, C: `8`, D: `9 Nomenclature & Isomerism in Coordination Compounds`
    },
    {
        qNo: 5, topic: 'Coordination Compounds', year: '2022',
        text: `The IUPAC name of the complex- (2022) [Ag(H 2 O) 2 ][Ag(CN) 2 ] is:`,
        A: `diaquasilver(I) dicyanidoargentate(I)`, B: `dicyanidosilver(II) diaquaargentate(II)`, C: `diaquasilver(II) dicyanidoargentate(II)`, D: `dicyanidosilver(I) diaquaargentate(I)`
    },
    {
        qNo: 6, topic: 'Stability of Coordination Compounds', year: '2018',
        text: `The type of isomerism shown by the complex [CoCl 2 (en) 2 ] is: (2018)`,
        A: `Geometrical isomerism`, B: `Coordination isomerism`, C: `Linkage isomerism`, D: `Ionization isomerism`
    },
    {
        qNo: 7, topic: 'Isomerism In Coordination Compounds', year: '2015 Re',
        text: `The name of complex ion, [Fe(CN) 6 ] 3– is: (2015 Re)`,
        A: `Hexacyanidoferrate (III) ion`, B: `Hexacyanoiron (III) ion`, C: `Hexacyanoferrate (III) ion`, D: `Tricyanoferrate (III) ion`
    },
    {
        qNo: 8, topic: 'Important Terms in Coordination Compounds', year: '2015 Re',
        text: `Number of possible isomers for the complex [Co(en) 2 Cl 2 ] Cl will be: (en = ethylenediamine) (2015 Re)`,
        A: `4`, B: `2`, C: `1`, D: `3 Bonding in Coordination Compounds`
    },
    {
        qNo: 9, topic: 'Werner\'s Theory', year: '2022',
        text: `The order of energy absorbed which is responsible for the color of complexes (2022) A. [Ni(H 2 O) 2 (en) 2 ] 2+ B. [Ni(H 2 O) 4 (en)] 2+ and C. [Ni(en) 3 ] 2+ is`,
        A: `B > A > C`, B: `A > B > C`, C: `C > B > A`, D: `C > A > B`
    },
    {
        qNo: 10, topic: 'Application of Coordination Compounds', year: '2021',
        text: `Match List-I with List-II. (2021) List-I List-II (A) [Fe(CN) 6 ] 3– (i) 5.92 BM (B) [Fe(H 2 O) 6 ] 3+ (ii) 0 BM (C) [Fe(CN) 6 ] 4– (iii) 4.90 BM (D) [Fe(H 2 O) 6 ] 2+ (iv) 1.73 BM Choose the correct answer from the options given below.`,
        A: `A-ii B-iv C-iii D-i`, B: `A-i B-iii C-iv D-ii`, C: `A-iv B-i C-ii D-iii`, D: `A-iv B-ii C-i D-iii 6 C H A P T E R Coordination Compounds Coordination Compounds 2`
    },
    {
        qNo: 11, topic: 'Ligand Field Theory', year: '2020',
        text: `Which of the following is the correct order of increasing field strength of ligands to form coordination compounds? (2020)`,
        A: `SCN – < F – < CN – < C 2 O 4 2–`, B: `F – < SCN – < C 2 O 4 2– < CN –`, C: `CN – < C 2 O 4 2– < SCN – < F –`, D: `SCN – < F – < C 2 O 4 2– < CN –`
    },
    {
        qNo: 12, topic: 'Chelation and Denticity', year: '2020',
        text: `Match the coordination number and type of hybridisation with distribution of hybrid orbitals in space based on Valence bond theory. (2020-Covid) Coordination number and type of hybridisation Distribution of hybrid orbit- als in space (A) 4, sp 3 (i) Trigonal bipyramidal (B) 4, dsp 2 (ii) Octahedral (C) 5, sp 3 d (iii) Tetrahedral (D) 6, d 2 sp 3 (iv) Square planar Select the correct option:`,
        A: `A-iii B-iv C-i D-ii`, B: `A-iv B-i C-ii D-iii`, C: `A-iii B-i C-iv D-ii`, D: `A-ii B-iii C-iv D-i`
    },
    {
        qNo: 13, topic: 'Magnetism', year: '2019',
        text: `What is the correct electronic configuration of the central atom in K 4 [Fe(CN) 6 ] based on crystal field theory? (2019)`,
        A: `t 4 2g e 2 g`, B: `t 6 2g e 0 g`, C: `e 3 t 2 3 g`, D: `e 4 t 2 2g`
    },
    {
        qNo: 14, topic: 'Nomenclature of Coordination Compounds', year: '2018',
        text: `The geometry and magnetic behaviour of the complex [Ni(CO) 4 ] are? (2018)`,
        A: `Square planar geometry and diamagnetic`, B: `Tetrahedral geometry and diamagnetic`, C: `Tetrahedral geometry and paramagnetic`, D: `Square planar geometry and paramagnetic`
    },
    {
        qNo: 15, topic: 'Coordination Compounds', year: '2017',
        text: `Correct increasing order for the wavelengths of absorption in the visible region for the complexes of Co 3+ is: (2017-Delhi)`,
        A: `[Co(NH 3 ) 6 ] 3+ , [Co(en) 3 ] 3+ , [Co(H 2 O) 6 ] 3+`, B: `[Co(en) 3 ] 3+ , [Co(NH 3 ) 6 ] 3+ , [Co(H 2 O) 6 ] 3+`, C: `[Co(H 2 O) 6 ] 3+ , [Co(en) 3 ] 3+ ,[Co(NH 3 ) 6 ] 3+`, D: `[Co(H 2 O) 6 ] 3+ , [Co(NH 3 ) 6 ] 3+ , [Co(en) 3 ] 3+`
    },
    {
        qNo: 16, topic: 'Stability of Coordination Compounds', year: '2017',
        text: `Pick out the correct statement with respect to [Mn(CN) 6 ] 3– (2017-Delhi)`,
        A: `It is dsp 2 hybridised and square planar`, B: `It is sp 3 d 2 hybridised and octahedral`, C: `It is sp 3 d 2 hybridised and tetrahedral`, D: `It is d 2 sp 3 hybridised and octahedral`
    },
    {
        qNo: 17, topic: 'Isomerism In Coordination Compounds', year: '2016',
        text: `The correct increasing order of trans-effect of the following species is: (2016-II)`,
        A: `NH 3 > CN – > Br – > C 6 H 5 –`, B: `CN – > C 6 H 5 – > Br – >NH 3`, C: `Br – > CN – > NH 3 > C 6 H 5 –`, D: `CN – > Br – > C 6 H 5 – > NH 3`
    },
    {
        qNo: 18, topic: 'Important Terms in Coordination Compounds', year: '2016',
        text: `Jahn-Teller effect is not observed in high spin complexes of: [OS] (2016-II)`,
        A: `d 7`, B: `d 8`, C: `d 4`, D: `d 9`
    },
    {
        qNo: 19, topic: 'Werner\'s Theory', year: '2015 Re',
        text: `The hybridisation involved in complex [Ni(CN) 4 ] 2– is (Atomic Number Ni = 28) (2015 Re)`,
        A: `d 2 sp 3`, B: `dsp 2`, C: `sp 3`, D: `d 2 sp 2`
    },
    {
        qNo: 20, topic: 'Application of Coordination Compounds', year: '2015',
        text: `Which of these statements about [Co(CN) 6 ] 3– is true? (2015)`,
        A: `[Co(CN) 6 ] 3– has four unpaired electrons and will be in a low-spin configuration`, B: `[Co(CN) 6 ] 3– has four unpaired electrons and will be in a high-spin configuration`, C: `[Co(CN) 6 ] 3– has no unpaired electrons and will be in a high-spin configuration`, D: `[Co(CN) 6 ] 3– has no unpaired electrons and will be in a low-spin configuration`
    },
    {
        qNo: 21, topic: 'Ligand Field Theory', year: '2014',
        text: `Among the following complexes the one which shows zero crystal field stabilization energy (CFSE) is: (2014)`,
        A: `[Fe(H 2 O) 6 ] 3+`, B: `[Co(H 2 O) 6 ] 2+`, C: `[Co(H 2 O) 6 ] 3+`, D: `[Mn(H 2 O) 6 ] 3+`
    },
    {
        qNo: 22, topic: 'Chelation and Denticity', year: '2013',
        text: `A magnetic moment of 1.73 BM will be shown by one among the following: (2013)`,
        A: `[Cu(NH 3 ) 4 ] 2+`, B: `[Ni(CN) 4 ] 2–`, C: `TiCl 4`, D: `[CoCl 6 ] 4– Bonding in Metal Carbonyls`
    },
    {
        qNo: 23, topic: 'Magnetism', year: '2018',
        text: `Iron carbonyl, Fe(CO) 5 is (2018)`,
        A: `Tetranuclear`, B: `Mononuclear`, C: `Dinuclear`, D: `Trinuclear`
    },
    {
        qNo: 24, topic: 'Nomenclature of Coordination Compounds', year: '2016',
        text: `Which of the following has longest C-O bond length? (Free C─O bond length in CO is 1.128Å) (2016 - I)`,
        A: `[Mn(CO) 6 ] +`, B: `Ni(CO) 4`, C: `[Co(CO) 4 ] –`, D: `[Fe(CO) 4 ] 2– Applications of Coordination Compounds`
    },
    {
        qNo: 25, topic: 'Coordination Compounds', year: '2014',
        text: `Which of the following complexes is used to be as an anticancer agent? (2014)`,
        A: `cis-[PtCl 2 (NH 3 ) 2 ]`, B: `cis-K 2 [PtCl 2 Br 2 ]`, C: `Na 2 [CoCl 4 ]`, D: `mer–[Co(NH 3 ) 3 Cl 3 ] Chapter & Topicwise NEET PYQ’s P W 3 Answer Key 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 d d d d a a a d d c d a b b b d b 18 19 20 21 22 23 24 25 b b d a a b d a`
    },
];

async function seed() {
    console.log(`Starting seeding for ${SUBJECT_NAME} - ${CHAPTER_NAME}...`);
    try {
        let subjectRow = await db.get('SELECT id FROM subjects WHERE name = ?', [SUBJECT_NAME]);
        if (!subjectRow) {
            console.log(`Inserting Subject: ${SUBJECT_NAME}`);
            const info = await db.run('INSERT INTO subjects (name) VALUES (?) RETURNING id', [SUBJECT_NAME]);
            subjectRow = { id: info.lastInsertRowid };
        }
        const subjectId = subjectRow.id;

        let chapterRow = await db.get('SELECT id FROM chapters WHERE subject_id = ? AND name = ?', [subjectId, CHAPTER_NAME]);
        if (!chapterRow) {
            console.log(`Inserting Chapter: ${CHAPTER_NAME}`);
            const info = await db.run('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES (?, ?, ?, ?) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 0]);
            chapterRow = { id: info.lastInsertRowid };
        }
        const chapterId = chapterRow.id;

        const topicIdMap = {};
        for (const topicName of TOPICS) {
            let tRow = await db.get('SELECT id FROM topics WHERE chapter_id = ? AND name = ?', [chapterId, topicName]);
            if (!tRow) {
                const info = await db.run('INSERT INTO topics (chapter_id, name) VALUES (?, ?) RETURNING id', [chapterId, topicName]);
                tRow = { id: info.lastInsertRowid };
            }
            topicIdMap[topicName] = tRow.id;
        }

        let added = 0;
        let skipped = 0;
        for (const q of QUESTIONS) {
            const topicId = topicIdMap[q.topic];
            const existing = await db.get('SELECT id FROM questions WHERE chapter_id = ? AND text = ?', [chapterId, q.text]);
            if (existing) {
                skipped++;
                continue;
            }

            const correctOption = ANSWER_KEY[q.qNo] || 'A';
            const examName = parseInt(q.year) < 2013 ? 'AIPMT' : 'NEET';

            await db.run(`
                INSERT INTO questions (
                    subject_id, chapter_id, topic_id, text,
                    option_a, option_b, option_c, option_d,
                    correct_option, difficulty, explanation,
                    year_asked, is_pyq, exam_name
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
            `, [
                subjectId, chapterId, topicId, q.text,
                q.A, q.B, q.C, q.D,
                correctOption, 'neet', 'Chemistry PYQ', q.year, examName
            ]);
            added++;
        }
        
        console.log(`✅ Done! Added ${added} questions (Skipped ${skipped})`);
    } catch (e) {
        console.error('Failed to seed:', e);
    }
}

seed();
