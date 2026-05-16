const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false } 
});

async function deduplicate() {
    console.log('🔍 Identifying duplicates...');
    
    try {
        // Find duplicate questions by text and keep the one with the highest quality chapter_id/topic_id
        const result = await pool.query(`
            WITH ranked_dupes AS (
                SELECT id, text,
                       ROW_NUMBER() OVER (
                           PARTITION BY text, option_a, option_b 
                           ORDER BY 
                               -- Prefer records that have non-default chapters/topics (usually seeded by the specific chapter scripts)
                               (CASE WHEN chapter_id > 1 THEN 1 ELSE 0 END) DESC,
                               (CASE WHEN topic_id > 1 THEN 1 ELSE 0 END) DESC,
                               id ASC
                       ) as rn
                FROM questions
                WHERE is_pyq = 1
            )
            DELETE FROM questions
            WHERE id IN (
                SELECT id FROM ranked_dupes WHERE rn > 1
            )
            RETURNING id;
        `);
        
        console.log(`✅ Successfully deleted ${result.rowCount} exact duplicate PYQs.`);
        
        // Final count
        const counts = await pool.query(`
            SELECT COUNT(*) as total FROM questions WHERE is_pyq = 1
        `);
        console.log(`📊 Final clean PYQ count: ${counts.rows[0].total}`);
        
    } catch (err) {
        console.error('Error during deduplication:', err);
    } finally {
        await pool.end();
    }
}

deduplicate();
