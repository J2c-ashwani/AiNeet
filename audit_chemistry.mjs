import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });

import { getDb } from './lib/db.js';
const db = getDb();

async function audit() {
    const subject = await db.get('SELECT id FROM subjects WHERE name = ?', ['Chemistry']);
    if (!subject) { console.log("No Chemistry subject found!"); return; }

    console.log("=== ALL Chemistry Chapters in DB ===");
    const chapters = await db.all('SELECT id, name, class_level FROM chapters WHERE subject_id = ? ORDER BY class_level, name', [subject.id]);
    for (const c of chapters) {
        const total = await db.get('SELECT COUNT(*) as cnt FROM questions WHERE chapter_id = ?', [c.id]);
        const pyqs = await db.get('SELECT COUNT(*) as cnt FROM questions WHERE chapter_id = ? AND is_pyq = 1', [c.id]);
        const mocks = await db.get('SELECT COUNT(*) as cnt FROM questions WHERE chapter_id = ? AND (is_pyq = 0 OR is_pyq IS NULL)', [c.id]);
        console.log(`[Class ${c.class_level}] "${c.name}" — Total: ${total.cnt}, PYQs: ${pyqs.cnt}, Mocks: ${mocks.cnt}`);
    }

    console.log("\n=== Chapters with 0 total questions ===");
    for (const c of chapters) {
        const total = await db.get('SELECT COUNT(*) as cnt FROM questions WHERE chapter_id = ?', [c.id]);
        if (total.cnt === 0) {
            console.log(`  EMPTY: "${c.name}" (id: ${c.id})`);
        }
    }

    console.log("\n=== Mock Chemistry questions (is_pyq = 0 or NULL) ===");
    const mockCount = await db.get('SELECT COUNT(*) as cnt FROM questions WHERE subject_id = ? AND (is_pyq = 0 OR is_pyq IS NULL)', [subject.id]);
    console.log(`Total mock Chemistry questions: ${mockCount.cnt}`);

    await db.close();
}

audit();
