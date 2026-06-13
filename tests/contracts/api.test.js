const { test, expect } = require('@playwright/test');
const {
    apiContractRegistry,
    contentQualityQuerySchema,
    contentQualityReviewSchema,
    playVerifyBodySchema,
    runtimeHealthResponseSchema,
    standardErrorSchema,
} = require('../../lib/contracts/api.cjs');

test.describe('API Contract Registry', () => {
    test('registers enterprise-controlled routes', () => {
        expect(apiContractRegistry['/api/admin/content-quality']).toBeTruthy();
        expect(apiContractRegistry['/api/admin/runtime-health']).toBeTruthy();
        expect(apiContractRegistry['/api/subscription/play/verify']).toBeTruthy();
    });

    test('validates admin content-quality query defaults and bounds', () => {
        expect(contentQualityQuerySchema.parse({})).toEqual({ page: 1, limit: 20 });
        expect(contentQualityQuerySchema.parse({ page: '2', limit: '50' })).toEqual({ page: 2, limit: 50 });
        expect(() => contentQualityQuerySchema.parse({ page: '0' })).toThrow();
        expect(() => contentQualityQuerySchema.parse({ limit: '1000' })).toThrow();
    });

    test('validates content review decisions', () => {
        expect(contentQualityReviewSchema.parse({ action: 'approve', questionId: 'q_123' }).action).toBe('approve');
        expect(contentQualityReviewSchema.parse({ action: 'reject', questionId: 42 }).questionId).toBe(42);
        expect(() => contentQualityReviewSchema.parse({ action: 'delete', questionId: 42 })).toThrow();
    });

    test('validates Google Play verification payload shape', () => {
        expect(playVerifyBodySchema.parse({
            purchaseToken: 'purchase_token_12345',
            productId: 'neet_pro_monthly',
        }).productId).toBe('neet_pro_monthly');
        expect(() => playVerifyBodySchema.parse({ purchaseToken: 'short', productId: 'x' })).toThrow();
        expect(() => playVerifyBodySchema.parse({
            purchaseToken: 'purchase_token_12345',
            productId: 'unapproved_subscription',
        })).toThrow();
    });

    test('validates runtime health does not require fake external SLOs', () => {
        const payload = {
            active_sessions: 0,
            bridge_timeout_rate: 0,
            recovery_failure_rate: 0,
            recovery_success_rate: 100,
            memory_pressure_count: 0,
            long_task_count: 0,
            offline_replay_failures: 0,
            fraud_signals_count: 0,
            circuit_breaker_opens: 0,
            crash_free_rate: null,
            submission_integrity_rate: null,
            api_uptime: null,
            unavailable_metrics: ['crash_free_rate', 'submission_integrity_rate', 'api_uptime'],
            boot_failures: {},
            recent_events: [],
            feature_flags: [],
        };

        expect(runtimeHealthResponseSchema.parse(payload).unavailable_metrics).toHaveLength(3);
    });

    test('validates normalized error envelope', () => {
        expect(standardErrorSchema.parse({
            error: 'Unauthorized',
            code: 'UNAUTHORIZED',
            requestId: 'req_123',
        }).code).toBe('UNAUTHORIZED');
    });
});
