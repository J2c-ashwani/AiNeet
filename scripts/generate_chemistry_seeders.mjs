import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NEET_BLUEPRINT } from '../lib/ncert-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const chemistryBlueprint = NEET_BLUEPRINT.chemistry || {};

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/chemistry_pyqs_extracted.json'), 'utf8'));
const chemistryPyqs = data.CHEMISTRY_EXTRA || [];

const grouped = {};
for (const q of chemistryPyqs) {
    if (!grouped[q.chapter]) {
        grouped[q.chapter] = [];
    }
    grouped[q.chapter].push(q);
}

const outDir = path.join(__dirname, '../scripts');

for (const [chapter, questions] of Object.entries(grouped)) {
    const topicsMap = chemistryBlueprint[chapter] || { 'General': {} };
    const topicsList = Object.keys(topicsMap);

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

// Load environment variables before getting the DB
dotenv.config({ path: path.join(__dirname, '../.env') });
// We also try .env.local just in case
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { getDb } from '../lib/db.js';

const db = getDb();

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
        let subjectRow = await db.get('SELECT id FROM subjects WHERE name = ?', [SUBJECT_NAME]);
        if (!subjectRow) {
            console.log(\`Inserting Subject: \${SUBJECT_NAME}\`);
            const info = await db.run('INSERT INTO subjects (name) VALUES (?) RETURNING id', [SUBJECT_NAME]);
            subjectRow = { id: info.lastInsertRowid };
        }
        const subjectId = subjectRow.id;

        let chapterRow = await db.get('SELECT id FROM chapters WHERE subject_id = ? AND name = ?', [subjectId, CHAPTER_NAME]);
        if (!chapterRow) {
            console.log(\`Inserting Chapter: \${CHAPTER_NAME}\`);
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

            await db.run(\`
                INSERT INTO questions (
                    subject_id, chapter_id, topic_id, text,
                    option_a, option_b, option_c, option_d,
                    correct_option, difficulty, explanation,
                    year_asked, is_pyq, exam_name
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
            \`, [
                subjectId, chapterId, topicId, q.text,
                q.A, q.B, q.C, q.D,
                correctOption, 'neet', 'Chemistry PYQ', q.year, examName
            ]);
            added++;
        }
        
        console.log(\`✅ Done! Added \${added} questions (Skipped \${skipped})\`);
    } catch (e) {
        console.error('Failed to seed:', e);
    }
}

seed();
`;

    fs.writeFileSync(path.join(outDir, filename), scriptContent);
    console.log(`Generated: ${filename}`);
}

console.log('All Chemistry seeder scripts generated successfully.');
