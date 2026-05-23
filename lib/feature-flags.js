import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';

export const FEATURE_FLAGS = {
    ai_generation: {
        key: 'ff_ai_generation',
        aliases: ['ff_ai_explanations'],
        envDisable: 'DISABLE_AI',
        label: 'AI generation',
    },
    rag_explanations: {
        key: 'ff_rag_explanations',
        aliases: ['ff_ai_explanations'],
        envDisable: 'DISABLE_RAG',
        label: 'RAG explanations',
    },
    omr: {
        key: 'ff_omr_enabled',
        envDisable: 'DISABLE_OMR',
        label: 'OMR',
    },
    battleground: {
        key: 'ff_battleground',
        envDisable: 'DISABLE_BATTLEGROUND',
        label: 'Battleground',
    },
    payments: {
        key: 'ff_payments',
        envDisable: 'DISABLE_PAYMENTS',
        label: 'Payments',
    },
    notifications: {
        key: 'ff_notifications',
        envDisable: 'DISABLE_NOTIFICATIONS',
        label: 'Push notifications',
    },
    referrals: {
        key: 'ff_referrals',
        envDisable: 'DISABLE_REFERRALS',
        label: 'Referral rewards',
    },
    leaderboard: {
        key: 'ff_leaderboard',
        envDisable: 'DISABLE_LEADERBOARD',
        label: 'Leaderboard',
    },
};

const CACHE_TTL_MS = 30_000;
const cache = new Map();

function getConfig(name) {
    const config = FEATURE_FLAGS[name];
    if (!config) throw new Error(`Unknown feature flag: ${name}`);
    return config;
}

function envDisabled(config) {
    return process.env[config.envDisable] === 'true';
}

export function getStaticFeatureSnapshot() {
    return Object.fromEntries(
        Object.entries(FEATURE_FLAGS).map(([name, config]) => [
            name,
            {
                key: config.key,
                enabled: !envDisabled(config),
                envDisable: config.envDisable,
                label: config.label,
            },
        ])
    );
}

export async function isFeatureEnabled(name, options = {}) {
    const config = getConfig(name);
    if (envDisabled(config)) return false;

    const defaultEnabled = options.defaultEnabled !== false;
    const keys = [config.key, ...(config.aliases || [])];
    const cacheKey = keys.join('|');
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.enabled;

    try {
        const supabase = await getDb();
        const { data, error } = await supabase
            .from('feature_flags')
            .select('key, enabled, rollout_pct')
            .in('key', keys);

        if (error) throw error;
        if (!data || data.length === 0) {
            cache.set(cacheKey, { enabled: defaultEnabled, expiresAt: Date.now() + CACHE_TTL_MS });
            return defaultEnabled;
        }

        const enabled = data.some(flag => flag.enabled !== false && Number(flag.rollout_pct ?? 100) > 0);
        cache.set(cacheKey, { enabled, expiresAt: Date.now() + CACHE_TTL_MS });
        return enabled;
    } catch (error) {
        console.warn(`[FEATURE_FLAG_READ_FAILED] ${name}: ${error.message}`);
        return defaultEnabled;
    }
}

export async function requireFeatureEnabled(name, options = {}) {
    const enabled = await isFeatureEnabled(name, options);
    if (enabled) return null;

    const config = getConfig(name);
    return NextResponse.json({
        error: `${config.label} is temporarily unavailable.`,
        code: 'FEATURE_DISABLED',
        feature: name,
    }, {
        status: options.status || 503,
        headers: {
            'Cache-Control': 'no-store',
            'Retry-After': String(options.retryAfterSeconds || 300),
        },
    });
}

export function clearFeatureFlagCache() {
    cache.clear();
}


