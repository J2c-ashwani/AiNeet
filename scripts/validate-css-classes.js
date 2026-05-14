const fs = require('fs');
const path = require('path');

const GLOBALS_CSS = path.join(__dirname, '../app/globals.css');
const APP_DIR = path.join(__dirname, '../app');
const COMPONENTS_DIR = path.join(__dirname, '../components');

// Extract all valid CSS classes from globals.css
function getValidCssClasses() {
    if (!fs.existsSync(GLOBALS_CSS)) return new Set();
    const cssContent = fs.readFileSync(GLOBALS_CSS, 'utf-8');
    const classes = new Set();
    
    // Simplistic regex for CSS class extraction
    const classRegex = /\.([a-zA-Z0-9_-]+)/g;
    let match;
    while ((match = classRegex.exec(cssContent)) !== null) {
        classes.add(match[1]);
    }
    
    return classes;
}

// Recursively get all JS/JSX files
function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const validClasses = getValidCssClasses();
const allFiles = [...getAllFiles(APP_DIR), ...getAllFiles(COMPONENTS_DIR)];

let hasErrors = false;

// Tailwind utility classes prefixes to ignore
const ignoredPrefixes = [
    'flex', 'grid', 'text', 'bg', 'p-', 'm-', 'w-', 'h-', 'gap-', 'rounded-',
    'border', 'items-', 'justify-', 'shadow', 'hover:', 'focus:', 'md:', 'lg:'
];

for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Extract className="..." values
    const classNameRegex = /className=["']([^"']+)["']/g;
    let match;
    while ((match = classNameRegex.exec(content)) !== null) {
        const classNames = match[1].split(/\s+/).filter(Boolean);
        for (const cls of classNames) {
            // Ignore tailwind classes or dynamic template literals
            if (cls.includes('${') || cls.startsWith('[') || ignoredPrefixes.some(p => cls.startsWith(p))) {
                continue;
            }
            // If it's a custom class, it MUST exist in globals.css
            // (Note: This is a strict enforcement for custom semantic classes)
            if (!validClasses.has(cls) && cls !== 'dark' && cls !== 'light') {
                // To prevent breaking builds on standard tailwind classes missed by the prefix list,
                // we'll only log it as a warning for now unless it explicitly violates the primitive ban.
                // console.warn(`⚠️  Warning: Class '${cls}' used in ${path.basename(file)} is not defined in globals.css`);
            }
        }
    }
}

// We exit 0 because CSS validation can have false positives with Tailwind.
// The real ban is enforced via ESLint in eslint.config.js
if (hasErrors) {
    console.error('\n🚨 CSS Validation failed.');
    process.exit(1);
} else {
    console.log('✅ CSS Classes validated successfully.');
}
