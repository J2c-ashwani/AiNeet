import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { getUserFromRequest } from '@/lib/core/auth';
// In a real implementation, you would use googleapis package
// import { google } from 'googleapis';

export async function POST(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { purchaseToken, productId } = body;

        if (!purchaseToken || !productId) {
            return NextResponse.json({ error: 'Missing purchase details' }, { status: 400 });
        }

        const supabase = await createSupabaseServerClient();

        // Check if token is already processed to prevent replay
        const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('external_subscription_id', purchaseToken)
            .single();

        if (existingSub) {
            return NextResponse.json({ success: true, message: 'Already processed', plan: 'pro' });
        }

        // ==========================================
        // 1. Verify with Google Play Developer API
        // ==========================================
        // This requires googleapis and service account credentials.
        // For architectural setup, we mock the validation success.
        // 
        // const auth = new google.auth.GoogleAuth({ credentials: JSON.parse(process.env.GOOGLE_PLAY_SERVICE_ACCOUNT), scopes: ['https://www.googleapis.com/auth/androidpublisher'] });
        // const androidpublisher = google.androidpublisher({ version: 'v3', auth });
        // const res = await androidpublisher.purchases.subscriptions.get({ packageName: 'com.aineetcoach.app', subscriptionId: productId, token: purchaseToken });
        // if (res.data.paymentState === 1) { // Success }
        
        console.log(`[Google Play] Verifying token for user: ${user.id}, product: ${productId}`);
        const isValid = true; // MOCKED
        const expiryTimeMillis = Date.now() + 30 * 24 * 60 * 60 * 1000; // MOCKED 30 days
        const eventId = `play_verify_${purchaseToken}`;

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid Google Play receipt' }, { status: 400 });
        }

        // ==========================================
        // 2. Insert into Subscriptions SSOT
        // ==========================================
        const { error: insertErr } = await supabase.from('subscriptions').insert({
            user_id: user.id,
            plan_tier: productId.includes('premium') ? 'premium' : 'pro',
            billing_source: 'play',
            billing_provider: 'google_play',
            billing_status: 'active',
            external_subscription_id: purchaseToken,
            external_customer_id: user.id,
            provider_event_id: eventId,
            provider_event_type: 'PURCHASE_VERIFICATION',
            provider_payload: { purchaseToken, productId, source: 'app_verification' },
            started_at: new Date().toISOString(),
            expires_at: new Date(expiryTimeMillis).toISOString()
        });

        if (insertErr) {
            if (insertErr.code === '23505') {
                return NextResponse.json({ success: true, message: 'Duplicate safely ignored' });
            }
            throw insertErr;
        }

        return NextResponse.json({ success: true, plan: productId.includes('premium') ? 'premium' : 'pro' });
    } catch (error) {
        console.error('Play Verify Error:', error);
        return NextResponse.json({ error: 'Failed to verify purchase' }, { status: 500 });
    }
}
