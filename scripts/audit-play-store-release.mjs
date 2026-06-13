#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
let passed = 0;

function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function exists(relativePath) {
    return fs.existsSync(path.join(ROOT, relativePath));
}

function check(condition, label, remediation) {
    if (condition) {
        passed += 1;
        console.log(`  PASS ${label}`);
        return;
    }
    failures.push({ label, remediation });
    console.log(`  FAIL ${label}`);
}

function manifestValue(manifest, attribute) {
    return manifest.match(new RegExp(`${attribute}="([^"]+)"`))?.[1] || '';
}

console.log('\nPLAY STORE RELEASE ARTIFACT AUDIT\n');

const sourceManifestPath = 'mobile/android/app/src/main/AndroidManifest.xml';
const mergedManifestPath = 'mobile/build/app/intermediates/merged_manifests/release/processReleaseManifest/AndroidManifest.xml';
const bundlePath = 'mobile/build/app/outputs/bundle/release/app-release.aab';
const googleServicesPath = 'mobile/android/app/google-services.json';
const sourceManifest = read(sourceManifestPath);
const footer = read('components/Footer.js');
const profile = read('app/profile/page.js');
const deleteRoute = read('app/api/auth/delete-account/route.js');
const subscriptionCheckout = read('lib/client/subscription-checkout.js');
const pricingPage = read('app/pricing/page.js');
const pricingModal = read('components/monetization/PricingModal.js');
const flutterShell = read('mobile/lib/main.dart');

check(
    sourceManifest.includes('android:usesCleartextTraffic="false"')
        && sourceManifest.includes('@xml/network_security_config'),
    'Source manifest enforces encrypted network traffic',
    'Keep cleartext disabled and retain the network security configuration.'
);
check(
    ['READ_MEDIA_IMAGES', 'READ_MEDIA_VIDEO', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE']
        .every(permission => sourceManifest.includes(`android.permission.${permission}" tools:node="remove"`)),
    'Source manifest prohibits broad photo and storage permissions',
    'Use the Android system picker and remove broad media/storage permissions.'
);
check(
    ['/privacy', '/terms', '/refund-policy', '/account-deletion'].every(route => footer.includes(route) && exists(`app${route}/page.js`)),
    'Public legal and account-deletion pages are linked in-app',
    'Restore all public legal pages and their footer links.'
);
check(
    profile.includes('handleDeleteAccount') && profile.includes('Delete Account') && deleteRoute.includes("auth: 'user'"),
    'Authenticated in-app account deletion is wired',
    'Restore the Profile deletion action and authenticated deletion endpoint.'
);
check(
    subscriptionCheckout.includes('purchaseNativeSubscription')
        && flutterShell.includes("case 'PURCHASE_SUBSCRIPTION'")
        && flutterShell.includes("case 'ACKNOWLEDGE_PURCHASE'")
        && !pricingPage.includes('openCashfreeCheckout')
        && !pricingModal.includes('openCashfreeCheckout'),
    'Android digital subscriptions use Google Play Billing with server verification',
    'Route Android subscription purchases through Play Billing; never expose Cashfree checkout inside the Play-distributed app.'
);

check(exists(mergedManifestPath), 'Release merged manifest exists', 'Build a fresh release AAB.');
check(exists(bundlePath), 'Release AAB exists', 'Build a fresh release AAB.');

if (exists(mergedManifestPath)) {
    const mergedManifest = read(mergedManifestPath);
    const targetSdk = Number(manifestValue(mergedManifest, 'android:targetSdkVersion'));
    const applicationId = manifestValue(mergedManifest, 'package');
    const hasRestrictedStoragePermission = /android\.permission\.(READ_MEDIA_IMAGES|READ_MEDIA_VIDEO|READ_EXTERNAL_STORAGE|WRITE_EXTERNAL_STORAGE)/.test(mergedManifest);
    const admobId = mergedManifest.match(/com\.google\.android\.gms\.ads\.APPLICATION_ID[\s\S]{0,300}?android:value="([^"]+)"/)?.[1] || '';

    check(applicationId === 'com.aineetcoach.app', 'Release package identity is com.aineetcoach.app', 'Correct the Android application ID before publishing.');
    check(targetSdk >= 35, `Release targets a Play-supported API level (${targetSdk || 'missing'})`, 'Upgrade the Android target SDK to API 35 or higher.');
    check(mergedManifest.includes('android:usesCleartextTraffic="false"'), 'Merged release manifest blocks cleartext HTTP', 'Rebuild after applying the network security configuration.');
    check(!hasRestrictedStoragePermission, 'Merged release manifest has no broad photo/storage permission', 'Rebuild after removing restricted media/storage permissions.');
    check(Boolean(admobId) && admobId !== 'ca-app-pub-3940256099942544~3347511713', 'Release uses a production AdMob app ID', 'Build with the production ADMOB_ANDROID_APP_ID.');
}

if (exists(googleServicesPath)) {
    const googleServices = JSON.parse(read(googleServicesPath));
    const firebasePackages = (googleServices.client || [])
        .map(client => client.client_info?.android_client_info?.package_name)
        .filter(Boolean);
    check(firebasePackages.includes('com.aineetcoach.app'), 'Firebase Android app matches the release package', 'Register com.aineetcoach.app in Firebase and replace google-services.json.');
}

if (exists(bundlePath)) {
    try {
        const output = execFileSync('jarsigner', ['-verify', '-verbose', '-certs', path.join(ROOT, bundlePath)], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        check(output.includes('jar verified.'), 'Release AAB signature verifies', 'Sign the AAB with the upload keystore.');
        check(!output.includes('CN=Android Debug'), 'Release AAB is not debug-signed', 'Build with the Play upload keystore, never the Android debug key.');
    } catch (error) {
        check(false, 'Release AAB signature verifies', `jarsigner failed: ${error.message}`);
        check(false, 'Release AAB is not debug-signed', 'Build with the Play upload keystore.');
    }
}

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failures.length}\n`);

if (failures.length > 0) {
    console.log('Launch blockers:');
    failures.forEach(({ label, remediation }) => console.log(`  - ${label}: ${remediation}`));
    process.exit(1);
}

console.log('PLAY_STORE_RELEASE_READY = true');
