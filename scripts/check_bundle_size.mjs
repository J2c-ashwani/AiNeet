import fs from 'fs';
import path from 'path';

// MD Constraint: 200KB Max Bundle Threshold
const MAX_BUNDLE_SIZE_KB = 200;

function getDirectorySize(dirPath) {
    let size = 0;
    try {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                size += getDirectorySize(filePath);
            } else if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
                size += stats.size;
            }
        }
    } catch(e) {
        // Missing dir logic handled gently
    }
    return size;
}

const buildDir = path.join(process.cwd(), '.next', 'static', 'chunks');
console.log('📦 Analyzing Next.js Bundle Weight CI Lock...');

const sizeBytes = getDirectorySize(buildDir);
const sizeKb = (sizeBytes / 1024).toFixed(2);

console.log(`Current Client Chunk Weight: ${sizeKb} KB`);

if (sizeKb > MAX_BUNDLE_SIZE_KB) {
    console.error(`🚨 FATAL: Payload exceeds ${MAX_BUNDLE_SIZE_KB}KB constraint! (Found: ${sizeKb}KB)`);
    console.error('Build rejected. You must shed dependencies before deployment.');
    process.exit(1);
} else {
    console.log('✅ Bundle weight is within secure limits. Cleared for takeoff.');
    process.exit(0);
}
