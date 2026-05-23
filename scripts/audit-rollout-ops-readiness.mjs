import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const passes = [];

const requiredDocs = [
    'docs/refund-policy.md',
    'docs/enterprise-public-launch-certification-final-2026-05-23.md',
    'docs/observability-and-alerting.md',
    'docs/feature-flag-rollout-control.md',
    'docs/closed-beta-operations.md',
    'docs/support-and-incident-system.md',
    'docs/soft-launch-and-scale-expansion.md',
    'docs/payment-production-drill.md',
    'docs/load-and-reliability-certification.md',
    'docs/rollback-drill-record.md',
    'docs/scale-expansion-certification.md',
    'docs/templates/incident-record.md',
];

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

for (const doc of requiredDocs) {
    exists(doc) ? pass(`Required rollout document exists: ${doc}`) : fail(`Missing rollout document: ${doc}`);
}

if (exists('docs/refund-policy.md')) {
    const refundPolicy = read('docs/refund-policy.md');
    /no refund|non-refundable|not refundable/i.test(refundPolicy)
        ? pass('Refund policy states no-refund business rule')
        : fail('Refund policy does not state the no-refund business rule');
    refundPolicy.includes('billing period')
        ? pass('Refund policy preserves access until billing-period end')
        : fail('Refund policy does not define billing-period-end access');
}

if (exists('docs/closed-beta-operations.md')) {
    const beta = read('docs/closed-beta-operations.md');
    for (const needle of ['100', '500', 'device', 'incident', 'support', 'abuse']) {
        beta.toLowerCase().includes(needle)
            ? pass(`Closed beta plan covers ${needle}`)
            : fail(`Closed beta plan does not cover ${needle}`);
    }
}

if (exists('docs/soft-launch-and-scale-expansion.md')) {
    const scale = read('docs/soft-launch-and-scale-expansion.md');
    for (const needle of ['5k', '10k', 'p95', 'cost', 'Supabase', 'Gemini', 'rollback']) {
        scale.includes(needle)
            ? pass(`Soft launch plan covers ${needle}`)
            : fail(`Soft launch plan does not cover ${needle}`);
    }
}

console.log('\nRollout Operations Readiness Audit');
console.log('----------------------------------');
for (const message of passes) console.log(`  ✅ ${message}`);
for (const message of failures) console.log(`  ❌ ${message}`);
console.log(`\n  Passed: ${passes.length}`);
console.log(`  Failed: ${failures.length}`);

if (failures.length > 0) process.exit(1);
