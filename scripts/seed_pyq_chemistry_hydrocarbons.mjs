/**
 * Seed REAL NEET PYQs — Chapter: Hydrocarbons (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_hydrocarbons.mjs
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

const CHAPTER_NAME = 'Hydrocarbons';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Chemical Properties of Alkene',
    'Preparation of Alkene',
    'Preparation of Alkane',
    'Aromatic Hydrocarbon',
    'Conformations'
];

const ANSWER_KEY = {
    1: 'C', 2: 'B', 3: 'B', 4: 'C', 5: 'A', 6: 'A', 7: 'B', 8: 'B', 9: 'D', 10: 'B', 11: 'C', 12: 'C', 13: 'D', 14: 'A', 15: 'A', 16: 'C', 17: 'A', 18: 'A', 19: 'A', 20: 'A', 21: 'A', 22: 'A', 23: 'A', 24: 'A', 25: 'A', 26: 'A', 27: 'A', 28: 'A', 29: 'A', 30: 'A', 31: 'A', 32: 'A', 33: 'A', 34: 'A', 35: 'A', 36: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Chemical Properties of Alkene', year: '2021',
        text: `Dihedral angle of least stable conformer of ethane is: (2021)`,
        A: `180°`, B: `60°`, C: `0°`, D: `120°`
    },
    {
        qNo: 2, topic: 'Preparation of Alkene', year: '2020',
        text: `Which of the following alkane cannot be made in good yield by Wurtz reaction? (2020)`,
        A: `2, 3-Dimethylbutane`, B: `n -Heptane`, C: `n -Butane`, D: `n -Hexane`
    },
    {
        qNo: 3, topic: 'Preparation of Alkane', year: '2020',
        text: `Which of the following is a free radical substitution reaction? (2020-Covid)`,
        A: `Acetylene with HBr`, B: `Methane with Br 2 /hv`, C: `Propene with HBr/(C 6 H 5 COO) 2`, D: `Benzene with Br 2 /AlCl 3`
    },
    {
        qNo: 4, topic: 'Aromatic Hydrocarbon', year: '2020',
        text: `Hydrocarbon`,
        A: `(A) reacts with bromine by substitution to form an alkyl bromide which by Wurtz reaction is converted to gaseous hydrocarbon containing less than four carbon atoms. (A) is (2018)`, B: `CH ≡ CH`, C: `CH 2 = CH 2`, D: `CH 4`
    },
    {
        qNo: 5, topic: 'Conformations', year: '2017',
        text: `With respect to the conformers of ethane, which of the following statements is true? (2017-Delhi)`,
        A: `Both bond angles and bond length remains same`, B: `Bond angle remains same but bond length changes`, C: `Bond angle changes but bond length remains same`, D: `Both bond angle and bond length change`
    },
    {
        qNo: 6, topic: 'Chemical Properties of Alkene', year: '2016',
        text: `The correct statement regarding the comparison of staggered and eclipsed conformations of ethane, is: (2016 - I)`,
        A: `The staggered conformation of ethane is more stable than eclipsed conformation, because staggered conformation has no torsional strain.`, B: `The staggered conformation of ethane is less stable than eclipsed conformation, because staggered conformation has torsional strain.`, C: `The eclipsed conformation of ethane is more stable than staggered conformation, because eclipsed conformation has no torsional strain.`, D: `The eclipsed conformation of ethane is more stable than staggered conformation even though the eclipsed conformation has torsional strain.`
    },
    {
        qNo: 7, topic: 'Preparation of Alkene', year: '2015 Re',
        text: `The number of structural isomers possible from the molecular formula C 3 H 9 N is: (2015 Re)`,
        A: `3`, B: `4`, C: `5`, D: `2 Alkenes`
    },
    {
        qNo: 8, topic: 'Preparation of Alkane', year: '2022',
        text: `Compound X on reaction with O 3 followed by Zn/H 2 O gives formaldehyde and 2-methyl propanal as products. The compound X is: (2022)`,
        A: `Pent-2-ene`, B: `3-Methylbut-1-ene`, C: `2-Methylbut-1-ene`, D: `2-Methylbut-2-ene`
    },
    {
        qNo: 9, topic: 'Aromatic Hydrocarbon', year: '2021',
        text: `The major product of the following chemical reaction is: (2021) CH 3 CH 3 CH CH (C 6 H 5 CO) 2 O 2 ? CH 2 + HBr`,
        A: `CH 3 CH 3 CH CH 2 CH 2 O COC 6 H 5`, B: `CH 3 CH 3 CH CH CH 3 Br`, C: `CH 3 CH 3 CBr CH 2 CH 3`, D: `CH 3 CH 3 CH CH 2 CH 2 Br`
    },
    {
        qNo: 10, topic: 'Conformations', year: '2020',
        text: `An alkene on ozonolysis gives methanal as one of the product. Its structure is : (2020)`,
        A: `a. b. c. d. 10 C H A P T E R Hydrocarbons Chapter & Topicwise NEET PYQ's P W 2`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 11, topic: 'Chemical Properties of Alkene', year: '2019',
        text: `An alkene “A” on reaction with O 3 and Zn – H 2 O gives propanone and ethanal in equimolar ratio. Addition of HCl to alkene “A” gives “B” as the major product. The structure of product “B” is: (2019)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 12, topic: 'Preparation of Alkene', year: '2016',
        text: `The compound that will react most readily with gaseous bromine has the formula: (2016 - II)`,
        A: `C 4 H 10`, B: `C 2 H 4`, C: `C 3 H 6`, D: `C 2 H 2`
    },
    {
        qNo: 13, topic: 'Preparation of Alkane', year: '2016',
        text: `The correct structure of the product A formed in the reaction: (2016 - II)`,
        A: `OH`, B: `OH`, C: `OH`, D: `O`
    },
    {
        qNo: 14, topic: 'Aromatic Hydrocarbon', year: '2016',
        text: `Which of the following compounds shall not produce propene by reaction with HBr followed by elimination or direct only elimination reaction? (2016 - II)`,
        A: `H 2 C=C=O`, B: `H 3 C C H 2 CH 3 Br`, C: `C H 2 C H 2 CH 3`, D: `H 3 C C H 2 CH 2 OH`
    },
    {
        qNo: 15, topic: 'Conformations', year: '2016',
        text: `In which of the following molecules, all atoms are coplanar? (2016 - II)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 16, topic: 'Chemical Properties of Alkene', year: '2015 Re',
        text: `In the reaction with HCl, an alkene reacts in accordance with the Markovnikov’s rule, to give a product 1-chloro-1- methylcyclohexane. The possible alkene is: (2015 Re) a. CH 2 b. CH 3 c.`,
        A: `(a) and (b) d. CH 3`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 17, topic: 'Preparation of Alkene', year: '2015 Re',
        text: `2, 3-Dimethyl-2-butene can be prepared by heating which of the following compounds with a strong acid? (2015 Re)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 18, topic: 'Preparation of Alkane', year: '2015',
        text: `A single compound of the structure CH 3 is obtainable from ozonolysis of which of the following cyclic compounds? (2015)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 19, topic: 'Aromatic Hydrocarbon', year: '2015',
        text: `The reaction of C 6 H 5 CH = CHCH 3 with HBr produces: (2015)`,
        A: `a. b. C 6 H 5 CH 2 CH 2 CH 2 Br c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 20, topic: 'Conformations', year: '2015',
        text: `Given: The enthalpy of hydrogenation of these compounds will be in the order as: (2015)`,
        A: `III > II > I`, B: `II > III > I`, C: `II > I > III`, D: `I > II > III Hydrocarbons 3 Alkynes`
    },
    {
        qNo: 21, topic: 'Chemical Properties of Alkene', year: '2019',
        text: `The number of sigma (s) and pi (p) bonds in pent-2-en-4-yne is (2019)`,
        A: `10 s bonds and 3p bonds`, B: `8 s bonds and 5p bonds`, C: `11 s bonds and 2p bonds`, D: `13 s bonds and no p bonds`
    },
    {
        qNo: 22, topic: 'Preparation of Alkene', year: '2019',
        text: `The most suitable reagent for the following conversion, is: (2019)`,
        A: `Na/liquid NH 3`, B: `H 2 , Pd/C, quinoline`, C: `Zn/HCl`, D: `Hg 2+ /H + , H 2 O`
    },
    {
        qNo: 23, topic: 'Preparation of Alkane', year: '2017',
        text: `Predict the correct intermediate and product in the following reaction (2017-Delhi) ( ) ( ) 2 2 4 4 H O,H SO 3 HgSO H C C CH intermediate product A B − ≡  → →`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 24, topic: 'Aromatic Hydrocarbon', year: '2017',
        text: `Which one is the correct order of acidity? (2017-Delhi)`,
        A: `CH 3 – CH 3 > CH 2 = CH 2 > CH 3 –C ≡ CH > CH ≡ CH`, B: `CH 2 = CH 2 > CH 3 –CH = CH 2 > CH 3 – C ≡ CH > CH ≡ CH`, C: `CH ≡ CH > CH 3 – C ≡ CH > CH 2 = CH 2 > CH 3 –CH 3`, D: `CH ≡ CH > CH 2 = CH 2 > CH 3 –C ≡ CH > CH 3 –CH 3`
    },
    {
        qNo: 25, topic: 'Conformations', year: '2016',
        text: `In the reaction: (2016 - I) H C CH Y X (1) NaNH 2 /liq.NH 3 (1) NaNH 2 /liq.NH 3 (2) CH 3 CH 2 Br (2) CH 3 CH 2 Br`,
        A: `X = 1-Butyne ; Y = 2-Hexyne`, B: `X = 1-Butyne ; Y = 3-Hexyne`, C: `X = 2-Butyne ; Y = 3-Hexyne`, D: `X = 2-Butyne ; Y = 2-Hexyne`
    },
    {
        qNo: 26, topic: 'Chemical Properties of Alkene', year: '2016',
        text: `The pair of electron in the given carbanion, C C H 3 C , is present in which of the following orbitals? (2016 - I)`,
        A: `sp`, B: `d 2 sp`, C: `sp 3`, D: `sp 2 Aromatic Hydrocarbons`
    },
    {
        qNo: 27, topic: 'Preparation of Alkene', year: '2022',
        text: `Which compound amongst the following is not an aromatic compound? (2022) a . b. c . d.`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 28, topic: 'Preparation of Alkane', year: '2022',
        text: `Which of the following is suitable to synthesize chlorobenzene? (2022) a . , HCl Heating NH 2 b. Benzene, Cl 2 , anhydrous FeCl 3 c. Phenol, NaNO 2 , HCl, CuCl d. , HCl`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 29, topic: 'Aromatic Hydrocarbon', year: '2020',
        text: `Which of the following compound is most reactive in electrophilic aromatic substitution? (2020-Covid)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 30, topic: 'Conformations', year: '2019',
        text: `Among the following, the reaction that proceeds through an electrophilic substitution, is: (2019)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 31, topic: 'Chemical Properties of Alkene', year: '2018',
        text: `The compound C 7 H 8 undergoes the following reactions: (2018) 2 2 3Cl / Br / Fe Zn / HCl 7 8 C H A B C ∆  →  → → The product ‘C’ is Chapter & Topicwise NEET PYQ's P W 4`,
        A: `m-bromotoluene`, B: `o-bromotoluene`, C: `p-bromotoluene`, D: `3-bromo-2,4,6-trichlorotoluene`
    },
    {
        qNo: 32, topic: 'Preparation of Alkene', year: '2016',
        text: `Which of the following can be used as the halide component for Friedel-Crafts reaction ? (2016 - II)`,
        A: `Chloroethene`, B: `Isopropyl chloride`, C: `Chlorobenzene`, D: `Bromobenzene`
    },
    {
        qNo: 33, topic: 'Preparation of Alkane', year: '2016',
        text: `In the given reaction, the product P is: (2016 - II)`,
        A: `a. F b. F c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 34, topic: 'Aromatic Hydrocarbon', year: '2014',
        text: `What products are formed when the following compound is treated with Br 2 in the presence of FeBr 3 ? (2014)`,
        A: `a. b. c. d. CH 3 CH 3 CH 3 CH 3 Br Br and`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 35, topic: 'Conformations', year: '2013',
        text: `Which of the following compounds will not undergo Friedel- Craft reaction easily? (2013)`,
        A: `Cumene`, B: `Xylene`, C: `Nitrobenzene`, D: `Toluene`
    },
    {
        qNo: 36, topic: 'Chemical Properties of Alkene', year: '2013',
        text: `The radical, is aromatic because it has: (2013)`,
        A: `6 p-orbitals and 6 unpaired electrons`, B: `7 p-orbitals and 6 unpaired electrons`, C: `7 p-orbitals and 7 unpaired electrons`, D: `6 p-orbitals and 7 unpaired electrons Answer Key 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 c b b c a a b b d b c c d a a c a 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 d d a a b b c b a a b c b a b c b 35 36 c a`
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
