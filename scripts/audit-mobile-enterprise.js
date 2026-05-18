#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const failures = [];
let totalChecks = 0;

function read(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function exists(relPath) {
    return fs.existsSync(path.join(ROOT, relPath));
}

function assert(condition, label) {
    totalChecks++;
    if (condition) {
        console.log(`  ✅ ${label}`);
    } else {
        failures.push(label);
        console.log(`  ❌ ${label}`);
    }
}

console.log('\n═══════════════════════════════════════════════════');
console.log('    📱 MOBILE ENTERPRISE CERTIFICATION AUDIT');
console.log('═══════════════════════════════════════════════════\n');

const clientLayout = read('components/ClientLayout.js');
const boot = read('lib/boot/orchestrator.js');
const offlineQueue = read('lib/client/offline-queue.js');
const testPage = read('app/test/[id]/page.js');
const platform = read('lib/platform.js');
const omrPage = read('app/omr/page.js');
const omrScan = read('app/api/omr/scan/route.js');
const omrRetry = read('app/api/cron/omr-retry/route.js');
const fcmRoute = read('app/api/user/update-fcm-token/route.js');
const dailyNudge = read('app/api/cron/daily-nudge/route.js');
const installPrompt = read('components/AppInstallPrompt.js');
const bridgeContract = read('docs/native-bridge-contract.md');
const flutterShell = read('mobile/lib/main.dart');
const flutterAds = read('mobile/lib/core/ad_service.dart');
const androidManifest = read('mobile/android/app/src/main/AndroidManifest.xml');
const mobilePubspec = read('mobile/pubspec.yaml');
const androidBuildGradle = read('mobile/android/app/build.gradle.kts');

assert(clientLayout.includes('bootApp()'), 'Boot orchestrator is called from the app shell');
assert(boot.includes('OfflineQueue.sync()'), 'Offline queue replay is part of boot');
assert(boot.includes('requestNativeFcmRegistration'), 'Native FCM registration is part of boot');
assert(exists('public/sw.js') && clientLayout.includes('serviceWorker.register'), 'Service worker is registered through the app shell');

assert(testPage.includes('OfflineQueue.enqueue'), 'Failed test submissions use OfflineQueue');
assert(offlineQueue.includes('AES-GCM') && offlineQueue.includes('crypto.subtle'), 'Offline queue uses Web Crypto AES-GCM');
assert(!offlineQueue.includes('simple base64') && !offlineQueue.includes('string reverse'), 'Offline queue has no fake-encryption implementation note');

[
    'HAPTIC',
    'REGISTER_FCM',
    'RESTORE_PURCHASES',
    'SHOW_INTERSTITIAL',
    'SHOW_REWARDED',
    'CAPTURE_IMAGE',
].forEach((intent) => {
    assert(platform.includes(intent) && bridgeContract.includes(intent), `Native bridge intent covered: ${intent}`);
});

assert(omrPage.includes('mimeType: selectedFile.type'), 'OMR frontend forwards the selected file MIME type');
assert(omrScan.includes('persistOmrScanObject') && omrRetry.includes('loadOmrScanObject'), 'OMR retry queue uses storage-backed scan references');
assert(!omrScan.includes('scan_url: `data:') && !omrScan.includes('imageBase64.substring'), 'OMR API does not store raw base64 scans in DB rows');

assert(fcmRoute.includes('user_devices') && fcmRoute.includes('safeUpsert'), 'FCM registration writes device-scoped records');
assert(dailyNudge.includes("from('user_devices')") && dailyNudge.includes('fcm_token_invalidated_at'), 'Notification cron sends through active device registry');

assert(!installPrompt.includes('Download App (APK)'), 'Student-facing install CTA does not mention APK');
assert(!installPrompt.includes('📱') && !installPrompt.includes('🧠'), 'Install prompt has no emoji rendering artifacts');

assert(flutterShell.includes('version: 3'), 'Flutter shell injects native bridge v3 capabilities');
[
    'REGISTER_FCM',
    'CAPTURE_IMAGE',
    'HAPTIC',
    'SHOW_INTERSTITIAL',
    'SHOW_REWARDED',
    'RESTORE_PURCHASES',
].forEach((intent) => {
    assert(flutterShell.includes(`case '${intent}'`), `Flutter shell handles ${intent}`);
});
assert(flutterShell.includes('jsonEncode(ack)') && flutterShell.includes('NEET_NATIVE_ACK'), 'Flutter shell sends structured JSON ACKs');
assert(flutterAds.includes('RewardedAd') && flutterShell.includes('loadRewardedAd'), 'Flutter shell supports rewarded ads');
assert(mobilePubspec.includes('in_app_purchase') && flutterShell.includes('InAppPurchase.instance'), 'Flutter shell supports Play purchase restore');
assert(androidManifest.includes('com.android.vending.BILLING') && androidManifest.includes('POST_NOTIFICATIONS'), 'Android manifest includes billing and notification permissions');
assert(androidBuildGradle.includes('NEET_UPLOAD_KEYSTORE') && !androidBuildGradle.includes('signingConfigs.getByName("debug")'), 'Android release builds require upload keystore signing');
assert(androidManifest.includes('${admobApplicationId}') && !androidManifest.includes('ca-app-pub-3940256099942544~3347511713'), 'Android manifest does not hardcode test AdMob app ID');
assert(flutterAds.includes('String.fromEnvironment') && flutterAds.includes('ADMOB_BANNER_ANDROID') && !flutterAds.includes('ca-app-pub-XXXXXXXXXXXX'), 'Flutter ads require production ad unit dart-defines outside debug');

console.log('\n═══════════════════════════════════════════════════');
console.log(`  ✅ Passed: ${totalChecks - failures.length}`);
console.log(`  ❌ Failed: ${failures.length}`);
console.log('═══════════════════════════════════════════════════\n');

if (failures.length > 0) {
    console.log('Blocking mobile enterprise failures:');
    failures.forEach((failure) => console.log(`  - ${failure}`));
    process.exit(1);
}

process.exit(0);
