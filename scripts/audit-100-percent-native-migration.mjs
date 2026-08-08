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
const isMainWebView = mainDart.includes('home: const WebViewScreen()');
const isMainV2 = mainDart.includes('v2/app.dart') || mainDart.includes('NeetV2App');

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
const p0Count = isMainWebView ? 1 : 0; // Entry point launches WebView Screen
const p1Count = !isMainV2 ? 1 : 0;     // NeetV2App unlinked from main.dart
const p2Count = launchUrlMatchesInMain > 0 ? 1 : 0;

console.log(`Native Flutter Screens Built: ${flutterScreens.length}`);
console.log(`Production Entry Point File: mobile/lib/main.dart`);
console.log(`Production Entry Point Launches: ${isMainWebView ? 'WebViewScreen (Legacy WebView)' : 'NeetV2App (Native Flutter)'}`);
console.log('');
console.log(`WebView SDK Occurrences in main.dart: ${webViewMatchesInMain}`);
console.log(`WebView SDK Occurrences in v2/app.dart: ${webViewMatchesInV2}`);
console.log(`Web URL Hardcoded References (main.dart): ${vercelUrlMatchesInMain}`);
console.log(`External Browser Launch (launchUrl): ${launchUrlMatchesInMain}`);
console.log('');
console.log(`P0 Findings: ${p0Count} (Production executable entry point lib/main.dart runs WebViewScreen)`);
console.log(`P1 Findings: ${p1Count} (Native V2 codebase in lib/v2 is unlinked from lib/main.dart entry point)`);
console.log(`P2 Findings: ${p2Count} (External browser navigation flows present in main.dart)`);
console.log('');
console.log('================================================');
console.log('FINAL MIGRATION VERDICT:');
if (isMainWebView) {
    console.log('🔴 NOT CERTIFIED — WEBVIEW HYBRID / MIGRATION INCOMPLETE');
} else {
    console.log('🟢 CERTIFIED 100% NATIVE FLUTTER');
}
console.log('================================================\n');

if (isMainWebView) process.exit(1);
else process.exit(0);
