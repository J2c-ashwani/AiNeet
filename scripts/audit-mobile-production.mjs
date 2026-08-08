#!/usr/bin/env node
// AI NEET Coach — Mobile Production Zero-Trust Audit
// Run: npm run audit:mobile:production

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const MOBILE_ROOT = path.resolve('mobile/lib');
const V2_ROOT = path.resolve('mobile/lib/v2');
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

let passes = 0;
let failures = 0;
let warnings = 0;
const issues = [];

function pass(label) {
  console.log(`${GREEN}  ✅ ${label}${RESET}`);
  passes++;
}
function fail(label, detail) {
  console.log(`${RED}  ❌ ${label}${detail ? ': ' + detail : ''}${RESET}`);
  failures++;
  issues.push({ label, detail });
}
function warn(label, detail) {
  console.log(`${YELLOW}  ⚠️  ${label}${detail ? ': ' + detail : ''}${RESET}`);
  warnings++;
}

function grepFiles(dir, pattern, includeExt = '.dart') {
  const results = [];
  function walk(d) {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const fullPath = path.join(d, entry.name);
      if (entry.isDirectory()) { walk(fullPath); continue; }
      if (!entry.name.endsWith(includeExt)) continue;
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(pattern)) {
        results.push({ file: fullPath.replace(process.cwd() + '/', ''), pattern });
      }
    }
  }
  walk(dir);
  return results;
}

function fileExists(relPath) {
  return fs.existsSync(path.resolve(relPath));
}

function fileContains(relPath, str) {
  if (!fileExists(relPath)) return false;
  return fs.readFileSync(path.resolve(relPath), 'utf8').includes(str);
}

function v2FileExists(relPath) {
  return fileExists(path.join('mobile/lib/v2', relPath));
}

console.log(`\n${BOLD}====================================================`);
console.log('AI NEET COACH');
console.log('MOBILE PRODUCTION ZERO-TRUST CERTIFICATION AUDIT');
console.log(`====================================================\n${RESET}`);

// ── CHECK 1: Entry Point ────────────────────────────────────
console.log(`${BOLD}[1] Native Entry Point${RESET}`);
const mainDart = 'mobile/lib/main.dart';
if (fileContains(mainDart, 'return const NeetV2App()')) {
  if (fileContains(mainDart, "defaultValue: false") || fileContains(mainDart, 'kUseWebviewFallback')) {
    pass('main.dart launches NeetV2App() by default');
    pass('WebView fallback is gated behind compile-time flag (defaultValue: false)');
  } else {
    pass('main.dart launches NeetV2App()');
  }
} else {
  fail('main.dart must launch NeetV2App() by default');
}

// ── CHECK 2: No Vercel URL in v2 ────────────────────────────
console.log(`\n${BOLD}[2] No Vercel URL in v2 Code${RESET}`);
const vercelHits = grepFiles(V2_ROOT, 'ai-neet.vercel.app');
if (vercelHits.length === 0) {
  pass('Zero ai-neet.vercel.app references in mobile/lib/v2/');
} else {
  fail(`Found ${vercelHits.length} ai-neet.vercel.app reference(s) in v2`, vercelHits.map(h=>h.file).join(', '));
}

// ── CHECK 3: No WebView in v2 ───────────────────────────────
console.log(`\n${BOLD}[3] No WebView in v2 Code${RESET}`);
const webviewHits = grepFiles(V2_ROOT, 'webview_flutter');
const webviewControllerHits = grepFiles(V2_ROOT, 'WebViewController');
const loadRequestHits = grepFiles(V2_ROOT, 'loadRequest');
if (webviewHits.length === 0 && webviewControllerHits.length === 0 && loadRequestHits.length === 0) {
  pass('Zero WebView imports/usage in mobile/lib/v2/');
} else {
  fail('WebView references found in v2', [...webviewHits, ...webviewControllerHits, ...loadRequestHits].map(h=>h.file).join(', '));
}

// ── CHECK 4: API Base URL ────────────────────────────────────
console.log(`\n${BOLD}[4] API Base URL${RESET}`);
const apiClient = 'mobile/lib/v2/core/api/api_client.dart';
if (fileContains(apiClient, 'api.aineetcoach.com')) {
  pass('api_client.dart defaultBaseUrl = api.aineetcoach.com');
} else if (fileContains(apiClient, 'NEET_API_URL')) {
  pass('api_client.dart uses NEET_API_URL env var');
  if (fileContains(apiClient, 'ai-neet.vercel.app')) {
    fail('api_client.dart still contains ai-neet.vercel.app as fallback');
  }
} else {
  fail('api_client.dart must use NEET_API_URL or default to api.aineetcoach.com');
}

// ── CHECK 5: Auth bypass fixed ──────────────────────────────
console.log(`\n${BOLD}[5] Auth Bypass Fixed${RESET}`);
const appDart = 'mobile/lib/v2/app.dart';
if (fileContains(appDart, '_isLoggedIn = true') && !fileContains(appDart, '_restoreSession')) {
  fail('app.dart still has _isLoggedIn = true hardcoded without session restore');
} else if (fileContains(appDart, '_restoreSession') || fileContains(appDart, 'getAuthToken')) {
  pass('app.dart performs real session restore');
} else {
  fail('app.dart does not implement session restore');
}

// ── CHECK 6: Required screens exist ─────────────────────────
console.log(`\n${BOLD}[6] Required Screens${RESET}`);
const requiredScreens = [
  ['features/auth/presentation/login_screen.dart', 'Login'],
  ['features/auth/presentation/register_screen.dart', 'Register'],
  ['features/auth/presentation/otp_screen.dart', 'OTP'],
  ['features/auth/presentation/settings_screen.dart', 'Settings'],
  ['features/dashboard/presentation/dashboard_screen.dart', 'Dashboard'],
  ['features/practice/presentation/test_engine_screen.dart', 'Test Engine'],
  ['features/practice/presentation/test_results_screen.dart', 'Test Results'],
  ['features/doubts/presentation/doubt_solver_screen.dart', 'Doubt Solver'],
  ['features/ncert/presentation/ncert_reader_screen.dart', 'NCERT'],
  ['features/omr/presentation/omr_scanner_screen.dart', 'OMR Scanner'],
  ['features/battleground/presentation/battleground_screen.dart', 'Battleground'],
  ['features/mistakes/presentation/mistake_notebook_screen.dart', 'Mistakes'],
  ['features/revision/presentation/revision_manager_screen.dart', 'Revision'],
  ['features/pricing/presentation/pricing_screen.dart', 'Pricing'],
  ['features/profile/presentation/profile_screen.dart', 'Profile'],
];
let screenCount = 0;
for (const [relPath, name] of requiredScreens) {
  if (v2FileExists(relPath)) {
    screenCount++;
    pass(`${name} screen exists`);
  } else {
    fail(`${name} screen MISSING`, relPath);
  }
}

// ── CHECK 7: No simulated data ───────────────────────────────
console.log(`\n${BOLD}[7] No Simulated / Hardcoded Data${RESET}`);
const OMR_MOCK_PATTERNS = ['Future.delayed', 'Score: 540', 'correct: 142', 'calculatedScore'];
let omrMockFound = false;
for (const p of OMR_MOCK_PATTERNS) {
  const hits = grepFiles(V2_ROOT + '/features/omr', p);
  if (hits.length > 0) { omrMockFound = true; fail(`OMR mock found: '${p}'`, hits.map(h=>h.file).join(', ')); }
}
if (!omrMockFound) pass('OMR scanner has no simulated data');

const DOUBT_MOCK = 'Based on NCERT Physics Chapter 5';
const doubtMockHits = grepFiles(V2_ROOT, DOUBT_MOCK);
if (doubtMockHits.length === 0) pass('Doubt solver has no hardcoded fallback content');
else fail('Doubt solver contains hardcoded NCERT fallback text', doubtMockHits.map(h=>h.file).join(', '));

// ── CHECK 8: Camera wired ───────────────────────────────────
console.log(`\n${BOLD}[8] Camera Integration${RESET}`);
const omrCamera = grepFiles(V2_ROOT + '/features/omr', 'ImagePicker');
if (omrCamera.length > 0) pass('OMR scanner uses ImagePicker');
else fail('OMR scanner must use ImagePicker for camera capture');

const doubtCamera = grepFiles(V2_ROOT + '/features/doubts', 'ImagePicker');
if (doubtCamera.length > 0) pass('Doubt solver uses ImagePicker for camera');
else fail('Doubt solver must have camera capture option');

// ── CHECK 9: Billing architecture ───────────────────────────
console.log(`\n${BOLD}[9] Billing Architecture${RESET}`);
const billingService = 'mobile/lib/v2/core/billing/billing_service.dart';
if (fileExists(billingService)) {
  pass('NativeBillingService exists');
  if (fileContains(billingService, 'productsNotConfigured') || fileContains(billingService, 'BillingInitResult')) {
    pass('Billing handles unconfigured products gracefully');
  } else {
    warn('Billing service should handle unconfigured products gracefully');
  }
  if (fileContains(billingService, 'verifyPlayPurchase') || fileContains(billingService, '/api/subscription/play/verify')) {
    pass('Billing service performs server-side verification');
  } else {
    fail('Billing must verify purchases server-side');
  }
} else {
  fail('NativeBillingService (billing_service.dart) not found');
}

if (fileContains('mobile/lib/v2/features/pricing/presentation/pricing_screen.dart', 'NativeBillingService') ||
    fileContains('mobile/lib/v2/features/pricing/presentation/pricing_screen.dart', 'BillingInitResult')) {
  pass('Pricing screen wired to NativeBillingService');
} else {
  fail('Pricing screen must use NativeBillingService (not SnackBar stub)');
}

// ── CHECK 10: No secrets in Dart ────────────────────────────
console.log(`\n${BOLD}[10] No Secrets in Dart Code${RESET}`);
const SECRET_PATTERNS = [
  'supabase.co',
  'service_role',
  'GEMINI_API_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', // JWT prefix
];
let secretFound = false;
for (const p of SECRET_PATTERNS) {
  const hits = grepFiles(MOBILE_ROOT, p);
  if (hits.length > 0) { secretFound = true; fail(`Secret pattern '${p}' found in Dart`, hits.map(h=>h.file).join(', ')); }
}
if (!secretFound) pass('No secrets detected in Dart code');

// ── CHECK 11: Test engine real data ─────────────────────────
console.log(`\n${BOLD}[11] Test Engine — Real Data${RESET}`);
const testEngine = 'mobile/lib/v2/features/practice/presentation/test_engine_screen.dart';
if (fileContains(testEngine, 'generateTest') || fileContains(testEngine, '/api/tests/generate') || fileContains(testEngine, 'NeetApiClient')) {
  pass('Test engine calls API for questions');
} else {
  fail('Test engine must fetch questions from API');
}
if (fileContains(testEngine, 'submitTest') || fileContains(testEngine, '/api/tests/submit')) {
  pass('Test engine submits to API');
} else {
  fail('Test engine must submit answers to API');
}

// ── CHECK 12: Health endpoints ──────────────────────────────
console.log(`\n${BOLD}[12] Backend Health Endpoints${RESET}`);
if (fileExists('app/api/health/route.js')) pass('/api/health endpoint exists');
else fail('/api/health endpoint missing');
if (fileExists('app/api/health/readiness/route.js')) pass('/api/health/readiness endpoint exists');
else fail('/api/health/readiness endpoint missing');
if (fileExists('app/api/health/version/route.js')) pass('/api/health/version endpoint exists');
else fail('/api/health/version endpoint missing');

// ── CHECK 13: Render deployment config ──────────────────────
console.log(`\n${BOLD}[13] Render Deployment Config${RESET}`);
if (fileExists('render.yaml')) pass('render.yaml exists');
else fail('render.yaml missing — needed for Render deployment');

// ── SUMMARY ─────────────────────────────────────────────────
console.log(`\n${BOLD}====================================================`);
console.log('AUDIT RESULTS');
console.log(`====================================================\n${RESET}`);
console.log(`${GREEN}Passed:   ${passes}${RESET}`);
console.log(`${RED}Failed:   ${failures}${RESET}`);
console.log(`${YELLOW}Warnings: ${warnings}${RESET}`);

if (failures === 0) {
  console.log(`\n${BOLD}${GREEN}====================================================`);
  console.log('✅ ALL CHECKS PASSED — READY FOR GATE VERIFICATION');
  console.log(`====================================================\n${RESET}`);
  process.exit(0);
} else {
  console.log(`\n${BOLD}${RED}====================================================`);
  console.log(`❌ ${failures} CHECK(S) FAILED — NOT READY FOR RELEASE`);
  console.log('====================================================');
  console.log('\nFailed checks:');
  issues.forEach(i => console.log(`  • ${i.label}${i.detail ? ': ' + i.detail : ''}`));
  console.log(`${RESET}`);
  process.exit(1);
}
