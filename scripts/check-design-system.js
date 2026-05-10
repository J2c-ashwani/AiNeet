const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to scan
const SCAN_DIRS = ['app', 'components'];
// Directories to ignore (canonical implementations)
const IGNORE_DIRS = ['components/ui', 'components/Charts.js'];

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

let hasErrors = false;

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        // Skip ignored directories
        if (IGNORE_DIRS.some(ignored => fullPath.includes(ignored))) {
            return;
        }

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

    lines.forEach((line, index) => {
        BLOCKED_PATTERNS.forEach(pattern => {
            const matches = line.match(pattern.regex);
            if (matches) {
                console.error(`\n❌ DESIGN SYSTEM VIOLATION in ${filePath}:${index + 1}`);
                console.error(`   Rule: ${pattern.message}`);
                console.error(`   Code: ${line.trim()}`);
                hasErrors = true;
            }
        });
    });
}

console.log('🔍 Running Design System Consistency Check...');

SCAN_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
        scanDirectory(dir);
    }
});

if (hasErrors) {
    console.error('\n🛑 BUILD FAILED: Design system violations detected.');
    console.error('Please refactor the above files to use Canonical UI primitives (/components/ui/) or global CSS tokens.');
    process.exit(1);
} else {
    console.log('\n✅ DESIGN SYSTEM CHECK PASSED: Architecture is strictly enforced.');
    process.exit(0);
}
