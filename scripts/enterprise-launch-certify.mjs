#!/usr/bin/env node

import { spawnSync } from 'child_process';

const args = new Set(process.argv.slice(2));
const live = args.has('--live');

const checks = [];

function add(name, command, options = {}) {
    checks.push({ name, command, ...options });
}

function envWith(overrides = {}) {
    return { ...process.env, ...overrides };
}

function runCheck(check) {
    if (check.liveOnly && !live) {
        return { name: check.name, status: 'SKIP', reason: 'requires --live and real production/staging services' };
    }

    const result = spawnSync(check.command[0], check.command.slice(1), {
        stdio: 'pipe',
        shell: false,
        env: check.env || process.env,
        encoding: 'utf8',
    });

    return {
        name: check.name,
        status: result.status === 0 ? 'PASS' : 'FAIL',
        code: result.status,
        output: `${result.stdout || ''}${result.stderr || ''}`.trim(),
    };
}

add('Secret hygiene', ['node', 'scripts/audit-secret-hygiene.js']);
add('Secret usage inventory', ['node', 'scripts/audit-secret-usage-inventory.mjs']);
add('Typecheck', ['npm', 'run', 'typecheck']);
add('Contract tests', ['npm', 'run', 'test:contracts']);
add('Performance budget', ['node', 'scripts/audit-performance-budget.js']);
add('Mobile enterprise audit', ['node', 'scripts/audit-mobile-enterprise.js']);
add('Master audit', ['node', 'scripts/audit-master.js']);
add('App Check static/native certification', ['node', 'scripts/test-app-check-enforcement.mjs'], {
    env: envWith({ APP_CHECK_ENFORCEMENT: process.env.APP_CHECK_ENFORCEMENT || 'native' }),
});
add('Cashfree webhook security', ['node', 'scripts/test-cashfree-webhook-security.mjs']);
add('Payment flow static certification', ['node', 'scripts/test-payment-flow.mjs'], {
    env: envWith({ CASHFREE_ENV: process.env.CASHFREE_ENV || 'sandbox' }),
});
add('Production build', ['npm', 'run', 'build']);

add('Backup restore drill', ['node', 'scripts/verify-backup-restore.js'], { liveOnly: true });
add('RAG governance live DB check', ['node', 'scripts/validate-rag-governance.mjs'], { liveOnly: true });
add('Chemistry retrieval validation', ['node', 'scripts/validate-retrieval.mjs', '--subject', 'chemistry'], { liveOnly: true });
add('Physics retrieval validation', ['node', 'scripts/validate-retrieval.mjs', '--subject', 'physics'], { liveOnly: true });
add('Biology retrieval validation', ['node', 'scripts/validate-retrieval.mjs', '--subject', 'biology'], { liveOnly: true });
add('Release readiness gate', ['node', 'scripts/release-readiness.js'], { liveOnly: true });

console.log('\nENTERPRISE PUBLIC LAUNCH CERTIFICATION');
console.log('--------------------------------------');
console.log(`Mode: ${live ? 'LIVE CERTIFICATION' : 'SAFE PREFLIGHT'}`);
console.log('');

const results = [];
for (const check of checks) {
    const result = runCheck(check);
    results.push(result);
    const icon = result.status === 'PASS' ? 'PASS' : result.status === 'SKIP' ? 'SKIP' : 'FAIL';
    console.log(`  ${icon.padEnd(4)} ${result.name}`);
    if (result.status === 'FAIL') {
        const firstLines = (result.output || '').split('\n').slice(-8).join('\n');
        if (firstLines) console.log(firstLines.split('\n').map(line => `       ${line}`).join('\n'));
    } else if (result.status === 'SKIP') {
        console.log(`       ${result.reason}`);
    }
}

const failed = results.filter(result => result.status === 'FAIL');
const skipped = results.filter(result => result.status === 'SKIP');

console.log('\nCERTIFICATION SUMMARY');
console.log(`  Passed:  ${results.filter(result => result.status === 'PASS').length}`);
console.log(`  Skipped: ${skipped.length}`);
console.log(`  Failed:  ${failed.length}`);

if (!live) {
    console.log('\nVerdict: PREFLIGHT_ONLY');
    console.log('Run with --live after staging restore, production payment configuration, App Check, and DB connectivity are ready.');
    process.exit(failed.length === 0 ? 0 : 1);
}

if (failed.length === 0 && skipped.length === 0) {
    console.log('\nVerdict: ENTERPRISE PUBLIC LAUNCH CERTIFIED');
    process.exit(0);
}

console.log('\nVerdict: NOT LAUNCH CERTIFIED');
process.exit(1);

