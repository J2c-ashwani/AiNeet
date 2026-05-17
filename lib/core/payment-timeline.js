import * as Sentry from '@sentry/nextjs';
import { sendCriticalAlert } from '../alert';
import { safeInsert } from './db-safe';

/**
 * Log a payment state transition to the payment_timeline table.
 * 
 * @param {Object} params
 * @param {string} params.paymentId
 * @param {string} params.userId
 * @param {string} params.provider (cashfree, google_play)
 * @param {string} params.requestId
 * @param {string} params.sourceRoute
 * @param {string} params.status (initiated, pending, verified, activated, failed, refunded, webhook_received, webhook_retried)
 * @param {Object} params.metadata
 */
export async function logPaymentTimeline({
    paymentId = null,
    userId = null,
    provider = null,
    requestId = null,
    sourceRoute = null,
    status,
    metadata = {}
}) {
    try {
        await safeInsert('payment_timeline', {
            payment_id: paymentId,
            user_id: userId,
            provider,
            request_id: requestId,
            source_route: sourceRoute,
            status,
            metadata
        }, { route: sourceRoute || 'payment_timeline', userId });

        if (status === 'failed') {
            await sendCriticalAlert('Payment Failed', `A payment failed for provider ${provider}.`, {
                paymentId, userId, provider, requestId, sourceRoute, ...metadata
            });
        }
    } catch (err) {
        console.error('[Payment Timeline Exception]', err);
        Sentry.captureException(err);
    }
}
