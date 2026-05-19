import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PaymentService, SUBSCRIPTION_PLANS } from '@/lib/payment_service';
import { safeRpc, safeSelect, safeInsert } from '@/lib/core/db-safe';
import { logPaymentTimeline } from '@/lib/core/payment-timeline';

export async function POST(request) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('x-webhook-signature');
        const timestamp = request.headers.get('x-webhook-timestamp');

        if (!signature || !timestamp) {
            return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 });
        }

        const secretKey = process.env.CASHFREE_SECRET_KEY;
        if (!secretKey) {
            console.error('CASHFREE_SECRET_KEY is missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        if (!PaymentService.verifyWebhookSignature(rawBody, timestamp, signature)) {
            console.warn('Blocked webhook with invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        let payload;
        try {
            payload = JSON.parse(rawBody);
        } catch {
            return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
        }

        // Process successful payments
        if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
            const orderId = payload.data.order.order_id;
            
            // Generate deterministic event ID for idempotency
            const eventId = `cashfree_${timestamp}_${orderId}_${payload.type}`;

            console.log(`[WEBHOOK START] Received valid payload for Order: ${orderId}`);

            // 0. Hard Idempotency Check using payment_events table
            try {
                await safeInsert('payment_events', {
                    provider: 'cashfree',
                    external_event_id: eventId,
                    payload_hash: crypto.createHash('sha256').update(rawBody).digest('hex'),
                    status: 'success'
                }, { route: '/api/webhooks/cashfree' });
            } catch (eventErr) {
                if (eventErr.originalError?.code === '23505') {
                    console.log(`[WEBHOOK IDEMPOTENCY] Replay blocked: Event ${eventId} already processed.`);
                    return NextResponse.json({ success: true, message: "Duplicate event safely ignored" });
                }
                throw eventErr;
            }

            // 1. Fetch payment intent to map to user_id
            let payment;
            try {
                payment = await safeSelect('payments', (q) => q.select('id, user_id, status, amount').eq('provider_order_id', orderId).single(), { route: '/api/webhooks/cashfree' });
            } catch (fetchErr) {
                console.error(`[WEBHOOK ERROR] Failed to fetch payment order ${orderId}:`, fetchErr);
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }

            const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.amount === payment.amount) || { duration_days: 30, id: 'pro' };
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + plan.duration_days);

            // 2. Execute Atomic Subscription Activation via RPC
            try {
                await safeRpc('subscription_activation_transaction', {
                    p_user_id: payment.user_id,
                    p_plan_tier: plan.id === 'premium' ? 'premium' : 'pro',
                    p_billing_source: 'web',
                    p_billing_provider: 'cashfree',
                    p_billing_status: 'active',
                    p_external_subscription_id: orderId,
                    p_external_customer_id: payment.user_id,
                    p_provider_event_id: eventId,
                    p_provider_event_type: payload.type,
                    p_provider_payload: payload,
                    p_started_at: new Date().toISOString(),
                    p_expires_at: expiryDate.toISOString(),
                    p_provider_order_id: orderId
                }, { route: '/api/webhooks/cashfree', userId: payment.user_id });

                await logPaymentTimeline({
                    paymentId: payment.id,
                    userId: payment.user_id,
                    provider: 'cashfree',
                    requestId: orderId,
                    sourceRoute: '/api/webhooks/cashfree',
                    status: 'webhook_received',
                    metadata: { type: payload.type, planTier: plan.id }
                });

                await logPaymentTimeline({
                    paymentId: payment.id,
                    userId: payment.user_id,
                    provider: 'cashfree',
                    requestId: orderId,
                    sourceRoute: '/api/webhooks/cashfree',
                    status: 'activated',
                    metadata: { expiry: expiryDate.toISOString(), eventId }
                });

            } catch (err) {
                if (err.originalError?.code === '23505') {
                    console.log(`[WEBHOOK SUB IDEMPOTENCY] Replay blocked at sub level: Event ${eventId}.`);
                    return NextResponse.json({ success: true, message: "Duplicate event safely ignored" });
                }
                throw err;
            }
            
            console.log(`[WEBHOOK SUCCESS] Upgraded User: ${payment.user_id} via Cashfree to ${plan.id}. Expiry: ${expiryDate.toISOString()}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook processing failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
