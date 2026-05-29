import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/core/auth';
import { safeSelect, safeUpdate } from '@/lib/core/db-safe';
import { logPaymentTimeline } from '@/lib/core/payment-timeline';
import { rateLimit } from '@/lib/rate-limit';
import { verifyAppCheck } from '@/lib/security/verify-app-check';
import { requireFeatureEnabled } from '@/lib/feature-flags';

const ROUTE = '/api/subscription/cancel';

export async function POST(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const appCheckResponse = await verifyAppCheck(request);
        if (appCheckResponse) return appCheckResponse;

        const featureDisabled = await requireFeatureEnabled('payments');
        if (featureDisabled) return featureDisabled;

        const rl = await rateLimit(`user:${user.id}:subscription_cancel`, 3, 300000, 'closed');
        if (!rl.success) {
            return NextResponse.json({
                error: 'Too many cancellation attempts. Please wait before trying again.',
                retryAfter: Math.ceil((rl.reset - Date.now()) / 1000),
            }, { status: 429 });
        }

        const subscription = await safeSelect('subscriptions', q => q
            .select('id, user_id, plan_tier, billing_source, billing_provider, billing_status, external_subscription_id, expires_at')
            .eq('user_id', user.id)
            .eq('billing_source', 'web')
            .in('billing_status', ['active', 'grace', 'canceled'])
            .order('expires_at', { ascending: false })
            .limit(1)
            .maybeSingle(), { route: `${ROUTE}/current-subscription`, userId: user.id });

        if (!subscription) {
            return NextResponse.json({
                error: 'No active web subscription was found for this account.',
            }, { status: 404 });
        }

        if (subscription.billing_status === 'canceled') {
            return NextResponse.json({
                success: true,
                alreadyCanceled: true,
                accessUntil: subscription.expires_at,
                message: 'Renewal is already canceled. Access remains active until the current billing period ends.',
            });
        }

        const [updatedSubscription] = await safeUpdate('subscriptions', {
            id: subscription.id,
            user_id: user.id,
        }, {
            billing_status: 'canceled',
        }, { route: ROUTE, userId: user.id });

        await logPaymentTimeline({
            userId: user.id,
            provider: subscription.billing_provider || 'cashfree',
            requestId: subscription.external_subscription_id || subscription.id,
            sourceRoute: ROUTE,
            status: 'canceled',
            metadata: {
                subscriptionId: subscription.id,
                planTier: subscription.plan_tier,
                accessUntil: subscription.expires_at,
                policy: 'cancel_at_period_end_no_refund',
            },
        });

        return NextResponse.json({
            success: true,
            accessUntil: updatedSubscription?.expires_at || subscription.expires_at,
            message: 'Renewal canceled. Paid access remains active until the current billing period ends.',
        });
    } catch (error) {
        console.error('Subscription Cancel Error:', error);
        return NextResponse.json({
            error: 'Unable to cancel renewal right now. Please try again in a moment.',
        }, { status: 500 });
    }
}
