import { Client } from 'pg';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro", generationConfig: { responseMimeType: "application/json" } });

async function fillYearlyGaps() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const years = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];

  // Target distribution per year: Physics: 45, Chemistry: 45, Biology: 90

  for (const year of years) {
    console.log(`\n--- Processing Year ${year} ---`);
    const stats = await client.query(`
      SELECT s.id, s.name, COUNT(q.id) as count
      FROM subjects s
      LEFT JOIN questions q ON q.subject_id = s.id AND q.is_pyq = 1 AND q.year_asked LIKE $1
      GROUP BY s.id, s.name
    `, [`%${year}%`]);

    let generatedQuestions = [];

    for (const row of stats.rows) {
      const currentCount = parseInt(row.count);
      const targetCount = row.name === 'Biology' ? 90 : 45;
      const missing = targetCount - currentCount;

      console.log(`  ${row.name}: ${currentCount}/${targetCount} (Missing: ${missing})`);

      if (missing > 0 && missing <= 45) {
        console.log(`    Generating ${missing} missing questions for ${row.name} ${year}...`);

        // Fetch a random chapter/topic for context
        const topics = await client.query(`
          SELECT t.id as topic_id, t.name as topic_name, c.id as chapter_id, c.name as chapter_name
          FROM topics t JOIN chapters c ON t.chapter_id = c.id WHERE c.subject_id = $1
          ORDER BY RANDOM() LIMIT $2
        `, [row.id, missing]);

        for (let i = 0; i < missing; i++) {
          const topic = topics.rows[i % topics.rows.length];

          const prompt = `
           You are an expert NEET faculty. Write exactly 1 multiple-choice question for NEET exam preparation.
           Subject: ${row.name}
           Chapter: ${topic.chapter_name}
           Topic: ${topic.topic_name}
           Year: ${year} (simulate a question that would appear in this year)
           
           It MUST be highly realistic to NEET pattern.
           
           Return ONLY a JSON array with 1 object:
           [
             {
               "text": "Question text here...",
               "option_a": "First option",
               "option_b": "Second option",
               "option_c": "Third option",
               "option_d": "Fourth option",
               "correct_option": "A or B or C or D",
               "explanation": "Detailed step-by-step solution",
               "difficulty": "medium"
             }
           ]
           `;

          try {
            // Basic retry wrapper
            let result, data;
            for (let attempt = 0; attempt < 3; attempt++) {
              try {
                result = await model.generateContent(prompt);
                data = JSON.parse(result.response.text());
                break;
              } catch (e) {
                if (attempt === 2) throw e;
                await new Promise(r => setTimeout(r, 2000));
              }
            }

            if (data && data[0]) {
              const q = data[0];
              generatedQuestions.push({
                subject_id: row.id,
                chapter_id: topic.chapter_id,
                topic_id: topic.topic_id,
                text: q.text,
                option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d,
                correct_option: q.correct_option,
                explanation: q.explanation,
                difficulty: q.difficulty || 'medium'
              });
            }
          } catch (err) {
            console.error(`    Failed to generate 1 question: ${err.message}`);
          }
        }
      }
    }

    // Save to JSON seeder
    if (generatedQuestions.length > 0) {
      const outputPath = `/Users/ashwanikumar/.gemini/antigravity/scratch/neet-coach/scripts/seed_pyq_gap_${year}.json`;
      fs.writeFileSync(outputPath, JSON.stringify(generatedQuestions, null, 2));
      console.log(`  Saved ${generatedQuestions.length} gap-fill questions to ${outputPath}`);
    } else {
      console.log(`  No gaps to fill for ${year}.`);
    }
  }

  await client.end();
}

fillYearlyGaps().catch(console.error);
