/**
 * Mobile Blocker Audit Script
 * 
 * Scans the entire frontend codebase for patterns that silently block
 * mobile users or return early based on user-agent detection.
 * 
 * This catches:
 *   1. userAgent checks that gate functionality
 *   2. Early returns after mobile detection
 *   3. Missing native-app bypass logic
 *   4. Any "download app" forced modals
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCAN_DIRS = ['app', 'components', 'lib', 'context'];

// Patterns that indicate a mobile blocker
const BLOCKER_PATTERNS = [
  { regex: /userAgent\.match\(.*Android.*iPhone/g, label: 'Mobile UA Detection' },
  { regex: /isMobile.*return/gs, label: 'Early return after mobile check' },
  { regex: /showAppPromo|AppInstallPrompt|App Required/g, label: 'App Install Gate' },
  { regex: /mode.*hard.*showModal/g, label: 'Hard-blocking modal' },
  { regex: /navigator\.userAgent.*\breturn\b/gs, label: 'UA-gated return statement' },
];

// Pattern that indicates proper native-app bypass
const BYPASS_PATTERNS = [
  /isInsideNativeApp|ReactNativeWebView|NEETCoachApp|nativeApp|native_app/g,
];

let totalFiles = 0;
let totalBlockers = 0;
let results = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let fileBlockers = [];

  for (const pattern of BLOCKER_PATTERNS) {
    // Reset regex
    pattern.regex.lastIndex = 0;
    let match;
    while ((match = pattern.regex.exec(content)) !== null) {
      // Find line number
      const upToMatch = content.substring(0, match.index);
      const lineNum = upToMatch.split('\n').length;
      
      fileBlockers.push({
        file: filePath.replace(ROOT + '/', ''),
        line: lineNum,
        type: pattern.label,
        snippet: lines[lineNum - 1]?.trim().substring(0, 120)
      });
    }
  }

  // Check if bypass exists in the same file
  if (fileBlockers.length > 0) {
    let hasBypass = false;
    for (const bp of BYPASS_PATTERNS) {
      bp.lastIndex = 0;
      if (bp.test(content)) {
        hasBypass = true;
        break;
      }
    }

    for (const b of fileBlockers) {
      b.hasBypass = hasBypass;
    }
    results.push(...fileBlockers);
    totalBlockers += fileBlockers.length;
  }
}

function walkDir(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      walkDir(fullPath);
    } else if (item.isFile() && (item.name.endsWith('.js') || item.name.endsWith('.jsx') || item.name.endsWith('.tsx'))) {
      totalFiles++;
      scanFile(fullPath);
    }
  }
}

// Run the scan
console.log('═══════════════════════════════════════════════════');
console.log('     📱 MOBILE BLOCKER AUDIT — Static Analysis');
console.log('═══════════════════════════════════════════════════\n');

for (const dir of SCAN_DIRS) {
  const fullDir = path.join(ROOT, dir);
  if (fs.existsSync(fullDir)) walkDir(fullDir);
}

console.log(`Scanned: ${totalFiles} files`);
console.log(`Found:   ${totalBlockers} mobile blocker pattern(s)\n`);

if (results.length === 0) {
  console.log('✅ NO MOBILE BLOCKERS DETECTED. All clear.\n');
} else {
  console.log('─── FINDINGS ───────────────────────────────────\n');
  for (const r of results) {
    const status = r.hasBypass ? '✅ BYPASSED (native app safe)' : '🔴 UNPROTECTED (blocks native app!)';
    console.log(`${status}`);
    console.log(`  File:    ${r.file}:${r.line}`);
    console.log(`  Type:    ${r.type}`);
    console.log(`  Code:    ${r.snippet}`);
    console.log('');
  }
  
  // Summary
  const unprotected = results.filter(r => !r.hasBypass);
  const protected_ = results.filter(r => r.hasBypass);
  
  console.log('─── SUMMARY ────────────────────────────────────');
  console.log(`  ✅ Bypassed (safe for native app): ${protected_.length}`);
  console.log(`  🔴 Unprotected (blocks native app): ${unprotected.length}`);
  
  if (unprotected.length > 0) {
    console.log(`\n❌ AUDIT FAILED: ${unprotected.length} unprotected mobile gate(s) found.`);
    process.exit(1);
  } else {
    console.log(`\n✅ AUDIT PASSED: All mobile gates have native-app bypass.`);
    process.exit(0);
  }
}
