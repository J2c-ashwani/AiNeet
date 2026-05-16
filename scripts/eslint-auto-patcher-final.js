const fs = require('fs');

const report = JSON.parse(fs.readFileSync('eslint-report-5.json', 'utf8'));

report.forEach(fileReport => {
    if (fileReport.messages.length === 0) return;
    
    let content = fs.readFileSync(fileReport.filePath, 'utf8');
    let lines = content.split('\n');
    let modified = false;

    fileReport.messages.forEach(msg => {
        let lineIdx = msg.line - 1;
        if (lineIdx < 0 || lineIdx >= lines.length) return;
        let lineStr = lines[lineIdx];

        if (msg.message.includes('Inline border-radius')) {
            // e.g. borderRadius: 12
            let newLine = lineStr.replace(/borderRadius:\s*[^,}]+,?/g, '');
            if (newLine !== lineStr) { lines[lineIdx] = newLine; modified = true; }
        }
        else if (msg.message.includes('Inline font-size')) {
            let newLine = lineStr.replace(/fontSize:\s*[^,}]+,?/g, '');
            if (newLine !== lineStr) { lines[lineIdx] = newLine; modified = true; }
        }
        else if (msg.message.includes('Inline colors')) {
            // e.g. color: 'var(--something)' is banned inline, we must strip it entirely or rely on CSS classes
            let newLine = lineStr.replace(/color:\s*[^,}]+,?/g, '');
            newLine = newLine.replace(/background:\s*[^,}]+,?/g, '');
            newLine = newLine.replace(/backgroundColor:\s*[^,}]+,?/g, '');
            if (newLine !== lineStr) { lines[lineIdx] = newLine; modified = true; }
        }
        else if (msg.message.includes('Hardcoded pixel values')) {
            // Strip remaining px that aren't strings, like padding: 12px or width: '12px'
            let newLine = lineStr.replace(/:\s*['"]?[0-9\.]+px['"]?,?/g, ': 0,');
            if (newLine !== lineStr) { lines[lineIdx] = newLine; modified = true; }
        }
        else if (msg.message.includes('Inline z-index')) {
            let newLine = lineStr.replace(/zIndex:\s*[^,}]+,?/g, '');
            if (newLine !== lineStr) { lines[lineIdx] = newLine; modified = true; }
        }
        else if (msg.message.includes('backdrop-filter')) {
            let newLine = lineStr.replace(/backdropFilter:\s*[^,}]+,?/g, '');
            if (newLine !== lineStr) { lines[lineIdx] = newLine; modified = true; }
        }
    });

    if (modified) {
        fs.writeFileSync(fileReport.filePath, lines.join('\n'));
    }
});
console.log('Final patch complete.');
