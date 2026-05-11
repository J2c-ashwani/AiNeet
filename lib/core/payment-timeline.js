import { getDb } from './db';
import * as Sentry from '@sentry/nextjs';
import { logError } from '../error-logger';
import { sendCriticalAlert } from '../alert';

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
        const supabase = await getDb();
        const { error } = await supabase.from('payment_timeline').insert({
            payment_id: paymentId,
            user_id: userId,
            provider,
            request_id: requestId,
            source_route: sourceRoute,
            status,
            metadata
        });

        if (status === 'failed') {
            await sendCriticalAlert('Payment Failed', `A payment failed for provider ${provider}.`, {
                paymentId, userId, provider, requestId, sourceRoute, ...metadata
            });
        }

        if (error) {
            console.error('[Payment Timeline Error] Failed to log state:', error.message);
            // Sentry alert but don't crash the main transaction
            Sentry.captureException(new Error(`Failed to log payment timeline: ${error.message}`));
            logError(supabase, {
                userId,
                route: sourceRoute || 'timeline_logger',
                method: 'PAYMENT_TIMELINE',
                error,
                metadata: { paymentId, status }
            });
        }
    } catch (err) {
        console.error('[Payment Timeline Exception]', err);
    }
}
