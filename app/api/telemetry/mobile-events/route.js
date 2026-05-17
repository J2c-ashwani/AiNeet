import { z } from 'zod';
import { RATE_LIMITS, withApiRoute } from '@/lib/api-handler';
import { safeInsert } from '@/lib/core/db-safe';

const mobileEventSchema = z.object({
    user_id: z.string().uuid().nullable().optional(),
    event_type: z.string().trim().min(1).max(100),
    device_info: z.unknown().nullable().optional(),
    android_version: z.string().max(80).nullable().optional(),
    webview_version: z.string().max(120).nullable().optional(),
    route: z.string().max(200).nullable().optional(),
    failure_reason: z.string().max(500).nullable().optional(),
});

const mobileEventsBodySchema = z.object({
    events: z.array(mobileEventSchema).max(200).default([]),
});

export const POST = withApiRoute(async (_request, { body }) => {
    if (body.events.length === 0) {
        return { ok: true, inserted: 0 };
    }

    const rows = body.events.map(e => ({
        user_id: e.user_id || null,
        event_type: e.event_type,
        device_info: e.device_info || null,
        android_version: e.android_version || null,
        webview_version: e.webview_version || null,
        route: e.route || null,
        failure_reason: e.failure_reason || null,
    }));

    await safeInsert('mobile_runtime_events', rows, {
        route: '/api/telemetry/mobile-events',
    });

    return { ok: true, inserted: rows.length };
}, {
    bodySchema: mobileEventsBodySchema,
    maxBodySize: 256_000,
    rateLimit: { ...RATE_LIMITS.STANDARD, failBehavior: 'soft', key: 'mobile-telemetry' },
});
