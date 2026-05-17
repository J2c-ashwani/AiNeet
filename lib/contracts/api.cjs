const { z } = require('zod');

const positiveIntFromString = (min, max, fallback) => z.preprocess(
    value => {
        if (value === undefined || value === null || value === '') return fallback;
        const parsed = Number.parseInt(String(value), 10);
        return Number.isNaN(parsed) ? value : parsed;
    },
    z.number().int().min(min).max(max)
);

const contentQualityQuerySchema = z.object({
    page: positiveIntFromString(1, 10000, 1),
    limit: positiveIntFromString(1, 100, 20),
});

const contentQualityReviewSchema = z.object({
    action: z.enum(['approve', 'reject']),
    questionId: z.union([z.string().min(1).max(128), z.number().int().positive()]),
    reviewedBy: z.string().trim().min(1).max(128).optional(),
});

const playVerifyBodySchema = z.object({
    purchaseToken: z.string().trim().min(12).max(4096),
    productId: z.string().trim().min(3).max(256),
});

const standardErrorSchema = z.object({
    error: z.string(),
    code: z.string(),
    requestId: z.string(),
});

const runtimeHealthResponseSchema = z.object({
    active_sessions: z.number(),
    bridge_timeout_rate: z.number(),
    recovery_failure_rate: z.number(),
    recovery_success_rate: z.number(),
    memory_pressure_count: z.number(),
    long_task_count: z.number(),
    offline_replay_failures: z.number(),
    fraud_signals_count: z.number(),
    circuit_breaker_opens: z.number(),
    crash_free_rate: z.number().nullable(),
    submission_integrity_rate: z.number().nullable(),
    api_uptime: z.number().nullable(),
    unavailable_metrics: z.array(z.string()),
    boot_failures: z.record(z.string(), z.number()),
    recent_events: z.array(z.object({
        event_type: z.string().nullable().optional(),
        failure_reason: z.string().nullable().optional(),
        route: z.string().nullable().optional(),
        created_at: z.string().nullable().optional(),
    })),
    feature_flags: z.array(z.object({
        key: z.string(),
        enabled: z.boolean().nullable().optional(),
        rollout_pct: z.number().nullable().optional(),
    })),
});

const apiContractRegistry = {
    '/api/admin/content-quality': {
        GET: { query: contentQualityQuerySchema },
        POST: { body: contentQualityReviewSchema },
    },
    '/api/admin/runtime-health': {
        GET: { response: runtimeHealthResponseSchema },
    },
    '/api/subscription/play/verify': {
        POST: { body: playVerifyBodySchema },
    },
};

module.exports = {
    contentQualityQuerySchema,
    contentQualityReviewSchema,
    playVerifyBodySchema,
    runtimeHealthResponseSchema,
    standardErrorSchema,
    apiContractRegistry,
};
