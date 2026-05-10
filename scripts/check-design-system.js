const fs = require('fs');
const path = require('path');

// Directories to scan
const SCAN_DIRS = ['app', 'components'];
// Directories to ignore (canonical implementations)
const IGNORE_DIRS = ['components/ui', 'components/Charts.js'];

// Directories that MUST pass the check (P0 and P1 trust surfaces)
const STRICT_DIRS = [
    'app/page.js', // Home
    'app/login', 'app/register', 'app/forgot-password', // Auth
    'app/test', // Test Engine
    'app/pricing', // Monetization
    'app/profile', 'app/analytics', // Dashboard
    'app/omr', 'app/revision', 'app/ncert' // P1 Core Tools
];

// Patterns that break the build
const BLOCKED_PATTERNS = [
    {
        regex: /className=["'][^"']*\bbg-(gray|blue|red|green|yellow|indigo|purple|white|black|transparent)(-[0-9]+)?(\/[0-9]+)?\b[^"']*["']/g,
        message: 'Forbidden Tailwind background class. Use canonical Card or CSS tokens.'
    },
    {
        regex: /className=["'][^"']*\b(text|border)-(gray|blue|red|green|yellow|indigo|purple|white|black)(-[0-9]+)?(\/[0-9]+)?\b[^"']*["']/g,
        message: 'Forbidden Tailwind color class. Use global CSS color tokens (var(--text-muted), etc).'
    },
    {
        regex: /className=["'][^"']*\b(rounded-(sm|md|lg|xl|2xl|3xl|full|none))\b[^"']*["']/g,
        message: 'Forbidden Tailwind radius class. Use canonical primitives.'
    },
    {
        regex: /className=["'][^"']*\b([pm][xytrbl]?-[0-9]+)\b[^"']*["']/g,
        message: 'Forbidden Tailwind spacing class. Use global spacing tokens or canonical primitives.'
    },
    {
        regex: /<button\s+[^>]*className=["'][^"']*["']/g,
        message: 'Raw HTML button with custom classes detected. Import and use <Button> from @/components/ui instead.'
    },
    {
        regex: /<input\s+[^>]*className=["'][^"']*["']/g,
        message: 'Raw HTML input with custom classes detected. Import and use <Input> from @/components/ui instead.'
    },
    {
        regex: /style=\{\{\s*[^}]*(color|background|borderColor)\s*:\s*['"]#[0-9a-fA-F]{3,6}['"]/g,
        message: 'Hardcoded inline hex color detected. Use semantic CSS tokens.'
    }
];

let hasStrictErrors = false;
let warningCount = 0;

function isStrict(filePath) {
    return STRICT_DIRS.some(strictPath => filePath.includes(strictPath));
}

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (IGNORE_DIRS.some(ignored => fullPath.includes(ignored))) return;

        if (stat.isDirectory()) {
            scanDirectory(fullPath);
        } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
            checkFile(fullPath);
        }
    });
}

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const isStrictFile = isStrict(filePath);

    lines.forEach((line, index) => {
        BLOCKED_PATTERNS.forEach(pattern => {
            if (pattern.regex.test(line)) {
                if (isStrictFile) {
                    console.error(`\n❌ ERROR in ${filePath}:${index + 1}`);
                    console.error(`   Rule: ${pattern.message}`);
                    console.error(`   Code: ${line.trim()}`);
                    hasStrictErrors = true;
                } else {
                    warningCount++;
                }
            }
        });
    });
}

console.log('🔍 Running Design System Consistency Check...');

SCAN_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) scanDirectory(dir);
});

if (warningCount > 0) {
    console.warn(`\n⚠️  WARNING: Found ${warningCount} legacy design violations in non-critical (P2) directories. These will not break the build.`);
}

if (hasStrictErrors) {
    console.error('\n🛑 BUILD FAILED: Design system violations detected in P0/P1 trust surfaces.');
    process.exit(1);
} else {
    console.log('\n✅ P0/P1 SURFACES PASSED: Architecture is strictly enforced.');
    process.exit(0);
}
