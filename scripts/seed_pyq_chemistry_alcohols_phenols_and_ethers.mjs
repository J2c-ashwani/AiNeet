/**
 * Seed REAL NEET PYQs — Chapter: Alcohols, Phenols and Ethers (Chemistry)
 * Usage: node scripts/seed_pyq_chemistry_alcohols_phenols_and_ethers.mjs
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

const CHAPTER_NAME = 'Alcohols, Phenols and Ethers';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    'Alcohols',
    'Phenols',
    'Ethers'
];

const ANSWER_KEY = {
    1: 'D', 2: 'C', 3: 'C', 4: 'B', 5: 'D', 6: 'C', 7: 'A', 8: 'D', 9: 'D', 10: 'D', 11: 'B', 12: 'C', 13: 'C', 14: 'A', 15: 'A', 16: 'B', 17: 'D', 18: 'C', 19: 'D', 20: 'B', 21: 'B', 22: 'D', 23: 'A', 24: 'D', 25: 'C'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Alcohols', year: '2022',
        text: `Given below are two statements: (2022) Statement I: In Lucas test, primary, secondary and tertiary alcohols are distinguished on the basis of their reactivity with conc. HCl + ZnCl 2 , known as Lucas Reagent. Statement II: Primary alcohols are most reactive and immediately produce turbidity at room temperature on reaction with Lucas Reagent. In the light of the above statements, choose the most appropriate answer from the options given below:`,
        A: `Statement I is incorrect but Statement II is correct.`, B: `Both Statement I and Statement II are correct.`, C: `Both Statement I and Statement II are incorrect.`, D: `Statement I is correct but Statement II is incorrect.`
    },
    {
        qNo: 2, topic: 'Phenols', year: '2021',
        text: `What is the IUPAC name of the organic compound formed in the following chemical reaction? (2021) (i)C H MgBr, dry ether 5 2 (ii) H O, H 2 Acetone Product +  →`,
        A: `Pentan-2-ol`, B: `Pentan-3-ol`, C: `2-methyl butan-2-ol`, D: `2-methyl propan-2-ol`
    },
    {
        qNo: 3, topic: 'Ethers', year: '2021',
        text: `The product formed in the following chemical reaction is: (2021) O O CH 2 CH 3 OCH 3 C NaBH 4 ? C 2 H 5 OH`,
        A: `O CH 2 CH 3 CH 2 OH`, B: `OH OH H CH 2 CH 3 C CH 3`, C: `OH O CH 2 CH 3 C OCH 3`, D: `OH OH H CH 2 CH 3 C OCH 3`
    },
    {
        qNo: 4, topic: 'Alcohols', year: '2020',
        text: `Reaction between acetone and methylmagnesium chloride followed by hydrolysis will give : (2020)`,
        A: `Sec. butyl alcohol`, B: `Tert. butyl alcohol`, C: `Isobutyl alcohol`, D: `Isopropyl alcohol`
    },
    {
        qNo: 5, topic: 'Phenols', year: '2020',
        text: `2 6 2 2 B H 3 2 2 H O, H O/ OH CH CH CH == CH Z  → What is Z? (2020-Covid)`,
        A: `a. b. CH 3 CH 2 CH 2 CHO c. CH 3 CH 2 CH 2 CH 3 d. CH 3 CH 2 CH 2 CH 2 OH`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 6, topic: 'Ethers', year: '2018',
        text: `Compound A, C 8 H 10 O, is found to react with NaOI (produced by reacting Y with NaOH) and yields a yellow precipitate with characteristic smell. A and Y are respectively (2018)`,
        A: `CH 2 OH and I 2 H 3 C`, B: `CH 2 CH 2 OH and I 2`, C: `CH OH CH 3 and I 2`, D: `OH and I 2 CH 3 CH 3`
    },
    {
        qNo: 7, topic: 'Alcohols', year: '2015 Re',
        text: `Which of the following is not the product of dehydration of OH ? (2015 Re)`,
        A: `a. b. c. d. 8 C H A P T E R Alcohols, Phenols and Ethers Chapter & Topicwise NEET PYQ’s P W 2 Phenols`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 8, topic: 'Phenols', year: '2022',
        text: `Given below are two statements: (2022) Statement I: The acidic strength of monosubstituted nitrophenol is higher than phenol because of electron withdrowing nitro group. Statement II: o-nitrophenol, m-nitrophenol and p-nitrophenol will have same acidic strength as they have one nitro group attached to the phenolic ring. In the light of the above statements, choose the most appropriate answer form the options given below:`,
        A: `Statement I is incorrect but Statement II is correct.`, B: `Both Statement I and Statement II are correct.`, C: `Both Statement I and Statement II are incorrect.`, D: `Statement I is correct but Statement II is incorrect.`
    },
    {
        qNo: 9, topic: 'Ethers', year: '2020',
        text: `Which of the following substituted phenols is the strongest acid? (2020-Covid)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 10, topic: 'Alcohols', year: '2019',
        text: `The compound that is most difficult to protonate is: (2019)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 11, topic: 'Phenols', year: '2019',
        text: `The structure of intermediate A in the following reaction, is (2019)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 12, topic: 'Ethers', year: '2018',
        text: `Identify the major products P, Q and R in the following sequence of reactions: (2018)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 13, topic: 'Alcohols', year: '2018',
        text: `In the reaction, the electrophile involved is: (2018)`,
        A: `Dichloromethyl cation 2 C HCl ⊕      `, B: `Formyl cation ü ⊕      `, C: `Dichlorocarbene ( ) 2 : CCl`, D: `Dichloromethyl anion 2 C HCl ⊕      `
    },
    {
        qNo: 14, topic: 'Phenols', year: '2017',
        text: `Which one is the most acidic compound? (2017-Delhi)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 15, topic: 'Ethers', year: '2015 Re',
        text: `Reaction of phenol with chloroform in presence of dilute sodium hydroxide finally introduces which one of the following functional group? (2015 Re)`,
        A: `–CHO`, B: `–CH 2 Cl`, C: `–COOH`, D: `–CHCl 2 Alcohols, Phenols and Ethers 3`
    },
    {
        qNo: 16, topic: 'Alcohols', year: '2014',
        text: `Which of the following will not be soluble in sodium hydrogen carbonate? (2014)`,
        A: `Benzoic acid`, B: `o-Nitrophenol`, C: `Benzenesulphonic acid`, D: `2,4,6-trinitrophenol Ethers`
    },
    {
        qNo: 17, topic: 'Phenols', year: '2020',
        text: `Anisole on cleavage with HI gives: (2020)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 18, topic: 'Ethers', year: '2018',
        text: `The compound A on treatment with Na gives B, and with PCl 5 gives C. B and C react together to give diethyl ether. A, B and C are in the order: (2018)`,
        A: `C 2 H 5 OH, C 2 H 6 , C 2 H 5 Cl`, B: `C 2 H 5 OH, C 2 H 5 Cl, C 2 H 5 ONa`, C: `C 2 H 5 OH, C 2 H 5 ONa, C 2 H 5 Cl`, D: `C 2 H 5 Cl, C 2 H 6 , C 2 H 5 OH`
    },
    {
        qNo: 19, topic: 'Alcohols', year: '2017',
        text: `The heating of phenyl-methyl ethers with HI produces. (2017-Delhi)`,
        A: `Benzene`, B: `Ethyl chlorides`, C: `Iodobenzene`, D: `Phenol`
    },
    {
        qNo: 20, topic: 'Phenols', year: '2017',
        text: `Identify A and predict the type of reaction: (2017-Delhi)`,
        A: `and cine substitution reaction`, B: `and substitution reaction`, C: `and elimination addition reaction`, D: `and cine substitution reaction`
    },
    {
        qNo: 21, topic: 'Ethers', year: '2016',
        text: `The reaction: can be classified as? (2016 - I)`,
        A: `Williamson alcohol synthesis reaction`, B: `Williamson ether synthesis reaction`, C: `Alcohol formation reaction`, D: `Dehydration reaction`
    },
    {
        qNo: 22, topic: 'Alcohols', year: '2015',
        text: `The reaction is called: (2015)`,
        A: `Williamson continuous esterification process`, B: `Etard reaction`, C: `Gatterman - Koch reaction`, D: `Williamson synthesis`
    },
    {
        qNo: 23, topic: 'Phenols', year: '2014',
        text: `Among the following sets of reactants which one produces anisole? (2014)`,
        A: `C 6 H 5 OH; NaOH; CH 3 I`, B: `C 6 H 5 OH; neutral FeCl 3`, C: `C 6 H 5 – CH 3 ; CH 3 COCl; AlCl 3`, D: `CH 3 CHO; RMgX`
    },
    {
        qNo: 24, topic: 'Ethers', year: '2014',
        text: `Identify Z in the sequence of reactions: 2 5 2 2 C H ONa HBr / H O 3 2 2 CH CH CH CH Y Z =  →  → (2014)`,
        A: `(CH 3 ) 2 CH – O – CH 2 CH 3`, B: `CH 3 (CH 2 ) 4 – O – CH 3`, C: `CH 3 CH 2 – CH(CH 3 ) – O – CH 2 CH 3`, D: `CH 3 – (CH 2 ) 3 – O – CH 2 CH 3`
    },
    {
        qNo: 25, topic: 'Alcohols', year: '2013',
        text: `Among the following ethers, which one will produce methyl alcohol on treatment with hot concentrated HI? (2013)`,
        A: `a. CH 3 – CH 2 – CH 2 – CH 2 – O – CH 3 b. c. d. Chapter & Topicwise NEET PYQ’s P W 4 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 d c c b d c a d d d b c c a a b d 18 19 20 21 22 23 24 25 c d b b d a d c Answer Key`, B: `Option B`, C: `Option C`, D: `Option D`
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
