import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { SUBSCRIPTION_PLANS } from '@/lib/payment_service';

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

        // Verify the signature
        const expectedSignature = crypto
            .createHmac('sha256', secretKey)
            .update(timestamp + rawBody)
            .digest('base64');

        if (signature !== expectedSignature) {
            console.warn('Blocked webhook with invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);

        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            serviceKey,
            { auth: { persistSession: false } }
        );

        // Process successful payments
        if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
            const orderId = payload.data.order.order_id;
            
            // Generate deterministic event ID for idempotency
            const eventId = `cashfree_${timestamp}_${orderId}_${payload.type}`;

            console.log(`[WEBHOOK START] Received valid payload for Order: ${orderId}`);

            // 1. Fetch payment intent from old payments table to map to user_id
            const { data: payment, error: fetchErr } = await supabase
                .from('payments')
                .select('user_id, status, amount')
                .eq('provider_order_id', orderId)
                .single();

            if (fetchErr) {
                console.error(`[WEBHOOK ERROR] Failed to fetch payment order ${orderId}:`, fetchErr);
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }

            const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.amount === payment.amount) || { duration_days: 30, id: 'pro' };
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + plan.duration_days);

            // 2. Insert into the new Dual-Rail Subscriptions table (History-Preserving)
            const { error: insertErr } = await supabase.from('subscriptions').insert({
                user_id: payment.user_id,
                plan_tier: plan.id === 'premium' ? 'premium' : 'pro',
                billing_source: 'web',
                billing_provider: 'cashfree',
                billing_status: 'active',
                external_subscription_id: orderId, // Cashfree links order ID to the subscription intent usually
                external_customer_id: payment.user_id,
                provider_event_id: eventId,
                provider_event_type: payload.type,
                provider_payload: payload,
                started_at: new Date().toISOString(),
                expires_at: expiryDate.toISOString()
            });

            if (insertErr) {
                // If the error is a unique constraint violation on provider_event_id, it's a duplicate webhook replay.
                if (insertErr.code === '23505') {
                    console.log(`[WEBHOOK IDEMPOTENCY] Replay blocked: Event ${eventId} already processed.`);
                    return NextResponse.json({ success: true, message: "Duplicate event safely ignored" });
                }
                throw insertErr;
            }

            // Optional: Mark legacy payment intent as completed so old checks don't break immediately
            await supabase.from('payments').update({ status: 'completed' }).eq('provider_order_id', orderId);
            
            console.log(`[WEBHOOK SUCCESS] Upgraded User: ${payment.user_id} via Cashfree to ${plan.id}. Expiry: ${expiryDate.toISOString()}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook processing failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
