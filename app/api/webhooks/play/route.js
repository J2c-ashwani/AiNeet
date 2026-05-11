import { NextResponse } from 'next/server';
import { safeRpc, safeSelect, safeInsert } from '@/lib/core/db-safe';
import { logPaymentTimeline } from '@/lib/core/payment-timeline';
import crypto from 'crypto';

export async function POST(request) {
    const ROUTE = '/api/webhooks/play';
    try {
        const rawBody = await request.text();
        const payload = JSON.parse(rawBody);

        if (!payload.message || !payload.message.data) {
            return NextResponse.json({ error: 'Invalid RTDN payload' }, { status: 400 });
        }

        const decodedData = JSON.parse(Buffer.from(payload.message.data, 'base64').toString('utf-8'));

        if (!decodedData.subscriptionNotification) {
            return NextResponse.json({ success: true, message: 'Ignored non-subscription event' });
        }

        const notificationType = decodedData.subscriptionNotification.notificationType;
        const purchaseToken = decodedData.subscriptionNotification.purchaseToken;
        const eventId = `play_rtdn_${payload.message.messageId}`;

        // 0. Hard Idempotency Check
        try {
            await safeInsert('payment_events', {
                provider: 'google_play',
                external_event_id: eventId,
                payload_hash: crypto.createHash('sha256').update(rawBody).digest('hex'),
                status: 'success'
            }, { route: ROUTE });
        } catch (eventErr) {
            if (eventErr.originalError?.code === '23505') {
                console.log(`[WEBHOOK IDEMPOTENCY] Replay blocked: Event ${eventId} already processed.`);
                return NextResponse.json({ success: true, message: "Duplicate event safely ignored" });
            }
            throw eventErr;
        }

        // Find user linked to this purchase token
        const previousSub = await safeSelect('subscriptions', (q) => q.select('user_id, plan_tier').eq('external_subscription_id', purchaseToken).order('created_at', { ascending: false }).limit(1).maybeSingle(), { route: ROUTE });

        if (!previousSub) {
            console.error(`[Play RTDN] Unmapped purchase token: ${purchaseToken}`);
            return NextResponse.json({ success: true, message: 'Token not mapped to user yet' });
        }

        const userId = previousSub.user_id;

        // Map notification type to billing status
        const STATUS_MAP = {
            2: 'active',    // SUBSCRIPTION_RENEWED
            3: 'canceled',  // SUBSCRIPTION_CANCELED
            6: 'grace',     // SUBSCRIPTION_IN_GRACE_PERIOD
            12: 'expired',  // SUBSCRIPTION_REVOKED
            13: 'expired',  // SUBSCRIPTION_EXPIRED
        };

        const newStatus = STATUS_MAP[notificationType];
        if (!newStatus) {
            return NextResponse.json({ success: true, message: `Ignored notification type ${notificationType}` });
        }

        // Atomic: insert event log + update user status
        try {
            await safeRpc('play_webhook_event_transaction', {
                p_user_id: userId,
                p_plan_tier: previousSub.plan_tier,
                p_billing_status: newStatus,
                p_purchase_token: purchaseToken,
                p_event_id: eventId,
                p_event_type: `RTDN_${notificationType}`,
                p_payload: decodedData,
                p_started_at: new Date().toISOString()
            }, { route: ROUTE, userId });

            await logPaymentTimeline({
                userId,
                provider: 'google_play',
                requestId: purchaseToken,
                sourceRoute: ROUTE,
                status: 'webhook_received',
                metadata: { notificationType, newStatus }
            });
        } catch (err) {
            if (err.originalError?.code === '23505') {
                console.log(`[WEBHOOK SUB IDEMPOTENCY] Replay blocked at sub level: Event ${eventId}.`);
                return NextResponse.json({ success: true, message: "Duplicate event safely ignored" });
            }
            throw err;
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Play Webhook] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
