import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const passes = [];

const requiredFlags = [
    {
        name: 'ai_generation',
        key: 'ff_ai_generation',
        env: 'DISABLE_AI',
        routes: [
            'app/api/doubt/route.js',
            'app/api/doubt/image/route.js',
            'app/api/doubt/snap/route.js',
            'app/api/tests/generate/route.js',
            'app/api/tests/diagnostic/generate/route.js',
        ],
    },
    {
        name: 'rag_explanations',
        key: 'ff_rag_explanations',
        env: 'DISABLE_RAG',
        routes: ['app/api/ncert/explain/route.js'],
    },
    {
        name: 'omr',
        key: 'ff_omr_enabled',
        env: 'DISABLE_OMR',
        routes: ['app/api/omr/scan/route.js', 'app/api/omr/grade/route.js'],
    },
    {
        name: 'battleground',
        key: 'ff_battleground',
        env: 'DISABLE_BATTLEGROUND',
        routes: [
            'app/api/battle/create/route.js',
            'app/api/battle/submit/route.js',
            'app/api/battleground/create/route.js',
            'app/api/battleground/join/route.js',
            'app/api/battleground/start/route.js',
            'app/api/battleground/submit/route.js',
            'app/api/battleground/state/route.js',
        ],
    },
    {
        name: 'payments',
        key: 'ff_payments',
        env: 'DISABLE_PAYMENTS',
        routes: [
            'app/api/subscription/create/route.js',
            'app/api/subscription/verify/route.js',
            'app/api/subscription/cancel/route.js',
            'app/api/subscription/play/verify/route.js',
        ],
    },
    {
        name: 'notifications',
        key: 'ff_notifications',
        env: 'DISABLE_NOTIFICATIONS',
        routes: [
            'app/api/user/update-fcm-token/route.js',
            'app/api/cron/daily-nudge/route.js',
            'app/api/cron/weekly-report/route.js',
        ],
    },
    {
        name: 'referrals',
        key: 'ff_referrals',
        env: 'DISABLE_REFERRALS',
        routes: ['app/api/auth/register/route.js', 'app/api/tests/submit/route.js'],
    },
    {
        name: 'leaderboard',
        key: 'ff_leaderboard',
        env: 'DISABLE_LEADERBOARD',
        routes: ['app/api/leaderboard/route.js'],
    },
];

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function pass(message) {
    passes.push(message);
}

function fail(message) {
    failures.push(message);
}

function assertContains(content, needle, message) {
    content.includes(needle) ? pass(message) : fail(message);
}

const featureHelper = read('lib/feature-flags.js');
const envExample = read('.env.example');
const launchMigration = read('scripts/migrations/003_enterprise_launch_feature_flags.sql');
const healthFeatures = read('app/api/health/features/route.js');
const adminOps = read('app/api/admin/ops/route.js');

for (const flag of requiredFlags) {
    assertContains(featureHelper, `${flag.name}:`, `Feature helper defines ${flag.name}`);
    assertContains(featureHelper, flag.key, `Feature helper maps ${flag.name} to ${flag.key}`);
    assertContains(featureHelper, flag.env, `.env kill switch mapped for ${flag.name}`);
    assertContains(envExample, `${flag.env}=false`, `.env.example documents ${flag.env}`);
    assertContains(launchMigration, flag.key, `Launch migration seeds ${flag.key}`);

    for (const route of flag.routes) {
        const content = read(route);
        const requiresFlag = content.includes(`requireFeatureEnabled('${flag.name}'`)
            || content.includes(`isFeatureEnabled('${flag.name}'`);
        requiresFlag ? pass(`${route} is gated by ${flag.name}`) : fail(`${route} is not gated by ${flag.name}`);
    }
}

assertContains(healthFeatures, 'getStaticFeatureSnapshot', 'Public feature health exposes all kill switch states');
assertContains(adminOps, 'FEATURE_FLAGS', 'Admin ops reads the central feature flag registry');
assertContains(adminOps, 'isFeatureEnabled', 'Admin ops checks remote feature flag state');

console.log('\nFeature Flag Readiness Audit');
console.log('----------------------------');
for (const message of passes) console.log(`  ✅ ${message}`);
for (const message of failures) console.log(`  ❌ ${message}`);
console.log(`\n  Passed: ${passes.length}`);
console.log(`  Failed: ${failures.length}`);

if (failures.length > 0) process.exit(1);
