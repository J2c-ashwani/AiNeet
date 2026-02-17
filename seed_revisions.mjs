
import { getDb } from './lib/db.js';

const db = getDb();
console.log('--- Seeding Revision Schedule ---');

const TEST_USER_ID = 'user_1'; // Default user

// Ensure user exists
db.prepare(`INSERT OR IGNORE INTO users (id, name, email, password_hash) VALUES (?, 'Test User', 'test@example.com', 'hash')`).run(TEST_USER_ID);

// 1. Get 5 random questions
const questions = db.prepare('SELECT id FROM questions ORDER BY RANDOM() LIMIT 5').all();

if (questions.length === 0) {
    console.error('❌ No questions found. Run npm run seed first.');
    process.exit(1);
}

// 2. Schedule them as 'due' (yesterday)
const dueTime = new Date();
dueTime.setDate(dueTime.getDate() - 1); // Yesterday

const insert = db.prepare(`
    INSERT OR REPLACE INTO revision_schedule 
    (user_id, question_id, easiness_factor, interval, repetitions, next_review_at, last_reviewed_at)
    VALUES (?, ?, 2.5, 1, 1, ?, datetime('now', '-2 days'))
`);

questions.forEach(q => {
    insert.run(TEST_USER_ID, q.id, dueTime.toISOString());
    console.log(`Scheduled Question ${q.id} for revision.`);
});

console.log('✅ Seeding complete.');
