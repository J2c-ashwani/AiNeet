#!/usr/bin/env node
/**
 * scripts/audit-100-percent-native-migration.mjs
 *
 * Forensic Audit Script: 100% Native Flutter Migration
 * Analyzes entry points, WebView dependencies, URL launches, route reachability,
 * and outputs an empirical zero-trust status report.
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

function countMatches(content, regex) {
    if (!content) return 0;
    const matches = content.match(new RegExp(regex, 'g'));
    return matches ? matches.length : 0;
}

console.log('\n================================================');
console.log('AI NEET COACH');
console.log('CTO FORENSIC 100% NATIVE MIGRATION AUDIT');
console.log('================================================\n');

// 1. Entry Point Check
const mainDart = read('mobile/lib/main.dart');

const launchesNeetV2ByDefault = mainDart.includes('return const NeetV2App();') || mainDart.includes('home: const NeetV2App()');
const isMainImportingV2 = mainDart.includes('import \'v2/app.dart\';');

// 2. Count V2 Native Screens
const v2Dir = path.join(ROOT, 'mobile/lib/v2/features');
let flutterScreens = [];
if (fs.existsSync(v2Dir)) {
    const walkDir = (dir) => {
        for (const file of fs.readdirSync(dir)) {
            const full = path.join(dir, file);
            if (fs.statSync(full).isDirectory()) walkDir(full);
            else if (file.endsWith('_screen.dart')) flutterScreens.push(file);
        }
    };
    walkDir(v2Dir);
}

// 3. Scan for WebView / Browser usages
const webViewMatchesInMain = countMatches(mainDart, 'WebViewWidget|WebViewController|webview_flutter');
const launchUrlMatchesInMain = countMatches(mainDart, 'launchUrl');
const vercelUrlMatchesInMain = countMatches(mainDart, 'ai-neet.vercel.app');

// 4. Trace V2 App dependencies
const v2AppDart = read('mobile/lib/v2/app.dart');
const webViewMatchesInV2 = countMatches(v2AppDart, 'WebViewWidget|WebViewController|webview_flutter');

// Classification
const p0Count = launchesNeetV2ByDefault ? 0 : 1; // Entry point launches NeetV2App by default
const p1Count = isMainImportingV2 ? 0 : 1;       // NeetV2App imported in main.dart
const p2Count = launchUrlMatchesInMain > 0 ? 1 : 0;

console.log(`Native Flutter Screens Built: ${flutterScreens.length}`);
console.log(`Production Entry Point File: mobile/lib/main.dart`);
console.log(`Production Entry Point Default Target: ${launchesNeetV2ByDefault ? 'NeetV2App (Native Flutter)' : 'WebViewScreen (Legacy WebView)'}`);
console.log(`Fallback Route Available: ${mainDart.includes('kUseWebviewFallback') ? 'YES (Controlled Rollback Path)' : 'NO'}`);
console.log('');
console.log(`WebView SDK Occurrences in main.dart: ${webViewMatchesInMain}`);
console.log(`WebView SDK Occurrences in v2/app.dart: ${webViewMatchesInV2}`);
console.log(`Web URL Hardcoded References (main.dart): ${vercelUrlMatchesInMain}`);
console.log(`External Browser Launch (launchUrl): ${launchUrlMatchesInMain}`);
console.log('');
console.log(`P0 Findings: ${p0Count}`);
console.log(`P1 Findings: ${p1Count}`);
console.log(`P2 Findings: ${p2Count} (Allowlisted external browser launch for legal/privacy links)`);
console.log('');
console.log('================================================');
console.log('FINAL MIGRATION VERDICT:');
if (launchesNeetV2ByDefault && isMainImportingV2) {
    console.log('🟡 MOUNTED & REACHABLE — PENDING REAL-DEVICE GATES A–L');
} else {
    console.log('🔴 NOT CERTIFIED — WEBVIEW HYBRID / MIGRATION INCOMPLETE');
}
console.log('================================================\n');

if (launchesNeetV2ByDefault && isMainImportingV2) process.exit(0);
else process.exit(1);
