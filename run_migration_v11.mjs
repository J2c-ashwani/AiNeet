import { getDb } from './lib/db.js';

async function verifyDb() {
    const db = getDb();
    console.log("Adding challenges table to database...");

    try {
        await db.exec(`
            CREATE TABLE IF NOT EXISTS challenges (
                id TEXT PRIMARY KEY,
                creator_id TEXT NOT NULL,
                recipient_id TEXT,
                status TEXT DEFAULT 'pending',
                questions_json TEXT NOT NULL,
                creator_score INTEGER DEFAULT 0,
                recipient_score INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (creator_id) REFERENCES users (id),
                FOREIGN KEY (recipient_id) REFERENCES users (id)
            );
        `);
        console.log("Successfully created 'challenges' table.");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await db.close();
    }
}

verifyDb();
