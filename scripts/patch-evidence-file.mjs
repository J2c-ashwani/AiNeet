#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const reportDir = path.resolve(process.cwd(), 'reports/academic-certification');

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i += 1) {
        const key = argv[i];
        if (!key.startsWith('--')) continue;
        const next = argv[i + 1];
        args[key.slice(2)] = !next || next.startsWith('--') ? true : next;
        if (next && !next.startsWith('--')) i += 1;
    }
    return args;
}

function latestEvidenceFile() {
    if (!fs.existsSync(reportDir)) {
        throw new Error(`Evidence directory does not exist: ${reportDir}`);
    }

    const files = fs.readdirSync(reportDir)
        .filter((file) => file.startsWith('evidence-') && file.endsWith('.json'))
        .map((file) => ({
            file,
            mtime: fs.statSync(path.join(reportDir, file)).mtimeMs,
        }))
        .sort((a, b) => b.mtime - a.mtime);

    if (files.length === 0) {
        throw new Error('No evidence-*.json files found.');
    }

    return path.join(reportDir, files[0].file);
}

function hasEvidenceHash(value) {
    return typeof value === 'string' && /^sha256:[a-f0-9]{32,}$/i.test(value.trim());
}

function isPlaceholder(value) {
    return typeof value === 'string' && /(placeholder|dummy|fake|seeded|sample only|replace-with-real)/i.test(value);
}

function validateLevelPatch(levelKey, patch) {
    if (!patch || typeof patch !== 'object') {
        throw new Error(`Patch for ${levelKey} must be an object.`);
    }
    if (!Number.isFinite(Number(patch.sampleSize)) || Number(patch.sampleSize) <= 0) {
        throw new Error(`Patch for ${levelKey} requires sampleSize > 0.`);
    }
    if (!patch.metrics || typeof patch.metrics !== 'object') {
        throw new Error(`Patch for ${levelKey} requires metrics.`);
    }
    if (!Array.isArray(patch.evidence) || patch.evidence.length === 0) {
        throw new Error(`Patch for ${levelKey} requires at least one evidence reference.`);
    }

    for (const item of patch.evidence) {
        if (!hasEvidenceHash(item.hash)) {
            throw new Error(`Patch for ${levelKey} has evidence without sha256 hash.`);
        }
        if (isPlaceholder(item.source) || isPlaceholder(item.summary)) {
            throw new Error(`Patch for ${levelKey} contains placeholder/synthetic evidence text.`);
        }
    }

    for (const [metric, value] of Object.entries(patch.metrics)) {
        if (value === null || value === undefined || value === '') {
            throw new Error(`Patch for ${levelKey} has empty metric: ${metric}.`);
        }
        if (typeof value === 'number' && (value < 0 || value > 100000)) {
            throw new Error(`Patch for ${levelKey} has out-of-range metric: ${metric}.`);
        }
    }
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const evidencePath = path.resolve(process.cwd(), args.evidence || latestEvidenceFile());
    const bundlePath = args['audit-bundle'];

    if (!bundlePath) {
        throw new Error('Usage: node scripts/patch-evidence-file.mjs --audit-bundle <verified-audit-bundle.json> [--evidence reports/academic-certification/evidence-...json]');
    }

    const bundle = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), bundlePath), 'utf8'));
    if (!bundle.levels || typeof bundle.levels !== 'object') {
        throw new Error('Audit bundle requires a levels object.');
    }
    if (!hasEvidenceHash(bundle.bundleHash)) {
        throw new Error('Audit bundle requires bundleHash in sha256:<hash> format.');
    }

    const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
    evidence.levels ||= {};

    for (const [levelKey, patch] of Object.entries(bundle.levels)) {
        validateLevelPatch(levelKey, patch);
        evidence.levels[levelKey] = {
            ...(evidence.levels[levelKey] || {}),
            sampleSize: Number(patch.sampleSize),
            metrics: {
                ...(evidence.levels[levelKey]?.metrics || {}),
                ...patch.metrics,
            },
            evidence: [
                ...(evidence.levels[levelKey]?.evidence || []),
                ...patch.evidence,
            ],
        };
    }

    evidence.auditBundlePatches ||= [];
    evidence.auditBundlePatches.push({
        bundleHash: bundle.bundleHash,
        evidenceOwner: bundle.evidenceOwner || null,
        patchedAt: new Date().toISOString(),
        patchedLevels: Object.keys(bundle.levels),
    });

    fs.writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));
    console.log('\nACADEMIC EVIDENCE FILE PATCHED');
    console.log('------------------------------');
    console.log(`Evidence: ${evidencePath}`);
    console.log(`Audit bundle: ${path.resolve(process.cwd(), bundlePath)}`);
    console.log(`Patched levels: ${Object.keys(bundle.levels).join(', ')}`);
    console.log('No hardcoded or synthetic metrics were generated.');
}

try {
    main();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
