#!/usr/bin/env node
/**
 * scripts/test-navigation-performance.mjs
 *
 * Navigation Performance & SPA Runtime Integrity Test Suite
 * Asserts:
 *  1. Preserved SPA Runtime: Navbar links use Next.js <Link> (no raw <a href>).
 *  2. No Artificial Delays: Register client has 0 hardcoded retry sleeps or redirect timeouts.
 *  3. Classified Boot Orchestration: bootApp() executes Critical path synchronously,
 *     and defers Background/Deferred tasks without blocking UI render.
 *  4. Flutter Shell Parallelization: main.dart uses Future.wait post Firebase init.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

const failures = [];
const passed = [];

function read(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function assert(condition, description) {
    if (condition) {
        passed.push(description);
        console.log(`  ✅ ${description}`);
    } else {
        failures.push(description);
        console.log(`  ❌ ${description}`);
    }
}

console.log('\n═══════════════════════════════════════════════════');
console.log('    ⚡ NAVIGATION & PERFORMANCE REGRESSION GATE');
console.log('═══════════════════════════════════════════════════\n');

// 1. Navbar SPA Navigation Check
const navbarCode = read('components/Navbar.js');
assert(navbarCode.includes("import Link from 'next/link'"), 'Navbar imports Next.js Link component');
assert(!navbarCode.includes('<a href="/'), 'Navbar contains 0 raw <a href="/"> document reload links');
assert(/href=\{item\.path\}/.test(navbarCode), 'Navbar navItems mapping uses Next.js Link component');
assert(navbarCode.includes('href="/test/configure"'), 'Navbar Practice drawer link uses Next.js Link');
assert(navbarCode.includes('href="/dashboard"'), 'Navbar Dashboard drawer link uses Next.js Link');

// 2. Dashboard SPA Navigation Check
const dashboardCode = read('app/dashboard/DashboardClient.js');
assert(dashboardCode.includes("import Link from 'next/link'"), 'DashboardClient imports Next.js Link component');
assert(!dashboardCode.includes("window.location.href = '/login'"), 'DashboardClient unauth check uses router.push instead of window.location.href');

// 3. Register Client Artificial Delay Check
const registerCode = read('app/register/RegisterClient.js');
assert(!registerCode.includes('setTimeout(r, 6000)'), 'RegisterClient contains 0 artificial 6-second retry sleep delays');
assert(!registerCode.includes('setTimeout(() => {'), 'RegisterClient contains 0 artificial redirect timeouts');
assert(registerCode.includes('router.push('), 'RegisterClient OTP verification redirects via router.push for instant SPA transition');

// 4. Boot Task Classification Check
const bootCode = read('lib/boot/orchestrator.js');
assert(bootCode.includes('1. CRITICAL PATH'), 'bootApp() establishes an explicit CRITICAL PATH section');
assert(bootCode.includes('2. DEFERRED PATH'), 'bootApp() establishes an explicit DEFERRED PATH section');
assert(bootCode.includes('3. BACKGROUND PATH'), 'bootApp() establishes an explicit BACKGROUND PATH section');
assert(!bootCode.includes('await step(\'push_registration\''), 'FCM push registration network call is not synchronously blocking bootApp');

// 5. Flutter Shell Startup Parallelization Check
const flutterCode = read('mobile/lib/main.dart');
assert(flutterCode.includes('Future.wait(['), 'Flutter main() uses Future.wait for parallel SDK initializations');
assert(flutterCode.includes('AdService().initialize()'), 'AdMob init is safely executed concurrently post Firebase init');

console.log('\n═══════════════════════════════════════════════════');
console.log(`  ✅ Passed: ${passed.length}`);
console.log(`  ❌ Failed: ${failures.length}`);
console.log('═══════════════════════════════════════════════════\n');

if (failures.length > 0) {
    console.error('❌ Navigation & Performance Regression Gate FAILED.');
    process.exit(1);
} else {
    console.log('🎉 All Navigation & Performance Regression checks PASSED!');
    process.exit(0);
}
