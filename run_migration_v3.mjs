
import { getDb } from './lib/db.js';

function up() {
    console.log('Running v3 migration: NCERT Intelligence Tables');
    const db = getDb();

    // 1. NCERT Books Table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS ncert_books (
            id TEXT PRIMARY KEY, -- e.g. 'class-11-physics-ch1'
            subject_id INTEGER,
            chapter_id INTEGER,
            title TEXT,
            file_path TEXT, -- e.g. '/books/phy-11-ch1.pdf'
            processed_text TEXT, -- For full-text search / AI feeding
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // 2. User Highlights & AI Explanations
    db.prepare(`
        CREATE TABLE IF NOT EXISTS ncert_highlights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            book_id TEXT,
            selected_text TEXT,
            ai_explanation TEXT,
            linked_pyq_ids TEXT, -- JSON array of question IDs
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (book_id) REFERENCES ncert_books(id)
        )
    `).run();

    console.log('v3 migration completed');
}

up();
