# Enterprise Live Certification Status

Date: 2026-05-19

## Important Env Clarification

`.env.local` is the real local credentials file. `.env.example` is only a non-secret inventory/template so CI, Vercel, mobile release, and MD approval can verify that every required variable is known without exposing values.

The certification scripts load `.env` first and `.env.local` second, so local secrets override template/default values.

## Completed In This Workspace

### Live Certification Runner

Command:

```bash
node scripts/enterprise-launch-certify.mjs --live
```

Result:

- Passed: 11
- Failed: 6
- Skipped: 0
- Verdict: `NOT LAUNCH CERTIFIED`

Passing gates:

- Secret hygiene.
- Secret usage inventory.
- Typecheck.
- Contract tests.
- Performance budget.
- Mobile enterprise audit.
- Master audit.
- App Check static/native certification.
- Cashfree webhook security.
- Payment flow static certification.
- Production build.

Failing live gates:

- Backup restore drill: `STAGING_DATABASE_URL` missing.
- Backup restore drill: `BACKUP_RESTORE_DRILL_ID` missing.
- RAG governance live DB check: Supabase DNS unreachable from this workspace.
- Chemistry retrieval validation: Supabase DNS unreachable from this workspace.
- Physics retrieval validation: Supabase DNS unreachable from this workspace.
- Biology retrieval validation: Supabase DNS unreachable from this workspace.
- Release readiness: DB performance and DB checks could not reach Supabase from this workspace.

### Env Presence Check

Present in `.env.local`:

- `DATABASE_URL`
- `CASHFREE_APP_ID`
- `CASHFREE_SECRET_KEY`
- `GEMINI_API_KEY`
- `NEET_UPLOAD_KEY_ALIAS`

Missing for live certification:

- `STAGING_DATABASE_URL`
- `BACKUP_RESTORE_DRILL_ID`
- `APP_CHECK_ENFORCEMENT`
- `APP_CHECK_TEST_BASE_URL`
- `APP_CHECK_TEST_AUTH_COOKIE` or `APP_CHECK_TEST_BEARER`
- `CASHFREE_ENV`
- `PAYMENT_FLOW_BASE_URL`
- `NEET_WEB_URL`
- `NEET_UPLOAD_KEYSTORE` or `NEET_UPLOAD_KEYSTORE_BASE64`
- `NEET_UPLOAD_KEYSTORE_PASSWORD`
- `NEET_UPLOAD_KEY_PASSWORD`
- `ADMOB_ANDROID_APP_ID`
- `ADMOB_BANNER_ANDROID`
- `ADMOB_INTERSTITIAL_ANDROID`
- `ADMOB_REWARDED_ANDROID`
- `EXPECTED_EMBEDDING_DIMENSIONS`

### App Check

Command:

```bash
APP_CHECK_ENFORCEMENT=native node scripts/test-app-check-enforcement.mjs
```

Result:

- Static/native certification passed.
- Live rejection probe skipped because `APP_CHECK_TEST_BASE_URL` and auth material are missing.

### Payments

Commands:

```bash
node scripts/test-cashfree-webhook-security.mjs
CASHFREE_ENV=sandbox node scripts/test-payment-flow.mjs
```

Result:

- Webhook cryptographic checks passed.
- Static payment flow checks passed.
- Live production payment/refund/replay proof not run because `CASHFREE_ENV=production`, `PAYMENT_FLOW_BASE_URL`, and manual production payment credentials/procedure are not configured for this workspace.

### Browser E2E / Accessibility

Commands attempted:

```bash
npm run test:a11y
npm run test:e2e
```

Result:

- Blocked by sandbox network policy: local Next server cannot bind to `127.0.0.1:3000`.
- Playwright config was improved to bind to `127.0.0.1` instead of `0.0.0.0`, but this sandbox still blocks listening sockets.

Owner/CI command:

```bash
npm run test:e2e
npm run test:a11y
npm run test:visual
```

### Mobile

Attempted:

```bash
flutter pub get
dart analyze
```

Result:

- Blocked by sandbox filesystem policy: Flutter tried to write to `/Users/ashwanikumar/development/flutter/bin/cache/engine.stamp`, which is outside the writable workspace.

Owner/CI command after mobile release envs are set:

```bash
cd mobile
flutter clean
flutter pub get
dart analyze
flutter build appbundle --release \
  --dart-define=NEET_WEB_URL="$NEET_WEB_URL" \
  --dart-define=ADMOB_ANDROID_APP_ID="$ADMOB_ANDROID_APP_ID" \
  --dart-define=ADMOB_BANNER_ANDROID="$ADMOB_BANNER_ANDROID" \
  --dart-define=ADMOB_INTERSTITIAL_ANDROID="$ADMOB_INTERSTITIAL_ANDROID" \
  --dart-define=ADMOB_REWARDED_ANDROID="$ADMOB_REWARDED_ANDROID"
```

### Load Testing

The load-test script was corrected to use real routes and to fail fast without `LOAD_TEST_JWT`.

Command readiness:

```bash
LOAD_TEST_BASE_URL="https://staging.example.com" \
LOAD_TEST_JWT="real-test-user-jwt" \
LOAD_TEST_CONCURRENCY=50 \
LOAD_TEST_AI_CONCURRENCY=5 \
node scripts/load-test/neet-season-simulation.js
```

Result in this workspace:

- Not run against live staging because `LOAD_TEST_BASE_URL` and `LOAD_TEST_JWT` are missing.
- Script syntax passed and it now refuses unauthenticated load certification.

## Final Remaining Public-Launch Gates

The platform cannot be called `ENTERPRISE PUBLIC LAUNCH CERTIFIED` until all of these pass in a real owner/CI environment:

1. Set `STAGING_DATABASE_URL` and `BACKUP_RESTORE_DRILL_ID`, restore production backup into staging, then run `node scripts/verify-backup-restore.js`.
2. Run live RAG validation for chemistry, physics, biology from a network that can resolve and reach Supabase.
3. Set App Check live probe envs and prove native protected requests reject missing/invalid App Check.
4. Set `CASHFREE_ENV=production`, perform one low-value production payment, refund/cancel drill, and webhook replay verification.
5. Generate signed APK/AAB with release keystore and production AdMob IDs.
6. Run E2E, a11y, and visual tests from a machine/CI runner allowed to bind localhost.
7. Run load test against staging with a real test-user JWT.
8. Execute rollback drill and attach evidence.

## Current Status

Status: `ENTERPRISE PREFLIGHT PASSED`

Public launch status: `PENDING LIVE OPERATIONAL VALIDATION`

