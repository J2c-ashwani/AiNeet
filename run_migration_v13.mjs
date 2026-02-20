import { getDb } from './lib/db.js';

async function migrate() {
    const db = getDb();
    console.log("Creating battleground tables...");

    try {
        await db.exec(`
            CREATE TABLE IF NOT EXISTS battlegrounds (
                id TEXT PRIMARY KEY,
                creator_id TEXT NOT NULL,
                invite_code TEXT UNIQUE NOT NULL,
                status TEXT DEFAULT 'waiting',
                questions_json TEXT NOT NULL,
                question_count INTEGER DEFAULT 20,
                time_limit_seconds INTEGER DEFAULT 1800,
                max_participants INTEGER DEFAULT 200,
                started_at DATETIME,
                ended_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (creator_id) REFERENCES users (id)
            );

            CREATE TABLE IF NOT EXISTS battleground_participants (
                id TEXT PRIMARY KEY,
                battleground_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                score INTEGER DEFAULT 0,
                correct_count INTEGER DEFAULT 0,
                incorrect_count INTEGER DEFAULT 0,
                time_spent_seconds INTEGER DEFAULT 0,
                submitted_at DATETIME,
                joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (battleground_id) REFERENCES battlegrounds (id),
                FOREIGN KEY (user_id) REFERENCES users (id),
                UNIQUE(battleground_id, user_id)
            );

            ALTER TABLE users ADD COLUMN battleground_creates_used INTEGER DEFAULT 0;
            ALTER TABLE users ADD COLUMN battleground_joins_used INTEGER DEFAULT 0;
        `);
        console.log("Successfully created battleground tables.");
    } catch (e) {
        if (e.message.includes('duplicate column name') || e.message.includes('already exists')) {
            console.log("Some columns/tables already exist, that's ok.");
        } else {
            console.error("Migration failed:", e);
        }
    } finally {
        await db.close();
    }
}

migrate();
