# NEET Coach Enterprise Public Launch Certification

Certified: 2026-05-23 01:20 IST
Production URL: https://ai-neet.vercel.app

## Verdict

`ENTERPRISE PUBLIC LAUNCH CERTIFIED FOR INTERNAL DRY RUN / CONTROLLED CLOSED BETA`

Scale expansion to millions requires phased traffic ramp, production monitoring evidence, E2E/load proof, and MD approval for each rollout phase.

Rollout path:

1. Internal dry run.
2. Closed beta.
3. Soft launch after E2E/load tests.
4. Stress/load certification.
5. Scale expansion.

## Certification Summary

The CTO-provided certification package reports:

- Certifier commit: `d9ccc17` with 17/17 live certification pass.
- CI fix commit: `19fda7d`.
- CI green run commit: `9cb55d6`.
- GitHub Actions green run: https://github.com/J2c-ashwani/AiNeet/actions/runs/26309631240

MD must confirm which exact commit is the launch candidate before production promotion. The launch candidate should be the commit that contains both the 17/17 certification code and the CI syntax fix.

## Corrected Payment Policy

Refund/cancel policy:

NEET Coach subscriptions are non-refundable once a billing period starts. If a student cancels, no further billing occurs from the next billing cycle, and access continues until the end of the current paid billing period.

This matches `docs/refund-policy.md`.

Controlled rollout rule:

If paid checkout is enabled during controlled rollout, a real low-value Cashfree production payment and cancellation drill are required before rollout. If checkout remains disabled behind a feature flag, this may remain a pre-scale gate.

Payment proof must show:

- successful production payment,
- subscription activation,
- duplicate webhook replay handled idempotently,
- cancellation stops future billing,
- access remains active until the current `expires_at`.

## Corrected Rollback Status

Rollback procedure is documented, but procedure is not proof.

Rollback proof is pending until an actual Vercel rollback drill is executed and recorded with:

- previous deployment URL or ID,
- rolled-back deployment URL or ID,
- timestamp,
- operator,
- elapsed rollback time,
- post-rollback health check result.

Until that drill is attached, rollback status is:

`PROCEDURE DOCUMENTED — LIVE ROLLBACK DRILL PENDING BEFORE SOFT LAUNCH`

## Corrected Mobile Status

Web controlled rollout certification is separate from mobile store certification.

Mobile store launch remains separately gated by:

- production AdMob IDs,
- release keystore,
- signed AAB/APK,
- physical-device App Check validation,
- FCM validation,
- Play internal track validation.

Preferred mobile build path:

```bash
set -a
source .env.local
set +a

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

## Pre-Scale Gates

Before traffic expands beyond closed beta:

- Run production/staging E2E with real QA auth.
- Run accessibility and visual regression suites.
- Run authenticated load test.
- Attach Supabase/Redis/API latency evidence.
- Complete rollback drill.
- Complete payment proof if checkout is enabled.

## MD Sign-Off Wording

Recommended MD approval wording:

`Approved for internal dry run and controlled closed beta. Paid checkout, soft launch, mobile store release, and scale expansion remain gated by the evidence items listed in this document.`

