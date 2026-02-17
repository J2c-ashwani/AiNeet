
import { getDb } from './lib/db.js';

const db = getDb();

console.log('Running migration v7: AI Battle Arena...');

try {
    // Add battle_elo column to users
    try {
        db.prepare('ALTER TABLE users ADD COLUMN battle_elo INTEGER DEFAULT 1000').run();
        console.log('Added battle_elo column to users.');
    } catch (e) {
        if (!e.message.includes('duplicate column')) console.log(e.message);
    }

    // Create battles table
    db.exec(`
        CREATE TABLE IF NOT EXISTS battles (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            opponent_id TEXT NOT NULL,
            user_score INTEGER DEFAULT 0,
            opponent_score INTEGER DEFAULT 0,
            outcome TEXT CHECK(outcome IN ('win', 'loss', 'draw')),
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);
    console.log('Created battles table.');

    console.log('Migration v7 completed successfully.');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
