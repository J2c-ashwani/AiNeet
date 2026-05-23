#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
require('dotenv').config({ path: path.join(process.cwd(), '.env.local'), override: true });

const args = new Set(process.argv.slice(2));
const live = args.has('--live');
const windowDays = Number(process.env.SCALE_WINDOW_DAYS || 7);

const thresholds = {
    minUptimePct: Number(process.env.SCALE_MIN_UPTIME_PCT || 99.5),
    minUptimeSamplesPerService: Number(process.env.SCALE_MIN_UPTIME_SAMPLES_PER_SERVICE || 24),
    maxSevereIncidents: Number(process.env.SCALE_MAX_SEVERE_INCIDENTS || 0),
    minPayments: Number(process.env.SCALE_MIN_PAYMENT_COUNT || 1),
    maxPaymentFailureRate: Number(process.env.SCALE_MAX_PAYMENT_FAILURE_RATE || 0.03),
    minAiRequests: Number(process.env.SCALE_MIN_AI_REQUESTS || 20),
    maxAiFailureRate: Number(process.env.SCALE_MAX_AI_FAILURE_RATE || 0.05),
    maxCostVarianceRatio: Number(process.env.SCALE_MAX_COST_VARIANCE_RATIO || 0.35),
    minCostSnapshotsPerProvider: Number(process.env.SCALE_MIN_COST_SNAPSHOTS_PER_PROVIDER || 3),
    maxRagFailures: Number(process.env.SCALE_MAX_RAG_FAILURES || 0),
    maxSyllabusLeakage: Number(process.env.SCALE_MAX_SYLLABUS_LEAKAGE || 0),
    maxWrongAnswers: Number(process.env.SCALE_MAX_WRONG_ANSWERS || 0),
    maxOpenQualityReviews: Number(process.env.SCALE_MAX_OPEN_QUALITY_REVIEWS || 0),
};

const requiredDocs = [
    'docs/observability-and-alerting.md',
    'docs/payment-production-drill.md',
    'docs/load-and-reliability-certification.md',
    'docs/rollback-drill-record.md',
    'docs/soft-launch-and-scale-expansion.md',
    'docs/support-and-incident-system.md',
];

const requiredStaticFiles = [
    'scripts/migrations/004_scale_readiness_evidence.sql',
    'scripts/load-test/neet-season-simulation.js',
    'scripts/validate-rag-governance.mjs',
    'scripts/validate-retrieval.mjs',
    'scripts/audit-payments.js',
];

const results = [];

function addResult(category, name, passed, details = {}) {
    results.push({ category, name, passed, details });
}

function fileExists(relativePath) {
    return fs.existsSync(path.join(process.cwd(), relativePath));
}

function requireStaticProof() {
    for (const doc of requiredDocs) {
        addResult('Static proof', `Required scale document: ${doc}`, fileExists(doc));
    }

    for (const file of requiredStaticFiles) {
        addResult('Static proof', `Required scale artifact: ${file}`, fileExists(file));
    }

    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    addResult('Static proof', 'Package script test:load exists', Boolean(pkg.scripts?.['test:load']));
    addResult('Static proof', 'Package script test:rag-live exists', Boolean(pkg.scripts?.['test:rag-live']));
    addResult('Static proof', 'Package script certify:scale exists', Boolean(pkg.scripts?.['certify:scale']));
}

async function tableExists(db, table) {
    const { rows } = await db.query('SELECT to_regclass($1) AS table_name', [`public.${table}`]);
    return Boolean(rows[0]?.table_name);
}

async function requireTables(db, tables) {
    for (const table of tables) {
        addResult('Schema', `Evidence table exists: ${table}`, await tableExists(db, table));
    }
}

async function queryValue(db, sql, params = []) {
    const { rows } = await db.query(sql, params);
    return rows[0] || {};
}

function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

async function certifyReliability(db) {
    const requiredServices = ['homepage', 'login', 'api_health', 'ai', 'payments'];
    for (const service of requiredServices) {
        const row = await queryValue(db, `
            SELECT
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE status = 'up')::int AS up,
                COALESCE(ROUND(
                    100.0 * COUNT(*) FILTER (WHERE status = 'up') / NULLIF(COUNT(*), 0),
                    3
                ), 0) AS uptime_pct,
                COALESCE(percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms), 0) AS p95_ms
            FROM uptime_checks
            WHERE service = $1
              AND checked_at >= NOW() - ($2::int * INTERVAL '1 day')
        `, [service, windowDays]);

        const total = number(row.total);
        const uptimePct = number(row.uptime_pct);
        addResult('Reliability', `${service} uptime stable`, total >= thresholds.minUptimeSamplesPerService && uptimePct >= thresholds.minUptimePct, {
            total,
            uptimePct,
            p95Ms: number(row.p95_ms),
            threshold: thresholds.minUptimePct,
        });
    }

    const incidents = await queryValue(db, `
        SELECT COUNT(*)::int AS count
        FROM operational_incidents
        WHERE severity IN ('critical', 'high')
          AND opened_at >= NOW() - ($1::int * INTERVAL '1 day')
          AND status <> 'resolved'
    `, [windowDays]);
    addResult('Reliability', 'No unresolved severe incidents', number(incidents.count) <= thresholds.maxSevereIncidents, {
        unresolvedSevereIncidents: number(incidents.count),
    });
}

async function certifyPayments(db) {
    const stats = await queryValue(db, `
        SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
            COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
            COUNT(*) FILTER (WHERE status = 'pending' AND created_at < NOW() - INTERVAL '24 hours')::int AS stale_pending
        FROM payments
        WHERE created_at >= NOW() - ($1::int * INTERVAL '1 day')
    `, [windowDays]);

    const total = number(stats.total);
    const failed = number(stats.failed);
    const failureRate = total > 0 ? failed / total : 1;
    addResult('Payment stability', 'Live payment volume is sufficient for proof', total >= thresholds.minPayments, {
        total,
        minPayments: thresholds.minPayments,
    });
    addResult('Payment stability', 'Payment failure rate within threshold', total > 0 && failureRate <= thresholds.maxPaymentFailureRate, {
        failed,
        total,
        failureRate,
        threshold: thresholds.maxPaymentFailureRate,
    });
    addResult('Payment stability', 'No stale pending payments older than 24h', number(stats.stale_pending) === 0, {
        stalePending: number(stats.stale_pending),
    });

    const orphanCompleted = await queryValue(db, `
        SELECT COUNT(*)::int AS count
        FROM payments p
        LEFT JOIN subscriptions s ON p.user_id = s.user_id
            AND (s.external_subscription_id = p.provider_order_id OR COALESCE(s.provider_event_id, '') LIKE '%' || COALESCE(p.provider_order_id, '') || '%')
        WHERE p.status = 'completed'
          AND p.created_at >= NOW() - ($1::int * INTERVAL '1 day')
          AND (s.id IS NULL OR s.billing_status NOT IN ('active', 'grace', 'canceled'))
    `, [windowDays]);
    addResult('Payment stability', 'Completed payments trace to subscription state', number(orphanCompleted.count) === 0, {
        orphanCompleted: number(orphanCompleted.count),
    });

    const duplicateSubs = await queryValue(db, `
        SELECT COUNT(*)::int AS count
        FROM (
            SELECT external_subscription_id
            FROM subscriptions
            WHERE external_subscription_id IS NOT NULL AND external_subscription_id <> ''
            GROUP BY external_subscription_id
            HAVING COUNT(*) > 1
        ) duplicates
    `);
    addResult('Payment stability', 'No duplicate external subscription IDs', number(duplicateSubs.count) === 0, {
        duplicates: number(duplicateSubs.count),
    });
}

async function certifyAiAvailability(db) {
    const stats = await queryValue(db, `
        SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE success_status = 'success')::int AS success,
            COUNT(*) FILTER (WHERE success_status <> 'success')::int AS failed,
            COALESCE(percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms), 0) AS p95_ms,
            COALESCE(SUM(generation_cost), 0) AS total_cost
        FROM ai_generation_logs
        WHERE created_at >= NOW() - ($1::int * INTERVAL '1 day')
    `, [windowDays]);

    const total = number(stats.total);
    const failed = number(stats.failed);
    const failureRate = total > 0 ? failed / total : 1;
    addResult('AI availability', 'AI request volume is sufficient for proof', total >= thresholds.minAiRequests, {
        total,
        minAiRequests: thresholds.minAiRequests,
    });
    addResult('AI availability', 'AI failure rate within threshold', total > 0 && failureRate <= thresholds.maxAiFailureRate, {
        failed,
        total,
        failureRate,
        threshold: thresholds.maxAiFailureRate,
        p95Ms: number(stats.p95_ms),
    });

    const severeAi = await queryValue(db, `
        SELECT COUNT(*)::int AS count
        FROM ai_incidents
        WHERE severity IN ('high', 'critical')
          AND status <> 'resolved'
          AND created_at >= NOW() - ($1::int * INTERVAL '1 day')
    `, [windowDays]);
    addResult('AI availability', 'No unresolved severe AI incidents', number(severeAi.count) === 0, {
        severeAiIncidents: number(severeAi.count),
    });
}

async function certifyCostStability(db) {
    const providers = ['gemini', 'supabase', 'vercel'];

    for (const provider of providers) {
        const stats = await queryValue(db, `
            SELECT
                COUNT(*)::int AS samples,
                COALESCE(AVG(metric_value), 0) AS avg_value,
                COALESCE(STDDEV_POP(metric_value), 0) AS stddev_value
            FROM infra_usage_snapshots
            WHERE provider = $1
              AND metric_name = 'daily_cost_inr'
              AND captured_at >= NOW() - ($2::int * INTERVAL '1 day')
        `, [provider, windowDays]);

        const samples = number(stats.samples);
        const avg = number(stats.avg_value);
        const stddev = number(stats.stddev_value);
        const varianceRatio = avg > 0 ? stddev / avg : 1;
        addResult('Cost stability', `${provider} daily cost predictable`, samples >= thresholds.minCostSnapshotsPerProvider && varianceRatio <= thresholds.maxCostVarianceRatio, {
            samples,
            avg,
            stddev,
            varianceRatio,
            threshold: thresholds.maxCostVarianceRatio,
        });
    }
}

async function certifyEducationalQuality(db) {
    const rag = await queryValue(db, `
        SELECT
            COALESCE(SUM(fail_count), 0)::int AS fail_count,
            COALESCE(SUM(syllabus_leakage_count), 0)::int AS syllabus_leakage_count,
            COALESCE(SUM(hallucination_count), 0)::int AS hallucination_count,
            COALESCE(SUM(wrong_answer_count), 0)::int AS wrong_answer_count,
            COUNT(*)::int AS audits
        FROM educational_quality_audits
        WHERE audited_at >= NOW() - ($1::int * INTERVAL '1 day')
    `, [windowDays]);

    addResult('Educational quality', 'RAG/quality audits have recent evidence', number(rag.audits) > 0, {
        audits: number(rag.audits),
    });
    addResult('Educational quality', 'No syllabus leakage in quality audits', number(rag.syllabus_leakage_count) <= thresholds.maxSyllabusLeakage, {
        syllabusLeakage: number(rag.syllabus_leakage_count),
    });
    addResult('Educational quality', 'No hallucinated explanation incidents in quality audits', number(rag.hallucination_count) === 0, {
        hallucinationCount: number(rag.hallucination_count),
    });
    addResult('Educational quality', 'No wrong-answer corruption in quality audits', number(rag.wrong_answer_count) <= thresholds.maxWrongAnswers, {
        wrongAnswerCount: number(rag.wrong_answer_count),
    });
    addResult('Educational quality', 'No failed RAG/quality audit cases', number(rag.fail_count) <= thresholds.maxRagFailures, {
        failCount: number(rag.fail_count),
    });

    const staleLeakage = await queryValue(db, `
        SELECT COUNT(*)::int AS count
        FROM ncert_embeddings
        WHERE corpus_status = 'active'
          AND (is_current_syllabus IS DISTINCT FROM true OR deleted_from_current_syllabus IS DISTINCT FROM false)
    `);
    addResult('Educational quality', 'No stale/deleted NCERT chunks active', number(staleLeakage.count) === 0, {
        staleActiveChunks: number(staleLeakage.count),
    });

    const openReviews = await queryValue(db, `
        SELECT COUNT(*)::int AS count
        FROM teacher_review_queue
        WHERE status IN ('pending', 'in_review')
          AND created_at >= NOW() - ($1::int * INTERVAL '1 day')
    `, [windowDays]);
    addResult('Educational quality', 'Teacher review queue has no unresolved launch blockers', number(openReviews.count) <= thresholds.maxOpenQualityReviews, {
        openReviews: number(openReviews.count),
    });

    const rejectedAiQuestions = await queryValue(db, `
        SELECT COUNT(*)::int AS count
        FROM questions
        WHERE is_ai_generated = 1
          AND verification_status IN ('rejected', 'quarantined')
    `);
    addResult('Educational quality', 'No rejected/quarantined AI questions active in bank', number(rejectedAiQuestions.count) === 0, {
        rejectedAiQuestions: number(rejectedAiQuestions.count),
    });
}

async function persistRun(db, verdict, summary) {
    if (!await tableExists(db, 'scale_certification_runs')) return;
    await db.query(
        'INSERT INTO scale_certification_runs (window_days, verdict, summary) VALUES ($1, $2, $3::jsonb)',
        [windowDays, verdict, JSON.stringify(summary)]
    );
}

function printResults() {
    console.log('\nSCALE EXPANSION READINESS CERTIFICATION');
    console.log('--------------------------------------');
    console.log(`Mode: ${live ? 'LIVE EVIDENCE' : 'STATIC PREFLIGHT'}`);
    console.log(`Window: ${windowDays} day(s)\n`);

    for (const result of results) {
        const icon = result.passed ? 'PASS' : 'FAIL';
        console.log(`  ${icon.padEnd(4)} [${result.category}] ${result.name}`);
        if (!result.passed && Object.keys(result.details || {}).length > 0) {
            console.log(`       ${JSON.stringify(result.details)}`);
        }
    }

    const failed = results.filter(result => !result.passed);
    console.log('\nSUMMARY');
    console.log(`  Passed: ${results.length - failed.length}`);
    console.log(`  Failed: ${failed.length}`);
    const verdict = failed.length > 0
        ? 'NOT_SCALE_READY'
        : live
            ? 'SCALE_READY'
            : 'SCALE_PREFLIGHT_READY';
    console.log(`\nVerdict: ${verdict}`);
    return failed;
}

async function main() {
    requireStaticProof();

    if (live) {
        if (!process.env.DATABASE_URL) {
            addResult('Live evidence', 'DATABASE_URL configured', false);
        } else {
            const db = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false },
                family: 4,
            });

            try {
                await requireTables(db, [
                    'operational_incidents',
                    'uptime_checks',
                    'infra_usage_snapshots',
                    'educational_quality_audits',
                    'ai_generation_logs',
                    'ai_incidents',
                    'payments',
                    'subscriptions',
                    'ncert_embeddings',
                    'teacher_review_queue',
                    'questions',
                ]);

                const missingSchema = results.some(result => result.category === 'Schema' && !result.passed);
                if (!missingSchema) {
                    await certifyReliability(db);
                    await certifyPayments(db);
                    await certifyAiAvailability(db);
                    await certifyCostStability(db);
                    await certifyEducationalQuality(db);
                }
            } catch (error) {
                addResult('Live evidence', 'Scale certification DB queries completed', false, { error: error.message });
            } finally {
                const failedBeforePersist = results.filter(result => !result.passed);
                await persistRun(db, failedBeforePersist.length === 0 ? 'passed' : 'failed', {
                    windowDays,
                    thresholds,
                    results,
                }).catch(() => {});
                await db.end();
            }
        }
    } else {
        addResult('Live evidence', 'Live scale proof deferred', true, {
            reason: 'Run with --live after beta/soft-launch evidence has been collected.',
        });
    }

    const failed = printResults();
    process.exit(failed.length === 0 ? 0 : 1);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
