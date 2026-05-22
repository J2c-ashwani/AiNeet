# Enterprise Public Launch Certification Plan

Date: 2026-05-19
Directive source: MD Final Enterprise Launch Certification Directive dated 2026-05-18.

## CTO Verdict

The platform is code-hardened, but not yet certified for a large public launch. The remaining work is operational proof: secrets, staging restore, RAG live validation, App Check enforcement, production payment proof, signed mobile release, full E2E testing, load testing, monitoring, rollback, and phased rollout.

## Certification Commands

Safe preflight:

```bash
node scripts/enterprise-launch-certify.mjs
```

Live certification, after production/staging env vars are configured:

```bash
node scripts/enterprise-launch-certify.mjs --live
```

The live command must pass without skipped or failed gates before the platform is called public-launch certified.

## Phase 1: Secret Rotation And Repository Cleanup

Rotation is deferred until final production freeze, but preparation is required now.

Required artifacts:

- Secret usage inventory: `node scripts/audit-secret-usage-inventory.mjs`
- Secret literal audit: `node scripts/audit-secret-hygiene.js`
- Rotation runbook: `docs/secret-rotation-and-history-cleanup-2026-05-19.md`

Manual approval required before running:

```bash
git filter-repo --path-glob '*.env*' --invert-paths
git filter-repo --replace-text replacements.txt
```

After a history rewrite, all collaborators must re-clone or hard-reset to the rewritten history.

## Phase 2: Real Backup Restore Drill

Required env:

- `DATABASE_URL`
- `STAGING_DATABASE_URL`
- `BACKUP_RESTORE_DRILL_ID`

Command:

```bash
node scripts/verify-backup-restore.js
```

This gate must prove that the restored staging database is separate from production and structurally usable.

## Phase 3: RAG Certification

Already applied migration:

- `scripts/migrations/002_rag_current_syllabus_governance.sql`

Required commands:

```bash
node scripts/validate-retrieval.mjs --subject chemistry
node scripts/validate-retrieval.mjs --subject physics
node scripts/validate-retrieval.mjs --subject biology
node scripts/validate-rag-governance.mjs
```

## Phase 4: Live Firebase App Check Enforcement

Required env:

- `APP_CHECK_ENFORCEMENT=native`
- `APP_CHECK_TEST_BASE_URL`
- `APP_CHECK_TEST_AUTH_COOKIE` or `APP_CHECK_TEST_BEARER`

Command:

```bash
node scripts/test-app-check-enforcement.mjs
```

The live probe must confirm protected native mutation requests fail without a valid App Check token.

## Phase 5: Production Payment Certification

Required env:

- `CASHFREE_ENV=production`
- `CASHFREE_APP_ID`
- `CASHFREE_SECRET_KEY`
- `PAYMENT_FLOW_BASE_URL`

Commands:

```bash
node scripts/test-cashfree-webhook-security.mjs
node scripts/test-payment-flow.mjs
```

Manual proof required:

- One low-value production payment.
- One cancellation drill that confirms no refund is issued, future billing stops, and access continues until the current billing period ends.
- One webhook replay verification.

If paid checkout is enabled during the controlled rollout, this payment proof is a controlled-rollout blocker. If checkout remains disabled behind a feature flag, it may remain a pre-scale gate.

## Phase 6: Signed Mobile Release Certification

Required env:

- `NEET_WEB_URL`
- `NEET_UPLOAD_KEYSTORE`
- `NEET_UPLOAD_KEYSTORE_PASSWORD`
- `NEET_UPLOAD_KEY_ALIAS`
- `NEET_UPLOAD_KEY_PASSWORD`
- `ADMOB_ANDROID_APP_ID`
- `ADMOB_BANNER_ANDROID`
- `ADMOB_INTERSTITIAL_ANDROID`
- `ADMOB_REWARDED_ANDROID`

Required proof:

- Signed APK/AAB.
- Production URL boot.
- App Check token injection.
- FCM registration.
- Offline replay.
- Purchase restore.

## Phase 7: Full Enterprise E2E Certification

Commands:

```bash
npm run test:e2e
npm run test:a11y
npm run test:visual
```

These must run against a production-like environment with real auth/session behavior.

## Phase 8: Load And Reliability Certification

Run the load test suite against staging first:

```bash
node scripts/load-test/neet-season-simulation.js
```

Required evidence:

- Supabase pool stability.
- Query/index performance.
- Redis resilience.
- AI quota fallback.
- Rate limits.
- Queue stability.
- Cron survivability.
- Degraded-mode behavior.

## Phase 9: Monitoring And Rollback Certification

Required before launch:

- Sentry production alerts.
- Uptime checks.
- Payment failure alerts.
- AI quota alerts.
- DB latency alerts.
- Feature flags for AI, payments, OMR, battleground, notifications, experimental systems.
- Rollback plan tested once.

Rollback evidence must include the actual previous/current Vercel deployment IDs or URLs, rollback timestamp, operator, elapsed time, and post-rollback health check result. A documented procedure alone is not rollback proof.

## Rollout Sequence

1. Internal production dry run.
2. Closed beta: 100-500 users.
3. Soft launch: 5k-10k users.
4. Stress/load certification.
5. Public launch.
6. Scale expansion.

## Final Approval Rule

Status can be changed to `ENTERPRISE PUBLIC LAUNCH CERTIFIED` only after:

- `node scripts/enterprise-launch-certify.mjs --live` passes.
- The real payment proof is attached.
- The signed mobile release proof is attached.
- The rollback drill is completed.
- MD sir approves the phased rollout.
