#!/usr/bin/env node
/**
 * scripts/release-readiness-check.js
 *
 * Master release gate. Runs all sub-checks and outputs:
 * PRODUCTION_READY = true | false
 *
 * All checks that can run without a live DB are run statically.
 * DB-dependent checks run if DATABASE_URL is available.
 */

const { execSync } = require('child_process');
const { Pool }     = require('pg');
const path         = require('path');
const fs           = require('fs');
require('dotenv').config({ path: '.env.local' });

const ROOT = path.join(__dirname, '..');
const checks = { passed: [], failed: [], warnings: [] };

async function run() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('    🚀 RELEASE READINESS CHECK');
    console.log('═══════════════════════════════════════════════════\n');

    // ── Static Checks (no DB needed) ───────────────────────
    await scriptCheck('Mobile blocker audit',    'node scripts/audit-mobile-blockers.js');
    await scriptCheck('Performance budget audit', 'node scripts/audit-performance-budget.js');

    // ── DB-Dependent Checks ─────────────────────────────────
    if (process.env.DATABASE_URL) {
        await scriptCheck('DB performance audit',  'node scripts/audit-db-performance.js');
        await scriptCheck('Backup verification',   'node scripts/verify-backup-restore.js');
        await dbCheck();
    } else {
        warn('DATABASE_URL not set — skipping DB checks');
    }

    // ── File Existence Checks ───────────────────────────────
    const requiredFiles = [
        'lib/recovery/recovery-manager.js',
        'lib/mobile/lifecycle-manager.js',
        'lib/resilience/circuit-breaker.js',
        'lib/security/fraud-detector.js',
        'lib/boot/orchestrator.js',
        'lib/telemetry/mobile-buffer.js',
        'lib/telemetry/performance.js',
        'lib/jobs/job-queue.js',
        'docs/stability-covenant.md',
        'docs/native-bridge-contract.md',
    ];
    for (const f of requiredFiles) {
        fs.existsSync(path.join(ROOT, f))
            ? pass(`Required file exists: ${f}`)
            : fail(`Missing required file: ${f}`);
    }

    const requiredRunbooks = [
        'gemini-outage', 'recovery-manager-failure', 'play-store-rollback',
        'fraud-spike-response', 'leaderboard-corruption', 'mass-notification-rollback', 'db-corruption-response'
    ];
    for (const rb of requiredRunbooks) {
        const exists = fs.existsSync(path.join(ROOT, `docs/runbooks/${rb}.md`));
        exists ? pass(`Runbook: ${rb}`) : fail(`Missing runbook: ${rb}`);
    }

    // ── Final Verdict ───────────────────────────────────────
    const ready = checks.failed.length === 0;

    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ✅ Passed:   ${checks.passed.length}`);
    console.log(`  ⚠️  Warnings: ${checks.warnings.length}`);
    console.log(`  ❌ Failed:   ${checks.failed.length}`);
    console.log(`\n  PRODUCTION_READY = ${ready ? 'true ✅' : 'false ❌'}`);
    console.log('═══════════════════════════════════════════════════\n');

    if (!ready) {
        console.log('  Blocking failures:');
        checks.failed.forEach(f => console.log(`    ❌ ${f}`));
    }

    process.exit(ready ? 0 : 1);
}

async function scriptCheck(name, cmd) {
    try {
        execSync(cmd, { cwd: ROOT, stdio: 'pipe' });
        pass(name);
    } catch (e) {
        fail(`${name}: ${e.stderr?.toString()?.split('\n')[0] || 'script failed'}`);
    }
}

async function dbCheck() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    try {
        // Feature flags reachable
        const { rows } = await pool.query("SELECT COUNT(*) as c FROM feature_flags WHERE enabled = true");
        parseInt(rows[0].c) >= 1 ? pass('Feature flags reachable') : fail('No enabled feature flags');

        // Telemetry table active
        await pool.query('SELECT 1 FROM mobile_runtime_events LIMIT 1');
        pass('Telemetry table accessible');

        // Fraud signals table
        await pool.query('SELECT 1 FROM fraud_signals LIMIT 1');
        pass('Fraud signals table accessible');

        // Recovery tracking columns
        const { rows: cols } = await pool.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'test_attempts' AND column_name = 'recovery_count'
        `);
        cols.length > 0 ? pass('Recovery tracking columns present') : fail('v27 migration not applied');
    } catch (e) {
        fail(`DB check failed: ${e.message}`);
    } finally {
        await pool.end();
    }
}

function pass(msg)  { checks.passed.push(msg);   console.log(`  ✅ ${msg}`); }
function fail(msg)  { checks.failed.push(msg);   console.log(`  ❌ ${msg}`); }
function warn(msg)  { checks.warnings.push(msg); console.log(`  ⚠️  ${msg}`); }

run().catch(e => { console.error(e); process.exit(1); });
