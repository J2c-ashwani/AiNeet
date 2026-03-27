import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });

import fs from 'fs';

console.log("=== DIAGNOSTIC: Where is Chemistry data? ===\n");

// Check 1: Is DATABASE_URL set?
const hasDBUrl = !!process.env.DATABASE_URL;
console.log(`1. DATABASE_URL present: ${hasDBUrl}`);
if (hasDBUrl) {
    // Show just the host part (not password)
    const url = process.env.DATABASE_URL;
    const lastAt = url.lastIndexOf('@');
    console.log(`   Host: ${url.substring(lastAt + 1).split('/')[0]}`);
}

// Check 2: Does local SQLite exist?
const sqlitePath = path.join(__dirname, 'neet-coach.db');
const sqliteExists = fs.existsSync(sqlitePath);
console.log(`\n2. Local neet-coach.db exists: ${sqliteExists}`);
if (sqliteExists) {
    const stats = fs.statSync(sqlitePath);
    console.log(`   Size: ${(stats.size / 1024).toFixed(1)} KB`);
    console.log(`   Last modified: ${stats.mtime.toISOString()}`);
}

// Check 3: lib/db.js would use which DB?
console.log(`\n3. lib/db.js would use: ${hasDBUrl ? '🟢 SUPABASE (PostgreSQL)' : '🔴 LOCAL SQLite'}`);

// Check 4: If PostgreSQL, try to count Chemistry PYQs
if (hasDBUrl) {
    import('pg').then(async (pg) => {
        const pool = new pg.default.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
        try {
            const { rows: [result] } = await pool.query("SELECT COUNT(*) as cnt FROM questions WHERE subject_id = (SELECT id FROM subjects WHERE name = 'Chemistry') AND is_pyq = 1");
            console.log(`\n4. Chemistry PYQs in SUPABASE: ${result.cnt}`);

            const { rows: chapters } = await pool.query("SELECT c.name, c.class_level, COUNT(q.id) as cnt FROM chapters c LEFT JOIN questions q ON q.chapter_id = c.id AND q.is_pyq = 1 WHERE c.subject_id = (SELECT id FROM subjects WHERE name = 'Chemistry') GROUP BY c.id, c.name, c.class_level ORDER BY c.class_level, c.name");
            console.log(`\n   Chemistry chapters in Supabase:`);
            for (const ch of chapters) {
                console.log(`   [Class ${ch.class_level}] "${ch.name}" — ${ch.cnt} PYQs`);
            }
        } catch (e) {
            console.log(`\n4. Error querying Supabase: ${e.message}`);
        }
        await pool.end();
    });
}

// Check 5: If SQLite exists, count Chemistry PYQs there
if (sqliteExists) {
    import('better-sqlite3').then((mod) => {
        const Database = mod.default;
        const db = new Database(sqlitePath, { readonly: true });
        try {
            const result = db.prepare("SELECT COUNT(*) as cnt FROM questions WHERE subject_id = (SELECT id FROM subjects WHERE name = 'Chemistry') AND is_pyq = 1").get();
            console.log(`\n5. Chemistry PYQs in LOCAL SQLite: ${result.cnt}`);
        } catch (e) {
            console.log(`\n5. Error querying SQLite: ${e.message}`);
        }
        db.close();
    });
}
