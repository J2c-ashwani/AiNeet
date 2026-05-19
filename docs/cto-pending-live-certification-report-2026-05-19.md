# CTO Pending Live Certification Report

Date: 2026-05-19

## Executive Summary

The command below was executed:

```bash
node scripts/enterprise-launch-certify.mjs --live
```

Result:

- Passed: 11
- Failed: 6
- Skipped: 0
- Verdict: `NOT LAUNCH CERTIFIED`

This does not mean the codebase regressed. The 11 code/static gates passed. The 6 failures are live operational certification gates that require staging/production infrastructure, missing environment variables, reachable Supabase networking, and live validation credentials.

Current status:

```text
ENTERPRISE PREFLIGHT PASSED
PUBLIC LAUNCH CERTIFICATION PENDING LIVE OPERATIONAL VALIDATION
```

## Passed Gates

The following gates passed successfully:

1. Secret hygiene audit.
2. Secret usage inventory.
3. Typecheck.
4. Contract tests.
5. Performance budget audit.
6. Mobile enterprise audit.
7. Master platform audit.
8. App Check static/native certification.
9. Cashfree webhook security.
10. Payment flow static certification.
11. Production build.

## Why 6 Gates Failed

### 1. Backup Restore Drill Failed

Severity: Critical

Category: Disaster Recovery / Database / Production Operations

Failure:

```text
STAGING_DATABASE_URL is required for restore verification
BACKUP_RESTORE_DRILL_ID is required to identify the restore drill being certified
```

Root cause:

The restore verification script now correctly requires an isolated staging database restored from production backup. `.env.local` currently does not contain:

- `STAGING_DATABASE_URL`
- `BACKUP_RESTORE_DRILL_ID`

Why this matters:

Without a real restore drill, we cannot prove that production data can be recovered after deletion, corruption, failed migration, provider outage, or accidental destructive operation.

Required CTO/infra action:

1. Create or select an isolated staging Supabase/Postgres database.
2. Restore the latest production backup into staging.
3. Add to local/CI environment:

```bash
export STAGING_DATABASE_URL="staging-postgres-url"
export BACKUP_RESTORE_DRILL_ID="$(date +%Y%m%d%H%M%S)"
```

4. Run:

```bash
node scripts/verify-backup-restore.js
```

Exit condition:

The script must pass schema checks, RPC checks, pgvector checks, row-count comparison, and integrity checks.

### 2. RAG Governance Live DB Check Failed

Severity: Critical

Category: AI/RAG / Database / Academic Trust

Failure:

```text
getaddrinfo ENOTFOUND db.lfwnrehqjiwpfoylhmby.supabase.co
```

Root cause:

The workspace could not resolve/reach the Supabase database host from this sandbox. `DATABASE_URL` is present, but DNS/network access to the Supabase host failed.

Why this matters:

RAG governance must prove:

- active syllabus filtering works,
- deleted syllabus chunks are excluded,
- stale corpus chunks are excluded,
- embedding dimensions are correct,
- governance metadata exists on active chunks.

Required CTO/infra action:

Run from a machine or CI runner that can reach Supabase:

```bash
node scripts/validate-rag-governance.mjs
```

Exit condition:

The script must pass with no failed governance checks.

### 3. Chemistry Retrieval Validation Failed

Severity: Critical

Category: AI/RAG / Academic Correctness

Failure:

```text
getaddrinfo ENOTFOUND db.lfwnrehqjiwpfoylhmby.supabase.co
```

Root cause:

The retrieval validator could not connect to Supabase from this workspace.

Required CTO/infra action:

Run from a network that can reach Supabase:

```bash
node scripts/validate-retrieval.mjs --subject chemistry
```

Important note:

If Gemini quota is exhausted, the validator may fail or warn at the embedding API stage. That is not the same as DB corruption, but public launch still requires one successful validation run before certification.

Exit condition:

Chemistry retrieval must pass without failed queries and without syllabus leakage.

### 4. Physics Retrieval Validation Failed

Severity: Critical

Category: AI/RAG / Academic Correctness

Failure:

```text
getaddrinfo ENOTFOUND db.lfwnrehqjiwpfoylhmby.supabase.co
```

Root cause:

The validator could not connect to Supabase from this workspace.

Required CTO/infra action:

```bash
node scripts/validate-retrieval.mjs --subject physics
```

Exit condition:

Physics retrieval must pass without failed queries, subject contamination, or incorrect embedding dimensions.

### 5. Biology Retrieval Validation Failed

Severity: Critical

Category: AI/RAG / Academic Correctness

Failure:

```text
getaddrinfo ENOTFOUND db.lfwnrehqjiwpfoylhmby.supabase.co
```

Root cause:

The validator could not connect to Supabase from this workspace.

Required CTO/infra action:

```bash
node scripts/validate-retrieval.mjs --subject biology
```

Exit condition:

Biology retrieval must pass without failed queries, subject contamination, or deleted syllabus leakage.

### 6. Release Readiness Gate Failed

Severity: Critical

Category: Final Release Governance

Failure:

```text
DB performance audit: getaddrinfo ENOTFOUND db.lfwnrehqjiwpfoylhmby.supabase.co
Backup verification: script failed
DB check failed: getaddrinfo ENOTFOUND db.lfwnrehqjiwpfoylhmby.supabase.co
```

Root cause:

The final readiness gate depends on live database connectivity and backup restore verification. Both are currently unavailable from this workspace.

Required CTO/infra action:

After adding staging restore envs and running DB/RAG checks from a network that can reach Supabase:

```bash
node scripts/release-readiness.js
```

Exit condition:

The gate must report:

```text
PRODUCTION_READY = true
```

## Additional Pending Launch Items Not Counted In The 6 Failures

These did not appear as failed gates in the runner, but they are still mandatory before public launch.

### A. Live App Check Probe

Current status:

- Static/native App Check certification passed.
- Live rejection probe was skipped because live probe envs are missing.

Missing:

- `APP_CHECK_ENFORCEMENT=native`
- `APP_CHECK_TEST_BASE_URL`
- `APP_CHECK_TEST_AUTH_COOKIE` or `APP_CHECK_TEST_BEARER`

Required command:

```bash
APP_CHECK_ENFORCEMENT=native node scripts/test-app-check-enforcement.mjs
```

Required proof:

Protected native mutation APIs must reject requests missing valid App Check.

### B. Production Cashfree Payment Proof

Current status:

- Cashfree webhook signature/security checks passed.
- Static payment flow certification passed.
- Real production payment was not executed.

Missing:

- `CASHFREE_ENV=production`
- `PAYMENT_FLOW_BASE_URL`
- Manual low-value production payment.
- Refund/cancel drill.
- Webhook replay verification.

Required commands:

```bash
CASHFREE_ENV=production node scripts/test-cashfree-webhook-security.mjs
CASHFREE_ENV=production node scripts/test-payment-flow.mjs
```

Required proof:

One real production payment must activate subscription correctly, duplicate webhook replay must be idempotent, and refund/cancel behavior must be recorded.

### C. Signed Mobile Release

Current status:

- Mobile enterprise audit passed.
- Signed APK/AAB was not produced in this workspace.

Missing:

- `NEET_WEB_URL`
- `NEET_UPLOAD_KEYSTORE` or `NEET_UPLOAD_KEYSTORE_BASE64`
- `NEET_UPLOAD_KEYSTORE_PASSWORD`
- `NEET_UPLOAD_KEY_PASSWORD`
- `ADMOB_ANDROID_APP_ID`
- `ADMOB_BANNER_ANDROID`
- `ADMOB_INTERSTITIAL_ANDROID`
- `ADMOB_REWARDED_ANDROID`

Required command:

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

### D. Browser E2E / A11y / Visual Tests

Current status:

- Attempted locally.
- Blocked because this sandbox cannot bind a local Next server to port 3000.

Required commands on owner machine or CI:

```bash
npm run test:e2e
npm run test:a11y
npm run test:visual
```

Required proof:

No console errors, hydration failures, redirect loops, auth breakage, broken payment/test flow, or viewport regressions.

### E. Load And Reliability Test

Current status:

- Load-test script was corrected to use real platform APIs.
- Not run against staging because `LOAD_TEST_BASE_URL` and `LOAD_TEST_JWT` are missing.

Required command:

```bash
LOAD_TEST_BASE_URL="https://staging-domain" \
LOAD_TEST_JWT="real-test-user-jwt" \
LOAD_TEST_CONCURRENCY=50 \
LOAD_TEST_AI_CONCURRENCY=5 \
node scripts/load-test/neet-season-simulation.js
```

Required proof:

No failed scenarios, acceptable P95/P99 latency, no DB/Redis/API instability, no retry storms.

## Priority Order For CTO

1. Restore production backup into isolated staging and set restore envs.
2. Run `node scripts/verify-backup-restore.js`.
3. Run RAG governance and retrieval validation from a Supabase-reachable network.
4. Configure live App Check probe envs and run App Check enforcement test.
5. Configure production payment env and execute real payment/refund/replay proof.
6. Produce signed Android AAB/APK with production URL and AdMob IDs.
7. Run E2E/a11y/visual tests on owner machine or CI.
8. Run authenticated staging load test.
9. Run `node scripts/enterprise-launch-certify.mjs --live` again.

## Final Certification Rule

The app can be marked:

```text
ENTERPRISE PUBLIC LAUNCH CERTIFIED
```

only after:

```bash
node scripts/enterprise-launch-certify.mjs --live
```

passes with:

- 0 failures,
- 0 skipped gates,
- attached proof for payment,
- attached proof for signed mobile release,
- attached proof for load test,
- attached rollback drill evidence.

