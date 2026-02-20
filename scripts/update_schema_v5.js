
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../neet-coach.db');
const db = new Database(DB_PATH);

console.log('🚀 Running Schema Update V5 (Parent Connect)...');

try {
    // Add columns to users table
    try {
        db.prepare("ALTER TABLE users ADD COLUMN parent_email TEXT").run();
        console.log('✅ Added parent_email to users');
    } catch (e) {
        if (e.message.includes('duplicate column')) console.log('ℹ️  parent_email already exists');
        else console.error('❌ Error adding parent_email:', e.message);
    }

    try {
        db.prepare("ALTER TABLE users ADD COLUMN parent_phone TEXT").run();
        console.log('✅ Added parent_phone to users');
    } catch (e) {
        if (e.message.includes('duplicate column')) console.log('ℹ️  parent_phone already exists');
        else console.error('❌ Error adding parent_phone:', e.message);
    }

    console.log('🎉 Schema Update V5 Complete!');

} catch (error) {
    console.error('Schema Update Failed:', error);
} finally {
    db.close();
}
