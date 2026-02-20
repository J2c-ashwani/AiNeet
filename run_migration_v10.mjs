
import { getDb } from './lib/db.js';

const db = getDb();

console.log('Running migration v10: AI Verification Fields...');

try {
    const columns = [
        { name: 'confidence_score', type: 'INTEGER DEFAULT 0' },
        { name: 'verification_status', type: "TEXT DEFAULT 'pending'" }, // verified, flagged, rejected
        { name: 'verified_answer', type: 'TEXT' }
    ];

    columns.forEach(col => {
        try {
            db.prepare(`ALTER TABLE questions ADD COLUMN ${col.name} ${col.type}`).run();
            console.log(`Added ${col.name} column.`);
        } catch (e) {
            if (!e.message.includes('duplicate column')) console.log(e.message);
        }
    });

    console.log('Migration v10 completed successfully.');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
