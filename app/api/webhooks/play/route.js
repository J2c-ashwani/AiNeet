import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function POST(request) {
    try {
        const rawBody = await request.text();
        const payload = JSON.parse(rawBody);

        // Google Play RTDN sends base64 encoded data inside message.data
        if (!payload.message || !payload.message.data) {
            return NextResponse.json({ error: 'Invalid RTDN payload' }, { status: 400 });
        }

        const decodedData = JSON.parse(Buffer.from(payload.message.data, 'base64').toString('utf-8'));
        
        // Ensure this is a subscription notification
        if (!decodedData.subscriptionNotification) {
            return NextResponse.json({ success: true, message: 'Ignored non-subscription event' });
        }

        const notificationType = decodedData.subscriptionNotification.notificationType;
        const purchaseToken = decodedData.subscriptionNotification.purchaseToken;
        const subscriptionId = decodedData.subscriptionNotification.subscriptionId;
        const eventId = `play_rtdn_${payload.message.messageId}`; // RTDN provides unique messageId

        const supabase = await createSupabaseServerClient();

        // 1. Find the user ID associated with this purchase token from previous history
        const { data: previousSub } = await supabase
            .from('subscriptions')
            .select('user_id, plan_tier')
            .eq('external_subscription_id', purchaseToken)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!previousSub) {
            // Unmapped purchase token. The app might not have verified it yet.
            console.error(`[Play RTDN] Unmapped purchase token: ${purchaseToken}`);
            return NextResponse.json({ success: true, message: 'Token not mapped to user yet' });
        }

        const userId = previousSub.user_id;

        // 2. Process based on Notification Type
        // https://developer.android.com/google/play/billing/rtdn-reference#sub
        let newStatus = 'active';
        let isInsertNeeded = true;
        
        switch (notificationType) {
            case 2: // SUBSCRIPTION_RENEWED
                newStatus = 'active';
                break;
            case 3: // SUBSCRIPTION_CANCELED (User canceled, but access remains until expiry)
                newStatus = 'canceled';
                break;
            case 6: // SUBSCRIPTION_IN_GRACE_PERIOD
                newStatus = 'grace';
                break;
            case 12: // SUBSCRIPTION_REVOKED
            case 13: // SUBSCRIPTION_EXPIRED
                newStatus = 'expired';
                break;
            default:
                isInsertNeeded = false; // We don't care about price changes or pauses for now
        }

        if (isInsertNeeded) {
            const { error: insertErr } = await supabase.from('subscriptions').insert({
                user_id: userId,
                plan_tier: previousSub.plan_tier,
                billing_source: 'play',
                billing_provider: 'google_play',
                billing_status: newStatus,
                external_subscription_id: purchaseToken,
                external_customer_id: userId,
                provider_event_id: eventId,
                provider_event_type: `RTDN_${notificationType}`,
                provider_payload: decodedData,
                started_at: new Date().toISOString(), // In reality, fetch from API
                // expires_at: ideally fetch latest from Google Play API here
            });

            if (insertErr) {
                if (insertErr.code === '23505') {
                    console.log(`[Play Webhook IDEMPOTENCY] Replay blocked: Event ${eventId} already processed.`);
                    return NextResponse.json({ success: true, message: "Duplicate event safely ignored" });
                }
                throw insertErr;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Play Webhook] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
