# AI NEET Coach Play Store Launch Checklist

This is the operational release gate for package `com.aineetcoach.app`. An old or locally generated bundle must never be uploaded without passing the artifact audit.

## 1. Deploy Public Policy Pages

Deploy the current web build and verify these URLs are publicly reachable without signing in:

- `https://ai-neet.vercel.app/privacy`
- `https://ai-neet.vercel.app/terms`
- `https://ai-neet.vercel.app/refund-policy`
- `https://ai-neet.vercel.app/account-deletion`

Use the privacy URL and account-deletion URL in Play Console.

## 2. Prepare Release Credentials

Set real production values locally or in protected CI secrets. Never commit them.

```bash
export NEET_UPLOAD_KEYSTORE="/absolute/path/upload-keystore.jks"
export NEET_UPLOAD_KEYSTORE_PASSWORD="..."
export NEET_UPLOAD_KEY_ALIAS="upload"
export NEET_UPLOAD_KEY_PASSWORD="..."
export ADMOB_ANDROID_APP_ID="ca-app-pub-...~..."
export ADMOB_BANNER_ANDROID="ca-app-pub-.../..."
export ADMOB_INTERSTITIAL_ANDROID="ca-app-pub-.../..."
export ADMOB_REWARDED_ANDROID="ca-app-pub-.../..."
export NEET_WEB_URL="https://ai-neet.vercel.app"
```

Back up the upload keystore and recovery information in an access-controlled location before launch.

Create and activate these exact subscription products in Play Console:

- `neet_pro_monthly`
- `neet_premium_monthly`

Configure base plans, prices, and license testers. Android subscription checkout must remain Google Play Billing-only. Cashfree is web-only.

## 3. Build and Certify the AAB

```bash
cd mobile
flutter clean
flutter pub get
dart analyze
flutter build appbundle --release \
  --dart-define=NEET_WEB_URL="$NEET_WEB_URL" \
  --dart-define=ADMOB_BANNER_ANDROID="$ADMOB_BANNER_ANDROID" \
  --dart-define=ADMOB_INTERSTITIAL_ANDROID="$ADMOB_INTERSTITIAL_ANDROID" \
  --dart-define=ADMOB_REWARDED_ANDROID="$ADMOB_REWARDED_ANDROID"

cd ..
npm run audit:play-store
```

Required final result:

```text
PLAY_STORE_RELEASE_READY = true
```

The audit rejects debug signing, test AdMob IDs, insecure HTTP, restricted broad photo/storage permissions, an unsupported target API, package/Firebase mismatches, missing legal pages, and missing in-app deletion.

## 4. Play Console Declarations

- Enroll in Play App Signing and upload only the certified AAB.
- Declare that the app contains ads.
- Complete the Data safety form consistently with the public privacy policy.
- Declare camera use for user-initiated OMR and image-question capture.
- Do not request or declare broad photo/video access; the app uses the system picker.
- Complete content rating, target audience, app access, and advertising declarations.
- Provide reviewer credentials because core student features require authentication.
- Add the privacy-policy URL and public account-deletion URL.

The Data safety declaration must account for:

- Account identity and optional parent contact information.
- Learning activity, answers, scores, mistakes, doubts, and progress.
- User-submitted OMR sheets and question images.
- Purchase and subscription status.
- Device registration tokens, App Check signals, diagnostics, crash data, and security telemetry.
- Ad identifiers and ad interactions when advertising is enabled.

## 5. Internal Track Verification

Install the app from the Play internal-testing track, not by sideloading the local APK, and verify:

- Play Integrity App Check succeeds.
- Login, logout, session restore, and account deletion work.
- OMR camera and system-picker flows work without broad photo permission.
- FCM notifications arrive and open the correct screen.
- Production AdMob units load without test-ad labels.
- Google Play subscription purchase and restore work.
- A successful Play purchase is server-verified before native acknowledgement.
- Cashfree checkout is never shown inside the Android app.
- Offline submission replays after reconnect.
- Crashlytics receives one controlled non-fatal test event.
- Play Console pre-launch report contains no blocking crash, ANR, security, or accessibility finding.

## 6. Production Access Gate

If the Play developer account is a personal account created after November 13, 2023, complete the required closed test with at least 12 opted-in testers continuously for 14 days before requesting production access.

Release to production only after:

- `npm run audit:mobile` passes.
- `npm run audit:play-store` passes.
- The internal-track verification above is recorded.
- Play Console App content and Data safety sections show no outstanding action.
- The current AAB version code is greater than every previously uploaded version.
