#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
    const parsed = {};
    for (let i = 0; i < argv.length; i += 1) {
        const token = argv[i];
        if (!token.startsWith('--')) continue;
        const key = token.slice(2);
        const next = argv[i + 1];
        if (!next || next.startsWith('--')) {
            parsed[key] = true;
        } else {
            parsed[key] = next;
            i += 1;
        }
    }
    return parsed;
}

function title(value) {
    if (!value) return '';
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function metricSummary(metrics = {}) {
    return Object.entries(metrics)
        .filter(([, value]) => value !== null && value !== undefined)
        .slice(0, 6)
        .map(([key, value]) => `${key}: ${typeof value === 'number' ? Number(value.toFixed(2)) : value}`)
        .join('; ');
}

function publicVerdict(summary) {
    const failed = (summary.results || []).filter((item) => item.status !== 'pass');
    if (failed.length > 0 || summary.level === 'none') {
        return 'Not publicly certified. Evidence gaps remain before institutional certification language may be used.';
    }
    return summary.verdict;
}

function renderMarkdown(summary) {
    const lines = [];
    const cycle = summary.cycle || {};
    const results = summary.results || [];
    const failed = results.filter((item) => item.status !== 'pass');

    lines.push('# NEET Coach Academic Certification Public Report');
    lines.push('');
    lines.push(`Certification Cycle: ${cycle.cycleCode || 'not provided'}`);
    lines.push(`Certification Date: ${cycle.completedAt || 'not provided'}`);
    lines.push(`Certification Version: ${cycle.certificationVersion || 'not provided'}`);
    lines.push(`Academic Corpus Version: ${cycle.academicCorpusVersion || 'not provided'}`);
    lines.push(`Official Syllabus Version: ${cycle.officialSyllabusVersion || 'not provided'}`);
    lines.push('');
    lines.push('## Public Verdict');
    lines.push('');
    lines.push(publicVerdict(summary));
    lines.push('');
    lines.push(`Final Score: ${summary.score ?? 0}/100`);
    lines.push(`Certification Level: ${title(summary.level || 'none')}`);
    lines.push('');
    lines.push('## Certification Scope');
    lines.push('');
    lines.push('This report summarizes academic evidence across syllabus compliance, question quality, answer quality, AI tutor responses, mock tests, RAG retrieval, faculty review, student outcomes, academic governance, and NEET benchmark similarity. It does not claim that AI is accurate by default. Certification is based only on the evidence recorded for this cycle.');
    lines.push('');
    lines.push('## Scorecard');
    lines.push('');
    lines.push('| Level | Area | Status | Score | Sample Size |');
    lines.push('|---:|---|---|---:|---:|');
    for (const result of results) {
        lines.push(`| ${result.levelNumber} | ${result.levelName} | ${String(result.status).toUpperCase()} | ${result.score} | ${result.sampleSize} |`);
    }
    lines.push('');
    lines.push('## Evidence Summary');
    lines.push('');
    for (const result of results) {
        lines.push(`### ${result.levelName}`);
        lines.push('');
        lines.push(`Status: ${String(result.status).toUpperCase()}`);
        lines.push(`Metrics: ${metricSummary(result.metrics) || 'not enough public metrics recorded'}`);
        lines.push('');
    }
    lines.push('## Limitations');
    lines.push('');
    if (failed.length === 0) {
        lines.push('No public blocking limitations were recorded for this cycle.');
    } else {
        for (const result of failed) {
            lines.push(`- ${result.levelName}: certification evidence incomplete or pass criteria not met.`);
        }
    }
    lines.push('');
    lines.push('## Methodology');
    lines.push('');
    lines.push('The internal certification runner stores raw evidence separately. This public report only exposes the high-level scorecard, metrics, methodology, and limitations suitable for NGOs, schools, coaching institutes, CSR partners, parents, students, and investors.');
    lines.push('');
    return lines.join('\n');
}

function renderHtml(markdown, summary) {
    const body = markdown
        .split('\n')
        .map((line) => {
            if (line.startsWith('# ')) return `<h1>${escapeHtml(line.slice(2))}</h1>`;
            if (line.startsWith('## ')) return `<h2>${escapeHtml(line.slice(3))}</h2>`;
            if (line.startsWith('### ')) return `<h3>${escapeHtml(line.slice(4))}</h3>`;
            if (line.startsWith('- ')) return `<li>${escapeHtml(line.slice(2))}</li>`;
            if (line.trim() === '') return '';
            if (line.includes('|')) return `<pre>${escapeHtml(line)}</pre>`;
            return `<p>${escapeHtml(line)}</p>`;
        })
        .join('\n');

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>NEET Coach Academic Certification Public Report</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; color: #172033; margin: 0; background: #f6f8fb; }
    main { max-width: 920px; margin: 0 auto; padding: 48px 24px; background: #fff; min-height: 100vh; }
    h1 { font-size: 32px; line-height: 1.2; margin: 0 0 24px; }
    h2 { font-size: 21px; margin: 32px 0 12px; border-top: 1px solid #e5e9f0; padding-top: 24px; }
    h3 { font-size: 17px; margin: 22px 0 8px; }
    p, li, pre { font-size: 14px; line-height: 1.65; }
    pre { white-space: pre-wrap; background: #f2f5f9; padding: 8px 10px; border-radius: 6px; }
    .badge { display: inline-block; padding: 6px 10px; border-radius: 999px; background: #eef6ff; color: #075985; font-weight: 700; font-size: 13px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <main>
    <div class="badge">Score ${escapeHtml(summary.score ?? 0)}/100 · ${escapeHtml(title(summary.level || 'none'))}</div>
    ${body}
  </main>
</body>
</html>`;
}

async function writePdf(htmlPath, pdfPath) {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    try {
        const page = await browser.newPage();
        await page.goto(`file://${htmlPath}`, { waitUntil: 'load' });
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' },
        });
    } finally {
        await browser.close();
    }
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const summaryPath = args.summary;
    if (!summaryPath) {
        throw new Error('Usage: node scripts/generate-public-academic-certification-report.mjs --summary <certification-summary.json> [--pdf]');
    }

    const summary = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), summaryPath), 'utf8'));
    const cycleCode = summary.cycle?.cycleCode || `academic-${Date.now()}`;
    const outDir = path.resolve(process.cwd(), args.out || 'public/academic-certification');
    fs.mkdirSync(outDir, { recursive: true });

    const markdown = renderMarkdown(summary);
    const html = renderHtml(markdown, summary);
    const mdPath = path.join(outDir, `${cycleCode}.md`);
    const htmlPath = path.join(outDir, `${cycleCode}.html`);
    const pdfPath = path.join(outDir, `${cycleCode}.pdf`);

    fs.writeFileSync(mdPath, markdown);
    fs.writeFileSync(htmlPath, html);

    if (args.pdf) {
        await writePdf(htmlPath, pdfPath);
    }

    const publicBase = process.env.ACADEMIC_CERT_PUBLIC_BASE_URL || '';
    const publicUrl = publicBase ? `${publicBase.replace(/\/$/, '')}/${cycleCode}.html` : null;

    console.log('\nPUBLIC ACADEMIC CERTIFICATION REPORT');
    console.log('------------------------------------');
    console.log(`Markdown: ${mdPath}`);
    console.log(`HTML:     ${htmlPath}`);
    if (args.pdf) console.log(`PDF:      ${pdfPath}`);
    if (publicUrl) console.log(`URL:      ${publicUrl}`);
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
