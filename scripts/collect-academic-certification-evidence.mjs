#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
require('dotenv').config({ path: path.join(process.cwd(), '.env.local'), override: true });

function parseArgs(argv) {
    const parsed = {};
    for (let i = 0; i < argv.length; i += 1) {
        const token = argv[i];
        if (!token.startsWith('--')) continue;
        const key = token.slice(2);
        const next = argv[i + 1];
        if (!next || next.startsWith('--')) {
            parsed[key] = true;
        } else {
            parsed[key] = next;
            i += 1;
        }
    }
    return parsed;
}

function sha256(value) {
    return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function pct(numerator, denominator) {
    const den = number(denominator);
    if (den <= 0) return null;
    return Number(((number(numerator) / den) * 100).toFixed(4));
}

async function tableExists(db, table) {
    const { rows } = await db.query('SELECT to_regclass($1) AS table_name', [`public.${table}`]);
    return Boolean(rows[0]?.table_name);
}

async function hasColumn(db, table, column) {
    const { rows } = await db.query(`
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
          AND column_name = $2
        LIMIT 1
    `, [table, column]);
    return rows.length > 0;
}

async function safeQuery(db, label, sql, params = []) {
    try {
        const { rows } = await db.query(sql, params);
        return { label, rows, error: null };
    } catch (error) {
        return { label, rows: [], error: error.message };
    }
}

function evidenceRef(type, source, payload) {
    return {
        type,
        source,
        hash: `sha256:${sha256(payload)}`,
        capturedAt: new Date().toISOString(),
        summary: payload,
    };
}

function emptyLevel(sampleSize = 0) {
    return { sampleSize, metrics: {}, evidence: [] };
}

async function collectRagEvidence(db, evidence, snapshot) {
    if (!(await tableExists(db, 'ncert_embeddings'))) {
        snapshot.missingTables.push('ncert_embeddings');
        return;
    }

    const rag = await safeQuery(db, 'ncert_embeddings', `
        SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (
                WHERE corpus_status = 'active'
                  AND is_current_syllabus = TRUE
                  AND deleted_from_current_syllabus = FALSE
            )::int AS active_current,
            COUNT(*) FILTER (
                WHERE corpus_status = 'active'
                  AND (
                    is_current_syllabus IS DISTINCT FROM TRUE
                    OR deleted_from_current_syllabus IS DISTINCT FROM FALSE
                  )
            )::int AS active_flag_violations,
            COUNT(*) FILTER (
                WHERE corpus_status = 'active'
                  AND (
                    syllabus_version IS NULL
                    OR ncert_edition IS NULL
                    OR ingestion_batch_id IS NULL
                    OR source_checksum IS NULL
                  )
            )::int AS missing_governance_metadata,
            COUNT(*) FILTER (WHERE embedding IS NOT NULL)::int AS embeddings_present,
            COUNT(*) FILTER (WHERE embedding IS NOT NULL AND vector_dims(embedding) = 3072)::int AS embeddings_3072
        FROM ncert_embeddings
    `);
    const row = rag.rows[0] || {};
    const total = number(row.total);
    const activeCurrent = number(row.active_current);
    const activeViolations = number(row.active_flag_violations);
    const missingMetadata = number(row.missing_governance_metadata);
    const embeddingsPresent = number(row.embeddings_present);
    const embeddings3072 = number(row.embeddings_3072);

    const subjectCoverage = await safeQuery(db, 'ncert_subject_coverage', `
        SELECT subject, COUNT(*)::int AS count
        FROM ncert_embeddings
        WHERE corpus_status = 'active'
          AND is_current_syllabus = TRUE
          AND deleted_from_current_syllabus = FALSE
        GROUP BY subject
        ORDER BY subject
    `);

    const activeFlagLeakagePct = pct(activeViolations, activeCurrent);
    const checksumCoveragePct = activeCurrent > 0 ? Number((((activeCurrent - missingMetadata) / activeCurrent) * 100).toFixed(4)) : null;
    const embeddingDimensionsCorrectPct = pct(embeddings3072, embeddingsPresent);
    const governanceCompliancePct = [
        activeCurrent > 0 ? 100 : 0,
        activeViolations === 0 ? 100 : 0,
        missingMetadata === 0 ? 100 : 0,
        embeddingDimensionsCorrectPct ?? 0,
        checksumCoveragePct ?? 0,
    ].reduce((sum, value) => sum + value, 0) / 5;

    const payload = {
        total,
        activeCurrent,
        activeViolations,
        missingMetadata,
        embeddingsPresent,
        embeddings3072,
        subjectCoverage: subjectCoverage.rows,
    };
    snapshot.rag = payload;

    evidence.levels.syllabusCompliance.sampleSize = activeCurrent;
    evidence.levels.syllabusCompliance.metrics.deletedChapterLeakagePct = activeFlagLeakagePct;
    evidence.levels.syllabusCompliance.evidence.push(evidenceRef('db-rag-syllabus-snapshot', 'ncert_embeddings', payload));

    evidence.levels.ragCertification.sampleSize = activeCurrent;
    evidence.levels.ragCertification.metrics.corpusIntegrityPct = Number(governanceCompliancePct.toFixed(2));
    evidence.levels.ragCertification.metrics.deletedContentRetrievalPct = activeFlagLeakagePct;
    evidence.levels.ragCertification.evidence.push(evidenceRef('db-rag-corpus-snapshot', 'ncert_embeddings', payload));

    evidence.levels.academicGovernance.sampleSize = total;
    evidence.levels.academicGovernance.metrics.governanceCompliancePct = Number(governanceCompliancePct.toFixed(2));
    evidence.levels.academicGovernance.metrics.embeddingDimensionsCorrectPct = embeddingDimensionsCorrectPct;
    evidence.levels.academicGovernance.metrics.corpusVersionCoveragePct = checksumCoveragePct;
    evidence.levels.academicGovernance.metrics.checksumCoveragePct = checksumCoveragePct;
    evidence.levels.academicGovernance.metrics.auditTrailCompletenessPct = Number(governanceCompliancePct.toFixed(2));
    evidence.levels.academicGovernance.evidence.push(evidenceRef('db-academic-governance-snapshot', 'ncert_embeddings', payload));
}

async function collectQuestionEvidence(db, evidence, snapshot) {
    if (!(await tableExists(db, 'questions'))) {
        snapshot.missingTables.push('questions');
        return;
    }

    const hasAiGenerated = await hasColumn(db, 'questions', 'is_ai_generated');
    const questionFilter = hasAiGenerated ? "WHERE COALESCE(is_ai_generated::text, '') IN ('1', 'true', 't')" : '';

    const questionStats = await safeQuery(db, 'questions', `
        WITH base AS (
            SELECT
                id,
                lower(regexp_replace(trim(text), '\\s+', ' ', 'g')) AS normalized_text,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_option,
                difficulty,
                explanation,
                verification_status,
                confidence_score,
                quality_score
            FROM questions
            ${questionFilter}
        ),
        duplicate_texts AS (
            SELECT normalized_text
            FROM base
            GROUP BY normalized_text
            HAVING COUNT(*) > 1
        )
        SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (
                WHERE correct_option NOT IN ('A', 'B', 'C', 'D')
                   OR option_a IS NULL OR option_a = ''
                   OR option_b IS NULL OR option_b = ''
                   OR option_c IS NULL OR option_c = ''
                   OR option_d IS NULL OR option_d = ''
            )::int AS invalid_options,
            COUNT(*) FILTER (
                WHERE normalized_text IN (SELECT normalized_text FROM duplicate_texts)
            )::int AS duplicate_questions,
            COUNT(*) FILTER (
                WHERE explanation IS NOT NULL AND length(trim(explanation)) >= 30
            )::int AS questions_with_explanations,
            COUNT(*) FILTER (
                WHERE verification_status IN ('teacher_verified', 'verified', 'ai_reviewed')
            )::int AS verified_questions,
            COUNT(*) FILTER (
                WHERE verification_status IN ('rejected', 'quarantined')
            )::int AS rejected_or_quarantined,
            AVG(NULLIF(quality_score, 0)) AS avg_quality_score,
            AVG(NULLIF(confidence_score, 0)) AS avg_confidence_score
        FROM base
    `);

    const row = questionStats.rows[0] || {};
    const total = number(row.total);
    const invalid = number(row.invalid_options);
    const duplicates = number(row.duplicate_questions);
    const withExplanations = number(row.questions_with_explanations);

    const payload = {
        generatedQuestionFilter: questionFilter || 'all questions (is_ai_generated column missing)',
        total,
        invalidOptions: invalid,
        duplicateQuestions: duplicates,
        questionsWithExplanations: withExplanations,
        verifiedQuestions: number(row.verified_questions),
        rejectedOrQuarantined: number(row.rejected_or_quarantined),
        avgQualityScore: row.avg_quality_score === null ? null : Number(Number(row.avg_quality_score).toFixed(2)),
        avgConfidenceScore: row.avg_confidence_score === null ? null : Number(Number(row.avg_confidence_score).toFixed(2)),
    };
    snapshot.questions = payload;

    evidence.levels.questionQuality.sampleSize = total;
    evidence.levels.questionQuality.metrics.invalidOptionPct = pct(invalid, total);
    evidence.levels.questionQuality.metrics.duplicateQuestionPct = pct(duplicates, total);
    evidence.levels.questionQuality.evidence.push(evidenceRef('db-question-bank-snapshot', 'questions', payload));

    evidence.levels.answerQuality.sampleSize = Math.max(evidence.levels.answerQuality.sampleSize || 0, withExplanations);
    evidence.levels.answerQuality.evidence.push(evidenceRef('db-question-explanation-snapshot', 'questions', payload));
}

async function collectAnswerEvidence(db, evidence, snapshot) {
    if (!(await tableExists(db, 'rag_explanations'))) {
        snapshot.missingTables.push('rag_explanations');
        return;
    }

    const stats = await safeQuery(db, 'rag_explanations', `
        SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE explanation_text IS NOT NULL AND length(trim(explanation_text)) >= 30)::int AS usable_explanations,
            COUNT(*) FILTER (WHERE source_chunk_ids IS NOT NULL AND cardinality(source_chunk_ids) > 0)::int AS cited_explanations,
            COUNT(*) FILTER (WHERE passed_confidence_gate = TRUE)::int AS passed_confidence_gate,
            COUNT(*) FILTER (WHERE grounding_mode = 'insufficient')::int AS insufficient_grounding,
            COUNT(*) FILTER (WHERE review_status IN ('approved', 'rejected'))::int AS reviewed,
            COUNT(*) FILTER (WHERE review_status = 'approved')::int AS approved,
            COUNT(*) FILTER (WHERE review_status = 'rejected')::int AS rejected,
            AVG(confidence_score) AS avg_confidence_score
        FROM rag_explanations
    `);

    const row = stats.rows[0] || {};
    const total = number(row.total);
    const usable = number(row.usable_explanations);
    const cited = number(row.cited_explanations);
    const insufficient = number(row.insufficient_grounding);
    const reviewed = number(row.reviewed);
    const approved = number(row.approved);

    const payload = {
        total,
        usableExplanations: usable,
        citedExplanations: cited,
        passedConfidenceGate: number(row.passed_confidence_gate),
        insufficientGrounding: insufficient,
        reviewed,
        approved,
        rejected: number(row.rejected),
        avgConfidenceScore: row.avg_confidence_score === null ? null : Number(Number(row.avg_confidence_score).toFixed(4)),
    };
    snapshot.ragExplanations = payload;

    evidence.levels.answerQuality.sampleSize = Math.max(evidence.levels.answerQuality.sampleSize || 0, usable);
    evidence.levels.answerQuality.metrics.referenceConsistencyPct = pct(cited, usable);
    if (reviewed >= 2000) {
        const approvalPct = pct(approved, reviewed);
        evidence.levels.answerQuality.metrics.answerAccuracyPct = approvalPct;
        evidence.levels.answerQuality.metrics.explanationAccuracyPct = approvalPct;
        evidence.levels.answerQuality.metrics.scientificCorrectnessPct = approvalPct;
        evidence.levels.answerQuality.metrics.terminologyCorrectnessPct = approvalPct;
        evidence.levels.answerQuality.metrics.hallucinationPct = pct(number(row.rejected), reviewed);
    }
    evidence.levels.answerQuality.evidence.push(evidenceRef('db-rag-explanation-snapshot', 'rag_explanations', payload));

    evidence.levels.ragCertification.metrics.groundingAccuracyPct = pct(cited - insufficient, usable);
    evidence.levels.ragCertification.evidence.push(evidenceRef('db-rag-explanation-grounding-snapshot', 'rag_explanations', payload));
}

async function collectDoubtEvidence(db, evidence, snapshot) {
    if (!(await tableExists(db, 'doubt_messages'))) {
        snapshot.missingTables.push('doubt_messages');
        return;
    }

    const stats = await safeQuery(db, 'doubt_messages', `
        SELECT
            COUNT(*) FILTER (WHERE role = 'assistant')::int AS assistant_responses,
            COUNT(*) FILTER (WHERE role = 'user')::int AS user_messages,
            COUNT(DISTINCT conversation_id)::int AS conversations
        FROM doubt_messages
    `);
    const payload = stats.rows[0] || {};
    snapshot.doubts = payload;

    evidence.levels.doubtSolver.sampleSize = number(payload.assistant_responses);
    evidence.levels.doubtSolver.evidence.push(evidenceRef('db-doubt-solver-snapshot', 'doubt_messages', payload));
}

async function collectMockEvidence(db, evidence, snapshot) {
    if (!(await tableExists(db, 'tests'))) {
        snapshot.missingTables.push('tests');
        return;
    }

    const stats = await safeQuery(db, 'tests', `
        SELECT
            COUNT(*)::int AS total_tests,
            COUNT(*) FILTER (WHERE type IN ('custom', 'topic', 'chapter', 'mock', 'practice', 'pyq'))::int AS generated_or_practice_tests,
            COUNT(*) FILTER (WHERE type = 'mock')::int AS full_mock_tests,
            COUNT(*) FILTER (WHERE type IN ('topic', 'chapter', 'custom'))::int AS focused_tests,
            AVG(NULLIF(total_questions, 0)) AS avg_questions,
            AVG(NULLIF(time_taken_seconds, 0)) AS avg_time_seconds
        FROM tests
    `);
    const payload = stats.rows[0] || {};
    snapshot.tests = payload;

    evidence.levels.mockTest.sampleSize = number(payload.generated_or_practice_tests);
    evidence.levels.mockTest.evidence.push(evidenceRef('db-mock-test-snapshot', 'tests', payload));
}

async function collectFacultyEvidence(db, evidence, snapshot) {
    if (await tableExists(db, 'academic_faculty_review_items')) {
        const stats = await safeQuery(db, 'academic_faculty_review_items', `
            SELECT
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE approved = TRUE)::int AS approved,
                COUNT(DISTINCT subject)::int AS subject_coverage,
                AVG((accuracy_score + relevance_score + difficulty_score + exam_usefulness_score) / 4.0) AS avg_rating
            FROM academic_faculty_review_items
        `);
        const row = stats.rows[0] || {};
        const total = number(row.total);
        const payload = {
            total,
            approved: number(row.approved),
            subjectCoverage: number(row.subject_coverage),
            avgRating: row.avg_rating === null ? null : Number(Number(row.avg_rating).toFixed(2)),
        };
        snapshot.facultyReview = payload;
        evidence.levels.facultyReview.sampleSize = total;
        evidence.levels.facultyReview.metrics.facultyApprovalPct = pct(payload.approved, total);
        evidence.levels.facultyReview.metrics.averageFacultyRating = payload.avgRating;
        evidence.levels.facultyReview.metrics.reviewerSubjectCoverageCount = payload.subjectCoverage;
        evidence.levels.facultyReview.evidence.push(evidenceRef('db-faculty-review-snapshot', 'academic_faculty_review_items', payload));
    }

    if (await tableExists(db, 'teacher_review_queue')) {
        const stats = await safeQuery(db, 'teacher_review_queue', `
            SELECT
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved,
                COUNT(*) FILTER (WHERE verdict = 'correct_as_is')::int AS approved,
                COUNT(*) FILTER (WHERE verdict IN ('needs_correction', 'remove'))::int AS rejected
            FROM teacher_review_queue
        `);
        const payload = stats.rows[0] || {};
        snapshot.teacherReviewQueue = payload;
        evidence.levels.facultyReview.sampleSize = Math.max(
            evidence.levels.facultyReview.sampleSize || 0,
            number(payload.resolved)
        );
        evidence.levels.facultyReview.evidence.push(evidenceRef('db-teacher-review-queue-snapshot', 'teacher_review_queue', payload));
    }

    if (await tableExists(db, 'academic_external_review_signoffs')) {
        const external = await safeQuery(db, 'academic_external_review_signoffs', `
            SELECT
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE approval_status IN ('approved', 'approved_with_observations'))::int AS approved,
                COUNT(DISTINCT subject)::int AS subject_coverage,
                AVG(average_rating) AS avg_rating
            FROM academic_external_review_signoffs
        `);
        const row = external.rows[0] || {};
        const total = number(row.total);
        const payload = {
            total,
            approved: number(row.approved),
            subjectCoverage: number(row.subject_coverage),
            avgRating: row.avg_rating === null ? null : Number(Number(row.avg_rating).toFixed(2)),
        };
        snapshot.externalReviewBoard = payload;
        evidence.levels.facultyReview.metrics.externalBoardCoverageCount = payload.subjectCoverage;
        evidence.levels.facultyReview.metrics.externalBoardApprovalPct = pct(payload.approved, total);
        if (!evidence.levels.facultyReview.metrics.averageFacultyRating && payload.avgRating !== null) {
            evidence.levels.facultyReview.metrics.averageFacultyRating = payload.avgRating;
        }
        evidence.levels.facultyReview.evidence.push(evidenceRef('db-external-review-board-snapshot', 'academic_external_review_signoffs', payload));
    }
}

async function collectOutcomeEvidence(db, evidence, snapshot) {
    if (await tableExists(db, 'academic_student_outcome_snapshots')) {
        const stats = await safeQuery(db, 'academic_student_outcome_snapshots', `
            SELECT
                COUNT(*)::int AS snapshots,
                SUM(sample_size)::int AS sample_size,
                AVG(accuracy_improvement_pct) AS avg_improvement,
                AVG(weak_topic_recovery_pct) AS weak_topic_recovery,
                AVG(time_efficiency_improvement_pct) AS time_efficiency,
                AVG(retention_pct) AS retention,
                AVG(completion_rate_pct) AS completion,
                AVG(
                    COALESCE(accuracy_improvement_pct, 0) * 2
                    + COALESCE(weak_topic_recovery_pct, 0)
                    + COALESCE(time_efficiency_improvement_pct, 0) * 2
                    + COALESCE(retention_pct, 0)
                    + COALESCE(completion_rate_pct, 0)
                ) / 7.0 AS learning_impact_score
            FROM academic_student_outcome_snapshots
        `);
        const row = stats.rows[0] || {};
        const payload = {
            snapshots: number(row.snapshots),
            sampleSize: number(row.sample_size),
            avgImprovement: row.avg_improvement === null ? null : Number(Number(row.avg_improvement).toFixed(2)),
            weakTopicRecovery: row.weak_topic_recovery === null ? null : Number(Number(row.weak_topic_recovery).toFixed(2)),
            timeEfficiency: row.time_efficiency === null ? null : Number(Number(row.time_efficiency).toFixed(2)),
            retention: row.retention === null ? null : Number(Number(row.retention).toFixed(2)),
            completion: row.completion === null ? null : Number(Number(row.completion).toFixed(2)),
            learningImpactScore: row.learning_impact_score === null ? null : Number(Number(row.learning_impact_score).toFixed(2)),
        };
        snapshot.studentOutcomes = payload;
        evidence.levels.studentOutcome.sampleSize = payload.sampleSize;
        evidence.levels.studentOutcome.metrics.learningImpactScore = payload.learningImpactScore;
        evidence.levels.studentOutcome.metrics.averageImprovementPct = payload.avgImprovement;
        evidence.levels.studentOutcome.metrics.retentionPct = payload.retention;
        evidence.levels.studentOutcome.metrics.completionRatePct = payload.completion;
        evidence.levels.studentOutcome.metrics.weakTopicRecoveryPct = payload.weakTopicRecovery;
        evidence.levels.studentOutcome.metrics.timeEfficiencyImprovementPct = payload.timeEfficiency;
        evidence.levels.studentOutcome.evidence.push(evidenceRef('db-student-outcome-snapshot', 'academic_student_outcome_snapshots', payload));
    }
}

async function collectAdversarialEvidence(db, evidence, snapshot) {
    if (!(await tableExists(db, 'academic_adversarial_evaluation_items'))) {
        snapshot.missingTables.push('academic_adversarial_evaluation_items');
        return;
    }

    const stats = await safeQuery(db, 'academic_adversarial_evaluation_items', `
        SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE passed = TRUE)::int AS passed,
            COUNT(*) FILTER (WHERE misconception_detected = TRUE)::int AS misconception_detected,
            COUNT(*) FILTER (WHERE false_premise_detected = TRUE)::int AS false_premise_detected,
            COUNT(*) FILTER (WHERE ambiguity_handled = TRUE)::int AS ambiguity_handled,
            COUNT(*) FILTER (WHERE safety_preserved = TRUE)::int AS safety_preserved,
            COUNT(DISTINCT scenario_type)::int AS scenario_coverage,
            COUNT(DISTINCT subject)::int AS subject_coverage
        FROM academic_adversarial_evaluation_items
    `);
    const row = stats.rows[0] || {};
    const total = number(row.total);
    const payload = {
        total,
        passed: number(row.passed),
        misconceptionDetected: number(row.misconception_detected),
        falsePremiseDetected: number(row.false_premise_detected),
        ambiguityHandled: number(row.ambiguity_handled),
        safetyPreserved: number(row.safety_preserved),
        scenarioCoverage: number(row.scenario_coverage),
        subjectCoverage: number(row.subject_coverage),
    };
    snapshot.adversarialAcademic = payload;

    if (total > 0) {
        evidence.levels.doubtSolver.metrics.misconceptionDetectionPct = pct(payload.misconceptionDetected, total);
        evidence.levels.doubtSolver.metrics.falsePremiseDetectionPct = pct(payload.falsePremiseDetected, total);
        evidence.levels.doubtSolver.metrics.ambiguityHandlingPct = pct(payload.ambiguityHandled, total);
        evidence.levels.doubtSolver.metrics.adversarialSafetyPct = pct(payload.safetyPreserved, total);
        evidence.levels.doubtSolver.evidence.push(evidenceRef('db-adversarial-academic-snapshot', 'academic_adversarial_evaluation_items', payload));
    }
}

async function collectNeetBenchmarkEvidence(db, evidence, snapshot) {
    const hasRuns = await tableExists(db, 'neet_benchmark_certification_runs');
    const hasPapers = await tableExists(db, 'neet_benchmark_papers');
    const hasGoldBank = await tableExists(db, 'certified_question_repository');

    if (!hasRuns) snapshot.missingTables.push('neet_benchmark_certification_runs');
    if (!hasPapers) snapshot.missingTables.push('neet_benchmark_papers');
    if (!hasGoldBank) snapshot.missingTables.push('certified_question_repository');

    const latestRun = hasRuns
        ? await safeQuery(db, 'neet_benchmark_certification_runs', `
            SELECT
                official_paper_count,
                nta_sample_paper_count,
                generated_mock_count,
                pattern_similarity_pct,
                bloom_similarity_pct,
                topic_distribution_similarity_pct,
                difficulty_distribution_similarity_pct,
                question_style_similarity_pct,
                alignment_pct,
                evidence,
                created_at
            FROM neet_benchmark_certification_runs
            ORDER BY created_at DESC
            LIMIT 1
        `)
        : { rows: [] };

    const papers = hasPapers
        ? await safeQuery(db, 'neet_benchmark_papers', `
            SELECT
                COUNT(*) FILTER (WHERE paper_type = 'neet_official')::int AS official_papers,
                COUNT(*) FILTER (WHERE paper_type = 'nta_sample')::int AS nta_sample_papers,
                COUNT(*) FILTER (WHERE paper_type = 'official_answer_key')::int AS official_answer_keys,
                COUNT(DISTINCT paper_year)::int AS year_coverage
            FROM neet_benchmark_papers
        `)
        : { rows: [] };

    const goldBank = hasGoldBank
        ? await safeQuery(db, 'certified_question_repository', `
            SELECT
                COUNT(*) FILTER (WHERE verification_status = 'verified')::int AS verified_questions,
                COUNT(DISTINCT subject) FILTER (WHERE verification_status = 'verified')::int AS subject_coverage,
                COUNT(*) FILTER (WHERE source_type = 'official_pyq' AND verification_status = 'verified')::int AS official_pyq_questions,
                COUNT(*) FILTER (WHERE source_type = 'faculty_verified' AND verification_status = 'verified')::int AS faculty_verified_questions
            FROM certified_question_repository
        `)
        : { rows: [] };

    const run = latestRun.rows[0] || {};
    const paper = papers.rows[0] || {};
    const bank = goldBank.rows[0] || {};
    const officialPaperCount = Math.max(number(run.official_paper_count), number(paper.official_papers));
    const ntaSamplePaperCount = Math.max(number(run.nta_sample_paper_count), number(paper.nta_sample_papers));
    const goldBankSize = number(bank.verified_questions);

    const payload = {
        latestRun: run,
        papers: paper,
        goldBank: bank,
        officialPaperCount,
        ntaSamplePaperCount,
        goldBankSize,
    };
    snapshot.neetBenchmark = payload;

    evidence.levels.neetBenchmark.sampleSize = officialPaperCount;
    evidence.levels.neetBenchmark.metrics.officialPaperCoverageCount = officialPaperCount;
    evidence.levels.neetBenchmark.metrics.ntaSamplePaperCoverageCount = ntaSamplePaperCount;
    evidence.levels.neetBenchmark.metrics.patternSimilarityPct = run.pattern_similarity_pct === undefined ? null : number(run.pattern_similarity_pct);
    evidence.levels.neetBenchmark.metrics.bloomTaxonomySimilarityPct = run.bloom_similarity_pct === undefined ? null : number(run.bloom_similarity_pct);
    evidence.levels.neetBenchmark.metrics.topicDistributionSimilarityPct = run.topic_distribution_similarity_pct === undefined ? null : number(run.topic_distribution_similarity_pct);
    evidence.levels.neetBenchmark.metrics.difficultyDistributionSimilarityPct = run.difficulty_distribution_similarity_pct === undefined ? null : number(run.difficulty_distribution_similarity_pct);
    evidence.levels.neetBenchmark.metrics.questionStyleSimilarityPct = run.question_style_similarity_pct === undefined ? null : number(run.question_style_similarity_pct);
    evidence.levels.neetBenchmark.metrics.neetPatternAlignmentPct = run.alignment_pct === undefined ? null : number(run.alignment_pct);
    evidence.levels.neetBenchmark.metrics.goldStandardQuestionBankSize = goldBankSize;
    evidence.levels.neetBenchmark.evidence.push(evidenceRef('db-neet-benchmark-snapshot', 'neet_benchmark_certification_runs/neet_benchmark_papers/certified_question_repository', payload));
}

function createBaseEvidence(args) {
    return {
        certificationVersion: 'academic-cert-v1',
        academicCorpusVersion: args['corpus-version'] || process.env.ACADEMIC_CORPUS_VERSION || 'not-provided',
        officialSyllabusVersion: args['syllabus-version'] || process.env.OFFICIAL_SYLLABUS_VERSION || 'not-provided',
        officialSyllabusSourceUrl: args['syllabus-url'] || process.env.OFFICIAL_SYLLABUS_SOURCE_URL || null,
        syllabusSourceChecksum: args['syllabus-checksum'] || process.env.OFFICIAL_SYLLABUS_CHECKSUM || null,
        generatedBy: 'academic-certification-evidence-collector',
        generatedAt: new Date().toISOString(),
        levels: {
            syllabusCompliance: emptyLevel(),
            questionQuality: emptyLevel(),
            answerQuality: emptyLevel(),
            doubtSolver: emptyLevel(),
            mockTest: emptyLevel(),
            ragCertification: emptyLevel(),
            facultyReview: emptyLevel(),
            studentOutcome: emptyLevel(),
            academicGovernance: emptyLevel(),
            neetBenchmark: emptyLevel(),
        },
    };
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is required to collect academic certification evidence.');
    }

    const outPath = path.resolve(
        process.cwd(),
        args.out || `reports/academic-certification/evidence-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}.json`
    );

    const db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        family: 4,
    });

    const evidence = createBaseEvidence(args);
    const snapshot = {
        collectedAt: new Date().toISOString(),
        missingTables: [],
    };

    try {
        await collectRagEvidence(db, evidence, snapshot);
        await collectQuestionEvidence(db, evidence, snapshot);
        await collectAnswerEvidence(db, evidence, snapshot);
        await collectDoubtEvidence(db, evidence, snapshot);
        await collectMockEvidence(db, evidence, snapshot);
        await collectFacultyEvidence(db, evidence, snapshot);
        await collectOutcomeEvidence(db, evidence, snapshot);
        await collectAdversarialEvidence(db, evidence, snapshot);
        await collectNeetBenchmarkEvidence(db, evidence, snapshot);
    } finally {
        await db.end();
    }

    evidence.databaseSnapshot = snapshot;
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(evidence, null, 2));

    const answerSample = evidence.levels.answerQuality.sampleSize || 0;
    const reviewedAnswers = snapshot.ragExplanations?.reviewed || 0;
    const questionSample = evidence.levels.questionQuality.sampleSize || 0;
    const ragSample = evidence.levels.ragCertification.sampleSize || 0;

    console.log('\nACADEMIC CERTIFICATION EVIDENCE COLLECTED');
    console.log('-----------------------------------------');
    console.log(`Evidence file: ${outPath}`);
    console.log(`Question sample: ${questionSample}`);
    console.log(`Answer/explanation sample: ${answerSample}`);
    console.log(`Human-reviewed RAG answers: ${reviewedAnswers}`);
    console.log(`Active RAG chunks: ${ragSample}`);
    if (answerSample >= 2000) {
        console.log('Answer sample size gate: PASS (>= 2000 explanations found)');
    } else {
        console.log('Answer sample size gate: FAIL (< 2000 explanations found)');
    }
    if (reviewedAnswers < 2000) {
        console.log('Accuracy proof note: fewer than 2000 reviewed answers found, so answer accuracy cannot be certified from DB evidence alone.');
    }
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
