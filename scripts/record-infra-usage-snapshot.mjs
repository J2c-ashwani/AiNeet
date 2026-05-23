#!/usr/bin/env node

import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
require('dotenv').config({ path: path.join(process.cwd(), '.env.local'), override: true });

function arg(name, fallback = '') {
    const idx = process.argv.indexOf(`--${name}`);
    return idx >= 0 ? process.argv[idx + 1] : fallback;
}

const provider = arg('provider');
const metric = arg('metric', 'daily_cost_inr');
const value = Number(arg('value'));
const unit = arg('unit', 'INR');

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required.');
    process.exit(1);
}

if (!provider || !['gemini', 'supabase', 'vercel', 'redis', 'cashfree'].includes(provider)) {
    console.error('Usage: node scripts/record-infra-usage-snapshot.mjs --provider gemini|supabase|vercel|redis|cashfree --value 123.45 [--metric daily_cost_inr] [--unit INR]');
    process.exit(1);
}

if (!Number.isFinite(value) || value < 0) {
    console.error('--value must be a non-negative number.');
    process.exit(1);
}

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    family: 4,
});

try {
    await db.query(`
        INSERT INTO infra_usage_snapshots (provider, metric_name, metric_value, unit, metadata)
        VALUES ($1, $2, $3, $4, $5::jsonb)
    `, [provider, metric, value, unit, JSON.stringify({ source: 'manual-dashboard-entry' })]);

    console.log(`Recorded ${provider} ${metric}=${value} ${unit}`);
} finally {
    await db.end();
}
