
import { getDb } from './lib/db.js';

const db = getDb();

console.log('Running migration v5: Adding PYQ columns...');

try {
    // Add is_pyq column
    try {
        db.prepare('ALTER TABLE questions ADD COLUMN is_pyq INTEGER DEFAULT 0').run();
        console.log('Added is_pyq column.');
    } catch (e) {
        if (!e.message.includes('duplicate column')) throw e;
        console.log('is_pyq column already exists.');
    }

    // Add exam_name column
    try {
        db.prepare('ALTER TABLE questions ADD COLUMN exam_name TEXT').run();
        console.log('Added exam_name column.');
    } catch (e) {
        if (!e.message.includes('duplicate column')) throw e;
        console.log('exam_name column already exists.');
    }

    // Update existing PYQs (if any) based on year_asked being present
    const result = db.prepare(`
        UPDATE questions 
        SET is_pyq = 1, 
            exam_name = CASE 
                WHEN CAST(year_asked AS INTEGER) < 2013 THEN 'AIPMT' 
                ELSE 'NEET' 
            END
        WHERE year_asked IS NOT NULL AND is_pyq = 0
    `).run();

    console.log(`Updated ${result.changes} existing questions as PYQs.`);

    console.log('Migration v5 completed successfully.');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
