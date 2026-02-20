
import { getDb } from './lib/db.js';

const db = getDb();

console.log('Running migration v9: AI Generation Fields...');

try {
    // Add columns to questions table
    try {
        db.prepare("ALTER TABLE questions ADD COLUMN is_ai_generated INTEGER DEFAULT 0").run();
        console.log('Added is_ai_generated column.');
    } catch (e) {
        if (!e.message.includes('duplicate column')) console.log(e.message);
    }

    try {
        db.prepare("ALTER TABLE questions ADD COLUMN source_context TEXT").run();
        console.log('Added source_context column.');
    } catch (e) {
        if (!e.message.includes('duplicate column')) console.log(e.message);
    }

    console.log('Migration v9 completed successfully.');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
