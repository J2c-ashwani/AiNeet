#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const warnings = [];
const passes = [];

const sourceDirs = ['app', 'components'];
const sourceFiles = sourceDirs.flatMap(dir => walk(path.join(root, dir)))
    .filter(file => /\.(js|jsx|ts|tsx)$/.test(file))
    .filter(file => !file.includes(`${path.sep}api${path.sep}`))
    .filter(file => !file.endsWith(`${path.sep}layout.js`));

const studentFacingFiles = sourceFiles
    .filter(file => !file.includes(`${path.sep}admin${path.sep}`));

const apiRoutes = new Set(
    walk(path.join(root, 'app', 'api'))
        .filter(file => /route\.(js|ts)$/.test(file))
        .map(file => routeFromFile(file, path.join(root, 'app', 'api'), '/api'))
);

const pageRoutes = walk(path.join(root, 'app'))
    .filter(file => /page\.(js|jsx|tsx)$/.test(file))
    .map(file => routeFromFile(file, path.join(root, 'app'), ''))
    .map(route => route || '/');

const pageMatchers = pageRoutes.map(routeToMatcher);
const publicFiles = new Set(
    fs.existsSync(path.join(root, 'public'))
        ? walk(path.join(root, 'public')).map(file => `/${path.relative(path.join(root, 'public'), file).replaceAll(path.sep, '/')}`)
        : []
);

const allowedMissingLocalLinks = new Set([
    '/downloads/neet-coach.apk',
]);

function walk(dir) {
    if (!fs.existsSync(dir)) return [];
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name === '.next') continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...walk(full));
        else out.push(full);
    }
    return out;
}

function routeFromFile(file, base, prefix) {
    const relative = path.relative(base, path.dirname(file)).replaceAll(path.sep, '/');
    const route = relative === '.' ? '' : `/${relative}`;
    return `${prefix}${route}`.replace(/\/page$/, '') || '/';
}

function routeToMatcher(route) {
    const escaped = route
        .split('/')
        .map(part => {
            if (!part) return '';
            if (/^\[.+\]$/.test(part)) return '[^/]+';
            return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        })
        .join('/');
    return new RegExp(`^${escaped || '/'}(?:[/?#].*)?$`);
}

function normalizeLocalPath(raw) {
    if (!raw || raw.startsWith('//')) return null;
    if (!raw.startsWith('/')) return null;
    if (raw.startsWith('/api/')) return raw.split(/[?#]/)[0];
    return raw.split(/[?#]/)[0].replace(/\/$/, '') || '/';
}

function hasPageRoute(route) {
    return pageMatchers.some(matcher => matcher.test(route));
}

function hasStaticAsset(route) {
    return publicFiles.has(route);
}

function pass(message) {
    passes.push(message);
}

function fail(message) {
    failures.push(message);
}

function warn(message) {
    warnings.push(message);
}

function relative(file) {
    return path.relative(root, file);
}

function lineFor(content, index) {
    return content.slice(0, index).split('\n').length;
}

function auditApiCalls(file, content) {
    const literalPattern = /['"`](\/api\/[^'"`)\s}]+)['"`]/g;
    for (const match of content.matchAll(literalPattern)) {
        const raw = match[1];
        const apiPath = normalizeLocalPath(raw);
        if (!apiPath) continue;
        if (!apiRoutes.has(apiPath)) {
            fail(`${relative(file)}:${lineFor(content, match.index)} calls missing API route ${apiPath}`);
        } else {
            pass(`${relative(file)} references live API ${apiPath}`);
        }
    }
}

function auditLinks(file, content) {
    const hrefPattern = /\bhref\s*=\s*(?:"([^"]+)"|'([^']+)'|{\s*["'`]([^"'`{}]+)["'`]\s*})/g;
    for (const match of content.matchAll(hrefPattern)) {
        const raw = match[1] || match[2] || match[3];
        const localPath = normalizeLocalPath(raw);
        if (!localPath || localPath.startsWith('/api/')) continue;
        if (raw.startsWith('/#') || localPath === '#') continue;
        if (allowedMissingLocalLinks.has(localPath)) continue;

        if (!hasPageRoute(localPath) && !hasStaticAsset(localPath)) {
            fail(`${relative(file)}:${lineFor(content, match.index)} links to missing local route/asset ${localPath}`);
        } else {
            pass(`${relative(file)} links to live local target ${localPath}`);
        }
    }
}

function isInsideLink(content, index) {
    const before = content.slice(Math.max(0, index - 1500), index);
    const after = content.slice(index, index + 1500);
    return /<(Link|a)\b[^>]*$/s.test(before) || (/<(Link|a)\b[^>]*>/s.test(before) && /<\/(Link|a)>/s.test(after));
}

function auditButtons(file, content) {
    if (relative(file) === 'components/ui/Button.js') return;

    const buttonPattern = /<(Button|button)\b([^>]*)>/g;
    for (const match of content.matchAll(buttonPattern)) {
        const attrs = match[2] || '';
        const line = lineFor(content, match.index);
        const hasAction = /\bonClick\s*=/.test(attrs)
            || /\btype\s*=\s*["']submit["']/.test(attrs)
            || /\bhref\s*=/.test(attrs)
            || /\basChild\b/.test(attrs)
            || isInsideLink(content, match.index);

        const isPureLayout = /\bdisabled\s*=\s*{\s*true\s*}/.test(attrs)
            || /\baria-hidden\s*=\s*["']true["']/.test(attrs);

        if (!hasAction && !isPureLayout) {
            warn(`${relative(file)}:${line} has a Button/button without direct action, submit type, or link wrapper`);
        }
    }
}

function auditPlaceholderCtas(file, content) {
    const placeholderPatterns = [
        { pattern: /onClick=\{[^}]*alert\(['"`][^'"`]*(redirecting|coming soon|compiling|demo|placeholder|not available)/i, label: 'placeholder alert CTA' },
        { pattern: /\balert\(['"`](Generation Failed|Generation Exception|Failed to add|Failed to delete)['"`]\)/, label: 'raw alert error UX' },
        { pattern: /href=["']#["']/, label: 'hash-only href' },
        { pattern: /\b(console\.log|debugger)\b/, label: 'developer console statement' },
    ];

    for (const { pattern, label } of placeholderPatterns) {
        for (const match of content.matchAll(new RegExp(pattern.source, `${pattern.flags || ''}g`))) {
            const location = `${relative(file)}:${lineFor(content, match.index)}`;
            if (relative(file).startsWith('app/admin/')) warn(`${location} contains admin ${label}`);
            else fail(`${location} contains student-facing ${label}`);
        }
    }
}

function auditStudentFacingCopy(file, content) {
    const riskyCopy = [
        /\bTODO\b/i,
        /\bFIXME\b/i,
        /\blorem ipsum\b/i,
        /\bmock_sig\b/i,
        /\bpay_mock_/i,
        /\bdevStack\b/i,
        /\bdevError\b/i,
    ];

    for (const pattern of riskyCopy) {
        const match = content.match(pattern);
        if (match) {
            fail(`${relative(file)}:${lineFor(content, match.index || 0)} contains risky student-facing copy: ${match[0]}`);
        }
    }
}

for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    auditApiCalls(file, content);
    auditLinks(file, content);
    auditButtons(file, content);
    auditPlaceholderCtas(file, content);
}

for (const file of studentFacingFiles) {
    auditStudentFacingCopy(file, fs.readFileSync(file, 'utf8'));
}

console.log('\nFRONTEND WIRING AUDIT');
console.log('---------------------');
console.log(`  API routes discovered: ${apiRoutes.size}`);
console.log(`  Page routes discovered: ${pageRoutes.length}`);
console.log(`  Frontend files scanned: ${sourceFiles.length}`);
console.log(`\n  Passed:   ${passes.length}`);
console.log(`  Warnings: ${warnings.length}`);
console.log(`  Failed:   ${failures.length}`);

if (warnings.length > 0) {
    console.log('\nWarnings:');
    for (const message of warnings.slice(0, 80)) console.log(`  ⚠️  ${message}`);
    if (warnings.length > 80) console.log(`  ... ${warnings.length - 80} more warnings`);
}

if (failures.length > 0) {
    console.log('\nFailures:');
    for (const message of failures) console.log(`  ❌ ${message}`);
}

process.exit(failures.length > 0 ? 1 : 0);
