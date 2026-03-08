/**
 * Seed REAL NEET PYQs — Chapter: Equilibrium (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_equilibrium.mjs
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

const CHAPTER_NAME = 'Equilibrium';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Solubility And Solubility Product',
    'Equilibrium Constant',
    'Acids and Bases',
    'pH Calculation',
    'Le Chatelier\'s Principle'
];

const ANSWER_KEY = {
    1: 'B', 2: 'C', 3: 'B', 4: 'B', 5: 'D', 6: 'A', 7: 'C', 8: 'B', 9: 'C', 10: 'A', 11: 'A', 12: 'C', 13: 'C', 14: 'C', 15: 'D', 16: 'C', 17: 'B', 18: 'C', 19: 'C', 20: 'D', 21: 'D', 22: 'A', 23: 'B', 24: 'B', 25: 'C', 26: 'B', 27: 'D', 28: 'A', 29: 'D', 30: 'A', 31: 'C', 32: 'A', 33: 'A', 34: 'D', 35: 'C', 36: 'C', 37: 'B', 38: 'B'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Solubility And Solubility Product', year: '2022',
        text: `3O 2 (g)  2O 3 (g) for the given reaction at 298 K, K c is found to be 3.0 × 10 –59 . If the concentration of O 2 at equilibrium is 0.040 M, then concentration of O 3 in M is: (2022)`,
        A: `1.2 × 10 21`, B: `4.38 × 10 –32`, C: `1.9 × 10 –63`, D: `2.4 × 10 31`
    },
    {
        qNo: 2, topic: 'Equilibrium Constant', year: '2017',
        text: `The equilibrium constants of the following are: 2 2 3 1 2 2 2 2 2 2 3 N 3H 2NH K N O 2NO K 1 H O H O K 2 + + + →     The equilibrium constant (K) of the reaction: (2017-Delhi) K 3 2 2 5 2NH + O 2NO + 3H O, 2     will be:`,
        A: `3 2 3 1 K K /K`, B: `3 1 3 2 K K / K`, C: `3 ü K K /K`, D: `K 2 K 3 /K 1`
    },
    {
        qNo: 3, topic: 'Acids and Bases', year: '2015 Re',
        text: `If the equilibrium constant for N 2 (g) + O 2 (g)   2NO(g) is K, the equilibrium constant for ( ) ( ) ( ) 2 2 1 1 N g O g NO g 2 2 +  will be: (2015 Re)`,
        A: `K 2`, B: `K 1/2`, C: `1 K 2`, D: `K`
    },
    {
        qNo: 4, topic: 'pH Calculation', year: '2015',
        text: `If the value of an equilibrium constant for a particular reaction is 1.6 × 10 12 , then at equilibrium the system will contain: (2015)`,
        A: `Mostly reactants`, B: `Mostly products`, C: `Similar amounts of reactants and products`, D: `All reactants Relation Between K,Q and G, Factors Affecting Equilibria`
    },
    {
        qNo: 5, topic: 'Le Chatelier\'s Principle', year: '2020',
        text: `Hydrolysis of sucrose is given by the following reaction: Sucrose + H 2 O  Glucose + Fructose If the equilibrium constant (K c ) is 2 × 10 13 at 300 K, the value of D r G o at the same temperature will be : (2020)`,
        A: `8.314 J mol –1 K –1 × 300 K × ln (2 × 10 13 )`, B: `8.314 J mol –1 K –1 × 300 K × ln (3 × 10 13 )`, C: `–8.314 J mol –1 K –1 × 300 K × ln (4 × 10 13 )`, D: `–8.314 J mol –1 K –1 × 300 K × ln (2 × 10 13 )`
    },
    {
        qNo: 6, topic: 'Solubility And Solubility Product', year: '2018',
        text: `Which one of the following conditions will favour maximum formation of the product in the reaction, ( ) ( ) 2 2 2 r A g B (g) X g H X kJ + D = -  (2018)`,
        A: `Low temperature and high pressure`, B: `Low temperature and low pressure`, C: `High temperature and low pressure`, D: `High temperature and high pressure`
    },
    {
        qNo: 7, topic: 'Equilibrium Constant', year: '2017',
        text: `Which one of the following statements is not correct? (2017-Delhi)`,
        A: `Coenzymes increase the catalytic activity of enzyme`, B: `Catalyst does not initiate any reaction`, C: `The value of equilibrium constant is changed in the presence of a catalyst in the reaction at equilibrium`, D: `Enzymes catalyse mainly bio-chemical reactions`
    },
    {
        qNo: 8, topic: 'Acids and Bases', year: '2017',
        text: `A 20 litre container at 400 K contains CO 2 (g) at pressure 0.4 atm and an excess of SrO (neglect the volume of solid SrO). The volume of the containers is now decreased by moving the movable piston fitted in the container. The maximum volume of the container, when pressure of CO 2 attains its maximum value, will be: (2017-Delhi) (Given that: SrCO 3 (s)   SrO(s) + CO 2 (g) K p = 1.6 atm)`,
        A: `2 litre`, B: `5 litre`, C: `10 litre`, D: `4 litre`
    },
    {
        qNo: 9, topic: 'pH Calculation', year: '2016',
        text: `Consider the nitration of benzene using mixed conc. H 2 SO 4 and HNO 3 . If a larger amount of KHSO 4 is added to the mixture, the rate of nitration will be: (2016-I)`,
        A: `Doubled`, B: `Increase`, C: `Decrease`, D: `Unchanged 6 C H A P T E R Equilibrium Chapter & Topicwise NEET PYQ's P W 2`
    },
    {
        qNo: 10, topic: 'Le Chatelier\'s Principle', year: '2015',
        text: `Which of the following statements is correct for a reversible process in a state of equilibrium? (2015)`,
        A: `Δ Gº = –2.303 RT log K`, B: `Δ Gº = 2.303 RT log K`, C: `Δ G = –2.303 RT log K`, D: `Δ G = 2.303 RT log K`
    },
    {
        qNo: 11, topic: 'Solubility And Solubility Product', year: '2014',
        text: `For a given exothermic reaction, K p and K´ p are the equilibrium constants at temperature T 1 and T 2 , respectively. Assuming that heat of reaction is constant in temperature range between T 1 and T 2 , it is readily observed that (2014)`,
        A: `p p K K ′ >`, B: `p p K K ′ <`, C: `p p K K ′ =`, D: `p p 1 K K = ′`
    },
    {
        qNo: 12, topic: 'Equilibrium Constant', year: '2014',
        text: `For the reversible reaction, N 2 (g) +3H 2 (g)  2NH 3 (g) + Heat. The equilibrium shifts in forward direction: (2014)`,
        A: `By decreasing the pressure`, B: `By decreasing the concentrations of N 2 (g) and H 2 (g)`, C: `By increasing pressure and decreasing temperature`, D: `By increasing the concentration of NH 3 (g)`
    },
    {
        qNo: 13, topic: 'Acids and Bases', year: '2013',
        text: `KMnO 4 can be prepared from K 2 MnO 4 as per the reaction: 2 4 2 4 2 3MnO 2H O 2MnO MnO 4OH ℵ ℵ  The reaction can go to completion by removing OH – ions by adding: (2013)`,
        A: `HCl`, B: `KOH`, C: `CO 2`, D: `SO 2 Acids, Bases and Salts`
    },
    {
        qNo: 14, topic: 'pH Calculation', year: '2019',
        text: `Conjugate base for Bronsted acids H 2 O and HF are: (2019)`,
        A: `OH – and H 2 F + , respectively`, B: `H 3 O + and F – , respectively`, C: `OH – and F – , respectively`, D: `H 3 O + and H 2 F + , respectively`
    },
    {
        qNo: 15, topic: 'Le Chatelier\'s Principle', year: '2016',
        text: `Which of the following fluoro-compounds is most likely to behave as a Lewis base? (2016-II)`,
        A: `CF 4`, B: `SiF 4`, C: `BF 3`, D: `PF 3`
    },
    {
        qNo: 16, topic: 'Solubility And Solubility Product', year: '2013',
        text: `Which of these is least likely to act as a Lewis base? (2013)`,
        A: `CO`, B: `F –`, C: `BF 3`, D: `PF 3 Ionization of Acids & Bases, pH Scale, Hydrolysis`
    },
    {
        qNo: 17, topic: 'Equilibrium Constant', year: '2021',
        text: `The pK b of dimethylamine and pK a of acetic acid are 3.27 and 4.77 respectively at T(K). The correct option for the pH of dimethylammonium acetate solution is: (2021)`,
        A: `5.50`, B: `7.75`, C: `6.25`, D: `8.50`
    },
    {
        qNo: 18, topic: 'Acids and Bases', year: '2020',
        text: `Which among the following salt solutions is basic in nature? (2020-Covid)`,
        A: `Ammonium sulphate`, B: `Ammonium nitrate`, C: `Sodium acetate`, D: `Ammonium chloride`
    },
    {
        qNo: 19, topic: 'pH Calculation', year: '2018',
        text: `Following solutions were prepared by mixing different volumes of NaOH and HCl of different concentrations: (2018) A. M M 60 mL HCl 40 mL NaOH 10 10 + B. M M 55 mL HCl 45 mL NaOH 10 10 + C. M M 75 mL HCl 25 mL NaOH 5 5 + \` D. M M 100 mL HCl 100 mL NaOH 10 10 + pH of which one of them will be equal to 1?`,
        A: `B`, B: `A`, C: `C`, D: `D`
    },
    {
        qNo: 20, topic: 'Le Chatelier\'s Principle', year: '2016',
        text: `The percentage of pyridine (C 5 H 5 N) that forms pyrimidine ion (C 5 H 5 N + H) in a 0.10 M aqueous pyridine solution (K b for C 5 H 5 N = 1.7 × 10 –9 ) is: (2016-II)`,
        A: `0.77%`, B: `1.6%`, C: `0.0060%`, D: `0.013%`
    },
    {
        qNo: 21, topic: 'Solubility And Solubility Product', year: '2015 Re',
        text: `What is the pH of the resulting solution when equal volumes of 0.1 M NaOH and 0.01 M HCl are mixed? (2015 Re)`,
        A: `2.0`, B: `7.0`, C: `1.04`, D: `12.65`
    },
    {
        qNo: 22, topic: 'Equilibrium Constant', year: '2015 Re',
        text: `Aqueous solution of which of the following compounds is the best conductor of electric current? (2015 Re)`,
        A: `Hydrochloric acid, HCl`, B: `Ammonia, NH 3`, C: `Fructose, C 6 H 12 O 6`, D: `Acetic acid, C 2 H 4 O 2`
    },
    {
        qNo: 23, topic: 'Acids and Bases', year: '2014',
        text: `Which of the following salts will give highest pH in water? (2014)`,
        A: `NaCl`, B: `Na 2 CO 3`, C: `CuSO 4`, D: `KCl Buffer Solutions`
    },
    {
        qNo: 24, topic: 'pH Calculation', year: '2022',
        text: `The pH of the solution containing 50 mL each of 0.10 M sodium acetate and 0.01 M acetic acid is (2022) [Given pK a of CH 3 COOH = 4.57] a . 2.57 b. 5.57 c. 3.57 d. 4.57`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 25, topic: 'Le Chatelier\'s Principle', year: '2019',
        text: `Which will make basic buffer? (2019)`,
        A: `50 mL of 0.1 M NaOH + 25 mL of 0.1 M CH 3 COOH`, B: `100 mL of 0.1 M CH 3 COOH + 100 mL of 0.1 M NaOH`, C: `100 mL of 0.1 M HCl + 200 mL of 0.1 M NH 4 OH`, D: `100 mL of 0.1 M HCl + 100 mL of 0.1 M NaOH`
    },
    {
        qNo: 26, topic: 'Solubility And Solubility Product', year: '2015 Re',
        text: `Which one of the following pairs of solution is not an acidic buffer? (2015 Re)`,
        A: `H 3 PO 4 and Na 3 PO 4`, B: `HClO 4 and NaClO 4`, C: `CH 3 COOH and CH 3 COONa`, D: `H 2 CO 3 and Na 2 CO 3 Equilibrium 3 Solubility Equilibria of Sparingly Soluble Salts`
    },
    {
        qNo: 27, topic: 'Equilibrium Constant', year: '2020',
        text: `Find out the solubility of Ni(OH) 2 in 0.1 M NaOH. Given that the ionic product of Ni(OH) 2 is 2 × 10 –15 . (2020)`,
        A: `2 × 10 –8 M`, B: `1 × 10 –13 M`, C: `1 × 10 8 M`, D: `2 × 10 –13 M`
    },
    {
        qNo: 28, topic: 'Acids and Bases', year: '2020',
        text: `HCl was passed through a solution of CaCl 2 , MgCl 2 and NaCl. Which of the following compounds crystalliess? (2020)`,
        A: `Only NaCl`, B: `Only MgCl 2`, C: `NaCl, MgCl 2 and CaCl 2`, D: `Both MgCl 2 and CaCl 2`
    },
    {
        qNo: 29, topic: 'pH Calculation', year: '2020',
        text: `The solubility product for a salt of the type AB is 4 × 10 –8 . What is the molarity of its standard solution? (2020-Covid)`,
        A: `16 × 10 –16 mol/L`, B: `2 × 10 –16 mol/L`, C: `4 × 10 –4 mol/L`, D: `2 × 10 –4 mol/L`
    },
    {
        qNo: 30, topic: 'Le Chatelier\'s Principle', year: '2020',
        text: `pH of a saturated solution of Ca(OH 2 ) is`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 31, topic: 'Solubility And Solubility Product', year: '2019',
        text: `The solubility product (K sp ) of Ca(OH) 2 is: (2019)`,
        A: `0.5 × 10 –15`, B: `0.25 × 10 –10`, C: `0.125 × 10 –15`, D: `0.5 × 10 –10`
    },
    {
        qNo: 32, topic: 'Equilibrium Constant', year: '2018',
        text: `The solubility of BaSO 4 in water is 2.42 × 10 –3 gL –1 at 298 K. The value of its solubility product (K sp ) will be (2018) (Given molar mass of BaSO 4 = 233 g mol –1 )`,
        A: `1.08 × 10 –10 mol 2 L –2`, B: `1.08 × 10 –12 mol 2 L –2`, C: `1.08 × 10 –8 mol 2 L –2`, D: `1.08 × 10 –14 mol 2 L –2`
    },
    {
        qNo: 33, topic: 'Acids and Bases', year: '2017',
        text: `Concentration of the Ag + ions in a saturated solution of Ag 2 C 2 O 4 is 2.2 × 10 –4 mol L –1 . Solubility product of Ag 2 C 2 O 4 is: (2017-Delhi)`,
        A: `5.3 × 10 –12`, B: `2.42 × 10 –8`, C: `2.66 × 10 –12`, D: `4.5 × 10 –11`
    },
    {
        qNo: 34, topic: 'pH Calculation', year: '2016',
        text: `The solubility of AgCl(s) with solubility product 1.6 × 10 –10 in 0.1 M NaCl solution would be: (2016-II)`,
        A: `1.6 × 10 –11 M`, B: `Zero`, C: `1.26 × 10 –5 M`, D: `1.6 × 10 –9 M`
    },
    {
        qNo: 35, topic: 'Le Chatelier\'s Principle', year: '2016',
        text: `MY and NY 3 , two nearly insoluble salts, have the same K sp values of 6.2 × 10 –13 at room temperature, which statements would be true in regard to MY and NY 3 ? (2016-I)`,
        A: `The addition of the salt of KY to solution of MY and NY 3 will have no effect on their solubilities`, B: `The molar solubilities of MY and NY 3 in water are identical`, C: `The molar solubility of MY in water is less than that of NY 3`, D: `The salts MY and NY 3 are more soluble in 0.5 M KY than in pure water`
    },
    {
        qNo: 36, topic: 'Solubility And Solubility Product', year: '2015',
        text: `The K sp of Ag 2 CrO 4 , AgCl, AgBr and AgI are respectively, 1.1 × 10 –12 , 1.8 × 10 –10 , 5.0 × 10 –13 , 8.3 × 10 –17 . Which one of the following salts will precipitate last if AgNO 3 solution is added to the solution containing equal moles of NaCl, NaBr, NaI and Na 2 CrO 4 ? (2015)`,
        A: `AgCl`, B: `AgBr`, C: `Ag 2 CrO 4`, D: `AgI`
    },
    {
        qNo: 37, topic: 'Equilibrium Constant', year: '2014',
        text: `Using the Gibb’s energy change, ΔG o = + 63.3 kJ, for the following reaction, + 2 2 3 3 Ag CO (s) 2Ag (aq) + CO (aq) −   the K sp of Ag 2 CO 3 (s) in water at 25°C is (R = 8.314 J K –1 mol –1 ) (2014)`,
        A: `3.2 × 10 –26`, B: `8.0 × 10 –12`, C: `2.9 × 10 –3`, D: `7.9 × 10 –2`
    },
    {
        qNo: 38, topic: 'Acids and Bases', year: '2013',
        text: `Identify the correct order of solubility in aqueous medium: (2013)`,
        A: `Na 2 S > CuS > ZnS`, B: `Na 2 S > ZnS > CuS`, C: `CuS > ZnS > Na 2 S`, D: `ZnS > Na 2 S > CuS 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 b c b b d a c b c a a c c c d c b 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 c c d d a b b c b d a d a a a d c 35 36 37 c b b Answer Key`
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
