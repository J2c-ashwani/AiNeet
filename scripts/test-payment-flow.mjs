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

function assertContains(content, fragment, label) {
    content.includes(fragment) ? pass(label) : fail(label);
}

function main() {
    console.log('\nPAYMENT FLOW CERTIFICATION');
    console.log('--------------------------');

    const createRoute = read('app/api/subscription/create/route.js');
    const verifyRoute = read('app/api/subscription/verify/route.js');
    const webhookRoute = read('app/api/webhooks/cashfree/route.js');
    const paymentService = read('lib/payment_service.js');

    assertContains(createRoute, 'getUserFromRequest(request)', 'Create route authenticates user');
    assertContains(createRoute, 'verifyAppCheck(request)', 'Create route enforces native App Check');
    assertContains(createRoute, 'rateLimit', 'Create route rate limits payment attempts');
    assertContains(createRoute, "safeInsert('payments'", 'Create route records payment intent through safe layer');
    assertContains(createRoute, 'PaymentService.createOrder', 'Create route delegates provider order creation');

    assertContains(verifyRoute, 'getUserFromRequest(request)', 'Verify route authenticates user');
    assertContains(verifyRoute, 'verifyAppCheck(request)', 'Verify route enforces native App Check');
    assertContains(verifyRoute, 'PaymentService.verifyPayment', 'Verify route asks provider for payment status');
    assertContains(verifyRoute, ".eq('provider_order_id', orderId)", 'Verify route binds order id to stored payment intent');
    assertContains(verifyRoute, ".eq('user_id', decoded.id)", 'Verify route binds payment intent to authenticated user');
    assertContains(verifyRoute, 'Payment plan mismatch', 'Verify route rejects plan/amount mismatch');
    assertContains(verifyRoute, 'subscription_verify_transaction', 'Verify route activates subscription through atomic RPC');

    assertContains(webhookRoute, 'PaymentService.verifyWebhookSignature', 'Webhook route verifies Cashfree signature');
    assertContains(webhookRoute, 'payment_events', 'Webhook route has provider event idempotency');
    assertContains(webhookRoute, 'subscription_activation_transaction', 'Webhook route activates subscription through atomic RPC');

    assertContains(paymentService, 'CASHFREE_ENV', 'Payment service uses explicit Cashfree environment');
    assertContains(paymentService, 'assertCashfreeConfigured', 'Payment service fails closed on missing/mock provider credentials');
    assertContains(paymentService, 'checkedFetch', 'Payment provider calls use checked fetch');

    const env = (process.env.CASHFREE_ENV || '').toLowerCase();
    if (!['production', 'sandbox'].includes(env)) {
        fail('CASHFREE_ENV must be production or sandbox');
    } else {
        pass(`CASHFREE_ENV=${env}`);
    }

    if (env === 'production' && (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY)) {
        fail('Production payment flow requires CASHFREE_APP_ID and CASHFREE_SECRET_KEY');
    }

    if (!process.env.PAYMENT_FLOW_BASE_URL) {
        warn('Live payment browser/provider flow skipped; set PAYMENT_FLOW_BASE_URL and test credentials for a manual/live certification run');
    }

    console.log('\nPAYMENT FLOW SUMMARY');
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
