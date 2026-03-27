import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });

import { getDb } from './lib/db.js';
const db = getDb();

async function cleanup() {
    const subject = await db.get('SELECT id FROM subjects WHERE name = ?', ['Chemistry']);
    if (!subject) { console.log("No Chemistry subject found!"); return; }
    const subjectId = subject.id;

    // 1. Remove all 19 mock Chemistry questions
    const mocksBefore = await db.get('SELECT COUNT(*) as cnt FROM questions WHERE subject_id = ? AND (is_pyq = 0 OR is_pyq IS NULL)', [subjectId]);
    console.log(`Found ${mocksBefore.cnt} mock Chemistry questions. Removing...`);
    await db.run('DELETE FROM questions WHERE subject_id = ? AND (is_pyq = 0 OR is_pyq IS NULL)', [subjectId]);
    console.log("✅ All mock Chemistry questions removed.");

    // 2. Move the 1 question from duplicate "d and f Block Elements" to the correct "d- and f-Block Elements"
    const correctChap = await db.get('SELECT id FROM chapters WHERE name = ? AND subject_id = ?', ['d- and f-Block Elements', subjectId]);
    const dupeChap = await db.get('SELECT id FROM chapters WHERE name = ? AND subject_id = ?', ['d and f Block Elements', subjectId]);
    if (correctChap && dupeChap) {
        await db.run('UPDATE questions SET chapter_id = ? WHERE chapter_id = ?', [correctChap.id, dupeChap.id]);
        console.log("✅ Moved questions from 'd and f Block Elements' → 'd- and f-Block Elements'");
    }

    // 3. Delete all empty chapters (0 questions)
    const emptyChapters = ['Amines and Biomolecules', 'Solid State', 'p-Block Elements', 'd and f Block Elements'];
    for (const name of emptyChapters) {
        const chap = await db.get('SELECT id FROM chapters WHERE name = ? AND subject_id = ?', [name, subjectId]);
        if (chap) {
            const remaining = await db.get('SELECT COUNT(*) as cnt FROM questions WHERE chapter_id = ?', [chap.id]);
            if (remaining.cnt === 0) {
                await db.run('DELETE FROM topics WHERE chapter_id = ?', [chap.id]);
                await db.run('DELETE FROM chapters WHERE id = ?', [chap.id]);
                console.log(`✅ Deleted empty chapter: "${name}"`);
            } else {
                console.log(`⚠️  Skipped "${name}" — still has ${remaining.cnt} questions`);
            }
        }
    }

    // 4. Final verification
    console.log("\n=== FINAL STATE ===");
    const chapters = await db.all('SELECT id, name, class_level FROM chapters WHERE subject_id = ? ORDER BY class_level, name', [subjectId]);
    let total = 0;
    for (const c of chapters) {
        const cnt = await db.get('SELECT COUNT(*) as cnt FROM questions WHERE chapter_id = ?', [c.id]);
        console.log(`[Class ${c.class_level}] "${c.name}" — ${cnt.cnt} PYQs`);
        total += cnt.cnt;
    }
    console.log(`\nTotal Chemistry chapters: ${chapters.length}`);
    console.log(`Total Chemistry PYQs: ${total}`);
    console.log("🎉 Cleanup complete!");

    await db.close();
}

cleanup();
