const { Client } = require('pg');
const fs = require('fs');

async function dumpYear(year) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const query = `
    SELECT 
      q.text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option,
      q.explanation, s.name as subject, c.name as chapter, t.name as topic
    FROM questions q
    JOIN subjects s ON q.subject_id = s.id
    JOIN chapters c ON q.chapter_id = c.id
    JOIN topics t ON q.topic_id = t.id
    WHERE q.is_pyq = 1 AND q.year_asked LIKE $1
    ORDER BY s.id, c.id, t.id
  `;

  const res = await client.query(query, [`%${year}%`]);
  fs.writeFileSync(`/tmp/neet_${year}_db_dump.json`, JSON.stringify(res.rows, null, 2));
  console.log(`Saved ${res.rows.length} questions for ${year} to /tmp/neet_${year}_db_dump.json`);
  
  await client.end();
}

console.log("Dumping 2022...");
dumpYear(2022);
