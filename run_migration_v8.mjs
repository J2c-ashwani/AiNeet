
import { getDb } from './lib/db.js';

const db = getDb();

console.log('Running migration v8: Admin Role...');

try {
    // Add role column to users
    try {
        db.prepare("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student' CHECK(role IN ('student', 'admin'))").run();
        console.log('Added role column to users.');
    } catch (e) {
        if (!e.message.includes('duplicate column')) console.log(e.message);
    }

    console.log('Migration v8 completed successfully.');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
