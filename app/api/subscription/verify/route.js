
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/core/auth';
import { PaymentService, SUBSCRIPTION_PLANS } from '@/lib/payment_service';
import { sanitizeString } from '@/lib/validate';
import { rateLimit } from '@/lib/rate-limit';
import { safeRpc, safeSelect, safeUpdate } from '@/lib/core/db-safe';
import { logPaymentTimeline } from '@/lib/core/payment-timeline';

export async function POST(request) {
    const ROUTE = '/api/subscription/verify';
    try {
        // 1. Auth Check
        const decoded = await getUserFromRequest(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limit: 5 verify attempts per 5 minutes
        const rl = await rateLimit(`user:${decoded.id}:verify`, 5, 300000, 'closed');
        if (!rl.success) {
            return NextResponse.json({ error: 'Too many verification attempts.', retryAfter: Math.ceil((rl.reset - Date.now()) / 1000) }, { status: 429 });
        }

        // 2. Parse & Sanitize Request
        let _body;
        try { _body = await request.json(); } catch (parseErr) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }
        const body = _body;
        const orderId = sanitizeString(body.orderId || '', 256);
        const planId = sanitizeString(body.planId || '', 128);

        if (!orderId || !planId) {
            return NextResponse.json({ error: 'Missing required fields (orderId, planId)' }, { status: 400 });
        }

        // 3. Verify Payment with Cashfree (fetch order status)
        const verification = await PaymentService.verifyPayment(orderId);

        if (!verification.isPaid) {
            // Update payment status to failed — use safe layer
            await safeUpdate('payments', { provider_order_id: orderId, user_id: decoded.id }, { status: 'failed' }, { route: ROUTE, userId: decoded.id });
            
            await logPaymentTimeline({
                userId: decoded.id,
                provider: 'cashfree',
                requestId: orderId,
                sourceRoute: ROUTE,
                status: 'failed',
                metadata: { error: 'Payment not completed', orderStatus: verification.orderStatus }
            });

            return NextResponse.json({
                error: 'Payment not completed',
                orderStatus: verification.orderStatus
            }, { status: 400 });
        }

        const existingSubscription = await safeSelect('subscriptions', q => q
            .select('plan_tier, expires_at')
            .eq('user_id', decoded.id)
            .eq('external_subscription_id', orderId)
            .maybeSingle(), { route: `${ROUTE}/existing-subscription`, userId: decoded.id });

        if (existingSubscription) {
            return NextResponse.json({
                success: true,
                expiry: existingSubscription.expires_at,
                plan: existingSubscription.plan_tier,
            });
        }

        // 4. Bind verification to the original payment intent, then derive the plan from the paid amount.
        const paymentIntent = await safeSelect('payments', q => q
            .select('id, user_id, amount, status')
            .eq('provider_order_id', orderId)
            .eq('user_id', decoded.id)
            .single(), { route: `${ROUTE}/payment-intent`, userId: decoded.id });

        const plan = Object.values(SUBSCRIPTION_PLANS).find(p => Number(p.amount) === Number(paymentIntent.amount));
        if (!plan || plan.id !== planId) {
            return NextResponse.json({ error: 'Payment plan mismatch' }, { status: 409 });
        }

        const durationDays = plan.duration_days;

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + durationDays);
        const expiryIso = expiryDate.toISOString();

        // 5. Atomic Subscription Activation via RPC
        // This atomically: upgrades user + marks payment completed
        await safeRpc('subscription_verify_transaction', {
            p_user_id: decoded.id,
            p_order_id: orderId,
            p_plan_tier: plan.id === 'premium' ? 'premium' : 'pro',
            p_expiry_at: expiryIso,
            p_cf_order_id: verification.cfOrderId || orderId
        }, { route: ROUTE, userId: decoded.id });

        await logPaymentTimeline({
            userId: decoded.id,
            provider: 'cashfree',
            requestId: orderId,
            sourceRoute: ROUTE,
            status: 'verified',
            metadata: { planId, expiryIso, cfOrderId: verification.cfOrderId || orderId }
        });

        return NextResponse.json({
            success: true,
            expiry: expiryIso,
            plan: planId,
        });

    } catch (error) {
        console.error('Subscription Verify Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
