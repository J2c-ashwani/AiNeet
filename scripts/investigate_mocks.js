const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verify() {
  try {
    const res = await pool.query(`
      SELECT 
        s.name as subject,
        q.is_pyq,
        q.exam_name,
        COUNT(q.id) as question_count
      FROM subjects s
      JOIN chapters c ON s.id = c.subject_id
      JOIN questions q ON c.id = q.chapter_id
      WHERE s.name IN ('Physics', 'Chemistry', 'Biology')
      GROUP BY s.name, q.is_pyq, q.exam_name
      ORDER BY s.name, q.is_pyq, q.exam_name;
    `);
    console.table(res.rows);
  } catch(e) { console.error(e); } finally { pool.end(); }
}
verify();
