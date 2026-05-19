#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCAN_DIRS = [
    '.github',
    'app',
    'components',
    'context',
    'lib',
    'mobile',
    'providers',
    'scripts',
    'tests',
    'utils',
];

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'build', '.dart_tool', '.pub-cache']);
const FILE_EXTENSIONS = new Set([
    '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx',
    '.yml', '.yaml', '.json', '.md', '.kts', '.gradle',
    '.dart', '.sh', '.sql',
]);

const REQUIRED_LAUNCH_ENV = [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
    'STAGING_DATABASE_URL',
    'BACKUP_RESTORE_DRILL_ID',
    'JWT_SECRET',
    'DIAGNOSTIC_SIGNING_SECRET',
    'INTERNAL_EVENT_SECRET',
    'CRON_SECRET',
    'N8N_WEBHOOK_SECRET',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'GEMINI_API_KEY',
    'EXPECTED_EMBEDDING_DIMENSIONS',
    'CASHFREE_ENV',
    'CASHFREE_APP_ID',
    'CASHFREE_SECRET_KEY',
    'GOOGLE_PLAY_PACKAGE_NAME',
    'GOOGLE_PLAY_SERVICE_ACCOUNT',
    'GOOGLE_PLAY_RTDN_AUDIENCE',
    'GOOGLE_PLAY_PUBSUB_SERVICE_ACCOUNT_EMAIL',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_APP_ID',
    'FIREBASE_SERVICE_ACCOUNT_KEY',
    'APP_CHECK_ENFORCEMENT',
    'APP_CHECK_TEST_BASE_URL',
    'APP_CHECK_TEST_AUTH_COOKIE',
    'APP_CHECK_TEST_BEARER',
    'NEET_WEB_URL',
    'NEET_UPLOAD_KEYSTORE',
    'NEET_UPLOAD_KEYSTORE_BASE64',
    'NEET_UPLOAD_KEYSTORE_PASSWORD',
    'NEET_UPLOAD_KEY_ALIAS',
    'NEET_UPLOAD_KEY_PASSWORD',
    'ADMOB_ANDROID_APP_ID',
    'ADMOB_BANNER_ANDROID',
    'ADMOB_INTERSTITIAL_ANDROID',
    'ADMOB_REWARDED_ANDROID',
    'NEXT_PUBLIC_SENTRY_DSN',
];

const SECRETISH = /(SECRET|PASSWORD|TOKEN|KEY|DATABASE_URL|JWT|SERVICE_ACCOUNT|KEYSTORE|WEBHOOK)/;
const ENV_PATTERNS = [
    /process\.env\.([A-Z][A-Z0-9_]*)/g,
    /process\.env\[['"]([A-Z][A-Z0-9_]*)['"]\]/g,
    /String\.fromEnvironment\(['"]([A-Z][A-Z0-9_]*)['"]/g,
    /\$\{\{\s*(?:secrets|vars)\.([A-Z][A-Z0-9_]*)\s*\}\}/g,
    /\$([A-Z][A-Z0-9_]{2,})/g,
];

function walk(dir, files = []) {
    if (!fs.existsSync(dir)) return files;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (SKIP_DIRS.has(entry.name)) continue;
        const absolute = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(absolute, files);
        } else if (FILE_EXTENSIONS.has(path.extname(entry.name))) {
            files.push(absolute);
        }
    }
    return files;
}

function envExampleKeys() {
    const file = path.join(ROOT, '.env.example');
    if (!fs.existsSync(file)) return new Set();
    return new Set(
        fs.readFileSync(file, 'utf8')
            .split('\n')
            .map(line => line.match(/^([A-Z][A-Z0-9_]*)=/)?.[1])
            .filter(Boolean)
    );
}

function collectUsage() {
    const usage = new Map();
    const files = SCAN_DIRS.flatMap(dir => walk(path.join(ROOT, dir)));
    for (const absolute of files) {
        const relative = path.relative(ROOT, absolute);
        const content = fs.readFileSync(absolute, 'utf8');
        for (const pattern of ENV_PATTERNS) {
            for (const match of content.matchAll(pattern)) {
                const key = match[1];
                if (!key || key === 'PATH' || key === 'HOME' || key === 'PWD') continue;
                if (!usage.has(key)) usage.set(key, new Set());
                usage.get(key).add(relative);
            }
        }
    }
    return usage;
}

function main() {
    console.log('\nENTERPRISE SECRET USAGE INVENTORY');
    console.log('---------------------------------');

    const usage = collectUsage();
    const exampleKeys = envExampleKeys();
    const missingFromExample = [];
    const missingLaunchKeys = [];

    for (const key of [...usage.keys()].sort()) {
        const files = [...usage.get(key)].sort();
        const classification = SECRETISH.test(key) ? 'secret' : 'config';
        console.log(`  ${classification.padEnd(6)} ${key.padEnd(44)} ${files.length} file(s)`);
        if (!exampleKeys.has(key) && SECRETISH.test(key)) {
            missingFromExample.push(key);
        }
    }

    for (const key of REQUIRED_LAUNCH_ENV) {
        if (!exampleKeys.has(key)) missingLaunchKeys.push(key);
    }

    if (missingFromExample.length > 0) {
        console.log('\nMissing secret-like keys from .env.example:');
        missingFromExample.forEach(key => console.log(`  - ${key}`));
    }

    if (missingLaunchKeys.length > 0) {
        console.log('\nMissing required launch keys from .env.example:');
        missingLaunchKeys.forEach(key => console.log(`  - ${key}`));
    }

    const failed = missingFromExample.length + missingLaunchKeys.length;
    console.log('\nINVENTORY SUMMARY');
    console.log(`  Env keys discovered: ${usage.size}`);
    console.log(`  Missing entries:     ${failed}`);
    process.exit(failed === 0 ? 0 : 1);
}

main();

