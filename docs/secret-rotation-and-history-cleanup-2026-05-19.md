# Secret Rotation And Git History Cleanup Plan

Date: 2026-05-19

## Current Decision

Secret rotation is deferred until final production freeze because the platform is still pre-launch and under active hardening. Preparation must still be complete before freeze.

## Required Safe Checks Now

```bash
node scripts/audit-secret-usage-inventory.mjs
node scripts/audit-secret-hygiene.js
```

## Secrets Inventory

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `STAGING_DATABASE_URL`

Rotation owner: Supabase project owner.

Update locations:

- Vercel project env.
- GitHub Actions secrets.
- Local `.env.local`.
- CI restore-drill secrets.

### App Auth And Internal Signing

- `JWT_SECRET`
- `DIAGNOSTIC_SIGNING_SECRET`
- `INTERNAL_EVENT_SECRET`
- `CRON_SECRET`
- `N8N_WEBHOOK_SECRET`

Update locations:

- Vercel project env.
- GitHub Actions secrets where applicable.
- Internal automation systems.

### Payments

- `CASHFREE_ENV`
- `CASHFREE_APP_ID`
- `CASHFREE_SECRET_KEY`

Update locations:

- Vercel project env.
- Cashfree webhook settings.
- Payment certification environment.

### Firebase And Mobile

- `FIREBASE_PROJECT_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_KEY`
- `APP_CHECK_ENFORCEMENT`
- `NEET_UPLOAD_KEYSTORE`
- `NEET_UPLOAD_KEYSTORE_BASE64`
- `NEET_UPLOAD_KEYSTORE_PASSWORD`
- `NEET_UPLOAD_KEY_ALIAS`
- `NEET_UPLOAD_KEY_PASSWORD`
- `ADMOB_ANDROID_APP_ID`
- `ADMOB_BANNER_ANDROID`
- `ADMOB_INTERSTITIAL_ANDROID`
- `ADMOB_REWARDED_ANDROID`

Update locations:

- GitHub Actions mobile release secrets.
- Local release machine.
- Firebase Console.
- AdMob Console.

### AI, Redis, Observability

- `GEMINI_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_SENTRY_DSN`
- `DISCORD_WEBHOOK_URL`
- `SLACK_WEBHOOK_URL`

Update locations:

- Vercel project env.
- GitHub Actions secrets where applicable.
- Provider consoles.

## Git History Cleanup Preparation

Do not run the following commands until MD sir approves history rewrite:

```bash
git filter-repo --path-glob '*.env*' --invert-paths
git filter-repo --replace-text replacements.txt
```

Prepare `replacements.txt` outside the repo. It must contain only exact leaked values and their replacements. Example format:

```text
old-secret-value==>***REMOVED***
```

After cleanup:

```bash
node scripts/audit-secret-hygiene.js
git grep -n "postgresql://"
git grep -n "SUPABASE_SERVICE_ROLE_KEY"
git grep -n "SERVICE_ROLE"
```

## Freeze-Day Rotation Sequence

1. Pause production deployment.
2. Rotate Supabase DB password.
3. Rotate Supabase service-role key if exposed.
4. Rotate app signing/internal secrets.
5. Rotate Cashfree and Firebase service credentials if exposed.
6. Update Vercel, GitHub Actions, mobile release secrets, and local `.env.local`.
7. Run full safe checks.
8. Run live certification.
9. Resume controlled rollout.

