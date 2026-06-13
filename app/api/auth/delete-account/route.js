import { ApiError, withApiRoute } from '@/lib/api-handler';
import { safeDelete, safeSelect, safeUpdate } from '@/lib/core/db-safe';
import { logPaymentTimeline } from '@/lib/core/payment-timeline';

const ROUTE = '/api/auth/delete-account';

export const POST = withApiRoute(async (_request, { user }) => {
    const userId = user.id;
    const profile = await safeSelect('users', query => query
        .select('id, account_status')
        .eq('id', userId)
        .single(), { route: `${ROUTE}/profile`, userId });

    if (profile.account_status === 'deleted') {
        return { success: true, alreadyDeleted: true };
    }

    const subscriptions = await safeSelect('subscriptions', query => query
        .select('id, billing_source, billing_provider, billing_status, external_subscription_id, plan_tier, expires_at')
        .eq('user_id', userId)
        .in('billing_status', ['active', 'grace'])
        .gt('expires_at', new Date().toISOString()), { route: `${ROUTE}/subscriptions`, userId });

    const activePlaySubscription = subscriptions.find(subscription => subscription.billing_source === 'play');
    if (activePlaySubscription) {
        throw new ApiError(
            'Cancel your active Google Play subscription before deleting this account.',
            409,
            'PLAY_SUBSCRIPTION_ACTIVE'
        );
    }

    for (const subscription of subscriptions.filter(item => item.billing_source === 'web')) {
        await safeUpdate('subscriptions', { id: subscription.id, user_id: userId }, {
            billing_status: 'canceled',
        }, { route: `${ROUTE}/cancel-subscription`, userId });

        await logPaymentTimeline({
            userId,
            provider: subscription.billing_provider || 'cashfree',
            requestId: subscription.external_subscription_id || subscription.id,
            sourceRoute: ROUTE,
            status: 'canceled',
            metadata: {
                reason: 'account_deletion',
                planTier: subscription.plan_tier,
                accessUntil: subscription.expires_at,
            },
        });
    }

    await safeDelete('user_devices', { user_id: userId }, { route: `${ROUTE}/devices`, userId });

    await safeUpdate('users', { id: userId }, {
        deleted_at: new Date().toISOString(),
        account_status: 'deleted',
        name: 'Deleted User',
        avatar: 'deleted',
        parent_email: null,
        parent_phone: null,
        scrubbed_identity: 0,
    }, { route: ROUTE, userId });

    return {
        success: true,
        message: 'Account disabled and scheduled for personal-data deletion.',
    };
}, {
    auth: 'user',
    appCheck: 'native',
    rateLimit: { limit: 2, window: 60 * 60 * 1000, failBehavior: 'closed', key: 'account-delete' },
});
