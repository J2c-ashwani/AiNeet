import { getDb } from './lib/db.js';
import fs from 'fs';

const db = getDb();

async function getSubjectId(name) {
    let row = await db.get('SELECT id FROM subjects WHERE name = ?', [name]);
    if (!row) {
        if (name === 'Physics') return 1;
        if (name === 'Chemistry') return 2;
        if (name === 'Biology') return 3;
        const info = await db.run('INSERT INTO subjects (name) VALUES (?) RETURNING id', [name]);
        return info.lastInsertRowid;
    }
    return row.id;
}

async function getChapterId(subjectId, name) {
    let row = await db.get('SELECT id FROM chapters WHERE subject_id = ? AND name = ?', [subjectId, name]);
    if (!row) {
        const info = await db.run('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES (?, ?, 11, 0) RETURNING id', [subjectId, name]);
        return info.lastInsertRowid;
    }
    return row.id;
}

async function getTopicId(chapterId, name) {
    let row = await db.get('SELECT id FROM topics WHERE chapter_id = ? AND name = ?', [chapterId, name]);
    if (!row) {
        const info = await db.run('INSERT INTO topics (chapter_id, name) VALUES (?, ?) RETURNING id', [chapterId, name]);
        return info.lastInsertRowid;
    }
    return row.id;
}

async function seedPYQs(subjectName, questions) {
    console.log(`Seeding ${questions.length} authentic PYQs for ${subjectName}...`);
    const subjectId = await getSubjectId(subjectName);

    let added = 0;
    for (const q of questions) {
        const chapterId = await getChapterId(subjectId, q.chapter);
        const topicId = await getTopicId(chapterId, q.topic);
        const yearAsked = q.year_asked || '2020';
        const examName = parseInt(yearAsked) < 2013 ? 'AIPMT' : 'NEET';

        const exists = await db.get('SELECT id FROM questions WHERE text = ?', [q.text]);
        if (exists) {
            // we deleted mocks earlier, so any exists are unexpected duplicates
            continue;
        }

        await db.run(`
            INSERT INTO questions (
                subject_id, chapter_id, topic_id, text, 
                option_a, option_b, option_c, option_d, 
                correct_option, difficulty, explanation, 
                year_asked, is_pyq, exam_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        `, [
            subjectId, chapterId, topicId, q.text,
            q.options[0], q.options[1], q.options[2], q.options[3],
            q.correct, q.difficulty, q.explanation,
            yearAsked, examName
        ]);
        added++;
    }
    console.log(`Successfully added ${added} new authentic PYQs for ${subjectName}.`);
}

async function main() {
    try {
        const data = JSON.parse(fs.readFileSync('data/physics_pyqs_extracted.json', 'utf8'));
        const physicsPyqs = data.PHYSICS_EXTRA || [];

        await seedPYQs('Physics', physicsPyqs);

        console.log('Authentic PYQ Seeding Completed.');
    } catch (error) {
        console.error('Seeding failed:', error);
    }
}

main();
