
import { getDb } from './lib/db.js';
import { PHYSICS_PYQ, CHEMISTRY_PYQ, BIOLOGY_PYQ } from './data/questions-pyq.js';

const db = getDb();

function getSubjectId(name) {
    let stmt = db.prepare('SELECT id FROM subjects WHERE name = ?');
    let row = stmt.get(name);
    if (!row) {
        // Map common variations if needed, or insert
        if (name === 'Physics') return 1;
        if (name === 'Chemistry') return 2;
        if (name === 'Biology') return 3;
        // Fallback insert
        const info = db.prepare('INSERT INTO subjects (name) VALUES (?)').run(name);
        return info.lastInsertRowid;
    }
    return row.id;
}

function getChapterId(subjectId, name) {
    let stmt = db.prepare('SELECT id FROM chapters WHERE subject_id = ? AND name = ?');
    let row = stmt.get(subjectId, name);
    if (!row) {
        const info = db.prepare('INSERT INTO chapters (subject_id, name) VALUES (?, ?)').run(subjectId, name);
        return info.lastInsertRowid;
    }
    return row.id;
}

function getTopicId(chapterId, name) {
    let stmt = db.prepare('SELECT id FROM topics WHERE chapter_id = ? AND name = ?');
    let row = stmt.get(chapterId, name);
    if (!row) {
        const info = db.prepare('INSERT INTO topics (chapter_id, name) VALUES (?, ?)').run(chapterId, name);
        return info.lastInsertRowid;
    }
    return row.id;
}

function seedPYQs(subjectName, questions) {
    console.log(`Seeding ${questions.length} PYQs for ${subjectName}...`);
    const subjectId = getSubjectId(subjectName);

    const insertStmt = db.prepare(`
        INSERT INTO questions (
            subject_id, chapter_id, topic_id, text, 
            option_a, option_b, option_c, option_d, 
            correct_option, difficulty, explanation, 
            year_asked, is_pyq, exam_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    let added = 0;
    for (const q of questions) {
        // Check duplicate by text
        const exists = db.prepare('SELECT id FROM questions WHERE text = ?').get(q.text);
        if (exists) continue;

        const chapterId = getChapterId(subjectId, q.chapter);
        const topicId = getTopicId(chapterId, q.topic);
        const examName = parseInt(q.year_asked) < 2013 ? 'AIPMT' : 'NEET';

        insertStmt.run(
            subjectId, chapterId, topicId, q.text,
            q.options[0], q.options[1], q.options[2], q.options[3],
            q.correct, q.difficulty, q.explanation,
            q.year_asked, examName
        );
        added++;
    }
    console.log(`Added ${added} new PYQs for ${subjectName}.`);
}

try {
    seedPYQs('Physics', PHYSICS_PYQ);
    seedPYQs('Chemistry', CHEMISTRY_PYQ);
    seedPYQs('Biology', BIOLOGY_PYQ);
    console.log('PYQ Seeding Completed.');
} catch (error) {
    console.error('Seeding failed:', error);
}
