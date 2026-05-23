#!/usr/bin/env node

import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
require('dotenv').config({ path: path.join(process.cwd(), '.env.local'), override: true });

const FEATURE_FLAGS = {
    ai_generation: { key: 'ff_ai_generation', label: 'AI generation' },
    rag_explanations: { key: 'ff_rag_explanations', label: 'RAG explanations' },
    omr: { key: 'ff_omr_enabled', label: 'OMR' },
    battleground: { key: 'ff_battleground', label: 'Battleground' },
    payments: { key: 'ff_payments', label: 'Payments' },
    notifications: { key: 'ff_notifications', label: 'Push notifications' },
    referrals: { key: 'ff_referrals', label: 'Referral rewards' },
    leaderboard: { key: 'ff_leaderboard', label: 'Leaderboard' },
};

function printUsage() {
    console.log('\nFEATURE FLAG INTERACTIVE TOGGLE TOOL');
    console.log('------------------------------------');
    console.log('Usage:');
    console.log('  node scripts/toggle-feature.mjs --flag <feature_name> --enable|--disable\n');
    console.log('Available features:');
    for (const [name, config] of Object.entries(FEATURE_FLAGS)) {
        console.log(`  - ${name.padEnd(20)} (DB Key: ${config.key}, Label: ${config.label})`);
    }
    console.log('\nExample:');
    console.log('  node scripts/toggle-feature.mjs --flag ai_generation --disable\n');
}

function arg(name) {
    const idx = process.argv.indexOf(`--${name}`);
    return idx >= 0 ? process.argv[idx + 1] : null;
}

const flagArg = arg('flag');
const enableArg = process.argv.includes('--enable');
const disableArg = process.argv.includes('--disable');

if (!flagArg || (!enableArg && !disableArg)) {
    printUsage();
    process.exit(1);
}

const featureName = flagArg.toLowerCase().trim();
const config = FEATURE_FLAGS[featureName] || Object.values(FEATURE_FLAGS).find(f => f.key === featureName);

if (!config) {
    console.error(`Error: Unknown feature '${flagArg}'`);
    printUsage();
    process.exit(1);
}

const action = enableArg ? 'enable' : 'disable';
const enabledValue = enableArg;

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required inside .env or .env.local.');
    process.exit(1);
}

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    family: 4, // IPv4 fallback
});

async function main() {
    try {
        console.log(`\nConnecting to database to toggle feature '${config.label}'...`);

        // Check if table exists
        const { rows: tableCheck } = await db.query(
            "SELECT to_regclass('public.feature_flags') AS table_name"
        );
        if (!tableCheck[0]?.table_name) {
            console.error('Error: public.feature_flags table does not exist. Please run migration 003 first.');
            process.exit(1);
        }

        // Perform the update/upsert
        const { rowCount } = await db.query(
            `INSERT INTO feature_flags (key, enabled, description, updated_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (key) DO UPDATE
             SET enabled = EXCLUDED.enabled, updated_at = NOW()`,
            [config.key, enabledValue, `${config.label} control flag toggled via CLI`]
        );

        console.log(`\nSUCCESS: Feature '${config.label}' (${config.key}) is now ${action.toUpperCase()}D.`);
        
        // Output verification hint
        console.log('\nVerification Hint:');
        console.log(`  - Fetch /api/health/features to confirm state.`);
        console.log(`  - Run 'npm run audit:ops' to ensure all dependent endpoints are properly gated.`);
    } catch (error) {
        console.error('\nError performing toggle:', error.message);
        process.exit(1);
    } finally {
        await db.end();
    }
}

main();
