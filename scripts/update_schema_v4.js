
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../neet-coach.db');
const db = new Database(DB_PATH);

console.log('🚀 Running Schema Update V4 (Usage & Cache)...');

try {
    // 1. Create user_usage table
    db.exec(`
    CREATE TABLE IF NOT EXISTS user_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        month TEXT NOT NULL, -- Format: 'YYYY-MM'
        ai_test_count INTEGER DEFAULT 0,
        ai_doubt_count INTEGER DEFAULT 0,
        ncert_explain_count INTEGER DEFAULT 0,
        ai_tokens_used INTEGER DEFAULT 0,
        last_reset_date TEXT DEFAULT (datetime('now')),
        UNIQUE(user_id, month),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    `);
    console.log('✅ Created user_usage table');

    // 2. Create ai_response_cache table
    db.exec(`
    CREATE TABLE IF NOT EXISTS ai_response_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_hash TEXT UNIQUE NOT NULL,
        response TEXT NOT NULL,
        confidence_score INTEGER,
        created_at TEXT DEFAULT (datetime('now')),
        expires_at TEXT
    );
    `);
    console.log('✅ Created ai_response_cache table');

    // 3. Update users table if needed (we already have subscription fields, but let's ensure plan_type is robust)
    // Note: SQLite doesn't strictly enforce ENUMs in the way Postgres does, so 'subscription_tier' can store 'premium' even if check said 'free','pro'.
    // efficiently we can just use the existing subscription_tier column for 'free', 'pro', 'premium'.

    console.log('🎉 Schema Update V4 Complete!');

} catch (error) {
    console.error('Schema Update Failed:', error);
} finally {
    db.close();
}
