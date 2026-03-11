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
            console.error('CASHFREE_SECRET_KEY is fully missing');
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

        // Process successful payments
        if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
            const orderId = payload.data.order.order_id;

            // Webhooks run without user cookies, so we instantiate a service client 
            // Here using ANON key as fallback since RLS allows updates via anon in this architecture
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                { auth: { persistSession: false } }
            );

            // Utility function for DB retries
            const withRetry = async (operation, maxRetries = 3) => {
                for (let i = 0; i < maxRetries; i++) {
                    try { return await operation(); }
                    catch (err) {
                        if (i === maxRetries - 1) throw err;
                        await new Promise(r => setTimeout(r, 1000 * (i + 1))); // exponential backoff
                    }
                }
            };

            // Fetch payment record
            const { data: payment, error: fetchErr } = await withRetry(() =>
                supabase.from('payments').select('user_id, status, amount').eq('provider_order_id', orderId).single()
            );

            if (fetchErr) {
                console.error('Failed to fetch payment order:', fetchErr);
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }

            // CTO Constraint: Strict Idempotency. If it's already completed, do NOT upgrade again.
            if (payment.status === 'completed') {
                console.log(`Webhook Idempotency matched: Order ${orderId} already processed. Ignoring.`);
                return NextResponse.json({ success: true, message: "Already processed" });
            }

            // Determine Plan by amount to set correct expiry
            const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.amount === payment.amount) || { duration_days: 30 };
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + plan.duration_days);

            try {
                // Execute updates with retry logic for DB locks
                await withRetry(async () => {
                    await Promise.all([
                        supabase.from('users').update({
                            subscription_tier: 'pro',
                            subscription_status: 'active',
                            subscription_expiry: expiryDate.toISOString()
                        }).eq('id', payment.user_id),

                        supabase.from('payments').update({
                            status: 'completed',
                            provider_payment_id: String(payload.data.payment.cf_payment_id)
                        }).eq('provider_order_id', orderId)
                    ]);
                });
                console.log(`Webhook successfully completed order ${orderId} for user ${payment.user_id}`);
            } catch (updateErr) {
                console.error(`Failed to update DB for order ${orderId} after retries:`, updateErr);
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook processing failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
