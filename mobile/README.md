# NEET Coach Mobile

Flutter WebView shell for the NEET Coach Android app.

## Release Requirements

Release builds fail closed unless the Play upload keystore and production AdMob app ID are provided. Do not use debug signing or Google test AdMob IDs for Play Store builds.

Required environment variables:

```bash
export NEET_UPLOAD_KEYSTORE="/absolute/path/upload-keystore.jks"
export NEET_UPLOAD_KEYSTORE_PASSWORD="..."
export NEET_UPLOAD_KEY_ALIAS="upload"
export NEET_UPLOAD_KEY_PASSWORD="..."
export ADMOB_ANDROID_APP_ID="ca-app-pub-...~..."
```

Required Flutter dart-defines:

```bash
--dart-define=ADMOB_BANNER_ANDROID=ca-app-pub-.../...
--dart-define=ADMOB_INTERSTITIAL_ANDROID=ca-app-pub-.../...
--dart-define=ADMOB_REWARDED_ANDROID=ca-app-pub-.../...
```

## Build

```bash
flutter pub get
dart analyze
flutter build appbundle --release \
  --dart-define=ADMOB_BANNER_ANDROID="$ADMOB_BANNER_ANDROID" \
  --dart-define=ADMOB_INTERSTITIAL_ANDROID="$ADMOB_INTERSTITIAL_ANDROID" \
  --dart-define=ADMOB_REWARDED_ANDROID="$ADMOB_REWARDED_ANDROID"
```

For local debug testing, no release keystore or production AdMob values are required.
