import { getDb } from './lib/db.js';

async function test() {
    const db = getDb();
    const rows = await db.all(`
        SELECT 
            c.name        AS chapter_name,
            COUNT(q.id)   AS pyq_count
        FROM questions q
        JOIN topics t    ON q.topic_id   = t.id
        JOIN chapters c  ON t.chapter_id = c.id
        WHERE q.is_pyq = 1
        GROUP BY c.name
        LIMIT 10
    `);
    console.log(rows);
    process.exit(0);
}
test().catch(console.error);
