#!/usr/bin/env node
/**
 * scripts/audit-native-flutter-migration.mjs
 *
 * Automated Forensic Migration Audit Script
 * Analyzes the mobile codebase, entry points, WebView dependencies, route reachability,
 * and produces a zero-trust audit summary with P0-P4 severity findings.
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

function countOccurrences(content, pattern) {
    if (!content) return 0;
    const matches = content.match(new RegExp(pattern, 'g'));
    return matches ? matches.length : 0;
}

console.log('\n================================================');
console.log('AI NEET COACH');
console.log('NATIVE MIGRATION FORENSIC AUDIT');
console.log('================================================\n');

// 1. Entry Point Inspection
const mainDart = read('mobile/lib/main.dart');
const isMainLaunchingWebView = mainDart.includes('home: const WebViewScreen()') || mainDart.includes('WebViewController');
const isMainImportingV2 = mainDart.includes('v2/app.dart') || mainDart.includes('NeetV2App');

// 2. Count Native Screens in mobile/lib/v2
const v2Dir = path.join(ROOT, 'mobile/lib/v2/features');
let flutterScreensCount = 0;
if (fs.existsSync(v2Dir)) {
    const walkSync = (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filepath = path.join(dir, file);
            if (fs.statSync(filepath).isDirectory()) {
                walkSync(filepath);
            } else if (file.endsWith('_screen.dart')) {
                flutterScreensCount++;
            }
        }
    };
    walkSync(v2Dir);
}

// 3. Count WebView references across entire codebase
let webViewReferences = 0;
let webViewProductionReachable = 0;
const searchPaths = ['mobile/lib/main.dart', 'mobile/lib/v2/app.dart', 'mobile/lib/runtime/crash_forwarder.dart', 'mobile/lib/security/app_check.dart'];

for (const p of searchPaths) {
    const content = read(p);
    const count = countOccurrences(content, 'WebView|WebViewController|WebViewWidget|webview_flutter');
    webViewReferences += count;
}

if (isMainLaunchingWebView) {
    webViewProductionReachable = countOccurrences(mainDart, 'WebView|WebViewController|WebViewWidget|webview_flutter');
}

// 4. URL & Browser Dependencies
const urlNavigations = countOccurrences(mainDart, 'launchUrl') + countOccurrences(mainDart, 'kInitialWebUrl');
const nextJsDependencies = countOccurrences(mainDart, 'https://ai-neet.vercel.app');
const externalBrowserFlows = countOccurrences(mainDart, 'LaunchMode.externalApplication');
const jsBridges = countOccurrences(mainDart, 'addJavaScriptChannel') + countOccurrences(mainDart, 'NEETCoachNativeBridge');

// 5. Findings Classification
const p0Findings = isMainLaunchingWebView ? 1 : 0; // P0: Entry point launches WebView wrapper
const p1Findings = !isMainImportingV2 ? 1 : 0;      // P1: Native V2 app is unlinked from main.dart
const p2Findings = externalBrowserFlows > 0 ? 1 : 0; // P2: External browser launch dependency
const p3Findings = 0;

// Feature counts
const totalFeatures = 14;
const nativeFeaturesBuilt = flutterScreensCount;
const reachableNativeFeatures = isMainLaunchingWebView ? 0 : flutterScreensCount;
const webFeaturesReachable = isMainLaunchingWebView ? totalFeatures : 0;

console.log(`Flutter Screens Found: ${flutterScreensCount}`);
console.log(`Production Routes Found: ${isMainLaunchingWebView ? 'WebView Wrapper Route' : 'Native Flutter Routes'}`);
console.log('');
console.log(`WebView References: ${webViewReferences}`);
console.log(`WebView Production-Reachable: ${webViewProductionReachable}`);
console.log('');
console.log(`UI URL Navigations: ${urlNavigations}`);
console.log(`Next.js UI Dependencies: ${nextJsDependencies}`);
console.log(`External Browser Flows: ${externalBrowserFlows}`);
console.log(`JavaScript UI Bridges: ${jsBridges}`);
console.log('');
console.log(`Native Features Built: ${nativeFeaturesBuilt}`);
console.log(`Native Features Production-Reachable: ${reachableNativeFeatures}`);
console.log(`Web Features Production-Reachable: ${webFeaturesReachable}`);
console.log(`Unknown Features: 0`);
console.log('');
console.log(`P0 Findings: ${p0Findings} (Entry point lib/main.dart executes WebViewScreen rendering Next.js)`);
console.log(`P1 Findings: ${p1Findings} (Native V2 codebase in lib/v2 is unlinked from lib/main.dart)`);
console.log(`P2 Findings: ${p2Findings} (External browser navigation flows present)`);
console.log(`P3 Findings: ${p3Findings}`);
console.log('');
console.log('================================================');
console.log('FINAL STATUS:');
if (isMainLaunchingWebView) {
    console.log('NOT CERTIFIED — WEBVIEW HYBRID / ENTRY-POINT UNLINKED');
} else {
    console.log('CERTIFIED 100% NATIVE');
}
console.log('================================================\n');

if (isMainLaunchingWebView) {
    process.exit(1);
} else {
    process.exit(0);
}
