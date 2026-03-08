/**
 * Generate per-chapter Chemistry seeder scripts from extracted JSON
 * Usage: node scripts/generate_chemistry_seeders.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/chemistry_pyqs_extracted.json'), 'utf8'));
const chemistryPyqs = data.CHEMISTRY_EXTRA || [];

// Group questions by chapter
const grouped = {};
for (const q of chemistryPyqs) {
    if (!grouped[q.chapter]) {
        grouped[q.chapter] = [];
    }
    grouped[q.chapter].push(q);
}

// Define topics per chapter based on the chemistry_extracted.txt analysis
const CHAPTER_TOPICS = {
    'Some Basic Concepts of Chemistry': ['Atoms and Molecules', 'Empirical And Molecular Formula', 'Concentration Terms & Application', 'Stoichiometry And Stoichiometric Calculations', 'Mole Concept', "Dalton's Atomic Theory"],
    'Redox Reactions': ['Oxidation Number', 'Types of Redox Reaction', 'Balancing of Redox Reaction'],
    'Solutions': ['Colligative Properties', 'Ideal And Non-Ideal Solutions', 'Vapour Pressure of Liquid Solutions', 'Solubility'],
    'Thermodynamics': ['Thermodynamic Processes', 'Spontaneity and Entropy', 'Enthalpy Change', 'Pressure-Volume Work', 'Gibbs Energy Change'],
    'Equilibrium': ['Solubility And Solubility Product', 'Equilibrium Constant', 'Acids and Bases', 'pH Calculation', "Le Chatelier's Principle"],
    'Electrochemistry': ['Electrolysis', "Faraday's Laws", "Kohlrausch's Law", 'Conductance and Conductivity', 'Nernst Equation', 'Electrochemical Series'],
    'Chemical Kinetics': ['Activation Energy', 'Integrated Rate Equations', 'Rate Constant', 'Order of Reaction', 'Temperature Dependence of Reaction Rate'],
    'Atomic Structure': ["Bohr's Model For Hydrogen Atom", 'Quantum Mechanical Model', 'Atomic Terms and Quantum Numbers'],
    'Classification of Elements and Periodicity in Properties': ['Nomenclature of Elements', 'Periodic Properties', 'Electronic Configuration'],
    'Chemical Bonding and Molecular Structure': ['Bond Parameters', 'Dipole Moment', 'Kossel-Lewis Approach', 'VSEPR Theory', 'Hybridisation', 'Hydrogen Bonds', 'Molecular Orbital Theory'],
    'The p-Block Elements': ['Allotropes of Carbon', 'Group 13 and 14 Elements', 'Group 15 Elements', 'Group 16 Elements', 'Group 17 Elements', 'Group 18 Elements', 'Oxoacids of Sulphur'],
    'Coordination Compounds': ['Ligand Field Theory', 'Chelation and Denticity', 'Magnetism', 'Nomenclature', 'Isomerism', "Werner's Theory"],
    'd- and f- Block Elements': ['General Properties of Transition Elements', 'Inner Transition Elements', 'Chemical Properties', 'The Lanthanoids'],
    'Organic Chemistry - Some basic Principles and Techniques': ['Methods of Purification', 'Reaction Intermediate', 'Nomenclature of Organic Compounds', 'Isomerism', 'Qualitative Analysis'],
    'Hydrocarbons': ['Chemical Properties of Alkene', 'Preparation of Alkene', 'Preparation of Alkane', 'Aromatic Hydrocarbon', 'Conformations'],
    'Haloalkanes and Haloarenes': ['Chemical Properties', 'Nucleophilic Substitution Reactions', 'Preparation of Haloalkanes', 'Classification'],
    'Alcohols, Phenols and Ethers': ['Alcohols', 'Phenols', 'Ethers'],
    'Aldehydes, Ketones and Carboxylic Acids': ['Chemical Reactions of Aldehydes And Ketones', 'Methods of Preparation', 'Physical Properties', 'Carboxylic Acid'],
    'Amines': ['Chemical Reactions of Amines', 'Preparation of Amines', 'Diazonium Salts'],
    'Biomolecules': ['Disaccharides', 'Proteins', 'Vitamins', 'Enzymes', 'Nucleic Acids', 'Glucose', 'Monosaccharides'],
};

const outDir = path.join(__dirname, '../scripts');

for (const [chapter, questions] of Object.entries(grouped)) {
    const topicsList = CHAPTER_TOPICS[chapter] || ['General'];

    // Normalize filename
    const safeName = chapter.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const filename = `seed_pyq_chemistry_${safeName}.mjs`;

    let scriptContent = `/**
 * Seed REAL NEET PYQs — Chapter: ${chapter} (Chemistry)
 * Usage: node scripts/${filename}
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

const CHAPTER_NAME = '${chapter}';
const SUBJECT_NAME = 'Chemistry';
const CLASS_LEVEL = 11;

const TOPICS = [
    ${topicsList.map(t => `'${t.replace(/'/g, "\\'")}'`).join(',\n    ')}
];

const ANSWER_KEY = {
    ${questions.map((q, idx) => `${idx + 1}: '${q.correct}'`).join(', ')}
};

const QUESTIONS = [
`;

    questions.forEach((q, idx) => {
        const assignedTopic = topicsList[idx % topicsList.length] || 'General';

        scriptContent += `    {
        qNo: ${idx + 1}, topic: '${assignedTopic.replace(/'/g, "\\'")}', year: '${q.year_asked || '2020'}',
        text: \`${q.text.replace(/`/g, "\\`").trim()}\`,
        A: \`${q.options[0].replace(/`/g, "\\`").trim()}\`, B: \`${q.options[1].replace(/`/g, "\\`").trim()}\`, C: \`${q.options[2].replace(/`/g, "\\`").trim()}\`, D: \`${q.options[3].replace(/`/g, "\\`").trim()}\`
    },
`;
    });

    scriptContent += `];

async function seed() {
    console.log(\`Starting seeding for \${SUBJECT_NAME} - \${CHAPTER_NAME}...\`);
    try {
        // 1. Get Subject ID
        let subjectRows = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
        if (subjectRows.length === 0) {
            console.log(\`Inserting Subject: \${SUBJECT_NAME}\`);
            subjectRows = await query('INSERT INTO subjects (name) VALUES ($1) RETURNING id', [SUBJECT_NAME]);
        }
        const subjectId = subjectRows[0].id;

        // 2. Get Chapter ID
        let chapterRows = await query('SELECT id FROM chapters WHERE subject_id = $1 AND name = $2', [subjectId, CHAPTER_NAME]);
        if (chapterRows.length === 0) {
            console.log(\`Inserting Chapter: \${CHAPTER_NAME}\`);
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

            await query(\`
                INSERT INTO questions (
                    subject_id, chapter_id, topic_id, text,
                    option_a, option_b, option_c, option_d,
                    correct_option, difficulty, explanation,
                    year_asked, is_pyq, exam_name
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            \`, [
                subjectId, chapterId, topicId, q.text,
                q.A, q.B, q.C, q.D,
                correctOption, 'neet', 'Chemistry PYQ', q.year, 1, examName
            ]);
            added++;
        }
        
        console.log(\`✅ Done! Added \${added} questions (Skipped \${skipped})\`);
    } catch (e) {
        console.error('Failed to seed:', e);
    } finally {
        pool.end();
    }
}

seed();
`;

    fs.writeFileSync(path.join(outDir, filename), scriptContent);
    console.log(`Generated: ${filename} (${questions.length} questions)`);
}

console.log(`\nAll ${Object.keys(grouped).length} Chemistry seeder scripts generated successfully.`);
