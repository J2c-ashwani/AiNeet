
const { getDb } = require('../lib/db');
// We need to allow require from parent directory context if running via node
// But lib/db might use ES modules or specific paths. 
// Let's rely on standard better-sqlite3 for this standalone script to be safe and simple.
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../neet-coach.db');
const db = new Database(DB_PATH);

console.log('🚀 Running Schema Update V3 (Monetization)...');

try {
    // 1. Add columns to users table
    try {
        db.prepare("ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK(subscription_tier IN ('free', 'pro'))").run();
        console.log('✅ Added subscription_tier to users');
    } catch (e) {
        if (e.message.includes('duplicate column')) console.log('ℹ️  subscription_tier already exists');
        else console.error('❌ Error adding subscription_tier:', e.message);
    }

    try {
        db.prepare("ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'active' CHECK(subscription_status IN ('active', 'expired', 'cancelled'))").run();
        console.log('✅ Added subscription_status to users');
    } catch (e) {
        if (e.message.includes('duplicate column')) console.log('ℹ️  subscription_status already exists');
        else console.error('❌ Error adding subscription_status:', e.message);
    }

    try {
        db.prepare("ALTER TABLE users ADD COLUMN subscription_expiry TEXT").run();
        console.log('✅ Added subscription_expiry to users');
    } catch (e) {
        if (e.message.includes('duplicate column')) console.log('ℹ️  subscription_expiry already exists');
        else console.error('❌ Error adding subscription_expiry:', e.message);
    }

    // 2. Create payments table
    db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'INR',
        status TEXT DEFAULT 'pending', -- pending, completed, failed
        provider_payment_id TEXT,
        provider_order_id TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    `);
    console.log('✅ Created payments table');

    console.log('🎉 Schema Update Complete!');

} catch (error) {
    console.error('Schema Update Failed:', error);
} finally {
    db.close();
}
