#!/usr/bin/env node

import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
require('dotenv').config({ path: path.join(process.cwd(), '.env.local'), override: true });

const baseUrl = (process.env.UPTIME_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://ai-neet.vercel.app').replace(/\/$/, '');
const timeoutMs = Number(process.env.UPTIME_CHECK_TIMEOUT_MS || 8000);

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required to store uptime checks.');
    process.exit(1);
}

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    family: 4,
});

async function probe(service, pathName, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const started = Date.now();
    let status = 'down';
    let statusCode = 0;
    let metadata = {};

    try {
        const response = await fetch(`${baseUrl}${pathName}`, {
            method: options.method || 'GET',
            headers: options.headers || {},
            body: options.body,
            signal: controller.signal,
        });
        statusCode = response.status;
        const latencyMs = Date.now() - started;
        status = response.ok ? 'up' : 'degraded';
        metadata = { path: pathName, ok: response.ok };

        if (options.evaluateJson) {
            const json = await response.clone().json().catch(() => null);
            const evaluated = options.evaluateJson(json);
            status = evaluated.ok ? 'up' : 'degraded';
            metadata = { ...metadata, ...evaluated.metadata };
        }

        await record(service, status, latencyMs, statusCode, metadata);
        return { service, status, latencyMs, statusCode };
    } catch (error) {
        const latencyMs = Date.now() - started;
        await record(service, 'down', latencyMs, statusCode, {
            path: pathName,
            error: error.message,
        });
        return { service, status: 'down', latencyMs, statusCode, error: error.message };
    } finally {
        clearTimeout(timer);
    }
}

async function record(service, status, latencyMs, statusCode, metadata) {
    await db.query(`
        INSERT INTO uptime_checks (service, status, latency_ms, status_code, metadata)
        VALUES ($1, $2, $3, $4, $5::jsonb)
    `, [service, status, latencyMs, statusCode, JSON.stringify(metadata || {})]);
}

async function main() {
    const featureEvaluator = (featureName) => (json) => {
        const enabled = Boolean(json?.[featureName] ?? json?.[featureName.replace('_generation', '')]);
        return {
            ok: enabled,
            metadata: { featureName, enabled },
        };
    };

    const checks = [
        probe('homepage', '/'),
        probe('login', '/login'),
        probe('api_health', '/api/health'),
        probe('ai', '/api/health/features', { evaluateJson: featureEvaluator('ai_generation') }),
        probe('payments', '/api/health/features', { evaluateJson: featureEvaluator('payments') }),
    ];

    const results = await Promise.all(checks);
    console.log('\nUPTIME CHECK COLLECTION');
    console.log('-----------------------');
    for (const result of results) {
        const icon = result.status === 'up' ? '✅' : result.status === 'degraded' ? '⚠️' : '❌';
        console.log(`  ${icon} ${result.service}: ${result.status} ${result.latencyMs}ms status=${result.statusCode}`);
    }
}

main()
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.end().catch(() => {});
    });
