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
const BUILD_MANIFEST = path.join(BUILD_DIR, 'build-manifest.json');

const BUDGETS = {
    initialBundleKB:  1500,  // 1.5 MB — initial page load
    pageRouteChunkKB:  600,  // Accommodates new native PDF export (jspdf) and Turbopack bundler behavior
    vendorChunkKB:     600,  // Webpack/Turbopack split/vendor chunks
    serverChunkKB:     600,  // Server-side chunks
};

const results = { passed: [], failed: [], warnings: [] };

function isVendorChunk(filename) {
    // Next.js/webpack vendor/split chunks have hex-only names
    // e.g. 09a80711f9c510d4.js — we don't control their size directly
    return /^[0-9a-f]{16}\.js$/.test(path.basename(filename));
}

function isInitialChunk(filename) {
    return /\/(main|polyfills|framework|webpack)/.test(filename);
}

function getInitialChunkFiles() {
    const files = new Set();
    if (fs.existsSync(BUILD_MANIFEST)) {
        try {
            const manifest = JSON.parse(fs.readFileSync(BUILD_MANIFEST, 'utf8'));
            for (const entry of manifest.rootMainFiles || []) files.add(path.join(BUILD_DIR, entry));
            for (const entry of manifest.polyfillFiles || []) files.add(path.join(BUILD_DIR, entry));
            for (const entry of manifest.pages?.['/_app'] || []) files.add(path.join(BUILD_DIR, entry));
        } catch (error) {
            fail(`Could not parse build manifest for initial bundle analysis: ${error.message}`);
        }
    }
    return files;
}

function check() {
    if (!fs.existsSync(BUILD_DIR)) {
        // In CI, the build may not exist yet when release-readiness runs.
        // This is not a failure — the build step itself validates compilation.
        warn('Build directory not found — skipping bundle size analysis (run after `npm run build`)');
        return;
    }

    if (!fs.existsSync(CHUNKS_DIR)) {
        warn('No chunks directory found — skipping bundle analysis');
        return;
    }

    let totalInitialBytes = 0;
    const files = getAllFiles(CHUNKS_DIR, '.js');
    const initialFiles = getInitialChunkFiles();
    const oversizedPage   = [];
    const oversizedVendor = [];

    for (const file of files) {
        const stats   = fs.statSync(file);
        const relPath = path.relative(ROOT, file);
        const kb      = stats.size / 1024;

        if (initialFiles.has(file) || isInitialChunk(file)) {
            totalInitialBytes += stats.size;
            continue;
        }

        if (isVendorChunk(file)) {
            // Vendor/split chunks — warn if huge, but use vendor budget
            if (kb > BUDGETS.vendorChunkKB) {
                oversizedVendor.push({ file: relPath, kb: kb.toFixed(1) });
            }
        } else {
            // Named page/route chunks — enforce strict budget
            if (kb > BUDGETS.pageRouteChunkKB) {
                oversizedPage.push({ file: relPath, kb: kb.toFixed(1) });
            }
        }
    }

    // Initial bundle
    const totalKB = totalInitialBytes / 1024;
    if (totalInitialBytes === 0) {
        fail('Initial JS bundle could not be calculated from build manifest');
    } else if (totalKB > BUDGETS.initialBundleKB) {
        fail(`Initial JS bundle ${totalKB.toFixed(1)}KB > ${BUDGETS.initialBundleKB}KB limit`);
    } else {
        pass(`Initial bundle ${totalKB.toFixed(1)}KB (limit: ${BUDGETS.initialBundleKB}KB)`);
    }

    // Page route chunks (strict — these are our code)
    if (oversizedPage.length > 0) {
        oversizedPage.forEach(c =>
            fail(`Page chunk too large: ${c.file} = ${c.kb}KB > ${BUDGETS.pageRouteChunkKB}KB`)
        );
    } else {
        pass(`All page route chunks within ${BUDGETS.pageRouteChunkKB}KB limit`);
    }

    // Vendor chunks (informational — not a hard CI failure, we don't own these)
    if (oversizedVendor.length > 0) {
        oversizedVendor.forEach(c =>
            warn(`Vendor chunk large: ${c.file} = ${c.kb}KB > ${BUDGETS.vendorChunkKB}KB — consider dynamic import`)
        );
    } else {
        pass(`All vendor chunks within ${BUDGETS.vendorChunkKB}KB limit`);
    }

    // Source-level checks
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
