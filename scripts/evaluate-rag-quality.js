import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const { Pool } = require('pg');
import { generateNCERTGroundedExplanation } from '../lib/rag_engine.js';
import fs from 'fs';

const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(':5432/', ':6543/') + '?pgbouncer=true' : '';
const db = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false }, family: 4 });

const SAMPLE_SIZE = parseInt(process.argv[2] || '10', 10);
const SUBJECT = process.argv[3] || 'biology';

async function runEvaluation() {
    console.log(`🧪 Running Academic Validation Suite for RAG System`);
    console.log(`   Target Subject: ${SUBJECT}`);
    console.log(`   Sample Size: ${SAMPLE_SIZE} questions\n`);

    // Fetch random questions
    const { rows: questions } = await db.query(`
        SELECT q.*, s.name as subject_name, c.name as chapter_title, c.order_index as chapter_number, c.class_level
        FROM questions q
        JOIN subjects s ON q.subject_id = s.id
        LEFT JOIN chapters c ON q.chapter_id = c.id
        WHERE s.name ILIKE $1
        ORDER BY RANDOM()
        LIMIT $2
    `, [SUBJECT, SAMPLE_SIZE]);

    if (questions.length === 0) {
        console.error(`❌ No questions found for subject: ${SUBJECT}. Please ensure database is seeded.`);
        process.exit(1);
    }

    const report = {
        totalEvaluated: questions.length,
        highConfidence: 0,
        ncertGrounded: 0,
        moderateConfidence: 0,
        needsVerification: 0,
        insufficientFallback: 0,
        avgSimilarity: 0,
        avgDriftScore: 0,
        avgComprehensionScore: 0,
        failures: [],
        results: []
    };

    let similaritySum = 0;
    let driftSum = 0;
    let comprehensionSum = 0;

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        process.stdout.write(`Evaluating [${i + 1}/${questions.length}]: ID ${q.id} ... `);
        
        try {
            const result = await generateNCERTGroundedExplanation({
                question: q,
                subject: q.subject_name,
                chapterTitle: q.chapter_title || '',
                chapterNumber: q.chapter_number,
                classLevel: q.class_level,
                persistToDB: false // Do not pollute production DB during evaluation
            });

            const passStatus = result.confident ? '✅ PASS' : '⚠️ WARN';
            console.log(`${passStatus} (${result.confidenceBand}, sim: ${result.topSimilarity.toFixed(3)}, drift: ${result.driftScore}, comp: ${result.comprehensionScore})`);

            // Update stats
            if (result.confidenceBand === 'High Confidence') report.highConfidence++;
            if (result.confidenceBand === 'NCERT Grounded') report.ncertGrounded++;
            if (result.confidenceBand === 'Moderate Confidence') report.moderateConfidence++;
            if (result.confidenceBand === 'Needs Verification') report.needsVerification++;
            if (result.groundingMode === 'insufficient') report.insufficientFallback++;

            similaritySum += result.topSimilarity;
            driftSum += result.driftScore || 0;
            comprehensionSum += result.comprehensionScore || 0;

            report.results.push({
                questionId: q.id,
                text: q.text,
                chapter: q.chapter_title,
                confidenceBand: result.confidenceBand,
                similarity: result.topSimilarity,
                driftScore: result.driftScore,
                comprehensionScore: result.comprehensionScore,
                explanationPreview: result.explanation.substring(0, 100) + '...'
            });

        } catch (err) {
            console.log(`❌ ERROR`);
            report.failures.push({
                questionId: q.id,
                error: err.message
            });
        }
    }

    report.avgSimilarity = (similaritySum / questions.length).toFixed(4);
    report.avgDriftScore = (driftSum / questions.length).toFixed(2);
    report.avgComprehensionScore = (comprehensionSum / questions.length).toFixed(2);

    console.log('\n=========================================');
    console.log('📊 ACADEMIC VALIDATION REPORT');
    console.log('=========================================');
    console.log(`Total Tested:           ${report.totalEvaluated}`);
    console.log(`Average Similarity:     ${report.avgSimilarity}`);
    console.log(`Average Drift Score:    ${report.avgDriftScore} (Lower is better)`);
    console.log(`Average Comprehension:  ${report.avgComprehensionScore} (Higher is better)`);
    console.log(`\n--- Confidence Distribution ---`);
    console.log(`High Confidence (>0.85):     ${report.highConfidence}  (${((report.highConfidence/report.totalEvaluated)*100).toFixed(1)}%)`);
    console.log(`NCERT Grounded (>0.75):      ${report.ncertGrounded}  (${((report.ncertGrounded/report.totalEvaluated)*100).toFixed(1)}%)`);
    console.log(`Moderate Confidence (>0.65): ${report.moderateConfidence}  (${((report.moderateConfidence/report.totalEvaluated)*100).toFixed(1)}%)`);
    console.log(`Needs Verification (<0.65):  ${report.needsVerification}  (${((report.needsVerification/report.totalEvaluated)*100).toFixed(1)}%)`);
    console.log(`\nInsufficient Fallbacks:      ${report.insufficientFallback}  (Expected when retrieval fails or is weak)`);
    console.log(`System Errors:               ${report.failures.length}`);

    // Save report to file
    const reportPath = path.join(__dirname, `../rag_validation_report_${SUBJECT}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📝 Detailed report saved to: ${reportPath}`);

    db.end();
}

runEvaluation();
