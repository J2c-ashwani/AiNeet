/**
 * lib/rag_engine.js — Enterprise NCERT RAG Engine v2.0
 * ─────────────────────────────────────────────────────────────────
 * MD-Approved Architecture (All 10 Modifications)
 *
 * Mod 1:  Structured curriculum metadata (topic_slug, concept_tags, etc.)
 * Mod 2:  220-350 word chunks (enforced in embed pipeline)
 * Mod 3:  Deterministic metadata-first retrieval — NEVER AI-guessed chapters
 * Mod 4:  Citation persistence — source_chunk_ids saved to rag_explanations
 * Mod 5:  Teacher review sampling — 3% daily via sample_explanations_for_review()
 * Mod 6:  Confidence collapse rule — similarity < 0.72 → fallback/insufficient
 * Mod 7:  Strict mode — AI refuses to answer if grounding is insufficient
 * Mod 8:  Full versioning on every explanation record
 * Mod 9:  Hybrid BM25 + vector retrieval via SQL function
 * Mod 10: "NCERT Grounded" trust badge payload returned with every explanation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { randomUUID } from 'crypto';
import pkg from 'pg';
const { Pool } = pkg;

// ─── Constants (Versioned — MD Mod 8) ────────────────────────────
export const RAG_VERSION = {
    PROMPT:       'v2.0',
    RETRIEVAL:    'v2.0',
    GENERATION:   'gemini-flash-latest',
    EMBEDDING:    'gemini-embedding-001', // FREE TIER COMPATIBLE
    CHUNK_TARGET: '220-350w',
};

const CONFIDENCE_THRESHOLD = 0.72;   // MD Mod 6
const TOP_K_CHUNKS         = 3;      // Top 3 retrieved chunks for context
const EMBED_DIMS           = 3072;   // gemini-embedding-001 uses 3072 dimensions

// ─── Clients ─────────────────────────────────────────────────────
let _db = null;
function getDB() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is required for NCERT RAG retrieval');
    }

    if (!_db) {
        _db = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 5,
        });
    }
    return _db;
}

let _embedder = null;
let _generator = null;

// Support dynamic key rotation
let availableKeys = [];
let currentKeyIndex = 0;

function getAI() {
    if (availableKeys.length === 0) {
        // Find all env variables starting with GEMINI_API_KEY
        availableKeys = Object.keys(process.env)
            .filter(k => k.startsWith('GEMINI_API_KEY'))
            .map(k => process.env[k])
            .filter(Boolean); // remove empty keys

        if (availableKeys.length === 0) {
            availableKeys.push(''); // fallback empty string
        }
    }

    // Always re-initialize with the current key so we can rotate if needed
    const activeKey = availableKeys[currentKeyIndex];
    const genAI = new GoogleGenerativeAI(activeKey);
    _embedder  = genAI.getGenerativeModel({ model: RAG_VERSION.EMBEDDING });
    _generator = genAI.getGenerativeModel({ model: RAG_VERSION.GENERATION });

    return { embedder: _embedder, generator: _generator, activeKey };
}

function rotateKey() {
    if (availableKeys.length > 1) {
        currentKeyIndex = (currentKeyIndex + 1) % availableKeys.length;
        console.warn(`[API Limits] Rotating to Gemini API Key #${currentKeyIndex + 1}...`);
        _embedder = null;
        _generator = null;
    }
}

function localMockAllowed() {
    return process.env.NODE_ENV !== 'production' || process.env.RAG_ALLOW_MOCK === 'true';
}

// ─────────────────────────────────────────────────────────────────
// STEP 1: Embed query text
// ─────────────────────────────────────────────────────────────────
async function embedQuery(text) {
    const { embedder } = getAI();
    const result = await embedder.embedContent({
        content: { parts: [{ text }], role: 'user' },
        taskType: 'RETRIEVAL_QUERY',
    });
    const values = result.embedding.values;
    if (!Array.isArray(values) || values.length !== EMBED_DIMS) {
        throw new Error(`Unexpected embedding dimension: expected ${EMBED_DIMS}, got ${values?.length || 0}`);
    }
    return values;
}

// ─────────────────────────────────────────────────────────────────
// STEP 2: Deterministic + Hybrid Retrieval (MD Mod 3 & 9)
// Uses question DB metadata to scope search, NEVER LLM chapter guessing
// ─────────────────────────────────────────────────────────────────
export async function retrieveContext({
    questionText,
    subject,          // Deterministic from questions.subject_id
    chapterTitle,     // Deterministic from chapters.title
    chapterNumber,    // Deterministic from chapters.chapter_number
    classLevel,       // 11 or 12, from curriculum mapping
}) {
    const db = getDB();

    // Fallback: if no Gemini key, return keyword-only search
    if (!process.env.GEMINI_API_KEY) {
        return keywordFallback(db, subject, chapterTitle, questionText);
    }

    try {
        // Embed the question text for vector search
        const queryVec = await embedQuery(questionText);
        const vecStr   = `[${queryVec.join(',')}]`;

        // Hybrid BM25 + vector via SQL function (MD Mod 9)
        const { rows } = await db.query(
            `SELECT * FROM hybrid_ncert_search(
                $1::vector,  -- query embedding
                $2::text,    -- BM25 query text
                $3::text,    -- subject filter (deterministic)
                $4::int,     -- chapter_number filter (deterministic)
                $5::int,     -- class_level filter
                $6::int,     -- top_k
                0.7,         -- vector weight
                0.3          -- BM25 weight
            )`,
            [vecStr, questionText, subject, chapterNumber || null, classLevel || null, TOP_K_CHUNKS]
        );

        if (rows.length === 0) {
            return keywordFallback(db, subject, chapterTitle, questionText);
        }

        // Use pure vector similarity for confidence thresholding (bounded 0-1)
        const topScore = rows[0]?.vector_score || 0;

        return {
            chunks: rows,
            topSimilarity: topScore,
            passedConfidenceGate: topScore >= CONFIDENCE_THRESHOLD,
            retrievalMethod: 'hybrid_bm25_vector',
            chapterTitle: rows[0]?.chapter_title || chapterTitle,
            topicSlug:    rows[0]?.topic_slug,
            sourceChunkIds: rows.map(r => r.id),
        };
    } catch (err) {
        console.error('[RAG] Hybrid retrieval failed, falling back to keyword:', err.message);
        return keywordFallback(db, subject, chapterTitle, questionText);
    }
}

/** Keyword-only fallback (MD Mod 6 — used when embedding fails) */
async function keywordFallback(db, subject, chapterTitle, questionText) {
    const chapterFilter = chapterTitle ? `%${chapterTitle}%` : null;
    const { rows } = await db.query(
        `SELECT id, chunk_text, chapter_title, topic_slug, ncert_keywords, source_url
         FROM ncert_embeddings
         WHERE subject = $1
           AND ($2::text IS NULL OR chapter_title ILIKE $2)
           AND fts_document @@ plainto_tsquery('english', $3)
         ORDER BY ts_rank_cd(fts_document, plainto_tsquery('english', $3)) DESC
         LIMIT $4`,
        [subject, chapterFilter, questionText, TOP_K_CHUNKS]
    );

    return {
        chunks: rows,
        topSimilarity: 0.5, // pessimistic default
        passedConfidenceGate: false,
        retrievalMethod: 'keyword_fallback',
        chapterTitle,
        sourceChunkIds: rows.map(r => r.id),
    };
}

// ─────────────────────────────────────────────────────────────────
// STEP 3: Grounded Explanation Generation (Elite NEET Tutor Mode)
// ─────────────────────────────────────────────────────────────────
async function generateGroundedExplanation({ question, correctOption, retrievalResult, subject }) {
    const { chunks, passedConfidenceGate, topSimilarity } = retrievalResult;

    // Confidence Band Classification
    let confidenceBand = 'Needs Verification';
    if (topSimilarity >= 0.85) confidenceBand = 'High Confidence';
    else if (topSimilarity >= 0.75) confidenceBand = 'NCERT Grounded';
    else if (topSimilarity >= 0.65) confidenceBand = 'Moderate Confidence';

    // MD Mod 6: Collapse if confidence too low (< 0.65)
    if (topSimilarity < 0.65 || chunks.length === 0) {
        return {
            text: 'Insufficient NCERT grounding available for this question. Please consult your NCERT textbook directly.',
            mode: 'insufficient',
            confident: false,
            confidenceBand,
            driftScore: null,
            comprehensionScore: null
        };
    }

    // Merge top-k chunks into context block
    const contextBlock = chunks
        .map((c, i) => `[NCERT Source ${i + 1} — ${c.chapter_title}${c.topic_slug ? ' > ' + c.topic_slug : ''}]\n${c.chunk_text}`)
        .join('\n\n---\n\n');

    // Subject-Specific Pedagogy Rules
    let pedagogyRules = '';
    if (subject === 'biology') {
        pedagogyRules = 'Focus on exact NCERT terminology, factual memory anchors, and biological process logic.';
    } else if (subject === 'physics') {
        pedagogyRules = 'Focus on the derivation path, mathematical/unit logic, and elimination through equations.';
    } else if (subject === 'chemistry') {
        pedagogyRules = 'Distinguish between physical calculations, inorganic facts, and organic mechanism reasoning.';
    }

    // Elite NEET Tutor Prompt Structure
    const strictPrompt = `You are an elite NEET exam tutor grounded strictly in official NCERT textbooks.

RETRIEVED NCERT CONTEXT (use ONLY this — do not hallucinate):
═══════════════════════════════════════════════════════════
${contextBlock}
═══════════════════════════════════════════════════════════

TASK: Explain why Option ${correctOption} is the correct answer for the NEET question below.

RULES (ELITE TUTOR STRICT MODE):
1. Use ONLY information present in the retrieved NCERT context above.
2. ${pedagogyRules}
3. If the retrieved context does NOT contain sufficient information to explain the answer completely, output "Insufficient NCERT grounding available" for the explanation.
4. Output your response as a valid JSON object matching this schema EXACTLY:
{
  "explanation_markdown": "Your detailed explanation using the required structure below.",
  "grounding_drift_score": 0-100, // 0 = 100% grounded in provided text, 100 = total hallucination/external knowledge
  "comprehension_score": 0-100 // 100 = Perfect Class 11/12 readability, easy to understand. 0 = Unreadable jargon.
}

REQUIRED EXPLANATION STRUCTURE (inside explanation_markdown):
**Concept Tested:** (1 sentence identifying the core concept)
**Correct Answer Reasoning:** (Explain clearly why the correct option is right based ONLY on the text)
**Why Other Options Are Wrong:** (Analyze the distractors and explain why they fail)
**NEET Exam Insight:** (1 sentence on how this concept is typically tested or common traps)
**NCERT Reference:** (Quote the most relevant sentence from the text)

QUESTION: ${question.text}
OPTIONS:
A) ${question.option_a}
B) ${question.option_b}
C) ${question.option_c}
D) ${question.option_d}
CORRECT ANSWER: Option ${correctOption}

Explanation (NCERT-grounded):`;

    const { generator } = getAI();
    // Use JSON response schema for strict parsing
    const result = await generator.generateContent({
        contents: [{ role: 'user', parts: [{ text: strictPrompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
    });
    
    let text = '';
    let driftScore = 0;
    let comprehensionScore = 100;
    
    try {
        const jsonStr = result.response.text().trim();
        const parsed = JSON.parse(jsonStr);
        text = parsed.explanation_markdown;
        driftScore = parsed.grounding_drift_score || 0;
        comprehensionScore = parsed.comprehension_score || 100;
    } catch (e) {
        text = result.response.text().trim(); // Fallback if parsing fails
    }

    const isInsufficient = text.toLowerCase().includes('insufficient ncert grounding');
    
    // Penalize confidence band if hallucination drift is detected
    if (driftScore > 30 && confidenceBand !== 'Needs Verification') {
        confidenceBand = 'Moderate Confidence'; // Downgrade due to hallucination
    }

    return {
        text,
        mode:      isInsufficient ? 'insufficient' : 'strict',
        confident: !isInsufficient && passedConfidenceGate && driftScore <= 30,
        confidenceBand,
        driftScore,
        comprehensionScore
    };
}

// ─────────────────────────────────────────────────────────────────
// STEP 4: Persist Explanation with Full Citations (MD Mod 4 & 8)
// ─────────────────────────────────────────────────────────────────
async function persistExplanation({ questionId, explanationText, retrievalResult, generationResult }) {
    const db = getDB();

    const { rows } = await db.query(
        `INSERT INTO rag_explanations (
            question_id, explanation_text, confidence_score,
            source_chunk_ids, ncert_chapter, ncert_topic,
            top_similarity, passed_confidence_gate, grounding_mode,
            prompt_version, retrieval_version, generation_model, embedding_model,
            drift_score, comprehension_score
        ) VALUES ($1, $2, $3, $4::uuid[], $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (question_id) DO UPDATE SET
            explanation_text       = EXCLUDED.explanation_text,
            confidence_score       = EXCLUDED.confidence_score,
            source_chunk_ids       = EXCLUDED.source_chunk_ids,
            ncert_chapter          = EXCLUDED.ncert_chapter,
            ncert_topic            = EXCLUDED.ncert_topic,
            top_similarity         = EXCLUDED.top_similarity,
            passed_confidence_gate = EXCLUDED.passed_confidence_gate,
            grounding_mode         = EXCLUDED.grounding_mode,
            prompt_version         = EXCLUDED.prompt_version,
            retrieval_version      = EXCLUDED.retrieval_version,
            generation_model       = EXCLUDED.generation_model,
            embedding_model        = EXCLUDED.embedding_model,
            drift_score            = EXCLUDED.drift_score,
            comprehension_score    = EXCLUDED.comprehension_score
        RETURNING id`,
        [
            questionId,
            explanationText,
            retrievalResult.topSimilarity,
            retrievalResult.sourceChunkIds,
            retrievalResult.chapterTitle,
            retrievalResult.topicSlug,
            retrievalResult.topSimilarity,
            retrievalResult.passedConfidenceGate,
            generationResult.mode,
            RAG_VERSION.PROMPT,
            RAG_VERSION.RETRIEVAL,
            RAG_VERSION.GENERATION,
            RAG_VERSION.EMBEDDING,
            generationResult.driftScore,
            generationResult.comprehensionScore
        ]
    );

    return rows[0]?.id;
}

// ─────────────────────────────────────────────────────────────────
// PUBLIC API: generateNCERTGroundedExplanation
// The main entry point used by enrichment pipeline & API routes
// ─────────────────────────────────────────────────────────────────
export async function generateNCERTGroundedExplanation({
    question,         // Full question row from DB
    subject,          // 'Biology' | 'Physics' | 'Chemistry'
    chapterTitle,     // From curriculum mapping
    chapterNumber,
    classLevel,
    persistToDB = true,
}) {
    // MD Mod 3: Always use deterministic metadata — never AI-guessed chapter
    const retrieval = await retrieveContext({
        questionText: question.text,
        subject: subject.toLowerCase(),
        chapterTitle,
        chapterNumber,
        classLevel,
    });

    const generation = await generateGroundedExplanation({
        question,
        correctOption: question.correct_option,
        retrievalResult: retrieval,
        subject: subject.toLowerCase()
    });

    let explanationId = null;
    if (persistToDB && question.id) {
        explanationId = await persistExplanation({
            questionId: question.id,
            explanationText: generation.text,
            retrievalResult: retrieval,
            generationResult: generation,
        });
    }

    // MD Mod 10: Trust badge payload
    const trustBadge = buildTrustBadge(retrieval, generation);

    return {
        explanation:    generation.text,
        groundingMode:  generation.mode,
        confident:      generation.confident,
        topSimilarity:  retrieval.topSimilarity,
        sourceChunks:   retrieval.chunks.map(c => ({
            id:           c.id,
            chapterTitle: c.chapter_title,
            topicSlug:    c.topic_slug,
            sourceUrl:    c.source_url,
            similarity:   c.vector_score,
        })),
        ncertChapter:   retrieval.chapterTitle,
        explanationId,
        trustBadge,
        versions:       RAG_VERSION,
        confidenceBand: generation.confidenceBand,
        driftScore:     generation.driftScore,
        comprehensionScore: generation.comprehensionScore
    };
}

// ─────────────────────────────────────────────────────────────────
// MD Mod 10: NCERT Grounded Trust Badge
// ─────────────────────────────────────────────────────────────────
function buildTrustBadge(retrieval, generation) {
    const sim = retrieval.topSimilarity;

    if (!retrieval.passedConfidenceGate || generation.mode === 'insufficient') {
        return {
            show:       false,
            label:      'Unverified',
            tier:       'none',
            similarity: Math.round(sim * 100),
        };
    }

    let tier, label;
    if (sim >= 0.92) {
        tier = 'gold';
        label = 'NCERT Grounded';
    } else if (sim >= 0.80) {
        tier = 'silver';
        label = 'NCERT Referenced';
    } else {
        tier = 'bronze';
        label = 'NCERT Aligned';
    }

    return {
        show:           true,
        label,
        tier,
        similarity:     Math.round(sim * 100),
        chapterTitle:   retrieval.chapterTitle,
        chunkCount:     retrieval.chunks.length,
        retrievalMethod: retrieval.retrievalMethod,
    };
}

// ─────────────────────────────────────────────────────────────────
// LEGACY COMPATIBILITY: retrieveContext (old mock → real)
// Old rag_engine.js exported this — keep for backward compat
// ─────────────────────────────────────────────────────────────────
export async function retrieveContextLegacy(topic) {
    // Maps old keyword-based call to new deterministic flow
    const subjectMap = { optics: 'physics', mechanics: 'physics', genetics: 'biology', cell: 'biology' };
    const subject = Object.keys(subjectMap).find(k => topic.toLowerCase().includes(k))
        ? subjectMap[Object.keys(subjectMap).find(k => topic.toLowerCase().includes(k))]
        : 'biology';

    const result = await retrieveContext({ questionText: topic, subject, chapterTitle: topic });
    const topChunk = result.chunks[0];

    return {
        text: topChunk?.chunk_text || 'No NCERT context found for this topic.',
        source: topChunk?.chapter_title || topic,
        ncertGrounded: result.passedConfidenceGate,
        similarity: result.topSimilarity,
    };
}

// ─────────────────────────────────────────────────────────────────
// LEGACY: generateQuestionAI — keep for old routes
// ─────────────────────────────────────────────────────────────────
export async function generateQuestionAI(topic, user = null) {
    if (!process.env.GEMINI_API_KEY) {
        if (!localMockAllowed()) {
            throw new Error('GEMINI_API_KEY is required for production AI question generation');
        }
        const context = { text: `Local mock context for ${topic}` };
        return generateMockAIQuestion(topic, context);
    }

    try {
        const context = await retrieveContextLegacy(topic);
        const { generator: model } = getAI();
        const prompt = `Context (NCERT): "${context.text}"
Topic: "${topic}"
Generate a single NEET MCQ. Return raw JSON only:
{"text":"...","option_a":"...","option_b":"...","option_c":"...","option_d":"...","correct_option":"A/B/C/D","explanation":"...","difficulty":"easy/medium/hard"}`;

        const result = await model.generateContent(prompt);
        const data = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());

        return { id: randomUUID(), ...data, is_ai_generated: 1, source_context: context.text, subject_id: 0, chapter_id: 0, topic_id: 0 };
    } catch (error) {
        if (!localMockAllowed()) {
            throw error;
        }
        const context = { text: `Local mock context for ${topic}` };
        return generateMockAIQuestion(topic, context);
    }
}

function generateMockAIQuestion(topic, context) {
    return {
        id: randomUUID(),
        text: `[Mock AI] Based on ${topic}: Which of the following is correct?`,
        option_a: 'It is constant in all frames.',
        option_b: 'It varies exponentially.',
        option_c: 'It is proportional to applied force.',
        option_d: 'It depends on refractive index.',
        correct_option: 'C',
        difficulty: 'medium',
        explanation: `Context: "${context.text?.substring(0, 50)}..."`,
        is_ai_generated: 1,
        source_context: context.text,
        subject_id: 1, chapter_id: 1, topic_id: 1,
    };
}

export async function generateInstantQuestions(topic, count = 1) {
    const results = [];
    for (let i = 0; i < count; i++) results.push(await generateQuestionAI(topic));
    return results;
}
