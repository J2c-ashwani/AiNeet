#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const explicitEnv = { ...process.env };
dotenv.config({ path: path.join(ROOT, '.env') });
dotenv.config({ path: path.join(ROOT, '.env.local'), override: true });
Object.assign(process.env, explicitEnv);

const checks = { passed: [], failed: [], warnings: [] };

function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function pass(message) {
    checks.passed.push(message);
    console.log(`  PASS ${message}`);
}

function fail(message) {
    checks.failed.push(message);
    console.log(`  FAIL ${message}`);
}

function warn(message) {
    checks.warnings.push(message);
    console.log(`  WARN ${message}`);
}

function assertContains(file, fragments, label = file) {
    const content = read(file);
    for (const fragment of fragments) {
        content.includes(fragment)
            ? pass(`${label} contains ${fragment}`)
            : fail(`${label} missing ${fragment}`);
    }
}

async function optionalLiveProbe() {
    const baseUrl = process.env.APP_CHECK_TEST_BASE_URL;
    const authCookie = process.env.APP_CHECK_TEST_AUTH_COOKIE;
    const bearer = process.env.APP_CHECK_TEST_BEARER;
    if (!baseUrl || (!authCookie && !bearer)) {
        warn('Live App Check rejection probe skipped; set APP_CHECK_TEST_BASE_URL plus APP_CHECK_TEST_AUTH_COOKIE or APP_CHECK_TEST_BEARER');
        return;
    }

    const headers = {
        'content-type': 'application/json',
        'x-neet-native-app': '1',
    };
    if (authCookie) headers.cookie = authCookie;
    if (bearer) headers.authorization = `Bearer ${bearer}`;

    const probes = [
        { method: 'POST', path: '/api/subscription/create', body: { planId: 'pro' } },
        { method: 'POST', path: '/api/tests/submit', body: { testId: 'app-check-certification-probe', answers: [] } },
    ];

    for (const probe of probes) {
        const response = await fetch(new URL(probe.path, baseUrl), {
            method: probe.method,
            headers,
            body: JSON.stringify(probe.body),
        });
        const payload = await response.json().catch(() => ({}));
        if ([401, 403].includes(response.status) && ['APP_CHECK_MISSING', 'APP_CHECK_INVALID'].includes(payload.code)) {
            pass(`${probe.path} rejects native request without App Check`);
        } else {
            fail(`${probe.path} did not reject missing App Check first; status=${response.status} code=${payload.code || 'none'}`);
        }
    }
}

async function main() {
    console.log('\nAPP CHECK ENFORCEMENT VALIDATION');
    console.log('--------------------------------');

    const mode = (process.env.APP_CHECK_ENFORCEMENT || '').toLowerCase();
    ['native', 'strict'].includes(mode)
        ? pass(`APP_CHECK_ENFORCEMENT=${mode}`)
        : fail('APP_CHECK_ENFORCEMENT must be native or strict for certification');

    assertContains('lib/security/verify-app-check.js', [
        '/api/tests/submit',
        '/api/tests/result',
        '/api/omr',
        '/api/subscription/create',
        '/api/subscription/verify',
        'X-Firebase-AppCheck',
        'APP_CHECK_MISSING',
        'APP_CHECK_INVALID',
        'Firebase App Check JWKS',
    ], 'App Check verifier');

    [
        'app/api/tests/submit/route.js',
        'app/api/tests/result/route.js',
        'app/api/omr/scan/route.js',
        'app/api/omr/grade/route.js',
        'app/api/subscription/create/route.js',
        'app/api/subscription/verify/route.js',
        'app/api/user/update-fcm-token/route.js',
        'app/api/battleground/create/route.js',
        'app/api/battleground/join/route.js',
        'app/api/battleground/start/route.js',
        'app/api/battleground/submit/route.js',
        'app/api/battle/create/route.js',
        'app/api/battle/submit/route.js',
    ].forEach(file => assertContains(file, ['verifyAppCheck(request)'], file));

    assertContains('lib/api-handler.js', ['options.appCheck', 'verifyAppCheck(request'], 'API handler');
    assertContains('lib/mobile/app-check-fetch.js', ['X-Firebase-AppCheck', 'x-neet-native-app', 'getNEETAppCheckToken'], 'Mobile App Check fetch patch');
    assertContains('mobile/lib/security/app_check.dart', ['NEET_APP_CHECK', 'getNEETAppCheckToken'], 'Flutter App Check bridge');
    assertContains('mobile/lib/main.dart', ['AppCheckBridge.injectScript(controller)'], 'Flutter WebView injection');

    await optionalLiveProbe();

    console.log('\nAPP CHECK SUMMARY');
    console.log(`  Passed:   ${checks.passed.length}`);
    console.log(`  Warnings: ${checks.warnings.length}`);
    console.log(`  Failed:   ${checks.failed.length}`);
    if (checks.failed.length > 0) {
        console.log('\nBlocking failures:');
        checks.failed.forEach(item => console.log(`  - ${item}`));
    }
    process.exit(checks.failed.length === 0 ? 0 : 1);
}

main();
