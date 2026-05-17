import { z } from 'zod';
import { RATE_LIMITS, withApiRoute } from '@/lib/api-handler';
import { safeInsert } from '@/lib/core/db-safe';

const growthLogSchema = z.object({
    platform: z.string().trim().min(1).max(64).optional().default('facebook'),
    topicDetected: z.string().trim().max(160).optional().default('Unknown'),
    originalDoubtText: z.string().max(5000).optional().default(''),
    selectedVariantText: z.string().max(5000).optional().default(''),
});

export const POST = withApiRoute(async (_request, { user, body }) => {
    await safeInsert('social_growth_logs', {
        admin_id: user.id,
        platform: body.platform,
        topic_detected: body.topicDetected,
        original_doubt_text: body.originalDoubtText,
        selected_variant: body.selectedVariantText,
    }, {
        route: '/api/admin/growth/log',
        userId: user.id,
    });

    return { success: true };
}, {
    auth: 'admin',
    bodySchema: growthLogSchema,
    maxBodySize: 64_000,
    rateLimit: { ...RATE_LIMITS.STANDARD, failBehavior: 'closed', key: 'admin:growth-log' },
});
