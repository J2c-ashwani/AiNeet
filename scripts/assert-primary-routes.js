/**
 * scripts/assert-primary-routes.js
 * 
 * MD-MANDATED: Validates that all primary navigation routes resolve
 * to actual page.js files in the app/ directory.
 * 
 * Runs during build. Fails with exit code 1 if any primary route is missing.
 * This ensures navigation bugs NEVER reach production again.
 * 
 * Usage: node scripts/assert-primary-routes.js
 */

const fs = require('fs');
const path = require('path');

// Primary navigation routes that MUST exist as app/[route]/page.js
const PRIMARY_ROUTES = [
  '/',                  // Landing
  '/dashboard',         // Home (logged in)
  '/test/configure',    // Practice / Test configure
  '/doubts',            // AI Doubt Solver
  '/profile',           // Student Profile
  '/login',             // Authentication
  '/register',          // Registration
  '/pricing',           // Premium / Pricing
  '/battleground',      // Battleground
  '/omr',               // OMR Scanner
  '/mistakes',          // Mistake Notebook
  '/leaderboard',       // Leaderboard
  '/ncert',             // NCERT Library
  '/revision',          // Revision
  '/study-plan',        // Study Plan
  '/blueprint',         // Blueprint
  '/analytics',         // Analytics
  '/download',          // Download page
  '/test/diagnostic',   // Diagnostic test
];

const appDir = path.resolve(__dirname, '../app');

function routeToPagePath(route) {
  if (route === '/') {
    return path.join(appDir, 'page.js');
  }
  return path.join(appDir, route.replace(/^\//, ''), 'page.js');
}

console.log('🔗 Asserting Primary Route Integrity...\n');

let failures = 0;
let passes = 0;

for (const route of PRIMARY_ROUTES) {
  const pagePath = routeToPagePath(route);
  const exists = fs.existsSync(pagePath);
  
  if (exists) {
    passes++;
    console.log(`  ✅ ${route.padEnd(25)} → ${path.relative(process.cwd(), pagePath)}`);
  } else {
    failures++;
    console.error(`  ❌ ${route.padEnd(25)} → MISSING: ${path.relative(process.cwd(), pagePath)}`);
  }
}

console.log(`\n📊 Results: ${passes} passed, ${failures} failed out of ${PRIMARY_ROUTES.length} routes\n`);

if (failures > 0) {
  console.error('🚨 BUILD BLOCKED: Primary routes are missing. Fix before deploying.\n');
  process.exit(1);
} else {
  console.log('✅ All primary routes verified.\n');
  process.exit(0);
}
