#!/usr/bin/env node
/**
 * scripts/embed-ncert-chunks.mjs
 * ─────────────────────────────────────────────────────────────────
 * NCERT Embedding Pipeline — Enterprise Version
 * MD-Approved: Mod 1 (structured metadata), Mod 2 (220-350 word chunks),
 *              Mod 8 (versioning), Mod 9 (FTS document update)
 *
 * What it does:
 *  1. Reads all NCERT books/chapters from ncert-data.js
 *  2. Downloads official PDF from ncert.nic.in (with retry)
 *  3. Parses & chunks at 220-350 words with 15% overlap
 *  4. Tags each chunk with concept_tags + ncert_keywords via Gemini
 *  5. Embeds with Google text-embedding-004 (768 dims, free tier)
 *  6. Upserts into Supabase ncert_embeddings + updates fts_document
 *
 * Usage:
 *   node scripts/embed-ncert-chunks.mjs
 *   node scripts/embed-ncert-chunks.mjs --subject biology --dry-run
 *   node scripts/embed-ncert-chunks.mjs --book lebo1 --chapter 8
 */

import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Use createRequire to load CJS modules from ESM
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const pdfParse = require('pdf-parse');
const { Pool } = require('pg');

// ─── CLI Args ────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };
const DRY_RUN       = args.includes('--dry-run');
const FILTER_SUBJECT = getArg('--subject');
const FILTER_BOOK    = getArg('--book');
const FILTER_CHAPTER = getArg('--chapter') ? parseInt(getArg('--chapter')) : null;

// ─── Config ──────────────────────────────────────────────────────
const CHUNK_TARGET_WORDS = 280;    // MD Mod 2: 220-350 word target
const CHUNK_OVERLAP_WORDS = 42;    // ~15% overlap
const CONFIDENCE_THRESHOLD = 0.72; // MD Mod 6
const EMBED_MODEL  = 'gemini-embedding-2';
const EMBED_DIMS   = 3072;
const RATE_LIMIT_MS = 700;         // ~85 req/min, safe under 100 RPM free tier
const MAX_RETRIES   = 3;
const PIPELINE_VERSION = 'v1.0';
const CHUNKING_VERSION = 'v1.0';

// ─── Supabase via raw pg ──────────────────────────────────────────
const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(':5432/', ':6543/') + '?pgbouncer=true' : '';
const db = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false }, family: 4 });

// Support dynamic key rotation
let availableKeys = [];
let currentKeyIndex = 0;
let embedderInstance = null;
let taggerInstance = null;

function getAI() {
    if (availableKeys.length === 0) {
        availableKeys = Object.keys(process.env)
            .filter(k => k.startsWith('GEMINI_API_KEY'))
            .map(k => process.env[k])
            .filter(Boolean);
        if (availableKeys.length === 0) availableKeys.push('');
    }

    if (!embedderInstance) {
        const activeKey = availableKeys[currentKeyIndex];
        const genAI = new GoogleGenerativeAI(activeKey);
        embedderInstance = genAI.getGenerativeModel({ model: EMBED_MODEL });
        taggerInstance = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    }
    return { embedder: embedderInstance, tagger: taggerInstance };
}

function rotateKey() {
    if (availableKeys.length > 1) {
        currentKeyIndex = (currentKeyIndex + 1) % availableKeys.length;
        console.log(`\n🔄 [API Limits] Rotating to Gemini API Key #${currentKeyIndex + 1}...\n`);
        embedderInstance = null; // force re-init
        taggerInstance = null;
        return true;
    }
    return false;
}

// ─── Helpers ──────────────────────────────────────────────────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry(fn, retries = MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            const msg = err.message || '';
            const shouldRotate = msg.includes('429') || msg.includes('403') || msg.includes('Quota');
            
            if (shouldRotate && rotateKey()) {
                // If we hit quota/forbidden and successfully rotated to another key, retry immediately!
                continue;
            }

            if (i === retries - 1) throw err;
            const delay = 2000 * Math.pow(2, i);
            process.stdout.write(`  Retry ${i + 1}/${retries} after ${delay}ms: ${msg.split('\n')[0]}\n`);
            await sleep(delay);
        }
    }
}

/** Download PDF from ncert.nic.in with retry */
async function downloadPDF(url) {
    const cacheDir = path.join(__dirname, '../.ncert-cache');
    fs.mkdirSync(cacheDir, { recursive: true });
    const cacheFile = path.join(cacheDir, url.replace(/[^a-z0-9]/gi, '_') + '.pdf');

    if (fs.existsSync(cacheFile)) {
        console.log(`    [CACHE HIT] ${path.basename(cacheFile)}`);
        return fs.readFileSync(cacheFile);
    }

    return withRetry(async () => {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Educational Use; NEET Coaching Platform)' }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(cacheFile, buf);
        return buf;
    });
}

/** Smart chunker: targets 220-350 words with overlap */
function chunkText(text, targetWords = CHUNK_TARGET_WORDS, overlapWords = CHUNK_OVERLAP_WORDS) {
    const sentences = text
        .replace(/\s+/g, ' ')
        .replace(/([.!?])\s+/g, '$1\n')
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 20); // filter short fragments

    const chunks = [];
    let current = [];
    let wordCount = 0;
    let overlapBuffer = [];

    for (const sentence of sentences) {
        const words = sentence.split(' ');
        current.push(sentence);
        wordCount += words.length;

        if (wordCount >= targetWords) {
            const chunkText = current.join(' ');
            chunks.push(chunkText);

            // Carry over overlap for next chunk
            const allWords = chunkText.split(' ');
            overlapBuffer = allWords.slice(-overlapWords).join(' ').split('. ');
            current = overlapBuffer.filter(Boolean);
            wordCount = current.join(' ').split(' ').length;
        }
    }

    // Remaining text
    if (current.length > 0 && wordCount > 30) {
        chunks.push(current.join(' '));
    }

    return chunks.filter(c => c.split(' ').length >= 50); // min 50 words
}

/** Extract concept tags + NCERT keywords via Gemini */
async function extractMetadata(chunkText, chapterTitle, subject) {
    try {
        const prompt = `You are a NEET curriculum expert. Analyze this NCERT ${subject} text chunk from the chapter "${chapterTitle}".

Extract:
1. concept_tags: 3-6 specific biological/chemical/physical concepts as slug-format strings
2. ncert_keywords: 5-10 exact NCERT terminology words that NEET exams commonly test
3. difficulty_hint: 'easy', 'medium', or 'hard' based on NEET relevance
4. topic_slug: single slug for the most specific topic

Text: "${chunkText.substring(0, 800)}..."

Return ONLY valid JSON, no markdown:
{"concept_tags":["..."],"ncert_keywords":["..."],"difficulty_hint":"medium","topic_slug":"..."}`;

        const { tagger } = getAI();
        const result = await tagger.generateContent(prompt);
        const raw = result.response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(raw);
    } catch {
        return { concept_tags: [], ncert_keywords: [], difficulty_hint: 'medium', topic_slug: null };
    }
}

/** Embed text with Google Gemini */
async function embedChunk(text) {
    return withRetry(async () => {
        const { embedder } = getAI();
        const result = await embedder.embedContent({
            content: { parts: [{ text }], role: 'user' },
            taskType: 'RETRIEVAL_DOCUMENT',
        });
        return result.embedding.values; // float[] length 3072
    });
}

/** Upsert chunk into DB */
async function upsertChunk({ bookCode, chapterNumber, chunkIndex, chunkText, wordCount,
    subject, classLevel, chapterTitle, topicSlug, conceptTags, ncertKeywords,
    difficultyHint, sourceUrl, embedding }) {

    // Params: $1=bookCode $2=chapterNumber $3=chunkIndex $4=chunkText $5=wordCount
    //         $6=subject $7=classLevel $8=chapterTitle $9=topicSlug $10=conceptTags
    //         $11=ncertKeywords $12=difficultyHint $13=sourceUrl $14=embedding
    //         $15=embedModel $16=chunkingVersion $17=pipelineVersion

    await db.query(`
        INSERT INTO ncert_embeddings (
            book_code, chapter_number, chunk_index, chunk_text, chunk_word_count,
            subject, class_level, chapter_title, topic_slug, concept_tags,
            ncert_keywords, difficulty_hint, source_url,
            embedding, fts_document,
            embedding_model, chunking_version, pipeline_version
        ) VALUES (
            $1, $2::int, $3::int, $4, $5::int,
            $6, $7::int, $8, $9, $10::text[],
            $11::text[], $12, $13,
            $14::vector,
            setweight(to_tsvector('english', $8), 'A') ||
            setweight(to_tsvector('english', coalesce($9, '')), 'A') ||
            setweight(to_tsvector('english', $4), 'B'),
            $15, $16, $17
        )
        ON CONFLICT (book_code, chapter_number, chunk_index) DO UPDATE SET
            chunk_text       = EXCLUDED.chunk_text,
            chunk_word_count = EXCLUDED.chunk_word_count,
            topic_slug       = EXCLUDED.topic_slug,
            concept_tags     = EXCLUDED.concept_tags,
            ncert_keywords   = EXCLUDED.ncert_keywords,
            difficulty_hint  = EXCLUDED.difficulty_hint,
            embedding        = EXCLUDED.embedding,
            fts_document     = EXCLUDED.fts_document,
            updated_at       = NOW()
    `, [
        bookCode, chapterNumber, chunkIndex, chunkText, wordCount,
        subject, classLevel, chapterTitle, topicSlug || null,
        `{${(conceptTags || []).map(t => `"${t}"`).join(',')}}`,
        `{${(ncertKeywords || []).map(k => `"${k}"`).join(',')}}`,
        difficultyHint || 'medium', sourceUrl,
        `[${embedding.join(',')}]`,
        EMBED_MODEL, CHUNKING_VERSION, PIPELINE_VERSION
    ]);
}

// ─── MAIN ────────────────────────────────────────────────────────
async function main() {
    console.log('\n🚀 NCERT Embedding Pipeline — Enterprise v1.0');
    console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
    if (FILTER_SUBJECT) console.log(`   Filter: subject=${FILTER_SUBJECT}`);
    if (FILTER_BOOK)    console.log(`   Filter: book=${FILTER_BOOK}`);
    if (FILTER_CHAPTER) console.log(`   Filter: chapter=${FILTER_CHAPTER}`);

    // Check pgvector is enabled
    try {
        await db.query(`SELECT '[1,2,3]'::vector(3)`);
        console.log('   pgvector: OK');
    } catch (e) {
        console.error('❌ pgvector extension not enabled or error:', e.message);
        process.exit(1);
    }

    // Load NCERT book manifest
    const { NCERT_BOOKS } = await import('../lib/ncert-data.js');

    let totalChunks = 0, totalEmbedded = 0, totalSkipped = 0;

    for (const book of NCERT_BOOKS) {
        if (FILTER_SUBJECT && book.subject !== FILTER_SUBJECT) continue;
        if (FILTER_BOOK    && book.code   !== FILTER_BOOK)    continue;

        console.log(`\n📖 ${book.book} (Class ${book.class}, ${book.subject})`);

        for (const chapter of book.chapters) {
            if (FILTER_CHAPTER && chapter.ch !== FILTER_CHAPTER) continue;

            const url = `https://ncert.nic.in/textbook/pdf/${book.code}${String(chapter.ch).padStart(2, '0')}.pdf`;
            console.log(`\n  📄 Ch. ${chapter.ch}: ${chapter.title}`);
            console.log(`     URL: ${url}`);

            let pdfBuffer;
            try {
                pdfBuffer = await downloadPDF(url);
            } catch (e) {
                console.warn(`     ⚠️ Download failed: ${e.message} — skipping`);
                totalSkipped++;
                continue;
            }

            // Parse PDF text
            let pdfText;
            try {
                const parsed = await pdfParse(pdfBuffer);
                pdfText = parsed.text;
                if (!pdfText || pdfText.length < 200) {
                    console.warn(`     ⚠️ PDF text too short (${pdfText?.length} chars) — skipping`);
                    totalSkipped++;
                    continue;
                }
            } catch (e) {
                console.warn(`     ⚠️ PDF parse failed: ${e.message} — skipping`);
                totalSkipped++;
                continue;
            }

            // Chunk (MD Mod 2: 220-350 words)
            const chunks = chunkText(pdfText);
            console.log(`     Chunks: ${chunks.length} (avg ~${Math.round(chunks.reduce((s,c)=>s+c.split(' ').length,0)/chunks.length)} words)`);

            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const wordCount = chunk.split(' ').length;
                totalChunks++;

                process.stdout.write(`     [${i + 1}/${chunks.length}] Extracting metadata...`);

                // Extract structured metadata (MD Mod 1)
                let meta = { concept_tags: [], ncert_keywords: [], difficulty_hint: 'medium', topic_slug: null };
                if (!DRY_RUN) {
                    meta = await extractMetadata(chunk, chapter.title, book.subject);
                    // Safe default if tagging completely fails
                    if (!meta) meta = { concept_tags: [], ncert_keywords: [], difficulty_hint: 'medium', topic_slug: null };
                    await sleep(RATE_LIMIT_MS);
                }

                process.stdout.write(` Embedding...`);

                // Embed (Google Gemini)
                let embedding = new Array(EMBED_DIMS).fill(0); // placeholder for dry run
                if (!DRY_RUN) {
                    embedding = await embedChunk(chunk);
                    if (!embedding || !Array.isArray(embedding)) {
                        console.warn(`\n  ⚠️ Skipping chunk ${i + 1} — all keys exhausted or embedding failed.`);
                        continue;
                    }
                    await sleep(RATE_LIMIT_MS);
                }

                // Upsert
                if (!DRY_RUN) {
                    await upsertChunk({
                        bookCode: book.code,
                        chapterNumber: chapter.ch,
                        chunkIndex: i,
                        chunkText: chunk,
                        wordCount,
                        subject: book.subject,
                        classLevel: book.class,
                        chapterTitle: chapter.title,
                        topicSlug: meta.topic_slug,
                        conceptTags: meta.concept_tags,
                        ncertKeywords: meta.ncert_keywords,
                        difficultyHint: meta.difficulty_hint,
                        sourceUrl: url,
                        embedding
                    });
                    totalEmbedded++;
                }

                console.log(` ✓ (${wordCount}w, tags: ${meta.concept_tags.slice(0, 2).join(', ')})`);
            }
        }
    }

    // Final report
    console.log('\n' + '═'.repeat(60));
    console.log('📊 PIPELINE COMPLETE');
    console.log(`   Total chunks processed: ${totalChunks}`);
    console.log(`   Embedded & saved:       ${totalEmbedded}`);
    console.log(`   Skipped (errors):       ${totalSkipped}`);
    console.log(`   Mode:                   ${DRY_RUN ? 'DRY RUN (no DB writes)' : 'LIVE'}`);
    console.log('═'.repeat(60));

    await db.end();
}

main().catch(e => { console.error('❌ Fatal:', e); process.exit(1); });
