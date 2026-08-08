#!/usr/bin/env node
/**
 * scripts/audit-mobile-route-parity.mjs
 *
 * Route Parity Audit Script
 * Maps Next.js student-facing web routes against native Flutter screens in mobile/lib/v2.
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
console.log('MOBILE ROUTE PARITY & MAPPING AUDIT');
console.log('================================================\n');

const routes = [
    { webRoute: '/login', flutterScreen: 'NativeLoginScreen', file: 'mobile/lib/v2/features/auth/presentation/login_screen.dart' },
    { webRoute: '/dashboard', flutterScreen: 'NativeDashboardScreen', file: 'mobile/lib/v2/features/dashboard/presentation/dashboard_screen.dart' },
    { webRoute: '/test/configure', flutterScreen: 'NativeTestEngineScreen', file: 'mobile/lib/v2/features/practice/presentation/test_engine_screen.dart' },
    { webRoute: '/test/[id]/results', flutterScreen: 'NativeTestResultsScreen', file: 'mobile/lib/v2/features/practice/presentation/test_results_screen.dart' },
    { webRoute: '/doubts', flutterScreen: 'NativeDoubtSolverScreen', file: 'mobile/lib/v2/features/doubts/presentation/doubt_solver_screen.dart' },
    { webRoute: '/ncert', flutterScreen: 'NativeNcertReaderScreen', file: 'mobile/lib/v2/features/ncert/presentation/ncert_reader_screen.dart' },
    { webRoute: '/omr', flutterScreen: 'NativeOmrScannerScreen', file: 'mobile/lib/v2/features/omr/presentation/omr_scanner_screen.dart' },
    { webRoute: '/battleground', flutterScreen: 'NativeBattlegroundScreen', file: 'mobile/lib/v2/features/battleground/presentation/battleground_screen.dart' },
    { webRoute: '/mistakes', flutterScreen: 'NativeMistakeNotebookScreen', file: 'mobile/lib/v2/features/mistakes/presentation/mistake_notebook_screen.dart' },
    { webRoute: '/revision', flutterScreen: 'NativeRevisionManagerScreen', file: 'mobile/lib/v2/features/revision/presentation/revision_manager_screen.dart' },
    { webRoute: '/blueprint', flutterScreen: 'NativeBlueprintScreen', file: 'mobile/lib/v2/features/blueprint/presentation/blueprint_screen.dart' },
    { webRoute: '/study-plan', flutterScreen: 'NativeStudyPlanScreen', file: 'mobile/lib/v2/features/study_plan/presentation/study_plan_screen.dart' },
    { webRoute: '/pricing', flutterScreen: 'NativePricingScreen', file: 'mobile/lib/v2/features/pricing/presentation/pricing_screen.dart' },
    { webRoute: '/profile', flutterScreen: 'NativeProfileScreen', file: 'mobile/lib/v2/features/profile/presentation/profile_screen.dart' },
];

let passed = 0;
let failed = 0;

for (const r of routes) {
    const exists = fs.existsSync(path.join(ROOT, r.file));
    if (exists) {
        console.log(`  ✅ ${r.webRoute.padEnd(22)} ➔ ${r.flutterScreen.padEnd(28)} (File Exists)`);
        passed++;
    } else {
        console.log(`  ❌ ${r.webRoute.padEnd(22)} ➔ ${r.flutterScreen.padEnd(28)} (MISSING)`);
        failed++;
    }
}

console.log('\n------------------------------------------------');
console.log(`Total Routes Mapped: ${routes.length}`);
console.log(`Native Screen Files Built: ${passed}`);
console.log(`Missing Screens: ${failed}`);
console.log('------------------------------------------------\n');

if (failed > 0) process.exit(1);
else process.exit(0);
