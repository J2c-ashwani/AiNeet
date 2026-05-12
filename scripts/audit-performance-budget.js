#!/usr/bin/env node
/**
 * scripts/audit-performance-budget.js
 *
 * CI gate: fails the build if performance budgets are exceeded.
 * Run AFTER `npm run build`.
 *
 * Budgets (non-negotiable — engineering constraint for low-end Android):
 *   Initial JS bundle:  < 1.5 MB
 *   Any route chunk:    < 350 KB
 *   Page count:         validates build output exists
 */

const fs   = require('fs');
const path = require('path');

const ROOT       = path.join(__dirname, '..');
const BUILD_DIR  = path.join(ROOT, '.next');
const CHUNKS_DIR = path.join(BUILD_DIR, 'static', 'chunks');

const BUDGETS = {
    initialBundleKB:  1500,  // 1.5 MB
    routeChunkKB:     350,   // 350 KB per chunk
    serverChunkKB:    500,   // Server-side chunks more lenient
};

const results = { passed: [], failed: [], warnings: [] };

function fmt(bytes) { return `${(bytes / 1024).toFixed(1)} KB`; }

function check(build) {
    if (!fs.existsSync(BUILD_DIR)) {
        fail('Build directory missing — run `npm run build` first');
        return;
    }

    // ── Scan all JS chunks ──────────────────────────────────
    if (!fs.existsSync(CHUNKS_DIR)) {
        warn('No chunks directory found — skipping bundle analysis');
        return;
    }

    let totalInitialBytes = 0;
    const chunksDir = CHUNKS_DIR;

    const files = getAllFiles(chunksDir, '.js');
    const oversized = [];

    for (const file of files) {
        const stats = fs.statSync(file);
        const relPath = path.relative(ROOT, file);
        const kb = stats.size / 1024;

        // Detect initial chunks (main, polyfills, framework)
        const isInitial = /\/(main|polyfills|framework|webpack)/.test(file);
        if (isInitial) totalInitialBytes += stats.size;

        if (kb > BUDGETS.routeChunkKB && !isInitial) {
            oversized.push({ file: relPath, kb: kb.toFixed(1) });
        }
    }

    // Initial bundle check
    const totalKB = totalInitialBytes / 1024;
    if (totalKB > BUDGETS.initialBundleKB) {
        fail(`Initial JS bundle ${totalKB.toFixed(1)}KB > ${BUDGETS.initialBundleKB}KB limit`);
    } else {
        pass(`Initial bundle ${totalKB.toFixed(1)}KB (limit: ${BUDGETS.initialBundleKB}KB)`);
    }

    // Per-chunk checks
    if (oversized.length > 0) {
        oversized.forEach(c => fail(`Route chunk too large: ${c.file} = ${c.kb}KB > ${BUDGETS.routeChunkKB}KB`));
    } else {
        pass(`All route chunks within ${BUDGETS.routeChunkKB}KB limit`);
    }

    // ── Source-level checks ─────────────────────────────────
    checkForUnvirtualizedLists();
}

function checkForUnvirtualizedLists() {
    const srcDirs = ['app', 'components'];
    let found = [];

    for (const dir of srcDirs) {
        const abs = path.join(ROOT, dir);
        if (!fs.existsSync(abs)) continue;
        const files = getAllFiles(abs, '.js', '.jsx', '.tsx');
        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');
            // Detect .map() rendering patterns on potentially large arrays
            const mapMatches = content.match(/\.(questions|items|results|students|events|reports)\s*\.map\s*\(/g);
            if (mapMatches && mapMatches.length > 0) {
                found.push(path.relative(ROOT, file));
            }
        }
    }

    if (found.length > 0) {
        found.forEach(f => warn(`Potential unvirtualized list in: ${f} — verify array size < 50 items`));
    } else {
        pass('No obvious unvirtualized large-list patterns detected');
    }
}

function getAllFiles(dir, ...exts) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, item.name);
        if (item.isDirectory() && item.name !== 'node_modules') {
            results.push(...getAllFiles(full, ...exts));
        } else if (item.isFile() && exts.some(e => item.name.endsWith(e))) {
            results.push(full);
        }
    }
    return results;
}

function pass(msg)  { results.passed.push(msg);   console.log(`  ✅ ${msg}`); }
function fail(msg)  { results.failed.push(msg);   console.log(`  ❌ ${msg}`); }
function warn(msg)  { results.warnings.push(msg); console.log(`  ⚠️  ${msg}`); }

console.log('\n═══════════════════════════════════════════════════');
console.log('    📦 PERFORMANCE BUDGET AUDIT');
console.log('═══════════════════════════════════════════════════\n');

check();

console.log(`\n  ✅ Passed:   ${results.passed.length}`);
console.log(`  ⚠️  Warnings: ${results.warnings.length}`);
console.log(`  ❌ Failed:   ${results.failed.length}`);
console.log('═══════════════════════════════════════════════════\n');

process.exit(results.failed.length > 0 ? 1 : 0);
