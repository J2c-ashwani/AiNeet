/**
 * ═══════════════════════════════════════════════════════════════
 * MASTER MOBILE & RELIABILITY AUDIT — Phase 1: Static Analysis
 * ═══════════════════════════════════════════════════════════════
 * 
 * Scans entire codebase for:
 *   1. Mobile blockers & WebView incompatibilities
 *   2. Silent failure patterns (swallowed errors)
 *   3. Orphan features (dead routes, empty backends)
 *   4. Payment failure risks
 *   5. Data integrity risks
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCAN_DIRS = ['app', 'components', 'lib', 'context'];
const RESULTS = { mobile: [], silent: [], orphan: [], payment: [], integrity: [] };
const ROUTE_OWNERSHIP_FILE = path.join(ROOT, 'docs', 'enterprise-route-ownership.json');

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

function getAllFiles(dir, ext = ['.js', '.jsx', '.tsx']) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules' && item.name !== '.next') {
      files.push(...getAllFiles(full, ext));
    } else if (item.isFile() && ext.some(e => item.name.endsWith(e))) {
      files.push(full);
    }
  }
  return files;
}

function findPattern(content, regex, lines) {
  regex.lastIndex = 0;
  let matches = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    const lineNum = content.substring(0, m.index).split('\n').length;
    matches.push({ line: lineNum, snippet: (lines[lineNum - 1] || '').trim().substring(0, 140), match: m[0].substring(0, 80) });
  }
  return matches;
}

function rel(filePath) { return filePath.replace(ROOT + '/', ''); }

function loadJsonFile(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const ROUTE_OWNERSHIP = loadJsonFile(ROUTE_OWNERSHIP_FILE, {});
const HAS_GLOBAL_SUPABASE_READ_MONITOR = fs.existsSync(path.join(ROOT, 'lib', 'core', 'supabase-monitor.js'))
  && fs.readFileSync(path.join(ROOT, 'lib', 'core', 'db.js'), 'utf8').includes('monitorSupabaseClient')
  && fs.readFileSync(path.join(ROOT, 'lib', 'supabase.js'), 'utf8').includes('monitorSupabaseClient');

// ═══════════════════════════════════════════════════════════════
// AUDIT 1: MOBILE BLOCKERS
// ═══════════════════════════════════════════════════════════════

const MOBILE_PATTERNS = [
  { regex: /navigator\.userAgent/g, label: 'User-Agent detection', risk: 'P1', note: 'May behave differently in WebView vs browser' },
  { regex: /window\.innerWidth\s*[<>]/g, label: 'Width-based conditional', risk: 'P2', note: 'Mobile layout gate' },
  { regex: /display:\s*['"]?none/g, label: 'display:none (check if mobile-targeted)', risk: 'P3', note: 'May hide critical elements on mobile' },
  { regex: /capture\s*=\s*["']environment/g, label: 'Camera capture attribute', risk: 'P1', note: 'May not work in all WebViews' },
  { regex: /navigator\.clipboard/g, label: 'Clipboard API', risk: 'P2', note: 'Requires HTTPS + secure context in WebView' },
  { regex: /navigator\.share/g, label: 'Web Share API', risk: 'P2', note: 'Not supported in all WebViews' },
  { regex: /navigator\.mediaDevices/g, label: 'MediaDevices API (camera/mic)', risk: 'P1', note: 'WebView camera access requires special permissions' },
  { regex: /document\.execCommand/g, label: 'Deprecated execCommand', risk: 'P2', note: 'Deprecated, may fail silently' },
  { regex: /window\.matchMedia/g, label: 'matchMedia query', risk: 'P3', note: 'Check if gates functionality' },
  { regex: /serviceWorker/g, label: 'Service Worker usage', risk: 'P2', note: 'Service workers inside WebView can conflict with native app' },
  { regex: /beforeinstallprompt/g, label: 'PWA install prompt', risk: 'P1', note: 'Fires in browser, conflicts with native app' },
  { regex: /window\.open\(/g, label: 'window.open() call', risk: 'P2', note: 'Popups may be blocked in WebView' },
  { regex: /target\s*=\s*["']_blank/g, label: 'target="_blank" link', risk: 'P2', note: 'Opens outside WebView, user loses app context' },
  { regex: /localStorage\./g, label: 'localStorage usage', risk: 'P2', note: 'May be cleared by Android system on low memory' },
  { regex: /indexedDB/g, label: 'IndexedDB usage', risk: 'P2', note: 'WebView IndexedDB can be unreliable on old Android' },
];

const BYPASS_CHECK = /isInsideNativeApp|ReactNativeWebView|NEETCoachApp|nativeApp|native_app/;
const APPROVED_MOBILE_RUNTIME_FILES = new Set([
  'lib/platform.js',
  'lib/storage-resilient.js',
  'lib/idb.js',
  'lib/boot/orchestrator.js',
  'lib/recovery/recovery-manager.js',
  'lib/telemetry/mobile-buffer.js',
  'lib/utils/clipboard.js',
  'lib/utils/whatsapp.js',
  'lib/hooks/usePlatformShare.js',
  'lib/client/offline-queue.js',
  'lib/mobile/lifecycle-manager.js',
]);

function isCommentSnippet(snippet) {
  return snippet.startsWith('//') || snippet.startsWith('*') || snippet.startsWith('/*');
}

function isApprovedMobileRuntime(file, content) {
  const fileRel = rel(file);
  if (!APPROVED_MOBILE_RUNTIME_FILES.has(fileRel)) return false;
  return BYPASS_CHECK.test(content) || content.includes('supportsCapability') || content.includes('resilient') || content.includes('fallback') || content.includes('IndexedDB');
}

function auditMobileBlockers(files) {
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const hasBypass = BYPASS_CHECK.test(content);
    const approvedRuntimeFile = isApprovedMobileRuntime(file, content);

    for (const pat of MOBILE_PATTERNS) {
      const matches = findPattern(content, pat.regex, lines);
      for (const m of matches) {
        if (isCommentSnippet(m.snippet)) continue;
        if (approvedRuntimeFile || hasBypass) continue;
        // Skip CSS-only display:none (too noisy)
        if (pat.label.includes('display:none') && !file.includes('/app/')) continue;
        
        RESULTS.mobile.push({
          file: rel(file), line: m.line, risk: pat.risk,
          type: pat.label, note: pat.note,
          hasBypass, snippet: m.snippet
        });
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// AUDIT 2: SILENT FAILURE PATTERNS
// ═══════════════════════════════════════════════════════════════

const SILENT_PATTERNS = [
  { 
    regex: /await\s+supabase\s*\.\s*from\([^)]+\)\s*\.\s*(insert|update|upsert|delete)\([^)]*\)(?!\s*\n\s*.*(?:if\s*\(\s*error|\.then|throw))/g,
    label: 'Supabase write without error check', risk: 'P0'
  },
  {
    regex: /catch\s*\([^)]*\)\s*\{\s*\}/g,
    label: 'Empty catch block (swallowed error)', risk: 'P0'
  },
  {
    regex: /catch\s*\([^)]*\)\s*\{\s*\n?\s*\/\//g,
    label: 'Catch block with only comment (likely swallowed)', risk: 'P1'
  },
  {
    regex: /Promise\.all\s*\(/g,
    label: 'Promise.all (check if errors propagate)', risk: 'P1'
  },
  {
    regex: /fetch\([^)]+\)(?!\s*\.\s*then|\s*;?\s*\n\s*.*(?:ok|status|json))/g,
    label: 'fetch() without response validation', risk: 'P1'
  },
  {
    regex: /console\.error\([^)]*\);\s*\n\s*(?:return\s+NextResponse\.json\(\s*\{[^}]*\}\s*\))/g,
    label: 'Error logged but success-like response returned', risk: 'P1'
  },
  {
    regex: /__handled_by_custom_select_audit__/g,
    label: 'Supabase select without error check', risk: 'P2'
  },
];

function getStatement(content, index) {
  const end = content.indexOf(';', index);
  if (end === -1) return null;

  const startCandidates = [
    content.lastIndexOf('\nconst ', index),
    content.lastIndexOf('\nlet ', index),
    content.lastIndexOf('\nvar ', index),
    content.lastIndexOf('\nreturn ', index),
    content.lastIndexOf('\nawait ', index),
  ].filter(i => i >= 0);
  const start = startCandidates.length ? Math.max(...startCandidates) + 1 : Math.max(0, content.lastIndexOf('\n', index) + 1);

  return { start, end: end + 1, text: content.slice(start, end + 1) };
}

function getDestructuredErrorNames(statement) {
  const match = statement.match(/\{([\s\S]*?)\}\s*=\s*await/);
  if (!match) return [];

  const names = [];
  const errorRegex = /\berror\s*(?::\s*([A-Za-z_$][\w$]*))?/g;
  let m;
  while ((m = errorRegex.exec(match[1])) !== null) {
    names.push(m[1] || 'error');
  }
  return names;
}

function hasNearbyErrorCheck(content, statement, errorNames) {
  const lookahead = content.slice(statement.end, statement.end + 900).split('\n').slice(0, 10).join('\n');
  return errorNames.some(name => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b(if|throw|return)\\b[\\s\\S]{0,160}\\b${escaped}\\b|\\b${escaped}\\b[\\s\\S]{0,160}\\b(throw|return)\\b`).test(lookahead);
  });
}

function auditSupabaseSelectErrorChecks(file, content, lines, usesSafeDB) {
  if (HAS_GLOBAL_SUPABASE_READ_MONITOR) return;
  if (rel(file) === 'lib/core/db-safe.js') return;

  const regex = /\.from\([^)]+\)\s*\.\s*select\(/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const statement = getStatement(content, match.index);
    if (!statement || !statement.text.includes('await')) continue;
    if (!/\bawait\b/.test(content.slice(statement.start, match.index))) continue;
    if (statement.text.includes('safeSelect(')) continue;

    const lineNum = content.substring(0, match.index).split('\n').length;
    const snippet = (lines[lineNum - 1] || '').trim().substring(0, 140);
    if (isCommentSnippet(snippet)) continue;

    const errorNames = getDestructuredErrorNames(statement.text);
    if (errorNames.length > 0 && hasNearbyErrorCheck(content, statement, errorNames)) {
      continue;
    }

    RESULTS.silent.push({
      file: rel(file),
      line: lineNum,
      risk: 'P2',
      type: 'Supabase select without error check',
      usesSafeDB,
      snippet,
    });
  }
}

function auditSilentFailures(files) {
  for (const file of files) {
    // Only audit backend routes and core libs
    if (!file.includes('/api/') && !file.includes('/lib/')) continue;
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    // Check for the safe DB layer usage
    const usesSafeDB = content.includes('db-safe') || content.includes('safeInsert') || content.includes('safeUpdate') || content.includes('safeRpc');

    for (const pat of SILENT_PATTERNS) {
      const matches = findPattern(content, pat.regex, lines);
      for (const m of matches) {
        RESULTS.silent.push({
          file: rel(file), line: m.line, risk: pat.risk,
          type: pat.label, usesSafeDB,
          snippet: m.snippet
        });
      }
    }

    auditSupabaseSelectErrorChecks(file, content, lines, usesSafeDB);
  }
}

// ═══════════════════════════════════════════════════════════════
// AUDIT 3: ORPHAN FEATURES
// ═══════════════════════════════════════════════════════════════

function auditOrphanFeatures(files) {
  // Find all API routes
  const apiRoutes = files.filter(f => f.includes('/api/') && f.endsWith('route.js'));
  const frontendFiles = files.filter(f => !f.includes('/api/'));
  const allFrontendContent = frontendFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');

  for (const route of apiRoutes) {
    // Extract the API path from file path
    const apiPath = route.replace(ROOT, '').replace('/route.js', '').replace(/^\/app/, '');
    // Check if any frontend file references this API path
    const isReferenced = allFrontendContent.includes(apiPath) || 
                         allFrontendContent.includes(apiPath.replace('/api/', '/api/'));
    const ownership = ROUTE_OWNERSHIP[apiPath];
    
    if (!isReferenced && !ownership) {
      const content = fs.readFileSync(route, 'utf8');
      const methods = [];
      if (content.includes('export async function GET')) methods.push('GET');
      if (content.includes('export async function POST')) methods.push('POST');
      if (content.includes('export async function PUT')) methods.push('PUT');
      if (content.includes('export async function DELETE')) methods.push('DELETE');
      
      RESULTS.orphan.push({
        file: rel(route), type: 'API route with no frontend caller',
        risk: 'P2', apiPath, methods: methods.join(', '),
        note: 'May be unused, or only called from external systems (webhooks, cron)'
      });
    }
  }

  // Find frontend pages
  const pages = files.filter(f => f.endsWith('page.js') && !f.includes('/api/'));
  for (const page of pages) {
    const content = fs.readFileSync(page, 'utf8');
    // Check for skeleton/placeholder pages
    if (content.includes('Coming Soon') || content.includes('TODO') || content.length < 200) {
      RESULTS.orphan.push({
        file: rel(page), type: 'Skeleton/placeholder page',
        risk: 'P2', note: 'Page exists in routing but may not be functional'
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// AUDIT 4: PAYMENT FAILURE RISKS
// ═══════════════════════════════════════════════════════════════

function auditPaymentRisks(files) {
  const paymentFiles = files.filter(f => 
    f.includes('payment') || f.includes('cashfree') || 
    f.includes('subscription') || f.includes('webhook') ||
    f.includes('entitlement') || f.includes('billing')
  );

  for (const file of paymentFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    // Check for signature verification
    if (file.includes('webhook') && !content.includes('verify') && !content.includes('signature') && !content.includes('hmac')) {
      RESULTS.payment.push({
        file: rel(file), type: 'Webhook without signature verification',
        risk: 'P0', note: 'Webhook endpoint may accept forged requests'
      });
    }

    // Check for idempotency
    if (file.includes('webhook') && !content.includes('idempoten') && !content.includes('23505') && !content.includes('duplicate')) {
      RESULTS.payment.push({
        file: rel(file), type: 'Webhook without idempotency check',
        risk: 'P0', note: 'Duplicate webhook replays may double-activate subscriptions'
      });
    }

    // Check for raw DB writes (not using safe layer)
    if (!content.includes('safeRpc') && !content.includes('safeInsert') && !content.includes('db-safe')) {
      if (content.includes('.insert(') || content.includes('.update(')) {
        RESULTS.payment.push({
          file: rel(file), type: 'Payment file using raw DB writes (not safe layer)',
          risk: 'P1', note: 'Payment writes should use transactional safe layer'
        });
      }
    }

    // Check for race condition protection
    if (content.includes('subscription') && !content.includes('transaction') && !content.includes('rpc') && !content.includes('lock')) {
      if (content.includes('.insert(')) {
        RESULTS.payment.push({
          file: rel(file), type: 'Subscription write without transaction protection',
          risk: 'P1', note: 'Concurrent webhook calls could create duplicate subscriptions'
        });
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// AUDIT 5: DATA INTEGRITY — UNPROTECTED WRITES
// ═══════════════════════════════════════════════════════════════

function auditDataIntegrity(files) {
  const apiFiles = files.filter(f => f.includes('/api/'));
  
  for (const file of apiFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const usesSafeDB = content.includes('db-safe') || content.includes('safeInsert');

    // Count raw supabase writes
    const rawInserts = (content.match(/supabase\s*\.\s*from\([^)]+\)\s*\.\s*insert/g) || []).length;
    const rawUpdates = (content.match(/supabase\s*\.\s*from\([^)]+\)\s*\.\s*update/g) || []).length;
    const rawDeletes = (content.match(/supabase\s*\.\s*from\([^)]+\)\s*\.\s*delete/g) || []).length;
    const totalRaw = rawInserts + rawUpdates + rawDeletes;

    if (totalRaw > 0 && !usesSafeDB) {
      RESULTS.integrity.push({
        file: rel(file), type: 'API route with raw DB writes (no safe layer)',
        risk: totalRaw >= 3 ? 'P0' : 'P1',
        rawInserts, rawUpdates, rawDeletes,
        note: `${totalRaw} raw write(s) bypass error enforcement and monitoring`
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// RUN ALL AUDITS
// ═══════════════════════════════════════════════════════════════

console.log('');
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  MASTER PLATFORM AUDIT — Phase 1: Static Code Analysis  ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');

let allFiles = [];
for (const dir of SCAN_DIRS) {
  allFiles.push(...getAllFiles(path.join(ROOT, dir)));
}
console.log(`📂 Scanned: ${allFiles.length} files across [${SCAN_DIRS.join(', ')}]\n`);

auditMobileBlockers(allFiles);
auditSilentFailures(allFiles);
auditOrphanFeatures(allFiles);
auditPaymentRisks(allFiles);
auditDataIntegrity(allFiles);

// ═══════════════════════════════════════════════════════════════
// REPORT
// ═══════════════════════════════════════════════════════════════

function printSection(title, items, showBypass = false) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${title} (${items.length} findings)`);
  console.log('═'.repeat(60));
  
  if (items.length === 0) {
    console.log('  ✅ No issues found.\n');
    return;
  }

  // Group by risk
  const p0 = items.filter(i => i.risk === 'P0');
  const p1 = items.filter(i => i.risk === 'P1');
  const p2 = items.filter(i => i.risk === 'P2');
  const p3 = items.filter(i => i.risk === 'P3');

  for (const [label, group] of [['🔴 P0 — CRITICAL', p0], ['🟠 P1 — HIGH', p1], ['🟡 P2 — MEDIUM', p2], ['⚪ P3 — LOW', p3]]) {
    if (group.length === 0) continue;
    console.log(`\n  ${label} (${group.length})`);
    console.log('  ' + '─'.repeat(56));
    for (const item of group) {
      const bypass = showBypass ? (item.hasBypass ? ' [✅ BYPASSED]' : ' [🔴 NO BYPASS]') : '';
      console.log(`  📄 ${item.file}:${item.line || '?'}${bypass}`);
      console.log(`     ${item.type}`);
      if (item.note) console.log(`     💡 ${item.note}`);
      if (item.snippet) console.log(`     > ${item.snippet}`);
      if (item.rawInserts) console.log(`     📊 Inserts: ${item.rawInserts}, Updates: ${item.rawUpdates}, Deletes: ${item.rawDeletes}`);
      console.log('');
    }
  }
}

printSection('1. MOBILE BLOCKERS & WEBVIEW RISKS', RESULTS.mobile, true);
printSection('2. SILENT FAILURE PATTERNS', RESULTS.silent);
printSection('3. ORPHAN FEATURES (Dead Routes/Pages)', RESULTS.orphan);
printSection('4. PAYMENT & BILLING RISKS', RESULTS.payment);
printSection('5. DATA INTEGRITY — UNPROTECTED DB WRITES', RESULTS.integrity);

// ═══════════════════════════════════════════════════════════════
// FINAL SUMMARY
// ═══════════════════════════════════════════════════════════════

const allFindings = [...RESULTS.mobile, ...RESULTS.silent, ...RESULTS.orphan, ...RESULTS.payment, ...RESULTS.integrity];
const p0Count = allFindings.filter(f => f.risk === 'P0').length;
const p1Count = allFindings.filter(f => f.risk === 'P1').length;
const p2Count = allFindings.filter(f => f.risk === 'P2').length;

console.log('\n' + '═'.repeat(60));
console.log('  FINAL SUMMARY');
console.log('═'.repeat(60));
console.log(`  Total findings: ${allFindings.length}`);
console.log(`  🔴 P0 Critical:  ${p0Count}`);
console.log(`  🟠 P1 High:      ${p1Count}`);
console.log(`  🟡 P2 Medium:    ${p2Count}`);
console.log(`  ⚪ P3 Low:       ${allFindings.filter(f => f.risk === 'P3').length}`);
console.log('');

if (p0Count > 0) {
  console.log(`  ❌ AUDIT STATUS: FAILED — ${p0Count} critical issue(s) require immediate attention.`);
  process.exit(1);
} else {
  console.log('  ✅ AUDIT STATUS: PASSED — No critical blockers found.');
  process.exit(0);
}
