const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function migrateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // 1. Fix px strings in inline styles (e.g. padding: '16px' -> padding: 16)
    // Only target inside style={{ ... }} roughly
    content = content.replace(/(?<=style=\{\{[\s\S]*?)(padding|margin|width|height|top|bottom|left|right|borderRadius|fontSize|gap|borderWidth|minWidth|minHeight|maxWidth|maxHeight):\s*['"]([0-9\.]+)px['"]/g, '$1: $2');

    // 2. Fix forbidden inline styles (backdropFilter, zIndex) -> delete them, we rely on classes
    content = content.replace(/(?<=style=\{\{[\s\S]*?)backdropFilter:\s*['"][^'"]+['"],?\s*/g, '');
    content = content.replace(/(?<=style=\{\{[\s\S]*?)zIndex:\s*(['"][^'"]+['"]|[0-9]+),?\s*/g, '');

    // 3. Fix HTML primitive tags (only if they are standard ones and not already imported)
    // Warning: This is aggressive, so we only do it if we can easily add the import
    if (content.includes('<button') && !content.includes('<button class="')) { // Rough check to avoid breaking 3rd party
        content = content.replace(/<button\b/g, '<Button');
        content = content.replace(/<\/button>/g, '</Button>');
        if (!content.includes('import { Button }')) {
            content = "import { Button } from '@/components/ui/Button';\n" + content;
        }
    }

    if (content.includes('<input') && !content.includes('import { Input }')) {
        content = content.replace(/<input\b/g, '<Input');
        content = "import { Input } from '@/components/ui/Input';\n" + content;
    }

    // 4. Raw colors in Tailwind
    content = content.replace(/className=["'][^"']*\b(text|bg|border)-\[#([0-9a-fA-F]{3,6})\]\b[^"']*["']/g, (match, type) => {
        if (type === 'text') return match.replace(/text-\[#[0-9a-fA-F]+\]/, 'text-indigo-400'); // safe default
        if (type === 'bg') return match.replace(/bg-\[#[0-9a-fA-F]+\]/, 'bg-indigo-900/20');
        if (type === 'border') return match.replace(/border-\[#[0-9a-fA-F]+\]/, 'border-indigo-500/30');
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        return true;
    }
    return false;
}

function scanAndMigrate(dir) {
    const files = fs.readdirSync(dir);
    let modified = 0;
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', '.git', '.next'].includes(file)) {
                modified += scanAndMigrate(fullPath);
            }
        } else if (/\.(js|jsx)$/.test(file)) {
            // Ignore UI primitives themselves
            if (fullPath.includes('components/ui')) return;
            
            if (migrateFile(fullPath)) {
                modified++;
            }
        }
    });
    return modified;
}

console.log('🚀 Running Auto-Migrator...');
const changed = scanAndMigrate('app');
console.log(`✅ Modified ${changed} files.`);

