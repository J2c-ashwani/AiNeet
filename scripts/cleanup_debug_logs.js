const fs = require('fs');

// Debug logs to remove (non-operational noise)
const targets = [
    { file: 'app/sitemap.xml/route.js', pattern: 'console.log("Sitemap Generation' },
    { file: 'app/sitemap.xml/route.js', pattern: 'console.log("Questions found for sitemap' },
    { file: 'lib/vision_engine.js', pattern: 'console.log(`👁️ Processing Vision Request' },
];

let cleaned = 0;
targets.forEach(({ file, pattern }) => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const filtered = lines.filter(l => !l.includes(pattern));
    if (filtered.length < lines.length) {
        fs.writeFileSync(file, filtered.join('\n'));
        cleaned++;
        console.log(`[CLEANED] ${file}: removed "${pattern.substring(0, 50)}..."`);
    }
});

console.log(`\nRemoved ${cleaned} non-operational debug logs.`);
console.log('Retained: webhook logs, cron logs, email logs (operational telemetry).');
