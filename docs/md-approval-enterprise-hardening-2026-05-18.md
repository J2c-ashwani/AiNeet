# MD Approval Pack: Enterprise Hardening Closure

Date: 2026-05-18

## Executive Verdict

The codebase has been hardened against the launch audit blockers that were in our control. The app is now materially closer to enterprise grade, but final production approval still depends on operational evidence that cannot be created by code alone: restored staging backup verification, live database connectivity, production secrets, Play/App Check configuration, and payment environment confirmation.

## Permanent Fixes Completed

### Security and Secret Hygiene

- Removed hardcoded production database URLs from migration/RPC utility scripts.
- Added `scripts/audit-secret-hygiene.js` and wired it into release gates.
- Added generated report files to `.gitignore`.
- Converted old DB utility scripts to fail closed when `DATABASE_URL` is missing.
- Hardened middleware failure handling so protected pages/APIs do not silently continue when enforcement fails.
- Added Firebase App Check verification for native high-trust mutations and wired the Flutter shell to provide tokens.

### Payments and Subscription Trust

- Payment runtime now uses explicit `CASHFREE_ENV` instead of inferring production/sandbox from `NODE_ENV`.
- Cashfree webhook verification now checks timestamp freshness and uses timing-safe signature comparison.
- Subscription create/verify paths now require native App Check where appropriate.

### Mobile Enterprise Runtime

- Native App Check bridge is injected after WebView loads.
- Mobile API calls can attach `X-Firebase-AppCheck` automatically from the native bridge.
- Removed broad automatic FCM topic subscriptions from the native shell.
- Removed FCM token logging.
- Android cleartext traffic is disabled.
- Legacy external storage permission was removed or scoped.
- Beta distribution workflow now supports release keystore, App URL, and AdMob build-time configuration.

### Offline and Test Submission Integrity

- Failed test submissions now replay through the encrypted offline queue instead of being stranded as raw local drafts.
- Offline queue now uses Web Crypto AES-GCM and preserves non-idempotent failed submissions for investigation.
- Duplicate/already-submitted responses are treated as safe idempotent success.
- Test result recovery API was added so the result page can reconstruct a completed attempt after refresh/session loss.
- Test submission core transaction now succeeds independently from post-commit side effects such as XP, badges, streaks, and referral rewards.
- Fixed the perfect-score badge check to use the actual processed-answer count.

### AI/RAG Governance

- RAG search and validation now filter to active/current syllabus chunks and exclude deleted syllabus material.
- Added migration `002_rag_current_syllabus_governance.sql` for existing databases.
- Retrieval validator now checks required governance columns and embedding dimensions before semantic validation.

### Reliability and Performance

- `checkedFetch` now supports timeout, abort composition, and response-size checks.
- NCERT proxy now has bounded timeout and maximum response size.
- Performance budget audit now reads real Next.js build manifest data instead of reporting a false zero-size pass.
- Release readiness now includes mobile enterprise, performance, and secret hygiene gates.

### Student-Facing Truthfulness

- Removed simulated peer/percentile claims from diagnostic grading and diagnostic result copy.
- Replaced mock AIR prediction language with score-band language.
- Traffic stats remain based on real registered-user counts instead of padded marketing numbers.

## Verification Completed Locally

- `npm run typecheck`: passed.
- `npx eslint app components lib --quiet`: passed.
- Changed JS/MJS syntax checks: passed.
- `node scripts/audit-secret-hygiene.js`: passed.
- `npm run lint:design`: passed.
- `node scripts/audit-performance-budget.js`: passed with warnings only.
- `node scripts/audit-mobile-enterprise.js`: passed.
- `node scripts/audit-master.js`: passed.
- `npm run build`: passed.
- `npm run test:contracts`: passed.
- Flutter `dart analyze`: passed.
- `npm audit`: previously confirmed by owner as zero vulnerabilities.

## Known Remaining Approval Blockers

These are not code defects. They are release-control items MD sir or the deployment owner must approve/provide.

### 1. Backup Restore Drill

The old backup check was replaced because it only proved production tables existed. The new check requires a real restored staging database.

Required before production approval:

- Set `STAGING_DATABASE_URL`.
- Set `BACKUP_RESTORE_DRILL_ID`.
- Restore a recent production backup into staging.
- Run `node scripts/verify-backup-restore.js`.
- Run `node scripts/release-readiness.js` after restore verification succeeds.

### 2. Production Secret Rotation

Hardcoded secrets were removed from the working tree, but any secret that was ever committed must be treated as exposed.

Required before production approval:

- Rotate the Supabase database password.
- Rotate exposed service credentials if any were pushed.
- Purge sensitive history or confirm the repository was never pushed with those secrets.

### 3. RAG Governance Migration

Existing databases must apply:

- `scripts/migrations/002_rag_current_syllabus_governance.sql`

After migration and Gemini quota availability, run:

- `node scripts/validate-retrieval.mjs --subject chemistry`
- Repeat for each subject with a completed corpus.
- `node scripts/validate-rag-governance.mjs`

### 4. Production Environment Configuration

Required before production approval:

- `CASHFREE_ENV=production` only after production keys/webhooks are confirmed.
- `APP_CHECK_ENFORCEMENT=native` or `strict` after Firebase App Check is fully configured.
- `node scripts/test-app-check-enforcement.mjs`
- `NEET_UPLOAD_KEYSTORE_*` secrets for signed Android release builds.
- `ADMOB_*` IDs for production ad units.
- `NEET_WEB_URL` for the mobile shell.
- GitHub Actions secrets for staging DB restore verification.
- `node scripts/test-cashfree-webhook-security.mjs`
- `node scripts/test-payment-flow.mjs`

## Destructive / Manual Commands

These commands must not be run casually on the active working copy. MD sir or the repo owner should approve them first.

- `git filter-repo --path-glob '*.env*' --invert-paths`
- `git filter-repo --replace-text replacements.txt`
- Supabase password/key rotation.
- Production backup restore into staging.
- Production payment validation with real credentials.

After history rewrite, every collaborator must re-clone or hard-reset to the rewritten repository history.

## CTO Recommendation

Approve the code hardening for merge after review. Do not approve public production launch until the backup restore drill, secret rotation, RAG migration, App Check configuration, and signed mobile build secrets are completed and evidenced.
