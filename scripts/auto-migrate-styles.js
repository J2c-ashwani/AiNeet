const fs = require('fs');
const path = require('path');

const emojiMap = {
    '👋': 'Smile', // Close enough, we don't have Hand
    '🔍': 'Search',
    '📋': 'FileText',
    '📈': 'TrendingUp',
    '🚀': 'Zap',
    '⚡': 'Zap',
    '📝': 'FileText',
    '🎯': 'Target',
    '📚': 'BookOpen',
    '⚠️': 'AlertCircle',
    '✅': 'CheckCircle',
    '❌': 'XCircle',
    '🔒': 'Lock',
    '🚨': 'AlertCircle',
    '💬': 'MessageCircle',
    '🏆': 'Trophy',
    '👑': 'Crown',
    '⭐': 'Star',
    '🔥': 'Flame',
    '🧠': 'Brain',
    '⏱️': 'Clock',
    '⏳': 'Clock',
    '📜': 'FileText',
    '🤖': 'Cpu',
    '👁️': 'Eye',
    '📊': 'BarChart2',
    '📈': 'TrendingUp',
    '📉': 'Activity',
    '⚙️': 'Settings',
    '🔄': 'RefreshCw',
    '📥': 'Download',
    '📤': 'Upload',
    '🎓': 'GraduationCap',
    '🔬': 'Microscope',
    '🧬': 'Dna',
    '⚛️': 'Atom',
    '📅': 'CalendarDays'
};

function migrateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // 1. Remove banned properties from style={{ ... }}
    const bannedProps = ['fontSize', 'color', 'background', 'backgroundColor', 'borderRadius', 'zIndex', 'backdropFilter', 'borderColor'];
    
    bannedProps.forEach(prop => {
        // Match `prop: 'value',` or `prop: value,` or `prop: 'value'`
        const regex = new RegExp(`(?<=style=\\{\\{[\\s\\S]*?)${prop}:\\s*('[^']*'|"[^"]*"|\\d+|var\\([^)]+\\)),?\\s*`, 'g');
        content = content.replace(regex, '');
    });

    // 2. Remove pixel values that might still be left as numbers, e.g. width: 40 -> width: '40px' wait, the rule says:
    // `Literal[value=/^[0-9]+px$/]` so strings ending in px. We already removed them, but let's be sure
    content = content.replace(/(?<=style=\{\{[\s\S]*?)(padding|margin|width|height|top|bottom|left|right|gap|borderWidth|minWidth|minHeight|maxWidth|maxHeight):\s*['"]([0-9\.]+)px['"]/g, '$1: $2');

    // 3. Replace Emojis with Icons
    let addedIconImport = false;
    Object.keys(emojiMap).forEach(emoji => {
        if (content.includes(emoji)) {
            const iconName = emojiMap[emoji];
            // Regex to find the emoji inside JSX (very basic approach: just replace all of them if they are in the file)
            // It's safer to just replace them blindly as text if they are outside quotes, but React handles them.
            // Let's replace >emoji< with ><Icon name="iconName" /><
            // And 'emoji' with <Icon name="iconName" />
            content = content.replace(new RegExp(emoji, 'g'), `<Icon name="${iconName}" />`);
            addedIconImport = true;
        }
    });

    if (addedIconImport && !content.includes('import { Icon }')) {
        content = "import { Icon } from '@/components/ui/Icon';\n" + content;
    }

    // 4. Raw select / textarea / input
    const primitives = ['select', 'textarea'];
    primitives.forEach(prim => {
        const capitalized = prim.charAt(0).toUpperCase() + prim.slice(1);
        if (content.includes(`<${prim}`) && !content.includes(`import { ${capitalized} }`)) {
            content = content.replace(new RegExp(`<${prim}\\b`, 'g'), `<${capitalized}`);
            content = content.replace(new RegExp(`</${prim}>`, 'g'), `</${capitalized}>`);
            content = `import { ${capitalized} } from '@/components/ui/${capitalized}';\n` + content;
        }
    });

    // Cleanup empty style={{}} which might have been created
    content = content.replace(/style=\{\{\s*\}\}/g, '');

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
            if (fullPath.includes('components/ui')) return;
            if (migrateFile(fullPath)) {
                modified++;
            }
        }
    });
    return modified;
}

console.log('🚀 Running Auto-Migrator Phase 2...');
const changed = scanAndMigrate('app');
console.log(`✅ Modified ${changed} files.`);

