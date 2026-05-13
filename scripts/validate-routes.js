/**
 * scripts/validate-routes.js
 * 
 * Scans all href="..." references in app/ and components/ directories.
 * Cross-references against actual app/ page routes.
 * Fails with exit code 1 if any internal href points to a non-existent route.
 * 
 * Skips: external URLs, API routes, anchor links, dynamic routes with [params]
 * 
 * Usage: node scripts/validate-routes.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const APP_DIR = path.join(ROOT, 'app');

// 1. Build the set of valid routes from app/ directory
function getValidRoutes() {
  const routes = new Set();
  
  function scan(dir, routePrefix) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'api') continue;
      
      if (entry.isDirectory()) {
        const segment = entry.name;
        // Dynamic segments like [id] match anything
        const isDynamic = segment.startsWith('[');
        const newPrefix = routePrefix + '/' + segment;
        
        // Check if this directory has a page.js
        if (fs.existsSync(path.join(dir, segment, 'page.js'))) {
          if (isDynamic) {
            // Mark the parent route pattern as valid
            routes.add(routePrefix + '/[dynamic]');
          } else {
            routes.add(newPrefix);
          }
        }
        scan(path.join(dir, segment), newPrefix);
      }
    }
  }
  
  // Root page
  if (fs.existsSync(path.join(APP_DIR, 'page.js'))) {
    routes.add('/');
  }
  
  scan(APP_DIR, '');
  return routes;
}

// 2. Extract all href values from source files
function extractHrefs() {
  const hrefs = [];
  const dirs = ['app', 'components'];
  
  for (const dir of dirs) {
    const fullDir = path.join(ROOT, dir);
    if (!fs.existsSync(fullDir)) continue;
    
    try {
      const output = execSync(
        `grep -rn 'href="[^"]*"' "${fullDir}" --include="*.js" --include="*.jsx"`,
        { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
      ).trim();
      
      if (!output) continue;
      
      for (const line of output.split('\n')) {
        const matches = line.matchAll(/href="([^"]+)"/g);
        for (const match of matches) {
          const href = match[1];
          const file = line.split(':')[0];
          const lineNum = line.split(':')[1];
          hrefs.push({ href, file: path.relative(ROOT, file), line: lineNum });
        }
      }
    } catch (e) {
      // grep returns exit code 1 if no matches
    }
  }
  
  return hrefs;
}

// 3. Validate
console.log('🔍 Validating all internal href references...\n');

const validRoutes = getValidRoutes();
const hrefs = extractHrefs();

let failures = 0;
let skipped = 0;
let passed = 0;

for (const { href, file, line } of hrefs) {
  // Skip external URLs
  if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    skipped++;
    continue;
  }
  
  // Skip anchors
  if (href.startsWith('#')) {
    skipped++;
    continue;
  }
  
  // Skip API routes
  if (href.startsWith('/api/')) {
    skipped++;
    continue;
  }
  
  // Skip asset paths
  if (href.match(/\.(png|jpg|svg|ico|webp|apk|json|xml|css|js)$/)) {
    skipped++;
    continue;
  }
  
  // Strip query params and hash for route matching
  const routePath = href.split('?')[0].split('#')[0];
  
  // Skip empty
  if (!routePath || routePath === '/') {
    if (validRoutes.has('/')) { passed++; } else { failures++; }
    continue;
  }
  
  // Check direct match
  if (validRoutes.has(routePath)) {
    passed++;
    continue;
  }
  
  // Check if it matches a dynamic route pattern
  // e.g., /test/123 matches /test/[id] which we stored as /test/[dynamic]
  const segments = routePath.split('/').filter(Boolean);
  let matchFound = false;
  
  // Try removing last segment and checking for dynamic
  if (segments.length >= 2) {
    const parentRoute = '/' + segments.slice(0, -1).join('/');
    if (validRoutes.has(parentRoute + '/[dynamic]')) {
      matchFound = true;
    }
  }
  
  // Also check the educator page pattern (has query params handled above)
  if (matchFound) {
    passed++;
  } else {
    failures++;
    console.error(`  ❌ ${file}:${line} → href="${href}" (no matching page)`);
  }
}

console.log(`\n📊 Results: ${passed} valid, ${failures} broken, ${skipped} skipped (external/api/assets)\n`);

if (failures > 0) {
  console.error('🚨 BUILD BLOCKED: Broken internal links detected. Fix before deploying.\n');
  process.exit(1);
} else {
  console.log('✅ All internal hrefs point to valid routes.\n');
  process.exit(0);
}
