import crypto from 'crypto';
import { ApiError, RATE_LIMITS, withApiRoute } from '@/lib/api-handler';
import { safeRpc, safeSelect, safeInsert } from '@/lib/core/db-safe';
import { logPaymentTimeline } from '@/lib/core/payment-timeline';
import { verifyGooglePubSubRequest } from '@/lib/payments/google-play';

const ROUTE = '/api/webhooks/play';

function parseJson(rawBody) {
    try {
        return JSON.parse(rawBody);
    } catch {
        throw new ApiError('Invalid RTDN payload', 400, 'INVALID_JSON');
    }
}

function decodePubSubMessage(payload) {
    if (!payload.message?.data) {
        throw new ApiError('Invalid RTDN payload', 400, 'INVALID_RTDN_PAYLOAD');
    }

    return parseJson(Buffer.from(payload.message.data, 'base64').toString('utf-8'));
}

function webhookEventId(payload, rawBody) {
    const messageId = payload.message?.messageId || payload.message?.message_id;
    if (messageId) return `play_rtdn_${messageId}`;
    return `play_rtdn_${crypto.createHash('sha256').update(rawBody).digest('hex').slice(0, 32)}`;
}

export const POST = withApiRoute(async (request) => {
    try {
        await verifyGooglePubSubRequest(request);
    } catch (error) {
        throw new ApiError(error.message || 'Invalid Google Pub/Sub signature', 401, 'PLAY_WEBHOOK_UNVERIFIED');
    }

    const rawBody = await request.text();
    const payload = parseJson(rawBody);
    const decodedData = decodePubSubMessage(payload);

    if (!decodedData.subscriptionNotification) {
        return { success: true, message: 'Ignored non-subscription event' };
    }

    const notificationType = decodedData.subscriptionNotification.notificationType;
    const purchaseToken = decodedData.subscriptionNotification.purchaseToken;
    const eventId = webhookEventId(payload, rawBody);

    if (!purchaseToken) {
        throw new ApiError('Missing purchase token', 400, 'PLAY_WEBHOOK_MISSING_TOKEN');
    }

    try {
        await safeInsert('payment_events', {
            provider: 'google_play',
            external_event_id: eventId,
            payload_hash: crypto.createHash('sha256').update(rawBody).digest('hex'),
            status: 'success',
        }, { route: ROUTE });
    } catch (eventErr) {
        if (eventErr.originalError?.code === '23505') {
            return { success: true, message: 'Duplicate event safely ignored' };
        }
        throw eventErr;
    }

    const previousSub = await safeSelect(
        'subscriptions',
        q => q.select('user_id, plan_tier')
            .eq('external_subscription_id', purchaseToken)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        { route: ROUTE }
    );

    if (!previousSub) {
        return { success: true, message: 'Token not mapped to user yet' };
    }

    const statusMap = {
        2: 'active',
        3: 'canceled',
        6: 'grace',
        12: 'expired',
        13: 'expired',
    };

    const newStatus = statusMap[notificationType];
    if (!newStatus) {
        return { success: true, message: `Ignored notification type ${notificationType}` };
    }

    try {
        await safeRpc('play_webhook_event_transaction', {
            p_user_id: previousSub.user_id,
            p_plan_tier: previousSub.plan_tier,
            p_billing_status: newStatus,
            p_purchase_token: purchaseToken,
            p_event_id: eventId,
            p_event_type: `RTDN_${notificationType}`,
            p_payload: decodedData,
            p_started_at: new Date().toISOString(),
        }, { route: ROUTE, userId: previousSub.user_id });

        await logPaymentTimeline({
            userId: previousSub.user_id,
            provider: 'google_play',
            requestId: purchaseToken,
            sourceRoute: ROUTE,
            status: 'webhook_received',
            metadata: { notificationType, newStatus },
        });
    } catch (err) {
        if (err.originalError?.code === '23505') {
            return { success: true, message: 'Duplicate event safely ignored' };
        }
        throw err;
    }

    return { success: true };
}, {
    maxBodySize: 256_000,
    rateLimit: { ...RATE_LIMITS.PUBLIC, failBehavior: 'open', key: 'play-webhook' },
});
