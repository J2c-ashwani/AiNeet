#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
require('dotenv').config({ path: path.join(process.cwd(), '.env.local'), override: true });

const SUBJECTS = new Set(['physics', 'chemistry', 'biology']);
const SCENARIOS = new Set([
    'wrong_premise',
    'mixed_concept',
    'misleading_wording',
    'trick_question',
    'ambiguous_question',
    'out_of_syllabus_probe',
    'unsafe_study_advice',
]);

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i += 1) {
        const key = argv[i];
        if (!key.startsWith('--')) continue;
        const next = argv[i + 1];
        args[key.slice(2)] = !next || next.startsWith('--') ? true : next;
        if (next && !next.startsWith('--')) i += 1;
    }
    return args;
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function hasRealText(value, min = 8) {
    if (typeof value !== 'string') return false;
    const text = value.trim();
    if (text.length < min) return false;
    return !/(placeholder|dummy|fake|seeded|sample only|verification code|canonical chapter)/i.test(text);
}

function hasEvidenceHash(value) {
    return typeof value === 'string' && /^sha256:[a-f0-9]{32,}$/i.test(value.trim());
}

function asJson(value) {
    return JSON.stringify(value || {});
}

function readBundle(file) {
    assert(file, 'Usage: node scripts/import-academic-certified-evidence.mjs --file <verified-evidence-bundle.json> --cycle-id <cycle-code>');
    const absolute = path.resolve(process.cwd(), file);
    assert(fs.existsSync(absolute), `Evidence bundle not found: ${absolute}`);
    return JSON.parse(fs.readFileSync(absolute, 'utf8'));
}

function validateBundle(bundle) {
    assert(bundle && typeof bundle === 'object', 'Evidence bundle must be a JSON object.');
    assert(hasRealText(bundle.evidenceOwner || '', 3), 'Bundle requires evidenceOwner.');
    assert(hasEvidenceHash(bundle.bundleHash), 'Bundle requires bundleHash in sha256:<hash> format.');

    for (const item of bundle.externalReviewBoardMembers || []) {
        assert(hasRealText(item.fullName), 'External board member requires fullName.');
        assert(SUBJECTS.has(item.subject), `Invalid external board subject: ${item.subject}`);
        assert(item.independenceAttestation === true, `External board member ${item.fullName} must have independenceAttestation=true.`);
        assert(hasRealText(item.credentialSummary, 20), `External board member ${item.fullName} requires credentialSummary.`);
    }

    for (const item of bundle.externalReviewSignoffs || []) {
        assert(hasRealText(item.reviewerName), 'External signoff requires reviewerName.');
        assert(SUBJECTS.has(item.subject), `Invalid signoff subject: ${item.subject}`);
        assert(['approved', 'approved_with_observations', 'rejected'].includes(item.approvalStatus), 'Invalid external signoff approvalStatus.');
        assert(Number(item.reviewedSampleSize || 0) > 0, 'External signoff requires reviewedSampleSize > 0.');
        assert(hasEvidenceHash(item.signatureHash) || hasRealText(item.signedReportUrl || '', 12), 'External signoff requires signatureHash or signedReportUrl.');
    }

    for (const item of bundle.certifiedQuestionRepository || []) {
        assert(SUBJECTS.has(item.subject), `Invalid certified question subject: ${item.subject}`);
        assert(hasRealText(item.chapterTitle), 'Certified question requires chapterTitle.');
        assert(hasRealText(item.questionText, 30), 'Certified question requires real questionText.');
        assert(['A', 'B', 'C', 'D'].includes(item.correctOption), 'Certified question requires correctOption A-D.');
        assert(hasRealText(item.explanation, 40), 'Certified question requires real explanation.');
        assert(['easy', 'medium', 'hard'].includes(item.difficulty), 'Certified question requires difficulty easy/medium/hard.');
        assert(['faculty_verified', 'official_pyq', 'ncert_derived', 'benchmark_seed'].includes(item.sourceType), 'Invalid certified question sourceType.');
        assert(hasRealText(item.sourceReference || '', 8), 'Certified question requires sourceReference.');
        assert(hasEvidenceHash(item.sourceChecksum), 'Certified question requires sourceChecksum.');
        assert(hasRealText(item.reviewerName || '', 3), 'Certified question requires reviewerName.');
    }

    for (const item of bundle.adversarialEvaluationItems || []) {
        assert(!item.subject || SUBJECTS.has(item.subject), `Invalid adversarial subject: ${item.subject}`);
        assert(SCENARIOS.has(item.scenarioType), `Invalid adversarial scenarioType: ${item.scenarioType}`);
        assert(hasRealText(item.promptText, 20), 'Adversarial item requires promptText.');
        assert(hasRealText(item.expectedBehavior, 20), 'Adversarial item requires expectedBehavior.');
        assert(hasRealText(item.modelResponse || '', 20), 'Adversarial item requires modelResponse.');
        assert(hasRealText(item.evaluator || '', 3), 'Adversarial item requires evaluator.');
    }

    for (const item of bundle.neetBenchmarkPapers || []) {
        assert(Number(item.paperYear) >= 2010, 'NEET benchmark paper requires paperYear >= 2010.');
        assert(['neet_official', 'nta_sample', 'official_answer_key'].includes(item.paperType), 'Invalid NEET benchmark paperType.');
        assert(hasRealText(item.sourceUrl || '', 12), 'NEET benchmark paper requires sourceUrl.');
        assert(hasEvidenceHash(item.sourceChecksum), 'NEET benchmark paper requires sourceChecksum.');
    }

    for (const item of bundle.neetBenchmarkCertificationRuns || []) {
        assert(Number(item.officialPaperCount || 0) >= 10, 'NEET benchmark run requires officialPaperCount >= 10.');
        assert(Number(item.alignmentPct || 0) > 0, 'NEET benchmark run requires alignmentPct.');
        assert(item.evidence && Object.keys(item.evidence).length > 0, 'NEET benchmark run requires evidence object.');
    }
}

async function ensureCycle(client, cycleCode, bundle) {
    const { rows } = await client.query(`
        INSERT INTO academic_certification_cycles (
            cycle_code,
            certification_version,
            academic_corpus_version,
            official_syllabus_version,
            official_syllabus_source_url,
            syllabus_source_checksum,
            status,
            metadata
        )
        VALUES ($1, 'academic-cert-v1', $2, $3, $4, $5, 'running', $6::jsonb)
        ON CONFLICT (cycle_code) DO UPDATE SET
            academic_corpus_version = COALESCE(EXCLUDED.academic_corpus_version, academic_certification_cycles.academic_corpus_version),
            official_syllabus_version = COALESCE(EXCLUDED.official_syllabus_version, academic_certification_cycles.official_syllabus_version),
            official_syllabus_source_url = COALESCE(EXCLUDED.official_syllabus_source_url, academic_certification_cycles.official_syllabus_source_url),
            syllabus_source_checksum = COALESCE(EXCLUDED.syllabus_source_checksum, academic_certification_cycles.syllabus_source_checksum),
            metadata = academic_certification_cycles.metadata || EXCLUDED.metadata
        RETURNING id
    `, [
        cycleCode,
        bundle.academicCorpusVersion || null,
        bundle.officialSyllabusVersion || 'not-provided',
        bundle.officialSyllabusSourceUrl || null,
        bundle.syllabusSourceChecksum || null,
        asJson({ importedEvidenceOwner: bundle.evidenceOwner, importedBundleHash: bundle.bundleHash }),
    ]);
    return rows[0].id;
}

async function importBundle(client, cycleId, bundle) {
    for (const item of bundle.externalReviewBoardMembers || []) {
        await client.query(`
            INSERT INTO academic_external_review_board_members (
                full_name, subject, affiliation, years_neet_experience,
                credential_summary, independence_attestation,
                conflict_of_interest_statement, active
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,COALESCE($8,true))
        `, [
            item.fullName,
            item.subject,
            item.affiliation || null,
            item.yearsNeetExperience || null,
            item.credentialSummary,
            item.independenceAttestation,
            item.conflictOfInterestStatement || null,
            item.active,
        ]);
    }

    for (const item of bundle.externalReviewSignoffs || []) {
        await client.query(`
            INSERT INTO academic_external_review_signoffs (
                cycle_id, reviewer_name, subject, approval_status, reviewed_sample_size,
                average_rating, signed_report_url, signature_hash, observations
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        `, [
            cycleId,
            item.reviewerName,
            item.subject,
            item.approvalStatus,
            item.reviewedSampleSize,
            item.averageRating || null,
            item.signedReportUrl || null,
            item.signatureHash || null,
            item.observations || null,
        ]);
    }

    for (const item of bundle.facultyReviewItems || []) {
        await client.query(`
            INSERT INTO academic_faculty_review_items (
                cycle_id, subject, content_type, content_id, reviewer_name, reviewer_role,
                accuracy_score, relevance_score, difficulty_score, exam_usefulness_score,
                approved, notes, evidence
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb)
        `, [
            cycleId,
            item.subject,
            item.contentType || 'question',
            item.contentId,
            item.reviewerName,
            item.reviewerRole || 'neet_faculty',
            item.accuracyScore,
            item.relevanceScore,
            item.difficultyScore,
            item.examUsefulnessScore,
            item.approved === true,
            item.notes || null,
            asJson(item.evidence || { bundleHash: bundle.bundleHash }),
        ]);
    }

    for (const item of bundle.studentOutcomeSnapshots || []) {
        await client.query(`
            INSERT INTO academic_student_outcome_snapshots (
                cycle_id, cohort_name, sample_size, diagnostic_avg, followup_avg,
                accuracy_improvement_pct, weak_topic_recovery_pct,
                time_efficiency_improvement_pct, retention_pct, completion_rate_pct, evidence
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb)
        `, [
            cycleId,
            item.cohortName,
            item.sampleSize,
            item.diagnosticAvg || null,
            item.followupAvg || null,
            item.accuracyImprovementPct || null,
            item.weakTopicRecoveryPct || null,
            item.timeEfficiencyImprovementPct || null,
            item.retentionPct || null,
            item.completionRatePct || null,
            asJson(item.evidence || { bundleHash: bundle.bundleHash }),
        ]);
    }

    for (const item of bundle.adversarialEvaluationItems || []) {
        await client.query(`
            INSERT INTO academic_adversarial_evaluation_items (
                cycle_id, subject, scenario_type, prompt_text, expected_behavior, model_response,
                passed, misconception_detected, false_premise_detected, ambiguity_handled,
                safety_preserved, evaluator, evidence
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb)
        `, [
            cycleId,
            item.subject || null,
            item.scenarioType,
            item.promptText,
            item.expectedBehavior,
            item.modelResponse,
            item.passed === true,
            item.misconceptionDetected === true,
            item.falsePremiseDetected === true,
            item.ambiguityHandled === true,
            item.safetyPreserved === true,
            item.evaluator,
            asJson(item.evidence || { bundleHash: bundle.bundleHash }),
        ]);
    }

    for (const item of bundle.neetBenchmarkPapers || []) {
        await client.query(`
            INSERT INTO neet_benchmark_papers (
                paper_year, paper_type, source_url, source_checksum, total_questions, metadata
            )
            VALUES ($1,$2,$3,$4,$5,$6::jsonb)
            ON CONFLICT (paper_year, paper_type) DO UPDATE SET
                source_url = EXCLUDED.source_url,
                source_checksum = EXCLUDED.source_checksum,
                total_questions = EXCLUDED.total_questions,
                metadata = EXCLUDED.metadata
        `, [
            item.paperYear,
            item.paperType,
            item.sourceUrl,
            item.sourceChecksum,
            item.totalQuestions || null,
            asJson(item.metadata || { bundleHash: bundle.bundleHash }),
        ]);
    }

    for (const item of bundle.certifiedQuestionRepository || []) {
        await client.query(`
            INSERT INTO certified_question_repository (
                subject, class_level, chapter_title, topic_slug, question_text,
                option_a, option_b, option_c, option_d, correct_option,
                explanation, difficulty, bloom_level, neet_style_tags,
                source_type, source_reference, source_checksum,
                reviewer_name, reviewer_subject, verification_status, verified_at
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::text[],$15,$16,$17,$18,$19,'verified',NOW())
        `, [
            item.subject,
            item.classLevel || null,
            item.chapterTitle,
            item.topicSlug || null,
            item.questionText,
            item.optionA,
            item.optionB,
            item.optionC,
            item.optionD,
            item.correctOption,
            item.explanation,
            item.difficulty,
            item.bloomLevel || null,
            item.neetStyleTags || [],
            item.sourceType,
            item.sourceReference,
            item.sourceChecksum,
            item.reviewerName,
            item.reviewerSubject || item.subject,
        ]);
    }

    for (const item of bundle.neetBenchmarkCertificationRuns || []) {
        await client.query(`
            INSERT INTO neet_benchmark_certification_runs (
                cycle_id, benchmark_window_years, official_paper_count,
                nta_sample_paper_count, generated_mock_count, pattern_similarity_pct,
                bloom_similarity_pct, topic_distribution_similarity_pct,
                difficulty_distribution_similarity_pct, question_style_similarity_pct,
                alignment_pct, evidence
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)
        `, [
            cycleId,
            item.benchmarkWindowYears || 10,
            item.officialPaperCount,
            item.ntaSamplePaperCount || 0,
            item.generatedMockCount || 0,
            item.patternSimilarityPct || null,
            item.bloomSimilarityPct || null,
            item.topicDistributionSimilarityPct || null,
            item.difficultyDistributionSimilarityPct || null,
            item.questionStyleSimilarityPct || null,
            item.alignmentPct,
            asJson(item.evidence),
        ]);
    }
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    assert(process.env.DATABASE_URL, 'DATABASE_URL is required.');
    const bundle = readBundle(args.file);
    validateBundle(bundle);

    const cycleCode = args['cycle-id'] || bundle.cycleCode || `academic-import-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;
    const db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        family: 4,
    });

    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const cycleId = await ensureCycle(client, cycleCode, bundle);
        await importBundle(client, cycleId, bundle);
        await client.query('COMMIT');
        console.log('\nACADEMIC CERTIFIED EVIDENCE IMPORTED');
        console.log('------------------------------------');
        console.log(`Cycle: ${cycleCode}`);
        console.log(`Cycle ID: ${cycleId}`);
        console.log(`Bundle owner: ${bundle.evidenceOwner}`);
        console.log(`Bundle hash: ${bundle.bundleHash}`);
        console.log('No synthetic evidence was generated.');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
        await db.end();
    }
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
