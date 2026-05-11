import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/core/auth';
import { safeRpc, safeSelect } from '@/lib/core/db-safe';
import { logPaymentTimeline } from '@/lib/core/payment-timeline';

export async function POST(request) {
    const ROUTE = '/api/subscription/play/verify';
    try {
        const user = await getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { purchaseToken, productId } = body;

        if (!purchaseToken || !productId) {
            return NextResponse.json({ error: 'Missing purchase details' }, { status: 400 });
        }

        const { getDb } = await import('@/lib/core/db');
        const supabase = await getDb();

        // Idempotency check — block replay attacks
        const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('external_subscription_id', purchaseToken)
            .maybeSingle();

        if (existingSub) {
            return NextResponse.json({ success: true, message: 'Already processed', plan: 'pro' });
        }

        // ==========================================
        // Verify with Google Play Developer API
        // ==========================================
        // TODO: Replace mock with real googleapis verification
        // const auth = new google.auth.GoogleAuth({ credentials: JSON.parse(process.env.GOOGLE_PLAY_SERVICE_ACCOUNT) });
        // const res = await androidpublisher.purchases.subscriptions.get({ ... });
        console.log(`[Google Play] Verifying token for user: ${user.id}, product: ${productId}`);
        const isValid = true; // MOCKED — replace with real API call
        const expiryTimeMillis = Date.now() + 30 * 24 * 60 * 60 * 1000;
        const eventId = `play_verify_${purchaseToken.slice(0, 32)}`;
        const planTier = productId.includes('premium') ? 'premium' : 'pro';

        if (!isValid) {
            await logPaymentTimeline({
                userId: user.id,
                provider: 'google_play',
                requestId: purchaseToken,
                sourceRoute: ROUTE,
                status: 'failed',
                metadata: { error: 'Invalid Google Play receipt', productId }
            });
            return NextResponse.json({ error: 'Invalid Google Play receipt' }, { status: 400 });
        }

        // Atomic activation: insert subscription + upgrade user in one transaction
        await safeRpc('play_subscription_activate_transaction', {
            p_user_id: user.id,
            p_plan_tier: planTier,
            p_purchase_token: purchaseToken,
            p_product_id: productId,
            p_event_id: eventId,
            p_event_type: 'PURCHASE_VERIFICATION',
            p_payload: { purchaseToken, productId, source: 'app_verification' },
            p_started_at: new Date().toISOString(),
            p_expires_at: new Date(expiryTimeMillis).toISOString()
        }, { route: ROUTE, userId: user.id });

        await logPaymentTimeline({
            userId: user.id,
            provider: 'google_play',
            requestId: purchaseToken,
            sourceRoute: ROUTE,
            status: 'verified',
            metadata: { planTier, productId }
        });

        return NextResponse.json({ success: true, plan: planTier });

    } catch (error) {
        if (error.code === '23505') {
            return NextResponse.json({ success: true, message: 'Duplicate safely ignored' });
        }
        console.error('Play Verify Error:', error);
        return NextResponse.json({ error: 'Failed to verify purchase' }, { status: 500 });
    }
}
