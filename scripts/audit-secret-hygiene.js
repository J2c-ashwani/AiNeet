#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SECRET_PATTERNS = [
    { name: 'Postgres connection string', pattern: /postgres(?:ql)?:\/\/[^'"`\s]+:[^'"`\s]+@/i },
    { name: 'Supabase service role JWT', pattern: /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]*service_role[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]+/i },
    { name: 'Private key block', pattern: /-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/ },
    { name: 'Cashfree secret literal', pattern: /CASHFREE_SECRET_KEY\s*[:=]\s*['"][^'"]{12,}['"]/ },
    { name: 'Google API key literal', pattern: /AIza[0-9A-Za-z_-]{30,}/ },
];

const SKIP = new Set([
    'package-lock.json',
    'docs/enterprise-launch-certification-audit-2026-05-18.md',
]);

function listScannableFiles() {
    return execSync('git ls-files --cached --others --exclude-standard', { cwd: ROOT, encoding: 'utf8' })
        .split('\n')
        .filter(Boolean)
        .filter(file => !SKIP.has(file))
        .filter(file => !file.startsWith('scripts/ocr_raw_'))
        .filter(file => !file.includes('yearly_pyqs_'));
}

function main() {
    const findings = [];

    for (const rel of listScannableFiles()) {
        const abs = path.join(ROOT, rel);
        if (!fs.existsSync(abs) || fs.statSync(abs).size > 2_000_000) continue;
        const content = fs.readFileSync(abs, 'utf8');

        for (const secret of SECRET_PATTERNS) {
            if (secret.pattern.test(content)) {
                findings.push({ file: rel, type: secret.name });
            }
        }
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('    🔐 SECRET HYGIENE AUDIT');
    console.log('═══════════════════════════════════════════════════\n');

    if (findings.length > 0) {
        findings.forEach(f => console.log(`  ❌ ${f.type}: ${f.file}`));
        console.log(`\n  ❌ Failed: ${findings.length}`);
        process.exit(1);
    }

    console.log('  ✅ No tracked or untracked secret literals detected');
    console.log('\n  ✅ Passed: 1');
    console.log('═══════════════════════════════════════════════════\n');
}

main();
