/**
 * Seed REAL NEET PYQs — Chapter: Electrochemistry (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_electrochemistry.mjs
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

const CHAPTER_NAME = 'Electrochemistry';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Electrolysis',
    'Faraday\'s Laws',
    'Kohlrausch\'s Law',
    'Conductance and Conductivity',
    'Electrochemical Series',
    'Nernst Equation',
    'Cell Constant',
    'Molar Conductivity'
];

const ANSWER_KEY = {
    1: 'B', 2: 'C', 3: 'A', 4: 'A', 5: 'B', 6: 'C', 7: 'A', 8: 'C', 9: 'B', 10: 'B', 11: 'B', 12: 'A', 13: 'B', 14: 'D', 15: 'C', 16: 'A', 17: 'D', 18: 'D', 19: 'A', 20: 'C', 21: 'C', 22: 'A', 23: 'B', 24: 'D', 25: 'A'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Electrolysis', year: '2022',
        text: `Given below are half cell reactions: (2022) 2 4 2 MnO 8 H 5e Mn 4H O − + − + + + → + o 2 Mn /MnO 4 E 1.510 V + − = − 2 2 1 O 2H 2e H O 2 + − + + → O /H O 2 2 E 1.223 V = + Will the permanganate ion, MnO – 4 liberate O 2 from water in the presence of an acid? a . No because o cell E 2.733V = − b . Yes, because o cell E 0.287 V = + c. No, because o cell E 0.287 V = − d. Yes, because o cell E 2.733 V = +`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 2, topic: 'Faraday\'s Laws', year: '2018',
        text: `Consider the change in oxidation state of Bromine corresponding to different emf values as shown in the diagram below : (2018) Then the species undergoing disproportionation is`,
        A: `BrO 3 –`, B: `BrO 4 –`, C: `HBrO`, D: `Br 2`
    },
    {
        qNo: 3, topic: 'Kohlrausch\'s Law', year: '2013',
        text: `A button cell used in watches functions as following Zn(s) + Ag 2 O(s) + H 2 O(l)  2Ag(s) + Zn 2+ (aq) + 2OH – (aq). If half cell potentials are Zn 2+ (aq) + 2e – → Zn(s) ; Eº = –0.76 V Ag 2 O(s) + H 2 O(l) + 2e – → 2Ag(s) + 2OH – (aq), Eº = 0.34 V. The cell potential will be: (2013)`,
        A: `1.10 V`, B: `0.42 V`, C: `0.84 V`, D: `1.34 V Nernst Equation`
    },
    {
        qNo: 4, topic: 'Conductance and Conductivity', year: '2022',
        text: `At 298 K, the standard electrode potentials of Cu 2+ /Cu, Zn 2+ / Zn, Fe 2+ / Fe and Ag + / Ag are 0.34 V, – 0.76 V, – 0.44 V and 0.80 V, respectively. On the basis of standard electrode potential, predict which of the following reaction can not occur? (2022)`,
        A: `2CuSO 4 (aq) + 2Ag(s) → 2Cu(s) + Ag 2 SO 4 (aq)`, B: `CuSO 4 (aq) + Zn(s) → ZnSO 4 (aq) + Cu(s)`, C: `CuSO 4 (aq) + Fe(s) → FeSO 4 (aq) + Cu(s)`, D: `FeSO 4 (aq) + Zn(s) → ZnSO 4 (aq) + Fe(s)`
    },
    {
        qNo: 5, topic: 'Electrochemical Series', year: '2022',
        text: `Find the emf of the cell in which the following reaction takes place at 298 K Ni(s) + 2Ag + (0.001 M) → Ni 2+ (0.001 M) + 2Ag(s) (Given that E° cell = 10.5 V, 2.303 RT F = 0.059 at 298 K) (2022)`,
        A: `1.05 V`, B: `1.0385 V`, C: `1.385 V`, D: `0.9615 V`
    },
    {
        qNo: 6, topic: 'Nernst Equation', year: '2020',
        text: `Identify the reaction from following having top position in EMF series (Std. red. potential) according to their electrode potential at 298 K. (2020-Covid)`,
        A: `Fe 2+ + 2e – → Fe(s)`, B: `Au 3+ + 3e – → Au(s)`, C: `K + + 1e – → K(s)`, D: `Mg 2+ + 2e – → Mg(s)`
    },
    {
        qNo: 7, topic: 'Cell Constant', year: '2019',
        text: `For a cell involving one electron E° cell = 0.59 V at 298 K, the equilibrium constant for the cell reaction is: 2.303RT Given that 0.059V at T = 298K F   =     (2019)`,
        A: `1.0 × 10 2`, B: `1.0 × 10 5`, C: `1.0 × 10 10`, D: `1.0 × 10 30`
    },
    {
        qNo: 8, topic: 'Molar Conductivity', year: '2019',
        text: `For the cell reaction 2Fe 3+ (aq) + 2I – (aq) → 2Fe 2+ (aq) + I 2 (aq) E Θ cell = 0.24 V at 298 K. The standard Gibbs energy ( D r G Θ ) of the cell reaction is: [Given that Faraday constant F = 96500 C mol –1 ] (2019)`,
        A: `–46.32 kJ mol –1`, B: `–23.16 kJ mol –1`, C: `46.32 kJ mol –1`, D: `23.16 kJ mol –1 2 C H A P T E R Electrochemistry Chapter & Topicwise NEET PYQ’s P W 2`
    },
    {
        qNo: 9, topic: 'Electrolysis', year: '2016',
        text: `If the E°cell for a given reaction has a negative value, which of the following gives the correct relationships for the values of ΔG° and K eq ? (2016 - II)`,
        A: `ΔG 0 < 0 ; K eq > 1`, B: `ΔG 0 < 0 ; K eq < 1`, C: `ΔG 0 > 0 ; K eq < 1`, D: `ΔG 0 > 0 ; K eq > 1`
    },
    {
        qNo: 10, topic: 'Faraday\'s Laws', year: '2016',
        text: `The pressure of H 2 required to make the potential of H 2- electrode zero in pure water at 298 K is: (2016 - I)`,
        A: `10 –4 atm`, B: `10 –14 atm`, C: `10 –12 atm`, D: `10 –10 atm`
    },
    {
        qNo: 11, topic: 'Kohlrausch\'s Law', year: '2014',
        text: `The pair of compounds that can exist together is: (2014)`,
        A: `HgCl 2 , SnCl 2`, B: `FeCl 2 , SnCl 2`, C: `FeCl 3 , KI`, D: `FeCl 3 , SnCl 2`
    },
    {
        qNo: 12, topic: 'Conductance and Conductivity', year: '2013',
        text: `A hydrogen gas electrode is made by dipping platinum wire in a solution of HCl of pH = 10 and by passing hydrogen gas around the platinum wire at one atm pressure. The oxidation potential of electrode would be? (2013)`,
        A: `0.059 V`, B: `0.59 V`, C: `0.118 V`, D: `1.18 V Conductance of Electrolytic Solutions`
    },
    {
        qNo: 13, topic: 'Electrochemical Series', year: '2021',
        text: `The molar conductance of NaCl, HCl and CH 3 COONa at infinite dilution are 126.45, 426.16 and 91.0 S cm 2 mol –1 respectively. The molar conductance of CH 3 COOH at infinite dilution is. Choose the right option for your answer. (2021)`,
        A: `390.71 S cm 2 mol –1`, B: `698.28 S cm 2 mol –1`, C: `540.48 S cm 2 mol –1`, D: `201.28 S cm 2 mol –1`
    },
    {
        qNo: 14, topic: 'Nernst Equation', year: '2021',
        text: `The molar conductivity of 0.007 M acetic acid is 20 S cm 2 mol –1 . What is the dissociation constant of acetic acid? Choose the correct option. (2021) 3 2 1 H 2 1 CH COO 350 S cm mol 50 S cm mol + − ° − ° −   Λ =     Λ =  `,
        A: `2.50 × 10 –4 mol L –1`, B: `1.75 × 10 –5 mol L –1`, C: `2.50 × 10 –5 mol L –1`, D: `1.75 × 10 –4 mol L –1`
    },
    {
        qNo: 15, topic: 'Cell Constant', year: '2016',
        text: `The molar conductivity of a 0.5 mol dm –3 solution of AgNO 3 with electrolytic conductivity of 5.76 × 10 –3 S cm –1 at 298 K is: (2016 - II)`,
        A: `0.086 S cm 2 mol –1`, B: `28.8 S cm 2 mol –1`, C: `2.88 S cm 2 mol –1`, D: `11.52 S cm 2 mol –1`
    },
    {
        qNo: 16, topic: 'Molar Conductivity', year: '2013',
        text: `At 25°C, molar conductance of 0.1 molar aqueous solution of ammonium hydroxide is 9.54 ohm –1 cm 2 mol –1 and at infinite dilution its molar conductance is 238 ohm –1 cm 2 mol –1 . The degree of ionisation of ammonium hydroxide at the same concentration and temperature is: (2013)`,
        A: `2.080 %`, B: `20.800 %`, C: `4.008 %`, D: `40.800 % Electrolytic Cells and Electrolysis`
    },
    {
        qNo: 17, topic: 'Electrolysis', year: '2020',
        text: `On electrolysis of dil sulphuric acid using Platinum (Pt) electrode, the product obtained at anode will be: (2020)`,
        A: `Oxygen gas`, B: `H 2 S gas`, C: `SO 2 gas`, D: `Hydrogen gas`
    },
    {
        qNo: 18, topic: 'Faraday\'s Laws', year: '2020',
        text: `The number of Faradays (F) required to produce 20 g of calcium from molten CaCl 2 (Atomic mass of Ca = 40 g mol –1 ) is: (2020)`,
        A: `2`, B: `3`, C: `4`, D: `1`
    },
    {
        qNo: 19, topic: 'Kohlrausch\'s Law', year: '2016',
        text: `During the electrolysis of molten sodium chloride, the time required to produce 0.10 mol of chlorine gas using a current of 3 amperes is: (2016 - II)`,
        A: `220 minutes`, B: `330 minutes`, C: `55 minutes`, D: `110 minutes`
    },
    {
        qNo: 20, topic: 'Conductance and Conductivity', year: '2016',
        text: `The number of electrons delivered at the cathode during electrolysis by a current of 1 ampere in 60 seconds is: (charge on electron = 1.60 × 10 –19 C) (2016 - II)`,
        A: `3.75 × 10 20`, B: `7.48 × 10 23`, C: `6 × 10 23`, D: `6 × 10 20`
    },
    {
        qNo: 21, topic: 'Electrochemical Series', year: '2014',
        text: `When 0.1 mol 2 4 MnO − is oxidised, the quantity of electricity required to completely oxidise 2 4 MnO − to 4 MnO − is: (2014)`,
        A: `96500 C`, B: `2 × 96500 C`, C: `9650 C`, D: `96.50 C`
    },
    {
        qNo: 22, topic: 'Nernst Equation', year: '2014',
        text: `The weight of silver (atomic weight = 108) displaced by a quantity of electricity which displaces 5600 mL of O 2 at STP will be: (2014)`,
        A: `10.8 g`, B: `54.0 g`, C: `108.0 g`, D: `5.4 g Batteries, Fuel Cells and Corrosion`
    },
    {
        qNo: 23, topic: 'Cell Constant', year: '2020',
        text: `In a typical fuel cell , the reactants (R) and product (P) are (2020-Covid)`,
        A: `R = H 2(g) , O 2(g) ; P = H 2 O ( l )`, B: `R = H 2(g) , O 2(g) , Cl 2(g) ; P = HClO 4(aq)`, C: `R = H 2(g) , N 2(g) ; P = NH 3(aq)`, D: `R = H 2(g) , O 2(g) ; P = H 2 O 2( l )`
    },
    {
        qNo: 24, topic: 'Molar Conductivity', year: '2016',
        text: `Zinc can be coated on iron to produce galvanized iron but the reverse is not possible. It is because: (2016 - II)`,
        A: `Zinc has lower negative electrode potential than iron`, B: `Zinc has higher negative electrode potential than iron`, C: `Zinc is lighter than iron`, D: `Zinc has lower melting point than iron`
    },
    {
        qNo: 25, topic: 'Electrolysis', year: '2015',
        text: `A device that converts energy of combustion of fuels like hydrogen and methane, directly into electrical energy is known as: (2015)`,
        A: `Electrolytic cell`, B: `Dynamo`, C: `Ni-Cd cell`, D: `Fuel cell Electrochemistry 3 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 b c a a None b c a c b b b a b d c a 18 19 20 21 22 23 24 25 d d a c c a b d Answer Key`
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
