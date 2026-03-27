import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables before getting the DB
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });

import { getDb } from './lib/db.js';
import { NEET_BLUEPRINT } from './lib/ncert-data.js';

const db = getDb();
const chemistryBlueprint = NEET_BLUEPRINT.chemistry || {};

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/chemistry_pyqs_extracted.json'), 'utf8'));
const chemistryPyqs = data.CHEMISTRY_EXTRA || [];

// Map the extracted chapter names exactly to the official NCERT Blueprint names
const nameMapping = {
    'Alcohols, Phenols and Ethers': 'Alcohols, Phenols & Ethers',
    'Atomic Structure': 'Structure of Atom',
    'Chemical Bonding and Molecular Structure': 'Chemical Bonding',
    'Classification of Elements and Periodicity in Properties': 'Classification of Elements',
    'Haloalkanes and Haloarenes': 'Haloalkanes & Haloarenes',
    'Organic Chemistry - Some basic Principles and Techniques': 'Organic Chemistry Basics',
    'The p-Block Elements': 'p-Block Elements (12)', // Safest generalized p-Block container
    'd- and f- Block Elements': 'd- and f-Block Elements',
    'Aldehydes, Ketones and Carboxylic Acids': 'Aldehydes, Ketones & Carboxylic Acids'
};

async function fixAndSeed() {
    console.log("Starting DB Cleanup to remove loosely-named duplicate chapters...");

    // 1. Clear out the loosely named ones
    const subjectRow = await db.get('SELECT id FROM subjects WHERE name = ?', ['Chemistry']);
    if (!subjectRow) {
        console.error("Subject 'Chemistry' not found!");
        return;
    }
    const subjectId = subjectRow.id;

    await db.run('DELETE FROM questions WHERE subject_id = ? AND is_pyq = 1', [subjectId]);
    console.log("Cleared existing Chemistry PYQs to begin exact re-mapping...");

    // 2. Delete the specific incorrect duplicate chapters 
    const wrongNames = Object.keys(nameMapping);
    for (const wrongName of wrongNames) {
        const chap = await db.get('SELECT id FROM chapters WHERE name = ? AND subject_id = ?', [wrongName, subjectId]);
        if (chap) {
            // Aggressively delete ALL questions associated with this bad chapter to satisfy Foreign Key constraints
            await db.run('DELETE FROM questions WHERE chapter_id = ?', [chap.id]);
            await db.run('DELETE FROM topics WHERE chapter_id = ?', [chap.id]);
            await db.run('DELETE FROM chapters WHERE id = ?', [chap.id]);
            console.log(`Removed duplicate loosely named chapter: ${wrongName}`);
        }
    }

    // 3. Distribute precisely into the blueprint
    console.log("\nStarting perfectly mapped seeding to official NCERT Blueprint...");

    const grouped = {};
    for (const q of chemistryPyqs) {
        let mappedChapter = nameMapping[q.chapter] || q.chapter;
        if (!grouped[mappedChapter]) {
            grouped[mappedChapter] = [];
        }
        grouped[mappedChapter].push(q);
    }

    let totalAdded = 0;

    for (const [chapter, questions] of Object.entries(grouped)) {
        const topicsMap = chemistryBlueprint[chapter] || { 'General': {} };
        const topicsList = Object.keys(topicsMap);

        let chapterRow = await db.get('SELECT id FROM chapters WHERE subject_id = ? AND name = ?', [subjectId, chapter]);
        if (!chapterRow) {
            const info = await db.run('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES (?, ?, 11, 0) RETURNING id', [subjectId, chapter]);
            chapterRow = { id: info.lastInsertRowid };
        }
        const chapterId = chapterRow.id;

        const topicIdMap = {};
        for (const topicName of topicsList) {
            let tRow = await db.get('SELECT id FROM topics WHERE chapter_id = ? AND name = ?', [chapterId, topicName]);
            if (!tRow) {
                const info = await db.run('INSERT INTO topics (chapter_id, name) VALUES (?, ?) RETURNING id', [chapterId, topicName]);
                tRow = { id: info.lastInsertRowid };
            }
            topicIdMap[topicName] = tRow.id;
        }

        // Add questions safely
        let added = 0;
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const assignedTopic = topicsList[i % topicsList.length] || 'General';

            if (!topicIdMap[assignedTopic]) {
                let tRow = await db.get('SELECT id FROM topics WHERE chapter_id = ? AND name = ?', [chapterId, assignedTopic]);
                if (!tRow) {
                    const info = await db.run('INSERT INTO topics (chapter_id, name) VALUES (?, ?) RETURNING id', [chapterId, assignedTopic]);
                    tRow = { id: info.lastInsertRowid };
                }
                topicIdMap[assignedTopic] = tRow.id;
            }

            const topicId = topicIdMap[assignedTopic];

            const correctOption = q.correct || 'A';
            const yearAsked = q.year_asked || '2020';
            const examName = parseInt(yearAsked) < 2013 ? 'AIPMT' : 'NEET';

            const existing = await db.get('SELECT id FROM questions WHERE chapter_id = ? AND text = ?', [chapterId, q.text]);
            if (!existing) {
                const params = [
                    subjectId, chapterId, topicId, q.text,
                    q.options[0], q.options[1], q.options[2], q.options[3],
                    correctOption, 'neet', 'Chemistry PYQ', yearAsked, examName
                ];
                await db.run(`
                    INSERT INTO questions (
                        subject_id, chapter_id, topic_id, text,
                        option_a, option_b, option_c, option_d,
                        correct_option, difficulty, explanation,
                        year_asked, is_pyq, exam_name
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
                `, params);
                added++;
                totalAdded++;
            }
        }
        console.log(`✅ Seeded ${added} questions properly into '${chapter}'`);
    }

    console.log(`\n🎉 FINISHED! Total Questions successfully mapped & seeded: ${totalAdded}`);
}

fixAndSeed().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
