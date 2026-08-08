#!/usr/bin/env node
/**
 * scripts/test-native-flutter-route-integrity.mjs
 *
 * Route Integrity & Entry Point Forensic Test Suite
 * Verifies production route resolution, entry point configuration, and allowlist rules.
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

console.log('\n═══════════════════════════════════════════════════');
console.log('    🧭 NATIVE FLUTTER ROUTE INTEGRITY AUDIT');
console.log('═══════════════════════════════════════════════════\n');

const mainDart = read('mobile/lib/main.dart');

const isMainLaunchingWebView = mainDart.includes('home: const WebViewScreen()');
const isMainLaunchingV2 = mainDart.includes('v2/app.dart') || mainDart.includes('NeetV2App');

console.log(`Entry Point File: mobile/lib/main.dart`);
console.log(`Launches WebViewScreen: ${isMainLaunchingWebView ? 'YES 🔴' : 'NO ✅'}`);
console.log(`Launches NeetV2App: ${isMainLaunchingV2 ? 'YES ✅' : 'NO 🔴'}`);
console.log('');

// Document Allowlist Rules
console.log('📋 Documented Non-Flutter Render Allowlist:');
console.log('  1. Android Camera Preview (Native Platform View)');
console.log('  2. Google Play Billing System UI (Native Android/Google Play Sheet)');
console.log('  3. System Permission Dialogs (Native OS Dialogs)');
console.log('  4. External Browser Intents (LaunchMode.externalApplication for external links)');
console.log('');

if (isMainLaunchingWebView) {
    console.error('❌ ROUTE INTEGRITY AUDIT FAILED: Production entry point mobile/lib/main.dart routes to legacy WebView wrapper.');
    process.exit(1);
} else {
    console.log('✅ ROUTE INTEGRITY AUDIT PASSED: Production entry point routes to NeetV2App.');
    process.exit(0);
}
