#!/usr/bin/env node

import crypto from 'crypto';
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

function assertContains(content, fragment, label) {
    content.includes(fragment) ? pass(label) : fail(label);
}

function sign(secret, body, timestamp) {
    return crypto.createHmac('sha256', secret).update(timestamp + body).digest('base64');
}

function verifyLikeProduction(secret, body, timestamp, signature) {
    if (!secret) return false;
    const timestampMs = Number(timestamp) * (String(timestamp).length === 10 ? 1000 : 1);
    if (!Number.isFinite(timestampMs)) return false;
    if (Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) return false;

    const expected = Buffer.from(sign(secret, body, timestamp));
    const received = Buffer.from(String(signature || ''));
    return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

function main() {
    console.log('\nCASHFREE WEBHOOK SECURITY VALIDATION');
    console.log('------------------------------------');

    const paymentService = read('lib/payment_service.js');
    const webhookRoute = read('app/api/webhooks/cashfree/route.js');

    assertContains(paymentService, 'timingSafeEqual', 'Webhook uses timing-safe signature comparison');
    assertContains(paymentService, '5 * 60 * 1000', 'Webhook rejects stale timestamps');
    assertContains(paymentService, 'CASHFREE_ENV', 'Cashfree environment is explicit');
    assertContains(paymentService, 'NODE_ENV must never decide where money flows', 'Payment environment does not depend on NODE_ENV');

    assertContains(webhookRoute, 'request.text()', 'Webhook reads raw body before parsing');
    assertContains(webhookRoute, 'x-webhook-signature', 'Webhook reads signature header');
    assertContains(webhookRoute, 'x-webhook-timestamp', 'Webhook reads timestamp header');
    assertContains(webhookRoute, 'verifyWebhookSignature', 'Webhook verifies provider signature');
    assertContains(webhookRoute, 'payment_events', 'Webhook stores provider event idempotency records');
    assertContains(webhookRoute, '23505', 'Webhook treats duplicate provider events as idempotent');
    assertContains(webhookRoute, 'subscription_activation_transaction', 'Webhook activates subscription through atomic RPC');

    const isProduction = (process.env.CASHFREE_ENV || '').toLowerCase() === 'production';
    if (isProduction && (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY)) {
        fail('Production payment certification requires CASHFREE_APP_ID and CASHFREE_SECRET_KEY');
    }

    if (process.env.CASHFREE_SECRET_KEY) {
        const body = JSON.stringify({ type: 'PAYMENT_SUCCESS_WEBHOOK', data: { order: { order_id: 'cert_order' } } });
        const freshTimestamp = String(Math.floor(Date.now() / 1000));
        const staleTimestamp = String(Math.floor((Date.now() - 10 * 60 * 1000) / 1000));
        const validSignature = sign(process.env.CASHFREE_SECRET_KEY, body, freshTimestamp);

        verifyLikeProduction(process.env.CASHFREE_SECRET_KEY, body, freshTimestamp, validSignature)
            ? pass('Valid fresh signature is accepted by certification algorithm')
            : fail('Valid fresh signature was rejected by certification algorithm');

        !verifyLikeProduction(process.env.CASHFREE_SECRET_KEY, `${body}x`, freshTimestamp, validSignature)
            ? pass('Tampered body is rejected')
            : fail('Tampered body was accepted');

        !verifyLikeProduction(process.env.CASHFREE_SECRET_KEY, body, staleTimestamp, sign(process.env.CASHFREE_SECRET_KEY, body, staleTimestamp))
            ? pass('Stale signed webhook is rejected')
            : fail('Stale signed webhook was accepted');
    } else {
        warn('CASHFREE_SECRET_KEY not set; cryptographic sample skipped');
    }

    console.log('\nCASHFREE WEBHOOK SUMMARY');
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
