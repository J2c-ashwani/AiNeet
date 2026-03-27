import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });

import { getDb } from './lib/db.js';
const db = getDb();

async function verify() {
    console.log("--- Verification of Chemistry PYQs ---");
    try {
        const subject = await db.get('SELECT id FROM subjects WHERE name = ?', ['Chemistry']);
        if (!subject) {
            console.log("Chemistry subject not found in DB.");
            return;
        }

        const chapters = await db.all('SELECT id, name FROM chapters WHERE subject_id = ? ORDER BY order_index, name', [subject.id]);
        let totalCount = 0;

        for (const chap of chapters) {
            const result = await db.get('SELECT COUNT(*) as count FROM questions WHERE chapter_id = ? AND is_pyq = 1', [chap.id]);
            const count = result.count || 0;
            console.log(`Chapter '${chap.name}': ${count} questions`);
            totalCount += count;
        }

        console.log(`\nTotal Chemistry PYQs in Database: ${totalCount}`);
    } catch (e) {
        console.error("Error during verification:", e);
    } finally {
        await db.close();
    }
}

verify();
