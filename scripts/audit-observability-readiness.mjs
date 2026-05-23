import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const passes = [];

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(relativePath) {
    return fs.existsSync(path.join(root, relativePath));
}

function pass(message) {
    passes.push(message);
}

function fail(message) {
    failures.push(message);
}

function assertFile(relativePath, message) {
    exists(relativePath) ? pass(message) : fail(`${message} (${relativePath})`);
}

function assertContains(relativePath, needle, message) {
    const content = read(relativePath);
    content.includes(needle) ? pass(message) : fail(`${message} (${relativePath})`);
}

function assertNotContains(relativePath, needle, message) {
    const content = read(relativePath);
    !content.includes(needle) ? pass(message) : fail(`${message} (${relativePath})`);
}

const sentryConfigs = [
    'sentry.client.config.js',
    'sentry.server.config.js',
    'sentry.edge.config.js',
];

for (const file of sentryConfigs) {
    assertContains(file, 'NEXT_PUBLIC_SENTRY_DSN', `${file} reads production Sentry DSN`);
    assertContains(file, 'if (sentryDsn)', `${file} does not initialize when DSN is absent`);
    assertNotContains(file, 'dummy@', `${file} has no dummy Sentry fallback`);
}

assertContains('.env.example', 'NEXT_PUBLIC_SENTRY_DSN=', 'Sentry DSN is in environment inventory');
assertContains('app/error.js', 'Sentry.captureException', 'Route error boundary reports crashes');
assertContains('app/global-error.js', 'Sentry.captureException', 'Global error boundary reports crashes');
assertFile('app/api/health/route.js', 'Core health endpoint exists');
assertFile('app/api/health/features/route.js', 'Feature health endpoint exists');
assertFile('app/api/admin/ops/route.js', 'Admin operational dashboard API exists');
assertFile('app/admin/integrity/page.js', 'Admin integrity page exists for payment/webhook/cron triage');
assertFile('lib/alert.js', 'Critical alert transport exists');
assertContains('lib/logger.js', 'CRITICAL_ALERT', 'Structured critical alert logger exists');
assertContains('lib/logger.js', 'WEBHOOK_FAILED', 'Webhook failure alert type exists');
assertContains('lib/logger.js', 'AI_TIMEOUT', 'AI timeout alert type exists');
assertContains('lib/reporting_engine.js', 'cron_execution_logs', 'Cron execution outcomes are logged');

const requiredRunbooks = [
    'docs/runbooks/gemini-outage.md',
    'docs/runbooks/fraud-spike-response.md',
    'docs/runbooks/leaderboard-corruption.md',
    'docs/runbooks/mass-notification-rollback.md',
    'docs/runbooks/play-store-rollback.md',
    'docs/runbooks/db-corruption-response.md',
    'docs/runbooks/recovery-manager-failure.md',
];

for (const runbook of requiredRunbooks) {
    assertFile(runbook, `Runbook exists: ${runbook}`);
}

console.log('\nObservability Readiness Audit');
console.log('-----------------------------');
for (const message of passes) console.log(`  ✅ ${message}`);
for (const message of failures) console.log(`  ❌ ${message}`);
console.log(`\n  Passed: ${passes.length}`);
console.log(`  Failed: ${failures.length}`);

if (failures.length > 0) process.exit(1);
