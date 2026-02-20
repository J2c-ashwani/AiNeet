import { getDb } from './lib/db.js';

async function verifyDb() {
    const db = getDb();
    console.log("Adding referral fields to users table...");

    try {
        await db.exec(`
            ALTER TABLE users ADD COLUMN referral_code TEXT;
            ALTER TABLE users ADD COLUMN referred_by TEXT;
            ALTER TABLE users ADD COLUMN referrals_count INTEGER DEFAULT 0;
        `);
        console.log("Successfully added referral columns to 'users'.");
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log("Columns already exist, skipping.");
        } else {
            console.error("Migration failed:", e);
        }
    } finally {
        await db.close();
    }
}

verifyDb();
