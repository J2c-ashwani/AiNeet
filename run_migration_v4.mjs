
import { getDb } from './lib/db.js';

function up() {
    console.log('Running v4 migration: Spaced Repetition Tables');
    const db = getDb();

    // 1. Revision Schedule Table
    // Tracks SM-2 parameters for each question per user
    db.prepare(`
        CREATE TABLE IF NOT EXISTS revision_schedule (
            user_id TEXT,
            question_id INTEGER,
            easiness_factor REAL DEFAULT 2.5,
            interval INTEGER DEFAULT 0, -- in days
            repetitions INTEGER DEFAULT 0,
            next_review_at DATETIME,
            last_reviewed_at DATETIME,
            PRIMARY KEY (user_id, question_id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (question_id) REFERENCES questions(id)
        )
    `).run();

    console.log('v4 migration completed');
}

up();
