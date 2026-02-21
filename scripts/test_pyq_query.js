const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'neet-coach.db');
const db = new Database(dbPath);

const chapter_name = 'Laws of Motion';
const cleanName = chapter_name.replace(/[^a-zA-Z0-9 ]/g, '');
const words = cleanName.split(' ').slice(0, 2).join('%');

const matchedChapter = db.prepare('SELECT id FROM chapters WHERE name LIKE ?').get(`%${words}%`);

console.log('Matched Chapter:', matchedChapter);

if (matchedChapter) {
    const questions = db.prepare('SELECT COUNT(*) as c FROM questions WHERE is_pyq = 1 AND chapter_id = ?').get(matchedChapter.id);
    console.log('Questions found for this chapter ID:', questions.c);
}
