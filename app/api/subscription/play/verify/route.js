import crypto from 'crypto';
import { ApiError, RATE_LIMITS, withApiRoute } from '@/lib/api-handler';
import { playSubscriptionProducts, playVerifyBodySchema } from '@/lib/contracts/api';
import { safeRpc, safeSelect } from '@/lib/core/db-safe';
import { logPaymentTimeline } from '@/lib/core/payment-timeline';
import { verifyGooglePlaySubscription } from '@/lib/payments/google-play';
import { requireFeatureEnabled } from '@/lib/feature-flags';

const ROUTE = '/api/subscription/play/verify';

function planTierFromProduct(productId) {
    return playSubscriptionProducts[productId] || null;
}

function eventIdForPurchase(purchaseToken) {
    return `play_verify_${crypto.createHash('sha256').update(purchaseToken).digest('hex').slice(0, 32)}`;
}

export const POST = withApiRoute(async (_request, { user, body }) => {
    const featureDisabled = await requireFeatureEnabled('payments');
    if (featureDisabled) return featureDisabled;

    const { purchaseToken, productId } = body;

    const existingSub = await safeSelect(
        'subscriptions',
        q => q.select('id, plan_tier').eq('external_subscription_id', purchaseToken).maybeSingle(),
        { route: ROUTE, userId: user.id }
    );

    if (existingSub) {
        return { success: true, message: 'Already processed', plan: existingSub.plan_tier };
    }

    const verification = await verifyGooglePlaySubscription({ purchaseToken, productId });
    if (!verification.isValid) {
        await logPaymentTimeline({
            userId: user.id,
            provider: 'google_play',
            requestId: purchaseToken,
            sourceRoute: ROUTE,
            status: 'failed',
            metadata: {
                error: verification.reason || 'Invalid Google Play receipt',
                productId,
                source: verification.source,
            },
        });

        throw new ApiError('Invalid Google Play receipt', 400, 'INVALID_PLAY_RECEIPT');
    }

    const verifiedProductId = verification.productId || productId;
    const planTier = planTierFromProduct(verifiedProductId);
    if (!planTier) {
        throw new ApiError('Unsupported Google Play subscription product', 400, 'PLAY_PRODUCT_UNSUPPORTED');
    }
    const expiryTimeMillis = verification.expiryTimeMillis;
    if (!expiryTimeMillis || expiryTimeMillis <= Date.now()) {
        throw new ApiError('Google Play subscription is not active', 400, 'PLAY_SUBSCRIPTION_INACTIVE');
    }

    try {
        await safeRpc('play_subscription_activate_transaction', {
            p_user_id: user.id,
            p_plan_tier: planTier,
            p_purchase_token: purchaseToken,
            p_product_id: verifiedProductId,
            p_event_id: eventIdForPurchase(purchaseToken),
            p_event_type: 'PURCHASE_VERIFICATION',
            p_payload: {
                productId,
                verifiedProductId: verification.productId,
                subscriptionState: verification.subscriptionState,
                source: verification.source,
            },
            p_started_at: new Date().toISOString(),
            p_expires_at: new Date(expiryTimeMillis).toISOString(),
        }, { route: ROUTE, userId: user.id });
    } catch (error) {
        if (error.originalError?.code === '23505') {
            return { success: true, message: 'Duplicate safely ignored', plan: planTier };
        }
        throw error;
    }

    await logPaymentTimeline({
        userId: user.id,
        provider: 'google_play',
        requestId: purchaseToken,
        sourceRoute: ROUTE,
        status: 'verified',
        metadata: {
            planTier,
            productId: verifiedProductId,
            source: verification.source,
        },
    });

    return { success: true, plan: planTier };
}, {
    auth: 'user',
    appCheck: 'native',
    bodySchema: playVerifyBodySchema,
    rateLimit: { ...RATE_LIMITS.PAYMENT, failBehavior: 'closed', key: 'play-verify' },
});
