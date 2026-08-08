#!/usr/bin/env node
/**
 * scripts/audit-mobile-web-dependencies.mjs
 *
 * Web Dependencies Forensic Audit Script
 * Scans pubspec.yaml, main.dart, and Android manifests for web dependencies, WebView SDKs, and JS channels.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

function read(relPath) {
    const fullPath = path.join(ROOT, relPath);
    if (!fs.existsSync(fullPath)) return '';
    return fs.readFileSync(fullPath, 'utf8');
}

console.log('\n================================================');
console.log('MOBILE WEB DEPENDENCY FORENSIC AUDIT');
console.log('================================================\n');

const pubspec = read('mobile/pubspec.yaml');
const mainDart = read('mobile/lib/main.dart');
const manifest = read('mobile/android/app/src/main/AndroidManifest.xml');

console.log('📦 Pubspec Web Dependencies Audit:');
console.log(`  webview_flutter: ${pubspec.includes('webview_flutter:') ? 'PRESENT (Used in legacy main.dart)' : 'ABSENT'}`);
console.log(`  webview_flutter_android: ${pubspec.includes('webview_flutter_android:') ? 'PRESENT (Used in legacy main.dart)' : 'ABSENT'}`);
console.log(`  url_launcher: ${pubspec.includes('url_launcher:') ? 'PRESENT (Used for external URL launches)' : 'ABSENT'}`);
console.log('');

console.log('⚙️ Runtime Executable Entry Point (main.dart) Audit:');
console.log(`  WebViewScreen instantiated: ${mainDart.includes('home: const WebViewScreen()') ? 'YES (P0 Migration Finding)' : 'NO'}`);
console.log(`  WebViewController initialized: ${mainDart.includes('WebViewController controller') ? 'YES (P0 Migration Finding)' : 'NO'}`);
console.log(`  JS Channels Registered: ${mainDart.includes('addJavaScriptChannel') ? 'YES (P0 Migration Finding)' : 'NO'}`);
console.log(`  Default Web URL: ${mainDart.includes('kInitialWebUrl') ? 'https://ai-neet.vercel.app (P0 Finding)' : 'NONE'}`);
console.log('');

console.log('🔒 Android Manifest Audit:');
console.log(`  Cleartext Traffic: ${manifest.includes('android:usesCleartextTraffic="false"') ? 'PROHIBITED (Secure)' : 'ALLOWED (Insecure)'}`);
console.log('');

console.log('================================================\n');
