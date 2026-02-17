
import { getDb } from './lib/db.js';

const db = getDb();

console.log('Running migration v6: Question Quality Control...');

try {
    // Add columns to questions table
    try {
        db.prepare('ALTER TABLE questions ADD COLUMN flag_count INTEGER DEFAULT 0').run();
        console.log('Added flag_count column.');
    } catch (e) {
        if (!e.message.includes('duplicate column')) console.log(e.message);
    }

    try {
        db.prepare('ALTER TABLE questions ADD COLUMN quality_score REAL DEFAULT 1.0').run();
        console.log('Added quality_score column.');
    } catch (e) {
        if (!e.message.includes('duplicate column')) console.log(e.message);
    }

    // Create question_reports table
    db.exec(`
        CREATE TABLE IF NOT EXISTS question_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            question_id INTEGER NOT NULL,
            reason TEXT NOT NULL CHECK(reason IN ('error', 'ambiguous', 'syllabus', 'other')),
            comment TEXT,
            status TEXT DEFAULT 'open' CHECK(status IN ('open', 'reviewed', 'resolved', 'ignored')),
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (question_id) REFERENCES questions(id)
        );
    `);
    console.log('Created question_reports table.');

    console.log('Migration v6 completed successfully.');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
