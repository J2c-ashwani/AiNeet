const { Pool } = require('pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });
const { buildEnrichmentPrompt, PROMPT_VERSION } = require('../lib/ai/prompts/v2');
const { checkFactConsistency } = require('../lib/ai/fact-checker');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Switch to gemini-2.5-pro for production (paid tier).
// Using Flash for free-tier testing.
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Exponential backoff retry wrapper for Gemini API calls.
 * Retries up to `maxRetries` times when hitting 429 rate limits.
 */
async function withRetry(fn, maxRetries = 5, baseDelayMs = 15000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            const is429 = err.message && err.message.includes('429');
            if (is429 && attempt < maxRetries) {
                const waitMs = baseDelayMs * Math.pow(2, attempt - 1); // 15s, 30s, 60s, 120s...
                console.log(`  ⏳ Rate limited (429). Attempt ${attempt}/${maxRetries}. Waiting ${waitMs / 1000}s before retry...`);
                await delay(waitMs);
            } else {
                throw err;
            }
        }
    }
}

async function runEnrichment(targetCount = 5) {
    const client = await pool.connect();
    let enrichedCount = 0;

    try {
        console.log(`🧠 Starting PYQ Explanation Enrichment Engine (Target: ${targetCount})`);
        
        // 1. Get PYQs that need enrichment (e.g. explanation is 'Physics PYQ' or very short)
        // AND explanation is NOT locked (MD Mandate)
        const { rows: pyqs } = await client.query(`
            SELECT q.id, q.text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, s.name as subject_name
            FROM questions q
            JOIN subjects s ON q.subject_id = s.id
            WHERE q.is_pyq = 1 
              AND (q.explanation IS NULL OR LENGTH(q.explanation) < 100)
              AND q.explanation_locked = FALSE
            LIMIT $1
        `, [targetCount]);

        if (pyqs.length === 0) {
            console.log('✅ No PYQs need enrichment! All caught up.');
            return;
        }

        console.log(`Found ${pyqs.length} PYQs needing enrichment.`);

        for (const pyq of pyqs) {
            console.log(`\nProcessing PYQ [ID: ${pyq.id}] - Subject: ${pyq.subject_name}`);
            
            try {
                // Rate limit protection — 12s between calls stays under 5 RPM free tier
                await delay(12000);

                const prompt = buildEnrichmentPrompt({
                    subject: pyq.subject_name,
                    questionText: pyq.text,
                    options: { a: pyq.option_a, b: pyq.option_b, c: pyq.option_c, d: pyq.option_d },
                    correctOption: pyq.correct_option
                });

                const result = await withRetry(() => model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
                }));

                const generated = JSON.parse(result.response.text());

                if (!generated.explanation || generated.explanation.length < 200) {
                    console.log('  ⚠️ Rejected: LLM generated explanation was too short or missing.');
                    continue;
                }

                if (generated.confidence === undefined || generated.confidence < 0.80) {
                    console.log(`  ⚠️ Rejected: LLM confidence (${generated.confidence}) below 0.80 MD threshold.`);
                    continue;
                }

                // Fact Consistency Engine
                console.log('  🔍 Running Fact Consistency Check...');
                const factCheckPrompt = async (p) => {
                    const r = await withRetry(() => model.generateContent({
                        contents: [{ role: 'user', parts: [{ text: p }] }],
                        generationConfig: { responseMimeType: "application/json" }
                    }));
                    return JSON.parse(r.response.text());
                };

                const mockQuestionObject = {
                    text: pyq.text,
                    option_a: pyq.option_a,
                    option_b: pyq.option_b,
                    option_c: pyq.option_c,
                    option_d: pyq.option_d,
                    correct_option: pyq.correct_option,
                    explanation: generated.explanation
                };

                const factCheck = await checkFactConsistency(mockQuestionObject, pyq.subject_name, factCheckPrompt);
                
                if (!factCheck.isFactuallyCorrect) {
                    console.log(`  ❌ Fact Check Rejected: ${factCheck.errorDetails}`);
                    await client.query(
                        'INSERT INTO question_rejections (topic_id, rejection_gate, rejection_reason, raw_output, prompt_version) VALUES ($1, $2, $3, $4, $5)',
                        [null, 'PYQ_ENRICHMENT_FACT_CHECK', factCheck.errorDetails, generated, PROMPT_VERSION]
                    );
                    continue;
                }

                // Basic quality scoring (similar to Gate 3)
                let qualityScore = 70; // Baseline
                if (generated.explanation.length >= 400) qualityScore += 10;
                if (generated.ncert_reference) qualityScore += 10;

                // Insert to DB (VERSIONED update)
                await client.query(`
                    UPDATE questions 
                    SET 
                        explanation = $1,
                        ncert_reference = $2,
                        explanation_version = $3,
                        confidence_score = $4,
                        quality_score = $5
                    WHERE id = $6
                `, [
                    generated.explanation,
                    generated.ncert_reference || null,
                    PROMPT_VERSION,
                    generated.confidence,
                    qualityScore,
                    pyq.id
                ]);

                console.log(`  ✅ Successfully enriched PYQ! (Quality: ${qualityScore}, Confidence: ${generated.confidence})`);
                enrichedCount++;

            } catch (err) {
                console.error(`  ⚠️ Error processing PYQ [ID: ${pyq.id}]:`, err.message);
            }
        }

        console.log(`\n🎉 Pipeline finished. Enriched ${enrichedCount} PYQs.`);

    } finally {
        client.release();
        await pool.end();
    }
}

// Run a small batch. Increase to 919 for full production run.
runEnrichment(3);
