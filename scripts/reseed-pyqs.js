const fs = require('fs');
const { Pool } = require('pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL.replace(':5432/', ':6543/') + '?pgbouncer=true',
    ssl: { rejectUnauthorized: false },
    family: 4
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const delay = ms => new Promise(res => setTimeout(res, ms));

async function reseedPYQs() {
    const client = await pool.connect();
    try {
        console.log('🔄 Starting PYQ Reseeding Process...');

        if (!fs.existsSync('scripts/yearly_pyqs_extracted.json')) {
            console.error('❌ Could not find scripts/yearly_pyqs_extracted.json');
            return;
        }

        const rawData = fs.readFileSync('scripts/yearly_pyqs_extracted.json', 'utf8');
        const pyqs = JSON.parse(rawData);
        
        console.log(`Found ${pyqs.length} PYQs in the JSON file.`);

        // Subject ID Mapping
        const { rows: subjects } = await client.query('SELECT id, name FROM subjects');
        const subjectMap = {};
        subjects.forEach(s => subjectMap[s.name.toLowerCase()] = s.id);

        // Fallback chapter for PYQs (since JSON doesn't specify chapter)
        // We will assign them to a generic chapter or first chapter of that subject
        const { rows: chapters } = await client.query('SELECT id, subject_id FROM chapters ORDER BY id ASC');
        const defaultChapterMap = {};
        chapters.forEach(c => {
            if (!defaultChapterMap[c.subject_id]) {
                defaultChapterMap[c.subject_id] = c.id;
            }
        });

        // We also need a generic topic ID
        const { rows: topics } = await client.query('SELECT id, chapter_id FROM topics ORDER BY id ASC');
        const defaultTopicMap = {};
        topics.forEach(t => {
            if (!defaultTopicMap[t.chapter_id]) {
                defaultTopicMap[t.chapter_id] = t.id;
            }
        });

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < pyqs.length; i++) {
            const pyq = pyqs[i];
            
            // Format check
            if (!pyq.options || !pyq.text || !pyq.year || !pyq.subject) {
                failCount++;
                continue;
            }

            const subjectId = subjectMap[pyq.subject.toLowerCase()];
            if (!subjectId) {
                console.log(`⚠️ Unknown subject: ${pyq.subject}`);
                failCount++;
                continue;
            }

            const chapterId = defaultChapterMap[subjectId];
            const topicId = defaultTopicMap[chapterId];

            if (!chapterId || !topicId) {
                console.log(`⚠️ Missing chapter/topic fallback for subject: ${pyq.subject}`);
                failCount++;
                continue;
            }

            // The JSON options usually have "Option 1", "Option 2" etc.
            const optA = pyq.options['Option 1'] || pyq.options['A'] || '';
            const optB = pyq.options['Option 2'] || pyq.options['B'] || '';
            const optC = pyq.options['Option 3'] || pyq.options['C'] || '';
            const optD = pyq.options['Option 4'] || pyq.options['D'] || '';

            if (!optA || !optB || !optC || !optD) {
                failCount++;
                continue;
            }

            // We need to use Gemini to generate an explanation and figure out the correct option
            console.log(`[${i+1}/${pyqs.length}] Processing ${pyq.subject} PYQ from ${pyq.year}...`);

            const prompt = `You are a NEET exam expert. 
Given this Previous Year Question (PYQ) from NEET ${pyq.year} (${pyq.subject}):
Question: ${pyq.text}
A: ${optA}
B: ${optB}
C: ${optC}
D: ${optD}

Analyze the question and provide the correct option letter (A, B, C, or D) and a detailed, high-quality explanation. 
The explanation MUST be at least 100 words, clearly explaining why the correct option is right and why the others are wrong.
Return ONLY valid JSON matching this schema:
{
  "correct_option": "A" | "B" | "C" | "D",
  "explanation": "Detailed explanation string...",
  "confidence_score": 0.95
}`;

            try {
                // Rate limit (15 requests per minute for free tier = 4s delay)
                await delay(4000);

                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                });

                const parsed = JSON.parse(result.response.text());

                if (!parsed.correct_option || !parsed.explanation || parsed.explanation.length < 50) {
                    throw new Error("Invalid generation from AI");
                }

                // Insert into DB with exam_name and year_asked
                await client.query(`
                    INSERT INTO questions (
                        subject_id, chapter_id, topic_id, text, 
                        option_a, option_b, option_c, option_d,
                        correct_option, explanation, difficulty, 
                        is_pyq, exam_name, year_asked,
                        is_ai_generated, generation_model, 
                        confidence_score, quality_score
                    ) VALUES (
                        $1, $2, $3, $4, 
                        $5, $6, $7, $8,
                        $9, $10, 'medium',
                        1, 'NEET', $11,
                        0, 'human_pyq', 
                        $12, 90
                    )
                `, [
                    subjectId, chapterId, topicId, pyq.text,
                    optA, optB, optC, optD,
                    parsed.correct_option, parsed.explanation,
                    pyq.year.toString(),
                    parsed.confidence_score <= 1 ? Math.round(parsed.confidence_score * 100) : parsed.confidence_score
                ]);

                successCount++;
                console.log(`  ✅ Inserted! (Correct: ${parsed.correct_option})`);

            } catch (err) {
                console.error(`  ❌ Failed:`, err.message);
                failCount++;
            }
        }

        console.log(`\n🎉 PYQ Reseeding Complete!`);
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ❌ Failed:  ${failCount}`);

    } catch (e) {
        console.error('Reseed Error:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

reseedPYQs();
