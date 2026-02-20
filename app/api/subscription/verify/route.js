
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { PaymentService, SUBSCRIPTION_PLANS } from '@/lib/payment_service';
import { initializeDatabase } from '@/lib/schema';
import { sanitizeString } from '@/lib/validate';

export async function POST(request) {
    try {
        await initializeDatabase();
        const db = getDb();

        // 1. Auth Check
        const decoded = await getUserFromRequest(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse & Sanitize Request
        const body = await request.json();
        const orderId = sanitizeString(body.orderId || '', 256);
        const paymentId = sanitizeString(body.paymentId || '', 256);
        const signature = sanitizeString(body.signature || '', 512);
        const planId = sanitizeString(body.planId || '', 128);

        if (!orderId || !paymentId || !signature || !planId) {
            return NextResponse.json({ error: 'Missing required payment fields (orderId, paymentId, signature, planId)' }, { status: 400 });
        }

        // 3. Verify Payment
        const isValid = await PaymentService.verifyPayment(paymentId, orderId, signature);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid Payment Signature' }, { status: 400 });
        }

        // 4. Calculate Expiry
        const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);
        const durationDays = plan ? plan.duration_days : 30; // Default to 30 if plan missing (shouldn't happen)

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + durationDays);
        const expiryIso = expiryDate.toISOString();

        // 5. Update User Subscription (Transaction suggested here in prod)
        // Set user to 'pro'
        await db.run(
            `UPDATE users 
             SET subscription_tier = 'pro', 
                 subscription_status = 'active', 
                 subscription_expiry = ? 
             WHERE id = ?`,
            [expiryIso, decoded.id]
        );

        // 6. Update Payment Status
        // Note: Ideally we find the payment by order_id. 
        // For sync simplicity, we assume the latest pending or we just insert a completion record if needed.
        // Let's update the payment entry we created in /create
        await db.run(
            `UPDATE payments 
             SET status = 'completed', 
                 provider_payment_id = ? 
             WHERE provider_order_id = ?`,
            [paymentId, orderId]
        );

        return NextResponse.json({ success: true, expiry: expiryIso });

    } catch (error) {
        console.error('Subscription Verify Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
