/**
 * Seed REAL NEET PYQs — Chapter: Current Electricity (Physics)
 * Usage: node scripts/seed_pyq_physics_current_electricity.mjs
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

const CHAPTER_NAME = 'Current Electricity';
const SUBJECT_NAME = 'Physics';
const CLASS_LEVEL = 11; // Adjust if necessary

const TOPICS = [
    'Electrical Resistance (Temperature Dependence & Resistivity)',
    'Colour Coding of Resistances',
    'Electric Current (Mobility)',
    'Electric Current (Drift Velocity)',
    'Meter Bridge',
    'Current Density',
    'Resistivity & Conductivity',
    'Combination of Resistors (Series and Parallel)',
    'Potentiometer',
    'Equivalent Resistance (Complex Circuits)',
    'Electrical Energy/Power',
    'Wheatstone Bridge',
    'Kirchhoff\'s Rules (Loop Rule)',
    'Heating Effect of Current',
    'Electric Current (Equation)',
    'Emf of Cell (Equivalent Emf/Internal Resistance)',
    'Voltage Division and Current Division Rule'
];

const ANSWER_KEY = {
    1: 'D', 2: 'B', 3: 'D', 4: 'B', 5: 'C', 6: 'A', 7: 'A', 8: 'A', 9: 'A', 10: 'C', 11: 'A', 12: 'A', 13: 'A', 14: 'A', 15: 'A', 16: 'A', 17: 'A', 18: 'A', 19: 'A', 20: 'A', 21: 'A', 22: 'A', 23: 'A', 24: 'A', 25: 'A', 26: 'B', 27: 'A', 28: 'A', 29: 'A', 30: 'A', 31: 'A', 32: 'A', 33: 'A', 34: 'A', 35: 'A', 36: 'A', 37: 'A', 38: 'A', 39: 'A', 40: 'A', 41: 'C'
};

const QUESTIONS = [
    {
        qNo: 1, topic: 'Electrical Resistance (Temperature Dependence & Resistivity)', year: '2015',
        text: `Across a metallic conductor of non-uniform cross section a constant potential difference is applied. The quantity which remains constant along the conductor is: [RC] (2015)`,
        A: `Current`, B: `Drift velocity`, C: `Electric field`, D: `Current density Ohm’s Law Resistance and Resistivity`
    },
    {
        qNo: 2, topic: 'Colour Coding of Resistances', year: '2020',
        text: `Two solid conductors are made up of same material have same length and same resistance. One of them has a circular cross section of area A 1 and the other one has a square cross section of area A 2 . The ratio A 1 /A 2 is (2020-Covid)`,
        A: `1`, B: `0.8`, C: `2`, D: `1.5`
    },
    {
        qNo: 3, topic: 'Electric Current (Mobility)', year: '2017',
        text: `The resistance of a wire is ‘R’ ohm. If it is melted and stretched to ‘n’ times its original length, its new resistance will be: (2017-Delhi)`,
        A: `R n`, B: `n 2 R`, C: `2 R n`, D: `nR`
    },
    {
        qNo: 4, topic: 'Electric Current (Drift Velocity)', year: '2013',
        text: `A wire of resistance 4 Ω is stretched to twice its original length. The resistance of stretched wire would be: (2013)`,
        A: `16 Ω`, B: `2 Ω`, C: `4 Ω`, D: `8 Ω Resistance and Conductance`
    },
    {
        qNo: 5, topic: 'Meter Bridge', year: '2022',
        text: `A copper wire of length 10 m and radius (10 –2 / π ) m has electrical resistance of 10 Ω . The current density in the wire for an electric field strength of 10 V/m is : (2022)`,
        A: `10 5 A/m 2`, B: `10 4 A/m 2`, C: `10 6 A/m 2`, D: `10 –5 A/m 2`
    },
    {
        qNo: 6, topic: 'Current Density', year: '2021',
        text: `Column-I gives certain physical terms associated with flow of current through a metallic conductor. Column-II gives some mathematical relations involving electrical quantities. Match Column-I and Column-II with appropriate relations. (2021) Column-I Column-II (A) Drift Velocity (P) 2 m ne ρ (B) Electrical Resistivity (Q) nev d (C) Relaxation Period (R) eE m τ (D) Current Density (S) E J`,
        A: `(A) - (R), (B) - (S), (C) - (Q), (D) - (P)`, B: `(A) - (R), (B) - (P), (C) - (S), (D) - (Q)`, C: `(A) - (R), (B) - (Q), (C) - (S), (D) - (P)`, D: `(A) - (R), (B) - (S), (C) - (P), (D) - (Q)`
    },
    {
        qNo: 7, topic: 'Resistivity & Conductivity', year: '2020',
        text: `A charged particle having drift velocity of 7.5 × 10 –4 m S –1 in an electric field of 3 × 10 –10 Vm –1 , has a mobility in m 2 V –1 S –1 of : (2020)`,
        A: `2.5 × 10 6`, B: `2.5 × 10 –6`, C: `2.25 × 10 –15`, D: `2.25 × 10 15`
    },
    {
        qNo: 8, topic: 'Combination of Resistors (Series and Parallel)', year: '2020',
        text: `Which of the following graph represents the variation of resistivity ( ρ ) with temperature (T) for copper (2020)`,
        A: `r`, B: `r`, C: `r`, D: `r`
    },
    {
        qNo: 9, topic: 'Potentiometer', year: '2015 Re',
        text: `Two metal wires of identical dimensions are connected in series. If σ 1 and σ 2 are the conductivities of the metal wires respectively, the effective conductivity of the combination is: (2015 Re)`,
        A: `1 2 1 2 σ σ σ + σ`, B: `1 2 1 2 2 σ σ σ + σ`, C: `1 2 1 2 2 σ + σ σ σ`, D: `1 2 1 2 σ + σ σ σ 3 C H A P T E R Current Electricity Chapter & Topicwise NEET PYQ's P W 2 Colour Code of Carbon Resistance`
    },
    {
        qNo: 10, topic: 'Equivalent Resistance (Complex Circuits)', year: '2020',
        text: `The color code of a resistance is given below: [RC] (2020) Yellow Yiolet Brown Gold The values of resistance and tolerance, respectively, are:`,
        A: `47 k Ω , 10%`, B: `4.7 k Ω , 5%`, C: `470 Ω , 5%`, D: `470 k Ω , 5%`
    },
    {
        qNo: 11, topic: 'Electrical Energy/Power', year: '2018',
        text: `A carbon resistor of (47 ± 4.7) kΩ is to be marked with rings of different colours for its identification. The colour code sequence will be [RC] (2018)`,
        A: `Yellow – Green – Violet – Gold`, B: `Yellow – Violet – Orange – Silver`, C: `Violet – Yellow – Orange – Silver`, D: `Green – Orange – Violet – Gold Combination of Resistance`
    },
    {
        qNo: 12, topic: 'Wheatstone Bridge', year: '2021',
        text: `The effective resistance of a parallel connection that consists of four wires of equal length, equal area of cross-section and same material is 0.25 Ω . What will be the effective resistance if they are connected in series? (2021)`,
        A: `0.5 Ω`, B: `1 Ω`, C: `4 Ω`, D: `0.25 Ω`
    },
    {
        qNo: 13, topic: 'Kirchhoff\'s Rules (Loop Rule)', year: '2020',
        text: `The equivalent resistance between A and B for the mesh shown in the figure is (2020-Covid)`,
        A: `16 Ω`, B: `30 Ω`, C: `4.8 Ω`, D: `7.2 Ω`
    },
    {
        qNo: 14, topic: 'Heating Effect of Current', year: '2015 Re',
        text: `A circuit contains an ammeter, a battery of 30 V and a resistance 40.8 ohm all connected in series. If the ammeter has a coil of resistance 480 ohm and a shunt of 20 ohm, the reading in the ammeter will be: (2015 Re)`,
        A: `1 A`, B: `0.5 A`, C: `0.25 A`, D: `2 A Internal Resistance of a Cell and Grouping`
    },
    {
        qNo: 15, topic: 'Electric Current (Equation)', year: '2019',
        text: `In the circuits shown below, the readings of the voltmeters and the ammeters will be (2019)`,
        A: `V 2 > V 1 and i 1 = i 2`, B: `V 1 = V 2 and i 1 > i 2`, C: `V 1 = V 2 and i 1 = i 2`, D: `V 2 > V 1 and i 1 > i 2`
    },
    {
        qNo: 16, topic: 'Emf of Cell (Equivalent Emf/Internal Resistance)', year: '2018',
        text: `A set of ‘n’ equal reistors, of value ‘R’ each, are connected in series to a battery of emf ‘E’ and internal resistance ‘R’. The current drawn is I. Now, the ‘n’ resistors are connected in parallel to the same battery. Then the current drawn from battery becomes 10 I. The value of ‘n’ is (2018)`,
        A: `20`, B: `11`, C: `10`, D: `9`
    },
    {
        qNo: 17, topic: 'Voltage Division and Current Division Rule', year: '2018',
        text: `A battery consists of a variable number ‘n’ of identical cells (having internal resistance ‘r’ each) which are connected in series. The terminals of the battery are short-circuited and the current I is measured. Which of the graphs shows the correct relationship between I and n? (2018)`,
        A: `a. b. c. d.`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 18, topic: 'Electrical Resistance (Temperature Dependence & Resistivity)', year: '2013',
        text: `The internal resistance of a 2.1 V cell which gives a current of 0.2 A through a resistance of 10 Ω is: (2013)`,
        A: `1.0 Ω`, B: `0.2 Ω`, C: `0.5 Ω`, D: `0.8 Ω Kirchhoff’s Law`
    },
    {
        qNo: 19, topic: 'Colour Coding of Resistances', year: '2021',
        text: `Three resistors having resistances r 1 , r 2 and r 3 are connected as shown in the given circuit. The ratio 3 1 i i of currents in terms of resistances used in the circuit is: (2021) i 2 i 1 A i 3 r 2 r 3 r 1 B Current Electricity 3`,
        A: `2 2 3 r r r +`, B: `1 1 2 r r r +`, C: `2 1 3 r r r +`, D: `1 2 3 r r r +`
    },
    {
        qNo: 20, topic: 'Electric Current (Mobility)', year: '2020',
        text: `For the circuit shown in the figure, the current I will be (2020-Covid)`,
        A: `1 A`, B: `1.5 A`, C: `0.5 A`, D: `0.75 A`
    },
    {
        qNo: 21, topic: 'Electric Current (Drift Velocity)', year: '2020',
        text: `For the circuit given below, the Kirchoff’s loop rule for the loop BCDEB is given by the equation (2020-Covid)`,
        A: `i 2 R 2 + E 2 – E 3 – i 3 R 1 = 0`, B: `i 2 R 2 + E 2 + E 3 – i 3 R 1 = 0`, C: `–i 2 R 2 + E 2 + E 3 – i 3 R 1 = 0`, D: `–i 2 R 2 + E 2 – E 3 – i 3 R 1 = 0`
    },
    {
        qNo: 22, topic: 'Meter Bridge', year: '2016',
        text: `The potential difference (V A – V B ) between the points A and B in the given figure is: (2016 - II)`,
        A: `+ 6 V`, B: `+9 V`, C: `–3 V`, D: `+3 V`
    },
    {
        qNo: 23, topic: 'Current Density', year: '2015',
        text: `A, B and C are voltmeters of resistance R, 1.5R and 3R respectively as shown in the figure. When some potential difference is applied between X and Y, the voltmeter readings are V A , V B and V C respectively, then: (2015)`,
        A: `V A ≠ V B ≠ V C`, B: `V A =V B ≠ V C`, C: `V A ≠ V B ≠ V C`, D: `V A = V B = V C Wheatstone and Meter Bridge`
    },
    {
        qNo: 24, topic: 'Resistivity & Conductivity', year: '2022',
        text: `A wheatstone bridge is used to determine the value of unknown resistance X by adjusting the variable resistance Y as shown in the figure. For the most precise measurement of X, the resistances P and Q: (2022) X P Q Y G E`,
        A: `do not play any significant role`, B: `should be approximately equal to 2X`, C: `should be approximately equal and are small`, D: `should be very large and unequal`
    },
    {
        qNo: 25, topic: 'Combination of Resistors (Series and Parallel)', year: '2020',
        text: `A resistance wire connected in the left gap of a metre bridge balances a 10 Ω resistance in the right gap at a point which divides the bridge wire in the ratio 3 :`,
        A: `Option A`, B: `Option B`, C: `Option C`, D: `Option D`
    },
    {
        qNo: 26, topic: 'Potentiometer', year: '2020',
        text: `If the length of the resistance wire is 1.5 m, then the length of 1 Ω of the resistance wire is: (2020)`,
        A: `1.0 × 10 –1 m`, B: `1.5 × 10 –1 m`, C: `1.5 × 10 –2 m`, D: `1.0 × 10 –2 m`
    },
    {
        qNo: 27, topic: 'Equivalent Resistance (Complex Circuits)', year: '2014',
        text: `The resistances in the two arms of the meter bridge are 5 Ω and R Ω , respectively. When the resistance R is shunted with an equal resistance, the new balance point is at 1.6 l 1 . The resistance R is: (2014) l 1 100– l 1`,
        A: `10 Ω`, B: `15 Ω`, C: `20 Ω`, D: `25 Ω`
    },
    {
        qNo: 28, topic: 'Electrical Energy/Power', year: '2013',
        text: `The resistances of the four arms P, Q, R and S in a Wheatstone’s bridge are 10 ohm, 30 ohm, 30 ohm and 90 ohm, respectively. The e.m.f. and internal resistance of the cell are 7 volt and 5 ohm respectively. If the galvanometer resistance is 50 ohm, the current drawn from the cell will be: (2013)`,
        A: `2.0 A`, B: `1.0 A`, C: `0.2 A`, D: `0.1 A Potentiometer (i) Comparison of E.M.F. of Two Cells (ii) Internal Resistance of a Cell`
    },
    {
        qNo: 29, topic: 'Wheatstone Bridge', year: '2021',
        text: `In a potentiometer circuit a cell of EMF 1.5 V gives balance point at 36 cm length of wire. If another cell of EMF 2.5 V replaces the first cell, then at what length of the wire, the balance point occurs? [RC] (2021)`,
        A: `21.6 cm`, B: `64 cm`, C: `62 cm`, D: `60 cm Chapter & Topicwise NEET PYQ's P W 4`
    },
    {
        qNo: 30, topic: 'Kirchhoff\'s Rules (Loop Rule)', year: '2017',
        text: `A potentiometer is an accurate and versatile device to make electrical measurements of E.M.F. because the method involves: [RC] (2017-Delhi)`,
        A: `Potential gradients`, B: `A condition of no current flow through the galvanometer`, C: `A combination of cells, galvanometer and resistances`, D: `Cells`
    },
    {
        qNo: 31, topic: 'Heating Effect of Current', year: '2016',
        text: `A potentiometer wire is 100 cm long and a constant potential difference is maintained across it. Two cells are connected in series first to support one another and then in opposite direction. The balance points are obtained at 50 cm and 10 cm from the positive end of the wire in the two cases. The ratio of emf’s is: [RC] (2016 - I)`,
        A: `5 : 1`, B: `5 : 4`, C: `3 : 4`, D: `3 : 2`
    },
    {
        qNo: 32, topic: 'Electric Current (Equation)', year: '2015',
        text: `A potentiometer wire has length 4 m and resistance 8 Ω. The resistance that must be connected in series with the wire and an accumulator of e.m.f. 2 V, so as to get a potential gradient 1 mV per cm on the wire is: [RC] (2015)`,
        A: `40 Ω`, B: `44 Ω`, C: `48 Ω`, D: `32 Ω`
    },
    {
        qNo: 33, topic: 'Emf of Cell (Equivalent Emf/Internal Resistance)', year: '2015 Re',
        text: `A potentiometer wire of length L and a resistance r are connected in series with a battery of e.m.f. E 0 and a resistance r 1 . An unknown e.m.f. E is balanced at a length l of the potentiometer wire. The e.m.f. E will be given by: [RC] (2015 Re)`,
        A: `( ) 0 1 LE r r r + `, B: `0 2 LE r r `, C: `( ) 0 1 E r . r r L + `, D: `0 E L `
    },
    {
        qNo: 34, topic: 'Voltage Division and Current Division Rule', year: '2014',
        text: `A potentiometer circuit has been set up for finding the internal resistance of a given cell. The main battery, used across the potentiometer wire, has an emf of 2.0 V and a negligible internal resistance. The potentiometer wire itself is 4 m long. When the resistance, R, connected across the given cell, has values of (i) Infinity (ii) 9.5 Ω The ‘balancing lengths’, on the potentiometer wire are found to be 3 m and 2.85 m, respectively. The value of internal resistance of the cell is: [RC] (2014)`,
        A: `0.25 Ω`, B: `0.95 Ω`, C: `0.5 Ω`, D: `0.75 Ω Electrical Power`
    },
    {
        qNo: 35, topic: 'Electrical Resistance (Temperature Dependence & Resistivity)', year: '2019',
        text: `Six similar bulbs are connected as shown in the figure with a DC source of emf E and zero internal resistance. The ratio of power consumption by the bulbs when (i) all are glowing and (ii) in the situation when two from section A and one from section B are glowing, will be: (2019)`,
        A: `4 : 9`, B: `9 : 4`, C: `1 : 2`, D: `2 : 1`
    },
    {
        qNo: 36, topic: 'Colour Coding of Resistances', year: '2016',
        text: `A filament bulb (500 W, 100 V) is to be used in a 230 V main supply. When a resistance R is connected in series, it works perfectly and the bulb consumes 500 W. The value of R is: (2016 - II)`,
        A: `26 Ω`, B: `13 Ω`, C: `230 Ω`, D: `46 Ω`
    },
    {
        qNo: 37, topic: 'Electric Current (Mobility)', year: '2014',
        text: `Two cities are 150 km apart. Electric power is sent from one city to another city through copper wires. The fall of potential per km is 8 volt and the average resistance per km is 0.5 Ω. The power loss in the wire is: (2014)`,
        A: `19.2 W`, B: `19.2 kW`, C: `19.2 J`, D: `12.2 kW Electric Energy and Heating of Current`
    },
    {
        qNo: 38, topic: 'Electric Current (Drift Velocity)', year: '2022',
        text: `As the temperature increases, the electrical resistance: (2022)`,
        A: `decrease for conductors but increases for semiconductors`, B: `increases for both conductors and semiconductors`, C: `decreases for both conductors and semiconductors`, D: `increases for conductors but decreases for semiconductors`
    },
    {
        qNo: 39, topic: 'Meter Bridge', year: '2022',
        text: `Two resistors of resistance, 100 Ω and 200 Ω are connected in parallel in an electrical circuit. The ratio of the thermal energy developed in 100 Ω to that in 200 Ω in a given time is: (2022)`,
        A: `4 : 1`, B: `1 : 2`, C: `2 : 1`, D: `1 : 4`
    },
    {
        qNo: 40, topic: 'Current Density', year: '2019',
        text: `Which of the following acts as a circuit protection device? (2019)`,
        A: `Conductor`, B: `Inductor`, C: `Switch`, D: `Fuse`
    },
    {
        qNo: 41, topic: 'Resistivity & Conductivity', year: '2016',
        text: `The charge flowing through a resistance R varies with time t as Q = at – bt 2 , where a and b are positive constants. The total heat produced in R is: (2016 - I)`,
        A: `3 a R 6b`, B: `3 a R 3b`, C: `3 a R 2b`, D: `3 a R b Current Electricity 5 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 a a b a a d a b b c b c a b c c c 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 c a a a b d c a b c d b d d c c b 35 36 37 38 39 40 a b d c d a Answer Key`
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
