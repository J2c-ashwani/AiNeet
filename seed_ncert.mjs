
import { getDb } from './lib/db.js';

const db = getDb();
console.log('--- Seeding NCERT Books ---');

// 1. Find 'Physical World' Chapter (Physics)
const chapter = db.prepare("SELECT id, subject_id FROM chapters WHERE name LIKE 'Physical World%'").get();

if (!chapter) {
    console.error('❌ Chapter "Physical World" not found! Run npm run seed first.');
    process.exit(1);
}

console.log(`Found Chapter: Physical World (ID: ${chapter.id}, Subject: ${chapter.subject_id})`);

// 2. Insert Book
const BOOK_ID = 'ncert-phy-11-ch1';
db.prepare(`
    INSERT OR REPLACE INTO ncert_books 
    (id, subject_id, chapter_id, title, file_path, processed_text)
    VALUES (?, ?, ?, ?, ?, ?)
`).run(
    BOOK_ID,
    chapter.subject_id,
    chapter.id,
    'Physical World (NCERT Class 11)',
    '/books/sample.pdf',
    'Sample text content for Physical World chapter...'
);

console.log(`✅ Book seeded: ${BOOK_ID}`);
