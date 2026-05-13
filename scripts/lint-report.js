const { ESLint } = require('eslint');
const fs = require('fs');
const path = require('path');

async function generateReport() {
    console.log('🔍 Generating UI Governance Report...');
    
    // 1. Run ESLint programmatic API to get results
    const eslint = new ESLint();
    const results = await eslint.lintFiles(['app/**/*.js', 'components/**/*.js', 'lib/**/*.js', 'context/**/*.js']);
    
    let totalWarnings = 0;
    let inlineStylesRemaining = 0;
    
    // Analyze violations
    results.forEach(result => {
        totalWarnings += result.warningCount;
        result.messages.forEach(msg => {
            if (msg.ruleId === 'no-restricted-syntax') {
                if (msg.message.includes('Inline colors') || msg.message.includes('Hardcoded pixel')) {
                    inlineStylesRemaining++;
                }
            }
        });
    });

    // 2. Token Adoption % (Heuristic based on clean files vs total files)
    const filesWithWarnings = results.filter(r => r.warningCount > 0).length;
    const totalFiles = results.length;
    const tokenAdoptionPct = totalFiles > 0 ? Math.round(((totalFiles - filesWithWarnings) / totalFiles) * 100) : 100;

    // 3. Output payload
    const report = {
        timestamp: new Date().toISOString(),
        total_warnings: totalWarnings,
        inline_styles_remaining: inlineStylesRemaining,
        token_adoption_pct: tokenAdoptionPct,
        snapshot_failures: 0 // Will be enriched by Playwright if needed in CI
    };

    const reportPath = path.join(process.cwd(), 'ui-governance-report.json');
    const publicReportPath = path.join(process.cwd(), 'public', 'ui-governance-report.json');
    const reportJson = JSON.stringify(report, null, 2);
    fs.writeFileSync(reportPath, reportJson, 'utf-8');
    fs.writeFileSync(publicReportPath, reportJson, 'utf-8');
    
    console.log(`✅ UI Governance Report generated at ${reportPath}`);
    console.log(`   - Total Warnings: ${totalWarnings}`);
    console.log(`   - Token Adoption: ${tokenAdoptionPct}%`);
}

generateReport().catch(err => {
    console.error('Failed to generate report:', err);
    process.exit(1);
});
