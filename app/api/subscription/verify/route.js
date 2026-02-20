
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
        const planId = sanitizeString(body.planId || '', 128);

        if (!orderId || !planId) {
            return NextResponse.json({ error: 'Missing required fields (orderId, planId)' }, { status: 400 });
        }

        // 3. Verify Payment with Cashfree (fetch order status)
        const verification = await PaymentService.verifyPayment(orderId);

        if (!verification.isPaid) {
            // Update payment status to failed
            await db.run(
                `UPDATE payments SET status = 'failed' WHERE provider_order_id = ?`,
                [orderId]
            );
            return NextResponse.json({
                error: 'Payment not completed',
                orderStatus: verification.orderStatus
            }, { status: 400 });
        }

        // 4. Calculate Expiry
        const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);
        const durationDays = plan ? plan.duration_days : 30;

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + durationDays);
        const expiryIso = expiryDate.toISOString();

        // 5. Upgrade User Subscription
        await db.run(
            `UPDATE users 
             SET subscription_tier = 'pro', 
                 subscription_status = 'active', 
                 subscription_expiry = ? 
             WHERE id = ?`,
            [expiryIso, decoded.id]
        );

        // 6. Update Payment Status
        await db.run(
            `UPDATE payments 
             SET status = 'completed', 
                 provider_payment_id = ? 
             WHERE provider_order_id = ?`,
            [verification.cfOrderId || orderId, orderId]
        );

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
