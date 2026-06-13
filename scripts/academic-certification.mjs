#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
require('dotenv').config({ path: path.join(process.cwd(), '.env.local'), override: true });

const CERTIFICATION_VERSION = 'academic-cert-v1';
const REPORT_ROOT = 'reports/academic-certification';

const LEVELS = [
    {
        number: 1,
        key: 'syllabusCompliance',
        name: 'Syllabus Compliance Certification',
        weight: 10,
        minSampleSize: 1,
        requiredMetrics: [
            'ncertAlignmentPct',
            'deletedChapterLeakagePct',
            'crossSubjectLeakagePct',
            'subjectClassificationAccuracyPct',
            'chapterClassificationAccuracyPct',
            'topicClassificationAccuracyPct',
        ],
        criteria: [
            'NCERT Alignment >= 98%',
            'Deleted Syllabus Leakage = 0%',
            'Cross Subject Leakage < 1%',
            'Subject, chapter, and topic classification >= 98%',
        ],
        score(metrics) {
            return average([
                metrics.ncertAlignmentPct,
                invertPct(metrics.deletedChapterLeakagePct),
                invertPct(metrics.crossSubjectLeakagePct),
                metrics.subjectClassificationAccuracyPct,
                metrics.chapterClassificationAccuracyPct,
                metrics.topicClassificationAccuracyPct,
            ]);
        },
        pass(metrics) {
            return number(metrics.ncertAlignmentPct) >= 98
                && number(metrics.deletedChapterLeakagePct) === 0
                && number(metrics.crossSubjectLeakagePct) < 1
                && number(metrics.subjectClassificationAccuracyPct) >= 98
                && number(metrics.chapterClassificationAccuracyPct) >= 98
                && number(metrics.topicClassificationAccuracyPct) >= 98;
        },
        recommendation: 'Run syllabus classification against official current NEET syllabus source, then quarantine any active content outside that boundary.',
    },
    {
        number: 2,
        key: 'questionQuality',
        name: 'Question Quality Certification',
        weight: 14,
        minSampleSize: 5000,
        requiredMetrics: [
            'accuracyPct',
            'ambiguityPct',
            'duplicateQuestionPct',
            'hallucinationPct',
            'invalidOptionPct',
            'difficultyCalibrationPct',
            'ncertGroundingPct',
        ],
        criteria: [
            'Sample size >= 5,000 generated questions',
            'Accuracy >= 97%',
            'Hallucination <= 1%',
            'Invalid Options <= 1%',
            'Duplicate Questions <= 2%',
        ],
        score(metrics) {
            return average([
                metrics.accuracyPct,
                invertPct(metrics.ambiguityPct),
                invertPct(metrics.duplicateQuestionPct),
                invertPct(metrics.hallucinationPct),
                invertPct(metrics.invalidOptionPct),
                metrics.difficultyCalibrationPct,
                metrics.ncertGroundingPct,
            ]);
        },
        pass(metrics, sampleSize) {
            return sampleSize >= 5000
                && number(metrics.accuracyPct) >= 97
                && number(metrics.hallucinationPct) <= 1
                && number(metrics.invalidOptionPct) <= 1
                && number(metrics.duplicateQuestionPct) <= 2;
        },
        recommendation: 'Generate and freeze a 5,000-question certification sample, then run automated validation plus faculty review before allowing production circulation.',
    },
    {
        number: 3,
        key: 'answerQuality',
        name: 'Answer Quality Certification',
        weight: 12,
        minSampleSize: 2000,
        requiredMetrics: [
            'answerAccuracyPct',
            'explanationAccuracyPct',
            'hallucinationPct',
            'referenceConsistencyPct',
            'scientificCorrectnessPct',
            'terminologyCorrectnessPct',
        ],
        criteria: [
            'Sample size >= 2,000 AI-generated answers',
            'Answer Accuracy >= 98%',
            'Hallucination <= 1%',
        ],
        score(metrics) {
            return average([
                metrics.answerAccuracyPct,
                metrics.explanationAccuracyPct,
                invertPct(metrics.hallucinationPct),
                metrics.referenceConsistencyPct,
                metrics.scientificCorrectnessPct,
                metrics.terminologyCorrectnessPct,
            ]);
        },
        pass(metrics, sampleSize) {
            return sampleSize >= 2000
                && number(metrics.answerAccuracyPct) >= 98
                && number(metrics.hallucinationPct) <= 1;
        },
        recommendation: 'Maintain a 2,000-answer benchmark set with answer key, NCERT source, model output, evaluator score, and replayable prompt/version evidence.',
    },
    {
        number: 4,
        key: 'doubtSolver',
        name: 'AI Doubt Solver Certification',
        weight: 10,
        minSampleSize: 1000,
        requiredMetrics: [
            'tutorAccuracyPct',
            'groundingPct',
            'hallucinationPct',
            'incompleteResponsePct',
            'conceptDepthPct',
            'simplicityPct',
            'safetyPct',
            'misconceptionDetectionPct',
            'falsePremiseDetectionPct',
            'ambiguityHandlingPct',
            'adversarialSafetyPct',
        ],
        criteria: [
            'Sample size >= 1,000 doubt-solving sessions',
            'Tutor Accuracy >= 97%',
            'Grounding >= 95%',
        ],
        score(metrics) {
            return average([
                metrics.tutorAccuracyPct,
                metrics.groundingPct,
                invertPct(metrics.hallucinationPct),
                invertPct(metrics.incompleteResponsePct),
                metrics.conceptDepthPct,
                metrics.simplicityPct,
                metrics.safetyPct,
                metrics.misconceptionDetectionPct,
                metrics.falsePremiseDetectionPct,
                metrics.ambiguityHandlingPct,
                metrics.adversarialSafetyPct,
            ]);
        },
        pass(metrics, sampleSize) {
            return sampleSize >= 1000
                && number(metrics.tutorAccuracyPct) >= 97
                && number(metrics.groundingPct) >= 95
                && number(metrics.adversarialSafetyPct) >= 95;
        },
        recommendation: 'Evaluate at least 1,000 real/seeded student doubt sessions plus adversarial prompts covering misconceptions, false premises, ambiguity, and unsafe assumptions.',
    },
    {
        number: 5,
        key: 'mockTest',
        name: 'Mock Test Certification',
        weight: 9,
        minSampleSize: 100,
        requiredMetrics: [
            'coverageScore',
            'difficultyCalibrationScore',
            'patternSimilarityScore',
            'questionUniquenessPct',
            'timeToCompleteRealismScore',
        ],
        criteria: [
            'Generated mock test sample size >= 100',
            'Similarity to NEET Pattern >= 90%',
        ],
        score(metrics) {
            return average([
                metrics.coverageScore,
                metrics.difficultyCalibrationScore,
                metrics.patternSimilarityScore,
                metrics.questionUniquenessPct,
                metrics.timeToCompleteRealismScore,
            ]);
        },
        pass(metrics, sampleSize) {
            return sampleSize >= 100 && number(metrics.patternSimilarityScore) >= 90;
        },
        recommendation: 'Sample custom, chapter, topic, PYQ, and full mock configurations; compare distribution against NEET blueprint and time realism.',
    },
    {
        number: 6,
        key: 'ragCertification',
        name: 'RAG Certification',
        weight: 10,
        minSampleSize: 1,
        requiredMetrics: [
            'top1PrecisionPct',
            'top5PrecisionPct',
            'groundingAccuracyPct',
            'corpusIntegrityPct',
            'wrongSubjectRetrievalPct',
            'wrongChapterRetrievalPct',
            'deletedContentRetrievalPct',
        ],
        criteria: [
            'Wrong Subject Retrieval < 1%',
            'Deleted Content Retrieval = 0%',
            'Corpus Integrity = 100%',
        ],
        score(metrics) {
            return average([
                metrics.top1PrecisionPct,
                metrics.top5PrecisionPct,
                metrics.groundingAccuracyPct,
                metrics.corpusIntegrityPct,
                invertPct(metrics.wrongSubjectRetrievalPct),
                invertPct(metrics.wrongChapterRetrievalPct),
                invertPct(metrics.deletedContentRetrievalPct),
            ]);
        },
        pass(metrics) {
            return number(metrics.wrongSubjectRetrievalPct) < 1
                && number(metrics.deletedContentRetrievalPct) === 0
                && number(metrics.corpusIntegrityPct) === 100;
        },
        recommendation: 'Run subject-wise retrieval probes after every embedding ingestion and store top-k source evidence, not only aggregate counts.',
    },
    {
        number: 7,
        key: 'facultyReview',
        name: 'Faculty and External Review Certification',
        weight: 9,
        minSampleSize: 1,
        requiredMetrics: [
            'facultyApprovalPct',
            'averageFacultyRating',
            'reviewerSubjectCoverageCount',
            'externalBoardCoverageCount',
            'externalBoardApprovalPct',
        ],
        criteria: [
            'Faculty Approval >= 95%',
            'Physics, Chemistry, and Biology reviewers represented',
        ],
        score(metrics) {
            return average([
                metrics.facultyApprovalPct,
                ratingToPct(metrics.averageFacultyRating),
                subjectCoverageToPct(metrics.reviewerSubjectCoverageCount),
                subjectCoverageToPct(metrics.externalBoardCoverageCount),
                metrics.externalBoardApprovalPct,
            ]);
        },
        pass(metrics) {
            return number(metrics.facultyApprovalPct) >= 95
                && number(metrics.reviewerSubjectCoverageCount) >= 3
                && number(metrics.externalBoardCoverageCount) >= 3
                && number(metrics.externalBoardApprovalPct) >= 95;
        },
        recommendation: 'Require separate internal faculty review plus independent external NEET Physics, Chemistry, and Biology sign-off before institutional certification is issued.',
    },
    {
        number: 8,
        key: 'studentOutcome',
        name: 'Student Outcome Certification',
        weight: 8,
        minSampleSize: 1,
        requiredMetrics: [
            'learningImpactScore',
            'averageImprovementPct',
            'retentionPct',
            'completionRatePct',
            'weakTopicRecoveryPct',
            'timeEfficiencyImprovementPct',
        ],
        criteria: [
            'Evidence-backed cohort outcome snapshot exists',
            'Learning Impact Score is calculated',
        ],
        score(metrics) {
            return numberOr(
                metrics.learningImpactScore,
                average([
                    boundedImprovement(metrics.averageImprovementPct),
                    metrics.retentionPct,
                    metrics.completionRatePct,
                    metrics.weakTopicRecoveryPct,
                    boundedImprovement(metrics.timeEfficiencyImprovementPct),
                ])
            );
        },
        pass(metrics, sampleSize) {
            return sampleSize > 0 && isFiniteNumber(metrics.learningImpactScore);
        },
        recommendation: 'Track a real cohort from diagnostic to follow-up tests so academic certification measures learning impact, not only content accuracy.',
    },
    {
        number: 9,
        key: 'academicGovernance',
        name: 'Academic Governance Certification',
        weight: 6,
        minSampleSize: 1,
        requiredMetrics: [
            'governanceCompliancePct',
            'embeddingDimensionsCorrectPct',
            'corpusVersionCoveragePct',
            'checksumCoveragePct',
            'auditTrailCompletenessPct',
        ],
        criteria: [
            'Governance Compliance = 100%',
            'Embedding dimensions, corpus versions, checksums, and audit trail complete',
        ],
        score(metrics) {
            return average([
                metrics.governanceCompliancePct,
                metrics.embeddingDimensionsCorrectPct,
                metrics.corpusVersionCoveragePct,
                metrics.checksumCoveragePct,
                metrics.auditTrailCompletenessPct,
            ]);
        },
        pass(metrics) {
            return number(metrics.governanceCompliancePct) === 100;
        },
        recommendation: 'Do not certify a corpus unless embedding dimensions, active syllabus version, source checksums, ingestion batch IDs, and audit trail are complete.',
    },
    {
        number: 10,
        key: 'neetBenchmark',
        name: 'NEET Pattern Benchmarking Certification',
        weight: 12,
        minSampleSize: 10,
        requiredMetrics: [
            'officialPaperCoverageCount',
            'ntaSamplePaperCoverageCount',
            'patternSimilarityPct',
            'bloomTaxonomySimilarityPct',
            'topicDistributionSimilarityPct',
            'difficultyDistributionSimilarityPct',
            'questionStyleSimilarityPct',
            'neetPatternAlignmentPct',
            'goldStandardQuestionBankSize',
        ],
        criteria: [
            'Last 10 years NEET papers represented',
            'NTA sample papers represented when available',
            'Official answer keys represented',
            'NEET Pattern Alignment >= 95%',
            'Certified question repository >= 10,000 manually verified questions',
        ],
        score(metrics) {
            return average([
                countToPct(metrics.officialPaperCoverageCount, 10),
                countToPct(metrics.ntaSamplePaperCoverageCount, 1),
                metrics.patternSimilarityPct,
                metrics.bloomTaxonomySimilarityPct,
                metrics.topicDistributionSimilarityPct,
                metrics.difficultyDistributionSimilarityPct,
                metrics.questionStyleSimilarityPct,
                metrics.neetPatternAlignmentPct,
                countToPct(metrics.goldStandardQuestionBankSize, 10000),
            ]);
        },
        pass(metrics, sampleSize) {
            return sampleSize >= 10
                && number(metrics.officialPaperCoverageCount) >= 10
                && number(metrics.ntaSamplePaperCoverageCount) >= 1
                && number(metrics.neetPatternAlignmentPct) >= 95
                && number(metrics.goldStandardQuestionBankSize) >= 10000;
        },
        recommendation: 'Build and maintain a NEET benchmark dataset from the last 10 years of official papers, NTA sample papers, official answer keys, and a 10,000-20,000 question manually verified gold-standard repository.',
    },
];

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

function printHelp() {
    console.log(`
Academic Certification Runner

Usage:
  node scripts/academic-certification.mjs --evidence path/to/evidence.json
  node scripts/academic-certification.mjs --live --store --evidence path/to/evidence.json
  node scripts/academic-certification.mjs --template

Options:
  --evidence <file>      JSON evidence file for the certification cycle.
  --cycle-id <id>        Stable cycle code. Defaults to academic-<timestamp>.
  --report-dir <dir>     Report output directory. Defaults to ${REPORT_ROOT}.
  --live                 Collect live DB governance snapshots using DATABASE_URL.
  --store                Store cycle, level results, and evidence in DB.
  --no-store             Do not write DB evidence even when --live is used.
  --template             Print an evidence JSON template.
`);
}

function evidenceTemplate() {
    return {
        certificationVersion: CERTIFICATION_VERSION,
        academicCorpusVersion: 'neet-current-YYYY-MM-DD',
        officialSyllabusVersion: 'official-neet-current',
        officialSyllabusSourceUrl: 'https://official-source.example/syllabus.pdf',
        syllabusSourceChecksum: 'sha256:<official-syllabus-file-checksum>',
        generatedBy: 'chief-academic-office',
        levels: Object.fromEntries(LEVELS.map((level) => [
            level.key,
            {
                sampleSize: level.minSampleSize,
                metrics: Object.fromEntries(level.requiredMetrics.map((metric) => [metric, null])),
                evidence: [
                    {
                        type: 'replace-with-real-evidence',
                        source: 'stored file, DB row, faculty review batch, or audit report',
                        hash: 'sha256:<evidence-hash>',
                    },
                ],
            },
        ])),
    };
}

function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
}

function numberOr(value, fallback = 0) {
    const parsed = number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function isFiniteNumber(value) {
    return Number.isFinite(number(value));
}

function clampPct(value) {
    if (!isFiniteNumber(value)) return null;
    return Math.max(0, Math.min(100, number(value)));
}

function invertPct(value) {
    if (!isFiniteNumber(value)) return null;
    return clampPct(100 - number(value));
}

function ratingToPct(value) {
    if (!isFiniteNumber(value)) return null;
    return clampPct((number(value) / 10) * 100);
}

function subjectCoverageToPct(value) {
    if (!isFiniteNumber(value)) return null;
    return clampPct((number(value) / 3) * 100);
}

function countToPct(value, target) {
    if (!isFiniteNumber(value)) return null;
    return clampPct((number(value) / target) * 100);
}

function boundedImprovement(value) {
    if (!isFiniteNumber(value)) return null;
    return clampPct(number(value) * 2);
}

function average(values) {
    const usable = values.map(clampPct).filter((value) => value !== null);
    if (usable.length === 0) return 0;
    return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

function round(value, digits = 2) {
    const parsed = number(value);
    if (!Number.isFinite(parsed)) return 0;
    return Number(parsed.toFixed(digits));
}

function sha256(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

function readEvidence(filePath) {
    if (!filePath) return {};
    const absolute = path.resolve(process.cwd(), filePath);
    const raw = fs.readFileSync(absolute, 'utf8');
    return JSON.parse(raw);
}

function mergeMetrics(liveDefaults, evidenceMetrics) {
    return {
        ...(liveDefaults || {}),
        ...(evidenceMetrics || {}),
    };
}

function evaluateLevel(level, evidence, liveDefaults) {
    const levelEvidence = evidence.levels?.[level.key] || evidence[level.key] || {};
    const metrics = mergeMetrics(liveDefaults[level.key], levelEvidence.metrics || {});
    const sampleSize = Math.trunc(numberOr(levelEvidence.sampleSize, metrics.sampleSize || 0));
    const findings = [];

    if (sampleSize < level.minSampleSize) {
        findings.push({
            severity: 'high',
            finding: `Sample size ${sampleSize} is below required minimum ${level.minSampleSize}.`,
        });
    }

    for (const metric of level.requiredMetrics) {
        if (!isFiniteNumber(metrics[metric])) {
            findings.push({
                severity: 'high',
                finding: `Required metric missing: ${metric}.`,
            });
        }
    }

    const rawScore = level.score(metrics);
    const score = round(rawScore);
    const passedCriteria = findings.length === 0 && level.pass(metrics, sampleSize);

    if (findings.length === 0 && !passedCriteria) {
        findings.push({
            severity: 'high',
            finding: 'One or more pass criteria were not met.',
        });
    }

    return {
        levelNumber: level.number,
        levelKey: level.key,
        levelName: level.name,
        status: passedCriteria ? 'pass' : 'fail',
        score,
        weight: level.weight,
        sampleSize,
        metrics,
        passCriteria: level.criteria,
        findings,
        evidenceRefs: levelEvidence.evidence || [],
        recommendation: level.recommendation,
    };
}

function calculateScore(results) {
    const totalWeight = results.reduce((sum, item) => sum + item.weight, 0);
    const weighted = results.reduce((sum, item) => sum + (item.score * item.weight), 0);
    return round(weighted / totalWeight);
}

function certificationLevel(score) {
    if (score >= 99) return 'platinum';
    if (score >= 98) return 'gold';
    if (score >= 95) return 'silver';
    if (score >= 90) return 'bronze';
    return 'none';
}

function formalVerdict(score, level, failedCount) {
    if (failedCount > 0 || level === 'none') {
        return `NOT ACADEMICALLY CERTIFIED. Score: ${score}/100. Blocking academic evidence gaps remain.`;
    }
    return `Based on syllabus validation, NEET benchmark comparison, independent faculty review, retrieval validation, question quality evaluation, answer verification, adversarial tutor testing, and student outcome analysis, the platform achieved an Academic Certification Score of ${score}/100 and is certified at the ${title(level)} level for NEET preparation support.`;
}

function title(value) {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function metricLine(metrics) {
    return Object.entries(metrics || {})
        .filter(([, value]) => value !== null && value !== undefined)
        .slice(0, 8)
        .map(([key, value]) => `${key}: ${typeof value === 'number' ? round(value) : value}`)
        .join('; ');
}

function renderReport({ cycle, results, score, level, verdict, liveSnapshot, evidenceHash }) {
    const failed = results.filter((item) => item.status === 'fail');
    const lines = [];

    lines.push('# NEET Coach Academic Quality Certification Report');
    lines.push('');
    lines.push(`Certification Date: ${cycle.completedAt}`);
    lines.push(`Certification Version: ${cycle.certificationVersion}`);
    lines.push(`Certification Cycle: ${cycle.cycleCode}`);
    lines.push(`Academic Corpus Version: ${cycle.academicCorpusVersion || 'not provided'}`);
    lines.push(`Official Syllabus Version: ${cycle.officialSyllabusVersion || 'not provided'}`);
    lines.push(`Official Syllabus Source: ${cycle.officialSyllabusSourceUrl || 'not provided'}`);
    lines.push(`Evidence Hash: ${evidenceHash}`);
    lines.push('');
    lines.push('## Executive Summary');
    lines.push('');
    lines.push(`Final Academic Certification Score: ${score}/100`);
    lines.push(`Certification Level: ${title(level)}`);
    lines.push(`Final Verdict: ${verdict}`);
    lines.push('');
    lines.push('This report does not claim that AI is accurate by default. It records whether the platform produced measurable, reproducible, evidence-backed academic validation across syllabus compliance, question quality, answer quality, tutor responses, mock tests, RAG retrieval, faculty review, student outcomes, and governance.');
    lines.push('');
    lines.push('## Final Scorecard');
    lines.push('');
    lines.push('| Level | Certification Area | Status | Score | Weight | Sample Size |');
    lines.push('|---:|---|---|---:|---:|---:|');
    for (const result of results) {
        lines.push(`| ${result.levelNumber} | ${result.levelName} | ${result.status.toUpperCase()} | ${result.score} | ${result.weight} | ${result.sampleSize} |`);
    }
    lines.push('');
    lines.push('## Level Findings');
    lines.push('');
    for (const result of results) {
        lines.push(`### Level ${result.levelNumber}: ${result.levelName}`);
        lines.push('');
        lines.push(`Status: ${result.status.toUpperCase()}`);
        lines.push(`Score: ${result.score}/100`);
        lines.push(`Key Metrics: ${metricLine(result.metrics) || 'no metrics recorded'}`);
        lines.push(`Pass Criteria: ${result.passCriteria.join(' | ')}`);
        if (result.findings.length === 0) {
            lines.push('Findings: none');
        } else {
            lines.push('Findings:');
            for (const finding of result.findings) {
                lines.push(`- ${finding.severity.toUpperCase()}: ${finding.finding}`);
            }
        }
        lines.push(`Recommendation: ${result.recommendation}`);
        lines.push('');
    }
    lines.push('## Risk Findings');
    lines.push('');
    if (failed.length === 0) {
        lines.push('No blocking academic risks were found in this certification cycle.');
    } else {
        for (const result of failed) {
            lines.push(`- Level ${result.levelNumber} (${result.levelName}) failed. Risk if unresolved: students, parents, schools, and partners cannot rely on academic accuracy claims for this area.`);
        }
    }
    lines.push('');
    lines.push('## Live Snapshot');
    lines.push('');
    lines.push('```json');
    lines.push(JSON.stringify(liveSnapshot || {}, null, 2));
    lines.push('```');
    lines.push('');
    lines.push('## Reproducibility Requirements');
    lines.push('');
    lines.push('- Keep the evidence JSON, generated report, raw faculty review batches, benchmark prompts, model versions, source checksums, and DB certification rows.');
    lines.push('- Re-run the same cycle after any syllabus update, embedding ingestion, question-generation prompt change, RAG model change, or major assessment-engine release.');
    lines.push('- Do not use this report for marketing unless every level is PASS and the formal verdict is certified.');
    lines.push('');
    return lines.join('\n');
}

async function tableExists(db, table) {
    const { rows } = await db.query('SELECT to_regclass($1) AS table_name', [`public.${table}`]);
    return Boolean(rows[0]?.table_name);
}

async function safeQuery(db, sql, params = []) {
    try {
        const { rows } = await db.query(sql, params);
        return { rows, error: null };
    } catch (error) {
        return { rows: [], error: error.message };
    }
}

async function collectLiveSnapshot(db) {
    const snapshot = {
        collectedAt: new Date().toISOString(),
        tables: {},
        levelDefaults: {},
        warnings: [],
    };

    const hasEmbeddings = await tableExists(db, 'ncert_embeddings');
    snapshot.tables.ncert_embeddings = hasEmbeddings;
    if (hasEmbeddings) {
        const columns = await safeQuery(db, `
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'ncert_embeddings'
        `);
        const columnSet = new Set(columns.rows.map((row) => row.column_name));
        const requiredColumns = [
            'syllabus_version',
            'ncert_edition',
            'ingestion_batch_id',
            'source_checksum',
            'is_current_syllabus',
            'deleted_from_current_syllabus',
            'corpus_status',
            'embedding',
        ];
        const columnPassCount = requiredColumns.filter((column) => columnSet.has(column)).length;

        const counts = await safeQuery(db, `
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

        const row = counts.rows[0] || {};
        const total = numberOr(row.total);
        const activeCurrent = numberOr(row.active_current);
        const activeViolations = numberOr(row.active_flag_violations);
        const missingMetadata = numberOr(row.missing_governance_metadata);
        const embeddingsPresent = numberOr(row.embeddings_present);
        const embeddings3072 = numberOr(row.embeddings_3072);

        const fn = await safeQuery(db, `
            SELECT pg_get_functiondef(p.oid) AS definition
            FROM pg_proc p
            JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname = 'hybrid_ncert_search'
            ORDER BY p.oid DESC
            LIMIT 1
        `);
        const fnDef = (fn.rows[0]?.definition || '').toLowerCase();
        const fnChecks = [
            fnDef.includes('is_current_syllabus'),
            fnDef.includes('deleted_from_current_syllabus'),
            fnDef.includes("corpus_status = 'active'"),
        ];

        const subjectCoverage = await safeQuery(db, `
            SELECT subject, COUNT(*)::int AS count
            FROM ncert_embeddings
            WHERE corpus_status = 'active'
              AND is_current_syllabus = TRUE
              AND deleted_from_current_syllabus = FALSE
            GROUP BY subject
        `);
        const subjects = new Set(subjectCoverage.rows.map((item) => String(item.subject || '').toLowerCase()));
        const subjectCoveragePassCount = ['physics', 'chemistry', 'biology'].filter((subject) => subjects.has(subject)).length;

        const checksumCoveragePct = activeCurrent > 0 ? ((activeCurrent - missingMetadata) / activeCurrent) * 100 : 0;
        const embeddingDimensionsCorrectPct = embeddingsPresent > 0 ? (embeddings3072 / embeddingsPresent) * 100 : 0;
        const governanceChecks = [
            columnPassCount / requiredColumns.length,
            activeCurrent > 0 ? 1 : 0,
            activeViolations === 0 ? 1 : 0,
            missingMetadata === 0 ? 1 : 0,
            embeddingDimensionsCorrectPct === 100 ? 1 : 0,
            subjectCoveragePassCount / 3,
            ...fnChecks.map((passed) => (passed ? 1 : 0)),
        ];
        const governanceCompliancePct = average(governanceChecks.map((value) => value * 100));

        snapshot.ragCorpus = {
            total,
            activeCurrent,
            activeViolations,
            missingMetadata,
            embeddingsPresent,
            embeddings3072,
            subjects: subjectCoverage.rows,
            hybridSearchFilterChecks: fnChecks,
        };

        snapshot.levelDefaults.syllabusCompliance = {
            deletedChapterLeakagePct: activeCurrent > 0 ? round((activeViolations / activeCurrent) * 100, 4) : null,
        };

        snapshot.levelDefaults.academicGovernance = {
            sampleSize: total,
            governanceCompliancePct: round(governanceCompliancePct),
            embeddingDimensionsCorrectPct: round(embeddingDimensionsCorrectPct),
            corpusVersionCoveragePct: columnSet.has('syllabus_version') ? checksumCoveragePct : 0,
            checksumCoveragePct: round(checksumCoveragePct),
            auditTrailCompletenessPct: round(governanceCompliancePct),
        };

        snapshot.levelDefaults.ragCertification = {
            corpusIntegrityPct: governanceCompliancePct === 100 ? 100 : round(governanceCompliancePct),
            deletedContentRetrievalPct: activeCurrent > 0 ? round((activeViolations / activeCurrent) * 100, 4) : null,
        };
    }

    const hasQuestions = await tableExists(db, 'questions');
    snapshot.tables.questions = hasQuestions;
    if (hasQuestions) {
        const q = await safeQuery(db, `
            WITH base AS (
                SELECT
                    id,
                    lower(trim(text)) AS normalized_text,
                    option_a, option_b, option_c, option_d,
                    correct_option
                FROM questions
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
                )::int AS duplicate_questions
            FROM base
        `);
        const row = q.rows[0] || {};
        const total = numberOr(row.total);
        const invalid = numberOr(row.invalid_options);
        const duplicates = numberOr(row.duplicate_questions);
        snapshot.questionBank = { total, invalid, duplicates };
        snapshot.levelDefaults.questionQuality = {
            sampleSize: total,
            invalidOptionPct: total > 0 ? round((invalid / total) * 100, 4) : null,
            duplicateQuestionPct: total > 0 ? round((duplicates / total) * 100, 4) : null,
        };
    }

    const hasQualityAudits = await tableExists(db, 'educational_quality_audits');
    snapshot.tables.educational_quality_audits = hasQualityAudits;
    if (hasQualityAudits) {
        const audits = await safeQuery(db, `
            SELECT DISTINCT ON (audit_type)
                audit_type,
                subject,
                sample_size,
                pass_count,
                warn_count,
                fail_count,
                hallucination_count,
                syllabus_leakage_count,
                wrong_answer_count,
                audited_at
            FROM educational_quality_audits
            ORDER BY audit_type, audited_at DESC
        `);
        snapshot.latestEducationalQualityAudits = audits.rows;
    }

    return snapshot;
}

async function storeCertification(db, cycle, results, score, level, verdict, reportPath, evidenceHash) {
    const requiredTables = [
        'academic_certification_cycles',
        'academic_certification_level_results',
        'academic_certification_evidence_items',
    ];
    for (const table of requiredTables) {
        if (!(await tableExists(db, table))) {
            throw new Error(`Missing evidence table ${table}. Apply scripts/migrations/006_academic_certification_program.sql first.`);
        }
    }

    const status = results.some((item) => item.status === 'fail') || level === 'none' ? 'failed' : 'passed';
    const cycleInsert = await db.query(`
        INSERT INTO academic_certification_cycles (
            cycle_code,
            certification_version,
            academic_corpus_version,
            official_syllabus_version,
            official_syllabus_source_url,
            syllabus_source_checksum,
            status,
            final_score,
            certification_level,
            verdict,
            report_path,
            evidence_hash,
            metadata,
            completed_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, NOW())
        ON CONFLICT (cycle_code) DO UPDATE SET
            status = EXCLUDED.status,
            final_score = EXCLUDED.final_score,
            certification_level = EXCLUDED.certification_level,
            verdict = EXCLUDED.verdict,
            report_path = EXCLUDED.report_path,
            evidence_hash = EXCLUDED.evidence_hash,
            metadata = EXCLUDED.metadata,
            completed_at = NOW()
        RETURNING id
    `, [
        cycle.cycleCode,
        cycle.certificationVersion,
        cycle.academicCorpusVersion || null,
        cycle.officialSyllabusVersion || 'not-provided',
        cycle.officialSyllabusSourceUrl || null,
        cycle.syllabusSourceChecksum || null,
        status,
        score,
        level,
        verdict,
        reportPath,
        evidenceHash,
        JSON.stringify(cycle.metadata || {}),
    ]);

    const cycleId = cycleInsert.rows[0].id;
    await db.query('DELETE FROM academic_certification_level_results WHERE cycle_id = $1', [cycleId]);
    await db.query('DELETE FROM academic_certification_evidence_items WHERE cycle_id = $1', [cycleId]);

    for (const result of results) {
        await db.query(`
            INSERT INTO academic_certification_level_results (
                cycle_id,
                level_number,
                level_key,
                level_name,
                status,
                score,
                weight,
                sample_size,
                metrics,
                pass_criteria,
                findings,
                evidence_refs
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11::jsonb, $12::jsonb)
        `, [
            cycleId,
            result.levelNumber,
            result.levelKey,
            result.levelName,
            result.status,
            result.score,
            result.weight,
            result.sampleSize,
            JSON.stringify(result.metrics),
            JSON.stringify(result.passCriteria),
            JSON.stringify(result.findings),
            JSON.stringify(result.evidenceRefs),
        ]);

        for (const evidenceRef of result.evidenceRefs || []) {
            await db.query(`
                INSERT INTO academic_certification_evidence_items (
                    cycle_id,
                    level_number,
                    evidence_type,
                    subject,
                    content_type,
                    content_id,
                    source_table,
                    source_id,
                    reviewer_role,
                    evaluator,
                    input_hash,
                    output_hash,
                    metrics,
                    raw_evidence
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14::jsonb)
            `, [
                cycleId,
                result.levelNumber,
                evidenceRef.type || 'certification-evidence',
                evidenceRef.subject || 'all',
                evidenceRef.contentType || null,
                evidenceRef.contentId || null,
                evidenceRef.sourceTable || null,
                evidenceRef.sourceId || null,
                evidenceRef.reviewerRole || null,
                evidenceRef.evaluator || null,
                evidenceRef.inputHash || evidenceRef.hash || null,
                evidenceRef.outputHash || null,
                JSON.stringify(result.metrics),
                JSON.stringify(evidenceRef),
            ]);
        }
    }

    return cycleId;
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help || args.h) {
        printHelp();
        return;
    }

    if (args.template) {
        console.log(JSON.stringify(evidenceTemplate(), null, 2));
        return;
    }

    const evidencePath = args.evidence || process.env.ACADEMIC_CERTIFICATION_EVIDENCE_FILE;
    const evidence = readEvidence(evidencePath);
    const evidenceHash = sha256(JSON.stringify(evidence));
    const live = Boolean(args.live);
    const store = Boolean(args.store || (live && !args['no-store']));
    const cycleCode = args['cycle-id'] || `academic-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;
    const reportDir = path.resolve(process.cwd(), args['report-dir'] || REPORT_ROOT);

    let db = null;
    let liveSnapshot = { levelDefaults: {}, warnings: ['Live DB snapshot not requested.'] };

    if (live || store) {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is required for --live or --store academic certification.');
        }
        db = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            family: 4,
        });
        if (live) {
            liveSnapshot = await collectLiveSnapshot(db);
        }
    }

    const cycle = {
        cycleCode,
        certificationVersion: evidence.certificationVersion || CERTIFICATION_VERSION,
        academicCorpusVersion: evidence.academicCorpusVersion || process.env.ACADEMIC_CORPUS_VERSION || null,
        officialSyllabusVersion: evidence.officialSyllabusVersion || process.env.OFFICIAL_SYLLABUS_VERSION || 'not-provided',
        officialSyllabusSourceUrl: evidence.officialSyllabusSourceUrl || process.env.OFFICIAL_SYLLABUS_SOURCE_URL || null,
        syllabusSourceChecksum: evidence.syllabusSourceChecksum || process.env.OFFICIAL_SYLLABUS_CHECKSUM || null,
        completedAt: new Date().toISOString(),
        metadata: {
            evidencePath: evidencePath || null,
            live,
            store,
        },
    };

    const results = LEVELS.map((level) => evaluateLevel(level, evidence, liveSnapshot.levelDefaults || {}));
    const score = calculateScore(results);
    const level = certificationLevel(score);
    const failedCount = results.filter((result) => result.status === 'fail').length;
    const verdict = formalVerdict(score, level, failedCount);

    fs.mkdirSync(reportDir, { recursive: true });
    const reportPath = path.join(reportDir, `${cycleCode}.md`);
    const jsonPath = path.join(reportDir, `${cycleCode}.json`);
    const report = renderReport({ cycle, results, score, level, verdict, liveSnapshot, evidenceHash });
    fs.writeFileSync(reportPath, report);
    fs.writeFileSync(jsonPath, JSON.stringify({ cycle, results, score, level, verdict, liveSnapshot, evidenceHash }, null, 2));

    let storedCycleId = null;
    try {
        if (store && db) {
            storedCycleId = await storeCertification(db, cycle, results, score, level, verdict, reportPath, evidenceHash);
        }
    } finally {
        await db?.end?.();
    }

    console.log('\nACADEMIC CERTIFICATION PROGRAM');
    console.log('------------------------------');
    console.log(`Cycle: ${cycleCode}`);
    console.log(`Score: ${score}/100`);
    console.log(`Level: ${title(level)}`);
    console.log(`Failed Levels: ${failedCount}`);
    console.log(`Report: ${reportPath}`);
    console.log(`JSON Evidence Summary: ${jsonPath}`);
    if (storedCycleId) console.log(`Stored DB Cycle ID: ${storedCycleId}`);
    console.log(`Verdict: ${verdict}`);

    process.exit(failedCount === 0 && level !== 'none' ? 0 : 1);
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
