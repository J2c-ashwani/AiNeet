const { Pool } = require('pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });
const { buildQuestionPrompt, buildCrossVerifyPrompt, PROMPT_VERSION } = require('../lib/ai/prompts/v2');
const { validateQuestion } = require('../lib/ai/validator');
const { checkFactConsistency } = require('../lib/ai/fact-checker');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// For testing on Free Tier, we use Flash for both to avoid 2 RPM limits on Pro
const modelPro = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const modelFlash = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Exponential backoff retry wrapper for Gemini API calls.
 */
async function withRetry(fn, maxRetries = 5, baseDelayMs = 15000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            const is429 = err.message && err.message.includes('429');
            if (is429 && attempt < maxRetries) {
                const waitMs = baseDelayMs * Math.pow(2, attempt - 1);
                console.log(`  ⏳ Rate limited (429). Attempt ${attempt}/${maxRetries}. Waiting ${waitMs / 1000}s...`);
                await delay(waitMs);
            } else {
                throw err;
            }
        }
    }
}

// Mock NCERT Retrieval (Placeholder for Vector DB)
async function retrieveNCERTContext(topicName) {
    return `NCERT Syllabus Context for ${topicName}: Please rely strictly on standard Class 11 and 12 Biology textbooks. Avoid higher-level medical knowledge not covered in NCERT.`;
}

// Flash Cross-Verification
async function crossVerifyAnswer(questionText, options) {
    const prompt = buildCrossVerifyPrompt({ questionText, options });
    const result = await modelFlash.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    });
    const responseText = result.response.text();
    try {
        const parsed = JSON.parse(responseText);
        return parsed.correct_option; // 'A', 'B', 'C', or 'D'
    } catch (e) {
        return null;
    }
}

// Flash Fact-Checking
async function aiFactCheck(prompt) {
    const result = await modelFlash.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    });
    return JSON.parse(result.response.text());
}

async function generateSingleCandidate(topic, existingTexts) {
    const ncertContext = await retrieveNCERTContext(topic.name);
    const prompt = buildQuestionPrompt({
        subject: 'Biology',
        chapter: topic.chapter_name,
        topic: topic.name,
        difficulty: 'medium', // Defaulting to medium for now
        ncertContext,
        existingTexts
    });

    const result = await withRetry(() => modelPro.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
    }));
    
    return JSON.parse(result.response.text());
}

async function generateWithConsensus(topic, existingTexts) {
    console.log(`[Consensus] Generating 1 candidate for topic (rate limit safe): ${topic.name}`);
    const candidate = await generateSingleCandidate(topic, existingTexts).catch(e => { console.log('Candidate failed:', e.message); return null; });
    
    if (!candidate) return null;
    
    if (candidate.confidence === undefined) {
        console.log(`  -> Candidate missing confidence field. Raw:`, JSON.stringify(candidate).substring(0, 100));
        return null;
    }
    
    if (candidate.confidence < 0.80) {
        console.log(`  -> Candidate rejected due to low confidence: ${candidate.confidence}`);
        return null;
    }
    
    console.log(`  -> Candidate PASSED confidence check (${candidate.confidence})`);
    return candidate;
}

const delay = ms => new Promise(res => setTimeout(res, ms));
async function runGenerator(targetCount = 5) {
    const client = await pool.connect();
    let generatedCount = 0;

    try {
        console.log(`🧬 Starting Biology Question Generator Engine (Target: ${targetCount})`);
        
        // 1. Get Biology Topics
        const { rows: topics } = await client.query(`
            SELECT t.id, t.name, t.chapter_id, c.name as chapter_name, s.name as subject_name 
            FROM topics t 
            JOIN chapters c ON t.chapter_id = c.id
            JOIN subjects s ON c.subject_id = s.id 
            WHERE s.name = 'Biology'
            LIMIT 50
        `);

        if (topics.length === 0) {
            console.error('❌ No Biology topics found in DB!');
            return;
        }

        for (const topic of topics) {
            if (generatedCount >= targetCount) break;

            console.log(`\nProcessing Topic: ${topic.name}`);
            
            // Get existing text for deduplication (Gate 5 logic)
            const { rows: existing } = await client.query('SELECT text FROM questions WHERE topic_id = $1', [topic.id]);
            const existingTexts = existing.map(r => r.text);

            try {
                // Rate limit protection — 12s between calls stays within 5 RPM free tier
                await delay(12000);

                // Generate
                const rawQuestion = await generateWithConsensus(topic, existingTexts);
                if (!rawQuestion) {
                    console.log('  ⚠️ Failed to generate high-confidence candidates. Skipping.');
                    continue;
                }

                // Validate (7 Gates)
                const validationResult = await validateQuestion(rawQuestion, {
                    crossVerifyFn: crossVerifyAnswer,
                    dedupFn: async (text) => existingTexts.some(ext => ext.toLowerCase() === text.toLowerCase()),
                    topicId: topic.id
                });

                if (!validationResult.isValid) {
                    console.log(`  ❌ Validator Rejected: ${validationResult.rejectionReason}`);
                    await client.query(
                        'INSERT INTO question_rejections (topic_id, rejection_gate, rejection_reason, raw_output, prompt_version) VALUES ($1, $2, $3, $4, $5)',
                        [topic.id, 'VALIDATOR', validationResult.rejectionReason, rawQuestion, PROMPT_VERSION]
                    );
                    continue;
                }

                // Fact Consistency Engine
                console.log('  🔍 Running Fact Consistency Check...');
                const factCheck = await checkFactConsistency(validationResult.finalQuestion, 'Biology', aiFactCheck);
                
                if (!factCheck.isFactuallyCorrect) {
                    console.log(`  ❌ Fact Check Rejected: ${factCheck.errorDetails}`);
                    await client.query(
                        'INSERT INTO question_rejections (topic_id, rejection_gate, rejection_reason, raw_output, prompt_version) VALUES ($1, $2, $3, $4, $5)',
                        [topic.id, 'FACT_CHECK', factCheck.errorDetails, rawQuestion, PROMPT_VERSION]
                    );
                    continue;
                }

                const finalQ = validationResult.finalQuestion;

                // Insert to DB
                await client.query(`
                    INSERT INTO questions (
                        subject_id, chapter_id, topic_id, text, option_a, option_b, option_c, option_d,
                        correct_option, explanation, difficulty, is_pyq, is_ai_generated,
                        generation_model, prompt_version, confidence_score, quality_score,
                        explanation_version, explanation_locked
                    ) VALUES (
                        (SELECT id FROM subjects WHERE name = 'Biology'), $1, $2, $3, $4, $5, $6, $7,
                        $8, $9, $10, 0, 1,
                        'gemini-2.5-pro', $11, $12, $13,
                        $14, FALSE
                    )
                `, [
                    topic.chapter_id, topic.id, finalQ.text, finalQ.option_a, finalQ.option_b, finalQ.option_c, finalQ.option_d,
                    finalQ.correct_option, finalQ.explanation, finalQ.difficulty,
                    PROMPT_VERSION, finalQ.confidence_score, finalQ.quality_score, PROMPT_VERSION
                ]);

                console.log(`  ✅ Successfully generated and validated question! (Quality: ${finalQ.quality_score}, Confidence: ${finalQ.confidence_score})`);
                generatedCount++;

            } catch (err) {
                console.error(`  ⚠️ Error processing topic ${topic.name}:`, err.message);
            }
        }

        console.log(`\n🎉 Pipeline finished. Generated ${generatedCount} Biology questions.`);

    } finally {
        client.release();
        await pool.end();
    }
}

// Run a small batch to test the pipeline
runGenerator(3);
