'use client';

import { checkedFetch } from '@/lib/http';
import {
    acknowledgeNativePurchase,
    isInsideNativeApp,
    purchaseNativeSubscription,
} from '@/lib/platform';
import { openCashfreeCheckout } from './cashfree-checkout';

async function verifyPlayPurchase(purchase) {
    const purchaseToken = purchase?.purchaseToken || purchase?.token;
    const productId = purchase?.productId || purchase?.productID;
    if (!purchaseToken || !productId) {
        throw new Error('Google Play did not return a verifiable purchase.');
    }

    const response = await checkedFetch('/api/subscription/play/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseToken, productId }),
    }, {
        allowedStatuses: [400, 409],
        errorMessage: 'Google Play purchase verification failed',
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Google Play purchase verification failed.');
    }

    if (purchase.pendingCompletePurchase !== false) {
        await acknowledgeNativePurchase(purchaseToken);
    }
    return { provider: 'google_play', plan: data.plan };
}

export async function startSubscriptionCheckout(planId) {
    if (isInsideNativeApp()) {
        const purchase = await purchaseNativeSubscription(planId);
        return verifyPlayPurchase(purchase);
    }

    const response = await checkedFetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
    }, {
        allowedStatuses: [400, 409],
        errorMessage: 'Payment could not be started',
    });
    const data = await response.json();
    if (!response.ok || data.error) {
        throw new Error(data.error || 'Payment could not be started.');
    }

    await openCashfreeCheckout({
        paymentSessionId: data.paymentSessionId,
        environment: data.environment,
    });
    return { provider: 'cashfree' };
}
