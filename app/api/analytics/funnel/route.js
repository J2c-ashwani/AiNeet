import { z } from 'zod';
import { RATE_LIMITS, withApiRoute } from '@/lib/api-handler';
import { checkedFetch } from '@/lib/http';

const funnelEventSchema = z.object({
    event_name: z.string().trim().min(1).max(120),
    user_id: z.string().max(128).optional().nullable(),
    device_session_id: z.string().trim().min(1).max(160),
    metadata: z.record(z.string(), z.unknown()).optional().default({}),
    timestamp: z.number().int().positive().optional(),
});

export const POST = withApiRoute(async (_request, { body }) => {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return { success: true, bypassed: true };
    }

    const safeSessionId = body.device_session_id.replace(/[^a-zA-Z0-9_-]/g, '');
    const unixTime = body.timestamp || Date.now();
    const telemetryNode = JSON.stringify({
        u: body.user_id || 'anonymous',
        e: body.event_name,
        m: body.metadata || {},
        t: unixTime,
    });

    const redisPayload = JSON.stringify([
        'ZADD',
        `funnel:${safeSessionId}`,
        unixTime,
        telemetryNode,
    ]);

    await checkedFetch(`${process.env.UPSTASH_REDIS_REST_URL}/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: redisPayload,
    }, {
        errorMessage: 'Failed to write funnel analytics',
    });

    return { success: true };
}, {
    bodySchema: funnelEventSchema,
    maxBodySize: 64_000,
    rateLimit: { ...RATE_LIMITS.PUBLIC, failBehavior: 'soft', key: 'funnel-analytics' },
});
