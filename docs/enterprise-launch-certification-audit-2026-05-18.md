# Enterprise Launch Certification Audit

Date: 2026-05-18
Role: Principal QA Architect, Enterprise CTO, Security Auditor, Production Reliability Engineer
Scope: Web app, mobile shell, API, database access patterns, RAG/AI, payments, deployment, CI/CD, production operations.

## Executive Verdict

The platform is much closer to enterprise grade than the original MVP, but I would not call it fully launch-certified yet.

The good news: core static gates are now strong. Build passes, typecheck passes, enterprise/mobile audits pass, contract tests pass, audit-master reports zero findings, and the user-confirmed `npm audit` result is zero vulnerabilities.

The launch blockers are deeper than normal lint/build failures:

- Production database credentials are hardcoded in tracked files.
- Firebase App Check exists in code but is not enforced by sensitive web APIs.
- The mobile release workflow is not aligned with the new release signing and AdMob requirements.
- The backup verification script does not perform an actual restore drill.
- Test submission can commit the core transaction and still return failure during post-commit side effects, creating offline retry and result-screen corruption risk.
- RAG metadata does not yet enforce syllabus version, active corpus, or deleted/rationalized chapter exclusion at the database level.
- Full browser E2E with real auth was not completed in this environment because the sandbox cannot bind a local server port.

Current status: controlled beta candidate after P0 fixes, not enterprise launch-certified for public scale.

## Verification Evidence

These checks were run or verified during this audit window.

| Check | Result | Evidence |
| --- | --- | --- |
| TypeScript | Passed | `npm run typecheck` |
| Design governance | Passed | `npm run lint:design` |
| ESLint quiet gate | Passed | `npx eslint app components lib --quiet` |
| Master static audit | Passed | `node scripts/audit-master.js`, zero findings |
| Mobile enterprise audit | Passed | `node scripts/audit-mobile-enterprise.js`, 31+ checks passed in user output |
| Contract tests | Passed | `npm run test:contracts`, 8 passed |
| Next production build | Passed | `npm run build`, 127 static pages generated |
| Flutter analyze | Passed | `dart analyze`, no issues in user output |
| Flutter release APK | Passed locally | `flutter build apk --release`, user output built APK |
| Dependency audit | Passed by user | `npm audit`, found 0 vulnerabilities |
| Release readiness | Passed by user from repo root | `PRODUCTION_READY = true`, 26 passed, 0 warnings |
| Browser/live route crawl | Blocked in this sandbox | `next start` failed with `listen EPERM` on local ports |
| Live DB/RAG checks in this sandbox | Blocked by restricted network | Supabase DNS resolution failed here; user can run locally |

## Architecture Map

### Frontend

- Framework: Next.js 16 App Router with React 19.
- Pages discovered: 45 `page.js` files.
- UI systems: shared `components/ui`, design audit scripts, route validation, CSS class validation.
- State: React Query, Supabase auth context, browser storage, IndexedDB/resilient storage, offline queue.
- Mobile web integration: `ClientLayout` starts boot orchestration, service worker registration, native bridge integration, lifecycle manager, FCM registration.

### Backend/API

- API routes discovered: 88 `app/api/**/route.js` files.
- Static classifier:
  - 11 routes use `withApiRoute`.
  - 55 routes use service-role/backend DB access paths.
  - 51 routes have local user/admin auth indicators.
  - 9 routes have cron/secret indicators.
  - 2 webhook routes.
  - 22 routes have no obvious route-local auth/secret/webhook indicator and need explicit public-route classification.
- Providers: Supabase Postgres/Auth/Storage, Upstash Redis, Sentry, Gemini, Cashfree, Google Play, Firebase.
- Core backend patterns: `getUserFromRequest`, `db-safe`, RPC transactions, payment timelines, academic timelines, route-level helpers.

### AI/RAG

- Runtime: `lib/rag_engine.js`.
- Embedding model: `gemini-embedding-001`.
- Embedding dimension: 3072.
- Vector DB: Postgres `pgvector`, table `ncert_embeddings`.
- Retrieval: hybrid BM25 + vector function `hybrid_ncert_search`.
- Confidence gate: top similarity threshold around 0.72 for retrieval pass, insufficient below 0.65 in explanation generation.

### Payments

- Web: Cashfree create/verify/webhook.
- Mobile: Google Play verification and Pub/Sub webhook.
- Subscription mutation: RPC-based activation transactions.
- Idempotency: `payment_events`, provider event IDs, activation RPC.

### Mobile

- Native shell: Flutter WebView.
- Bridge contract: v3 capabilities for FCM, camera, haptics, ads, purchase restore.
- Firebase: Messaging, Crashlytics, App Check.
- Ads: Google Mobile Ads.
- Billing: Play Billing via in-app purchase package.

### Deployment/Operations

- CI: production gates, audit scripts, build checks, release-readiness script.
- Beta distribution: GitHub workflow for Flutter APK and Firebase App Distribution.
- Observability: Sentry, health route, mobile telemetry, runtime pages.
- Reliability primitives: recovery manager, lifecycle manager, circuit breaker, job queue, runbooks.

## Critical Findings

### 1. Tracked Files Contain Hardcoded Production Database Credentials

Severity: Critical

Category: Security, Deployment, Database

Exact reproduction:

```bash
git ls-files migrate4.js migrate8.js scripts/enable_realtime.js
git grep -n "postgresql://postgres:" -- migrate4.js migrate8.js scripts/enable_realtime.js
```

Evidence:

- `migrate4.js:4` contains a hardcoded Supabase Postgres URL.
- `migrate8.js:4` contains a hardcoded Supabase Postgres URL.
- `scripts/enable_realtime.js:4` falls back to a hardcoded Supabase Postgres URL.
- These files are tracked by git.

Root cause:

Temporary migration scripts were committed with direct database connection strings and password-bearing fallbacks instead of requiring `DATABASE_URL`.

Likely responsible files:

- `migrate4.js`
- `migrate8.js`
- `scripts/enable_realtime.js`

Recommended permanent fix:

- Rotate the Supabase database password immediately.
- Remove hardcoded connection strings from all tracked files.
- Make migration scripts fail closed when `DATABASE_URL` is missing.
- Move one-off migration scripts under a controlled migration folder or delete them after converting to formal migrations.
- Purge the leaked secret from git history before sharing the repository externally.
- Add a CI secret scanner that fails on database URLs, service role keys, JWT secrets, Cashfree keys, Firebase private keys, and Google service account material.

Risk if unresolved:

Anyone with repository access can connect directly to production Postgres. This is a total data compromise path.

Priority:

P0 - fix before any launch, beta distribution, or investor/customer repository sharing.

### 2. Firebase App Check Exists But Is Not Enforced By Sensitive APIs

Severity: High

Category: Security, Mobile, Backend

Exact reproduction:

```bash
rg -n "verifyAppCheck|X-Firebase-AppCheck|App Check|app check" lib app components scripts proxy.js
```

Evidence:

- `lib/security/verify-app-check.js` defines the verifier and protected endpoint list.
- Static search found no imports or calls outside that file.
- The verifier itself logs and fails open on network verification failure.

Root cause:

The native shell now generates App Check capability, but server enforcement was not wired into API routes or the central gateway.

Likely responsible files:

- `lib/security/verify-app-check.js`
- `app/api/tests/submit/route.js`
- `app/api/xp/update/route.js`
- `app/api/battleground/**`
- `app/api/omr/**`
- `app/api/subscription/**`

Recommended permanent fix:

- Integrate App Check enforcement into the central API gateway wrapper.
- Require App Check on high-cost and mutation endpoints from mobile/native contexts.
- Fail closed in production for sensitive endpoints.
- Add contract tests proving requests without App Check are rejected where required.
- Keep a controlled bypass only for server-to-server/webhook/test contexts.

Risk if unresolved:

Attackers can script expensive AI, test submission, OMR, XP, and payment-adjacent endpoints without owning a real app install.

Priority:

P0 for launch hardening.

### 3. Test Submission Can Commit Data Then Return Failure

Severity: High

Category: Backend, Database, Mobile, Frontend

Exact reproduction:

1. Submit a test through `/api/tests/submit`.
2. Let `submit_test_transaction` succeed.
3. Force a later side effect to fail, for example XP, streak, achievement, referral, or trust update.
4. Observe the route returns `500` even though the test was already completed.

Evidence:

- Core transaction runs at `app/api/tests/submit/route.js:235`.
- Post-commit side effects run after that, including trust, XP, streak, achievements, referral rewards.
- Catch-all response at `app/api/tests/submit/route.js:426-440` returns failure for errors after the core commit.
- Client offline fallback queues failed submissions at `app/test/[id]/page.js:341-349`.
- Results page only reads `sessionStorage` and redirects if missing at `app/test/[id]/results/page.js:17-25`.

Root cause:

The route treats post-commit side effects as part of the user-visible submission transaction. The frontend assumes any 500 means the test was not submitted.

Likely responsible files:

- `app/api/tests/submit/route.js`
- `app/test/[id]/page.js`
- `app/test/[id]/results/page.js`
- `lib/client/offline-queue.js`

Recommended permanent fix:

- Define one atomic "core submission succeeded" boundary.
- Return success once the test transaction commits.
- Move XP, streaks, trust recovery, achievements, referrals, notifications, and analytics into idempotent background jobs.
- Add a server-backed result fetch route so `/test/[id]/results` can recover after refresh, offline replay, or duplicate submit.
- Use idempotency keys server-side instead of trusting only event locks.

Risk if unresolved:

Students can complete a test, receive an error, retry offline, lose the result screen, or see duplicated/contradictory state.

Priority:

P0 for real student trust.

### 4. Backup Restore Verification Is Not A Restore Drill

Severity: High

Category: Deployment, Database, Reliability

Exact reproduction:

```bash
nl -ba scripts/verify-backup-restore.js | sed -n '1,140p'
```

Evidence:

- Header says it restores latest Supabase backup into staging.
- Code only connects to `DATABASE_URL` and checks production tables.
- `STAGING_DATABASE_URL` is read and `stagingPool` is constructed, but it is never used.

Root cause:

The operational check validates production reachability, not backup restore ability.

Likely responsible file:

- `scripts/verify-backup-restore.js`

Recommended permanent fix:

- Provision a real staging restore target.
- Restore latest backup into staging on a schedule.
- Validate row counts, schema version, critical indexes, RLS policies, RPC functions, vector indexes, and referential integrity on staging.
- Record restore duration, backup age, and rollback readiness.
- Fail release readiness if restore drill age exceeds the allowed window.

Risk if unresolved:

The team may believe backups work until the first real incident, when restore time or restore correctness is unknown.

Priority:

P0 before public launch.

### 5. Mobile Beta Release Workflow Is Out Of Sync With Release Hardening

Severity: High

Category: Mobile, Deployment

Exact reproduction:

```bash
nl -ba .github/workflows/beta-distribution.yml | sed -n '58,67p'
nl -ba mobile/android/app/build.gradle.kts
```

Evidence:

- `.github/workflows/beta-distribution.yml:62-64` builds release APK without keystore environment variables.
- The workflow also does not pass AdMob Dart defines.
- The Android Gradle release config now expects release signing and AdMob app ID inputs.

Root cause:

Mobile runtime hardening was applied, but beta CI was not upgraded with the required secret restore and build flags.

Likely responsible files:

- `.github/workflows/beta-distribution.yml`
- `mobile/android/app/build.gradle.kts`
- `mobile/lib/core/ad_service.dart`

Recommended permanent fix:

- Store upload keystore as a GitHub secret, restore it in CI, and pass `NEET_UPLOAD_KEYSTORE*`.
- Pass `ADMOB_ANDROID_APP_ID`, banner, interstitial, and rewarded ad unit IDs as `--dart-define`.
- Add `flutter analyze` and a release build smoke check before distribution.
- Keep debug/test ad IDs only in debug builds.

Risk if unresolved:

Local builds can pass while the real beta distribution pipeline fails or ships with incomplete monetization config.

Priority:

P0 before beta tester distribution.

### 6. Mobile Release Has Cleartext Traffic Enabled And Hardcoded Initial URL

Severity: High

Category: Mobile, Security, Deployment

Exact reproduction:

```bash
nl -ba mobile/lib/main.dart | sed -n '20,30p'
nl -ba mobile/android/app/src/main/AndroidManifest.xml | sed -n '1,20p'
```

Evidence:

- `mobile/lib/main.dart:24` hardcodes `https://ai-neet.vercel.app/login`.
- `mobile/android/app/src/main/AndroidManifest.xml:12` sets `android:usesCleartextTraffic="true"`.

Root cause:

The mobile shell still carries MVP-era deployment assumptions and permissive network settings.

Likely responsible files:

- `mobile/lib/main.dart`
- `mobile/android/app/src/main/AndroidManifest.xml`

Recommended permanent fix:

- Drive the initial web URL from release-time configuration.
- Use the production canonical domain for release.
- Set cleartext traffic to false for release.
- Add Android network security config only if a controlled debug exception is needed.
- Add a CI assertion that release builds cannot target old domains.

Risk if unresolved:

The APK can boot the wrong host and permits insecure HTTP transport behavior in release.

Priority:

P0 before Play Store or external beta.

### 7. RAG Corpus Cannot Enforce Current Syllabus At The Database Layer

Severity: High

Category: AI/RAG, Database, Education Quality

Exact reproduction:

```bash
nl -ba scripts/migrations/001_ncert_rag_enterprise.sql | sed -n '16,65p'
nl -ba scripts/migrations/001_ncert_rag_enterprise.sql | sed -n '136,195p'
```

Evidence:

- `ncert_embeddings` stores subject, class, book, chapter, topic, model, and pipeline versions.
- It does not store explicit `syllabus_version`, `ncert_edition`, `is_active`, `deleted_from_current_syllabus`, or rationalized-syllabus flags.
- `hybrid_ncert_search` filters subject, chapter, class, and embedding only.

Root cause:

The RAG schema is strong on retrieval metadata but not yet strong on curriculum-governance metadata.

Likely responsible files:

- `scripts/migrations/001_ncert_rag_enterprise.sql`
- `lib/rag_engine.js`
- `scripts/validate-retrieval.mjs`

Recommended permanent fix:

- Add syllabus version, NCERT edition, active flag, deleted/rationalized exclusion flag, ingestion batch ID, source checksum, and corpus status.
- Make retrieval filter only active/current syllabus chunks by default.
- Add a strict validator for deleted chapter leakage, cross-subject contamination, and stale embedding batches.
- Require retrieval validation for physics, chemistry, and biology before release.

Risk if unresolved:

The app can give academically outdated or deleted-syllabus explanations while appearing "NCERT grounded."

Priority:

P0 for education trust if RAG explanations are part of launch.

## High Findings

### 8. Middleware And Edge Rate Limiting Fail Open On Unexpected Errors

Severity: High

Category: Security, Backend, Reliability

Exact reproduction:

```bash
nl -ba proxy.js | sed -n '147,179p'
```

Evidence:

- Rate limit errors are logged and requests continue at `proxy.js:168-171`.
- Middleware catch-all returns `NextResponse.next()` at `proxy.js:175-178`.

Root cause:

Global middleware is optimized for availability, but unexpected auth/session/rate-limit failures are allowed through.

Likely responsible file:

- `proxy.js`

Recommended permanent fix:

- Split public, protected, admin, webhook, static, and health routes into explicit middleware policies.
- Fail closed for protected pages/admin APIs when session verification crashes.
- Keep availability-focused bypasses only for explicitly public routes and webhooks.
- Add tests that simulate middleware dependency errors.

Risk if unresolved:

A middleware dependency failure can disable global protection and rate limits. Route-local auth mitigates some APIs, but protected pages and abuse controls still degrade.

Priority:

P1, but should be fixed before scale.

### 9. Public Keepalive Route Uses Service-Role DB Probe And Returns DB Error Details

Severity: High

Category: Security, Backend, Deployment

Exact reproduction:

```bash
nl -ba app/api/cron/keepalive/route.js | sed -n '1,30p'
```

Evidence:

- Public GET route touches `users` through backend DB access.
- On DB error it returns `details: error.message`.
- No cron secret or internal secret is required.

Root cause:

Operational keepalive was implemented as a public diagnostic endpoint.

Likely responsible file:

- `app/api/cron/keepalive/route.js`

Recommended permanent fix:

- Protect keepalive with the same cron secret policy as other cron routes.
- Query `SELECT 1` or a non-sensitive health RPC, not `users`.
- Return sanitized status only.

Risk if unresolved:

Attackers can trigger production DB probes and gain operational error detail.

Priority:

P1.

### 10. API Gateway And Schema Enforcement Are Still Partial

Severity: High

Category: Backend, API, Security

Exact reproduction:

```bash
find app/api -name route.js | wc -l
rg -l "withApiRoute\\(" app/api | wc -l
```

Evidence:

- 88 API route files exist.
- Static classifier found only 11 routes using `withApiRoute`.
- 55 routes use backend/service DB access paths.
- 22 routes have no obvious route-local auth/secret/webhook marker and need explicit public-route classification.

Root cause:

Enterprise route wrapper was introduced but not adopted across the entire API surface.

Likely responsible files:

- `app/api/**/route.js`
- `lib/api/route-wrapper.js` or equivalent gateway helper

Recommended permanent fix:

- Make every route go through one gateway wrapper.
- Require explicit route classification: public, user, admin, cron, internal, webhook.
- Require schema validation for all request bodies and query params.
- Standardize response shape, error shape, rate limits, audit logging, App Check, and timeout behavior.
- Add CI that fails raw handlers unless they are allowlisted.

Risk if unresolved:

Security and validation depend on every route author remembering every control manually.

Priority:

P1.

## Medium Findings

### 11. Payment Environment Selection Can Point Staging At Production Cashfree

Severity: Medium

Category: Payments, Deployment

Exact reproduction:

```bash
nl -ba lib/payment_service.js | sed -n '8,18p'
```

Evidence:

- `isProduction` is true if the key contains `_prod_` or `NODE_ENV === 'production'`.
- Vercel preview/staging builds often run with `NODE_ENV=production`.

Root cause:

Provider environment is inferred from build mode instead of an explicit payment environment variable.

Likely responsible file:

- `lib/payment_service.js`

Recommended permanent fix:

- Add explicit `CASHFREE_ENV=production|sandbox`.
- Refuse mismatched key/environment combinations.
- Add CI and startup validation for payment environment.

Risk if unresolved:

Preview/staging can accidentally call production payment APIs.

Priority:

P1.

### 12. Cashfree Webhook Signature Check Lacks Timing-Safe Compare And Freshness Window

Severity: Medium

Category: Payments, Security

Exact reproduction:

```bash
nl -ba app/api/webhooks/cashfree/route.js | sed -n '23,32p'
```

Evidence:

- Signature is compared with `signature !== expectedSignature`.
- No timestamp freshness window is enforced before accepting signed payloads.

Root cause:

Webhook authentication is functional but not fully hardened against replay/timing patterns.

Likely responsible files:

- `app/api/webhooks/cashfree/route.js`
- `lib/payment_service.js`

Recommended permanent fix:

- Use `crypto.timingSafeEqual` with normalized buffers.
- Reject timestamps outside an allowed replay window.
- Keep idempotency table as second layer.

Risk if unresolved:

Replay protection depends heavily on event idempotency and provider behavior.

Priority:

P1.

### 13. Performance Budget Gate Gives False Confidence Under Current Chunk Naming

Severity: Medium

Category: Performance, CI/CD

Exact reproduction:

```bash
node scripts/audit-performance-budget.js
find .next/static -type f -name '*.js' -exec du -k {} + | sort -nr | head -20
```

Evidence:

- The script detected `Initial bundle 0.0KB`.
- Real chunk sizes include about 416 KB, 360 KB, 360 KB, and 316 KB files.
- Initial chunk detection only matches names containing `main`, `polyfills`, `framework`, or `webpack`.

Root cause:

The budget script assumes older Webpack-style chunk names, while the build emits hashed Turbopack/Next chunk names.

Likely responsible file:

- `scripts/audit-performance-budget.js`

Recommended permanent fix:

- Parse Next build manifest files instead of guessing chunk names.
- Enforce per-route first-load JS from build metadata.
- Fail when the budget cannot compute a valid initial bundle.

Risk if unresolved:

CI can report performance as healthy while mobile users receive large first-load payloads.

Priority:

P1.

### 14. Browser E2E Coverage Does Not Prove Real Auth Or Real User Flows

Severity: Medium

Category: Frontend, QA, Auth

Exact reproduction:

```bash
nl -ba playwright.config.js | sed -n '1,60p'
nl -ba tests/visual/authenticated/authenticated.spec.js | sed -n '1,70p'
```

Evidence:

- Playwright default `testDir` is `./tests/visual`.
- Authenticated visual tests inject `auth_token=mock_jwt_token` and local storage mock auth.
- Real login lines are commented out.
- Browser-level testing was blocked in this sandbox by local port binding failure: `listen EPERM`.

Root cause:

Visual testing is present, but real auth/session testing is not wired as a launch gate.

Likely responsible files:

- `playwright.config.js`
- `tests/visual/authenticated/authenticated.spec.js`
- `tests/e2e/**`
- `package.json`

Recommended permanent fix:

- Add a dedicated launch E2E config for public, authenticated, admin, payment, offline, and mobile viewport flows.
- Use seeded Supabase QA users or Supabase test auth helpers.
- Fail CI on console errors, hydration errors, failed API calls, redirect loops, and broken buttons.

Risk if unresolved:

The app can pass screenshots while login, session restore, protected routes, and real APIs are broken.

Priority:

P1.

### 15. External Fetch Helper Has No Timeout

Severity: Medium

Category: Backend, Reliability, Performance

Exact reproduction:

```bash
nl -ba lib/http.js | sed -n '1,20p'
nl -ba app/api/ncert/proxy/route.js | sed -n '13,31p'
```

Evidence:

- `checkedFetch` simply calls `fetch`.
- NCERT proxy fetches full PDFs into memory and has no timeout or size cap.

Root cause:

The shared HTTP wrapper does not enforce deadline, retry policy, body limit, or circuit breaker behavior.

Likely responsible files:

- `lib/http.js`
- `app/api/ncert/proxy/route.js`
- Payment and AI-adjacent provider calls using `checkedFetch`

Recommended permanent fix:

- Add AbortController timeout support.
- Add max response size where applicable.
- Add provider-specific deadlines and error classification.
- Stream large PDFs instead of buffering full files in memory.

Risk if unresolved:

Slow providers can consume serverless execution time and memory.

Priority:

P1.

### 16. Diagnostic Result Claims Use Simulated Percentiles And Peer Improvement

Severity: Medium

Category: Frontend, Backend, Compliance, Education Quality

Exact reproduction:

```bash
nl -ba app/api/tests/diagnostic/grade/route.js | sed -n '96,117p'
nl -ba app/test/diagnostic/results/page.js | sed -n '96,140p'
```

Evidence:

- Comments say simulated percentiles are used for FOMO/urgency.
- UI displays "Average: 61%", "Bottom X%", and peer improvement claims.

Root cause:

Growth copy is being presented with data-like language without tying every number to real analytics.

Likely responsible files:

- `app/api/tests/diagnostic/grade/route.js`
- `app/test/diagnostic/results/page.js`

Recommended permanent fix:

- Replace simulated claims with actual cohort analytics or clearly labeled estimates.
- Store metric source, sample size, and time window.
- Add compliance review for student-facing performance claims.

Risk if unresolved:

Trust and marketing compliance risk. Parents/students may see invented benchmark claims as factual.

Priority:

P1.

### 17. Diagnostic AI Question Path Silently Degrades

Severity: Medium

Category: AI/RAG, Backend, Product Reliability

Exact reproduction:

```bash
nl -ba app/api/tests/diagnostic/generate/route.js | sed -n '41,70p'
nl -ba app/api/tests/diagnostic/grade/route.js | sed -n '19,33p'
```

Evidence:

- Diagnostic generate inserts AI questions with UUID ids into `questions`.
- Diagnostic grade comments state DB question IDs are integers, so UUID AI ids cannot be server-graded.
- The generator catches LLM/insert errors and substitutes DB questions.

Root cause:

AI-generated diagnostic question IDs are not aligned with the persistent question schema and grading contract.

Likely responsible files:

- `app/api/tests/diagnostic/generate/route.js`
- `app/api/tests/diagnostic/grade/route.js`
- `lib/rag_engine.js`

Recommended permanent fix:

- Create a separate `diagnostic_generated_questions` table or server-side signed session bundle.
- Grade generated questions against a server-stored answer key.
- Stop inserting UUIDs into integer-ID question flows.

Risk if unresolved:

The advertised AI diagnostic experience can silently fall back or penalize AI-generated attempted questions as incorrect.

Priority:

P1.

### 18. Offline Queue Treats All HTTP 400 Replays As Safe To Drop

Severity: Medium

Category: Mobile, Frontend, Reliability

Exact reproduction:

```bash
nl -ba lib/client/offline-queue.js | sed -n '177,199p'
```

Evidence:

- Offline replay allows 400.
- Any 400 is counted as success and removed from the queue.
- Comment assumes 400 means already completed.

Root cause:

Replay result classification is based on status code rather than machine-readable error code.

Likely responsible file:

- `lib/client/offline-queue.js`

Recommended permanent fix:

- Require structured error codes from `/api/tests/submit`.
- Drop only `TEST_ALREADY_SUBMITTED` or duplicate/idempotent statuses.
- Keep validation errors visible to the user and telemetry.

Risk if unresolved:

Real failed submissions can be discarded permanently.

Priority:

P1.

### 19. Mobile FCM Registration Leaks Token To Logs And Uses Unstable Device Identity

Severity: Medium

Category: Mobile, Security, Privacy

Exact reproduction:

```bash
nl -ba mobile/lib/main.dart | sed -n '200,240p'
nl -ba mobile/lib/main.dart | sed -n '558,576p'
```

Evidence:

- FCM token is printed with `debugPrint`.
- All installs subscribe to `daily_reminders` and `all_users`.
- Device ID is derived from `token.hashCode.abs()`.

Root cause:

Notification setup is functional but not yet privacy/consent/identity hardened.

Likely responsible file:

- `mobile/lib/main.dart`

Recommended permanent fix:

- Do not log tokens in release.
- Generate a stable install/device ID and persist it securely.
- Subscribe to broad topics only after consent and user segmentation.
- Rotate device records when FCM token rotates.

Risk if unresolved:

Notification privacy, auditability, and device registry quality are weak.

Priority:

P1.

## Low Findings

### 20. Image Optimization Allows Any HTTPS Host

Severity: Low

Category: Security, Performance

Exact reproduction:

```bash
nl -ba next.config.mjs | sed -n '26,30p'
```

Evidence:

- `images.remotePatterns` allows `{ protocol: 'https', hostname: '**' }`.

Root cause:

The image allowlist is open-ended.

Likely responsible file:

- `next.config.mjs`

Recommended permanent fix:

- Restrict image hosts to known providers and owned domains.
- Disable optimization for untrusted user-controlled URLs or proxy them through a safer media pipeline.

Risk if unresolved:

Potential resource abuse, cache growth, and exposure to future image optimizer issues.

Priority:

P2.

### 21. Frontend Copy And Developer-Language Residue Still Needs P2 Polish

Severity: Low

Category: Frontend, UX

Exact reproduction:

```bash
rg -n "ACQUISITION FUNNEL|GROWTH ENGINE|FOMO|Fear Panel|Psychological|MD Mandate|P0|mock_jwt" app components lib tests --glob "*.{js,jsx,ts,tsx}"
```

Evidence:

- No replacement-character corruption was found in the sampled scan.
- Raw emojis still exist in several student-facing buttons/share texts.
- Developer/growth language remains in comments and logs.
- Diagnostic UI still uses aggressive labels such as "CRITICAL DIAGNOSIS COMPLETE", "Bottom X%", and social unlock mechanics.

Root cause:

Bulk emoji/code cleanup improved the app, but student-facing copy and internal growth comments were not fully separated.

Likely responsible files:

- `app/test/diagnostic/results/page.js`
- `app/test/[id]/results/page.js`
- `app/battleground/page.js`
- `app/leaderboard/page.js`
- Admin pages and API logs

Recommended permanent fix:

- Run a dedicated student-facing copy audit.
- Separate internal comments/logs from user-visible strings.
- Use icons consistently instead of raw emoji in UI buttons.
- Keep urgency copy factual and respectful.

Risk if unresolved:

Lower trust and polish, especially for parents, teachers, and institutional buyers.

Priority:

P2.

### 22. Generated ESLint Report Is Tracked

Severity: Low

Category: Repo Hygiene, Deployment

Exact reproduction:

```bash
git ls-files eslint-report-6.json
```

Evidence:

- `eslint-report-6.json` is tracked.

Root cause:

Generated audit/report output was committed.

Likely responsible file:

- `eslint-report-6.json`

Recommended permanent fix:

- Remove generated reports from git.
- Add report output patterns to `.gitignore`.
- Keep CI artifacts in CI artifact storage.

Risk if unresolved:

No direct runtime risk, but it increases repo noise and can leak source snapshots or stale findings.

Priority:

P2.

## Browser And UX Audit Limitation

I attempted to start the built app locally for browser-level route testing, but this sandbox cannot bind local ports. Both wildcard and localhost binding failed with `listen EPERM`.

Because of that, I cannot honestly certify:

- every page renders without console errors,
- no hydration mismatches exist,
- every button works,
- protected route redirects are correct,
- mobile/tablet layouts are visually clean,
- slow-network behavior is stable,
- real auth session restore works.

Manual certification commands to run from the repo root:

```bash
npm run build
npm run start
npm run test:visual
npm run test:a11y
```

But these are not enough by themselves. The real missing launch gate is a proper Playwright E2E suite with real QA credentials, real session cookies, console-error failure, failed-request failure, mobile viewport runs, and protected route checks.

## AI/RAG Certification Status

Positive:

- RAG has been aligned to `gemini-embedding-001` and 3072 dimensions.
- The schema and runtime now match the working free-tier embedding model.
- User-provided chemistry validation showed corpus integrity clean with zero failures, though several expected-chapter warnings were caused by missing/not-yet-ingested chapters or limited AI quota.

Not yet certified:

- Live validation for physics, chemistry, and biology was not completed from this sandbox because Supabase DNS/network access is blocked here.
- Validator checks top retrieval behavior but not full syllabus-version governance.
- No hard database invariant prevents stale/deleted/rationalized chunks from retrieval.

Required before launch if RAG is student-facing:

```bash
node scripts/validate-retrieval.mjs --subject physics
node scripts/validate-retrieval.mjs --subject chemistry
node scripts/validate-retrieval.mjs --subject biology
```

Add a second validator for:

- cross-subject contamination,
- deleted chapter leakage,
- active syllabus only,
- embedding dimension consistency,
- source checksum consistency,
- top-k source chapter correctness,
- stale ingestion batch exclusion.

## Scalability Assessment

The platform can support a controlled beta once P0 issues are fixed. It is not ready for "millions of users" without the next hardening layer.

Current strengths:

- Build and static gates are now mostly strong.
- Payment activation is largely RPC/idempotency based.
- Mobile bridge v3 is wired.
- Offline queue has real Web Crypto encryption.
- Release readiness script now works correctly from repo root.
- Runbooks and operational primitives exist.

Current scale risks:

- Many APIs still bypass a single gateway.
- App Check is not enforced.
- Rate limiting and middleware fail open.
- External provider calls have no global timeout policy.
- Performance budget script can miss true first-load JS.
- RAG depends on live Gemini quota and lacks syllabus governance fields.
- Backup restore is not proven.
- Browser E2E does not yet exercise real auth.

## Scores

These scores are based on code evidence, local static/build checks, and user-provided live command outputs.

| Area | Score | Meaning |
| --- | ---: | --- |
| Enterprise readiness | 74/100 | Stronger than MVP, but blocked by secrets, App Check, DR, mobile deployment, and test consistency |
| Security posture | 68/100 | Zero npm vulnerabilities, but tracked DB credentials and unenforced App Check are serious |
| Production stability | 76/100 | Build/release gates pass, but post-commit failure and weak E2E remain |
| AI reliability | 69/100 | Embedding model fixed, but syllabus/version governance is not enterprise complete |
| Mobile launch confidence | 72/100 | Bridge passes audit, but release URL, cleartext traffic, CI secrets, and notification identity need work |
| Deployment confidence | 67/100 | Readiness passes locally, but beta CI and restore verification are not production-grade |

## Priority Fix Order

1. Rotate exposed Supabase database password and remove hardcoded DB URLs from tracked files and git history.
2. Enforce Firebase App Check on high-cost and mutation APIs through the central route gateway.
3. Fix test submission so committed submissions always return recoverable success, and add server-backed results recovery.
4. Replace backup "verification" with a real staging restore drill.
5. Update mobile beta workflow for keystore, AdMob dart-defines, analyze, and release build checks.
6. Move mobile initial URL to release config and disable cleartext traffic in release.
7. Add RAG syllabus-version, active corpus, and deleted-chapter database governance.
8. Convert all APIs to explicit gateway classification with schema validation.
9. Harden middleware fail-open behavior by route class.
10. Add real browser E2E launch certification with real auth and mobile viewports.
11. Fix payment environment selection and Cashfree webhook freshness/timing-safe comparison.
12. Fix performance budget calculation using Next build manifests.
13. Add global external fetch timeouts and size caps.
14. Clean diagnostic truthfulness/copy claims.
15. Finish P2 UI polish and remove generated report artifacts.

## Final CTO Opinion

The application has moved from MVP chaos into a serious enterprise-hardening phase. The architecture is no longer casual: there are gateways, audits, mobile bridge contracts, payment idempotency, recovery primitives, runbooks, and production checks.

But "enterprise grade" means the boring parts are provably safe. Right now, the app is close, but not fully certified because secrets, real browser auth testing, disaster recovery, App Check enforcement, and academic corpus governance still have gaps.

My verdict: do not call it fully enterprise-grade yet. Call it "enterprise-grade baseline with remaining P0 certification blockers." After the P0 list above is fixed and the browser/RAG live validations pass for all subjects, the app can move from baseline to launch-certified.
