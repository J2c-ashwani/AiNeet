
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { PaymentService, SUBSCRIPTION_PLANS } from '@/lib/payment_service';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase } from '@/lib/schema';

export async function POST(request) {
    try {
        await initializeDatabase();
        const db = getDb();

        // 1. Auth Check
        const decoded = await getUserFromRequest(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Request
        const { planId } = await request.json();
        const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);

        if (!plan) {
            return NextResponse.json({ error: 'Invalid Plan ID' }, { status: 400 });
        }

        // 3. Get user details for Cashfree customer info
        const user = await db.get('SELECT id, name, email FROM users WHERE id = ?', [decoded.id]);

        // 4. Create Order via Cashfree
        const order = await PaymentService.createOrder(
            plan.amount,
            'INR',
            {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: '9999999999', // We don't collect phone at registration yet
            },
            planId
        );

        // 5. Log payment intent in DB
        const paymentId = uuidv4();
        await db.run(
            `INSERT INTO payments (id, user_id, amount, currency, status, provider_order_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [paymentId, decoded.id, plan.amount, 'INR', 'pending', order.orderId]
        );

        // 6. Return Cashfree session details to frontend
        return NextResponse.json({
            orderId: order.orderId,
            paymentSessionId: order.paymentSessionId,
            cfOrderId: order.cfOrderId,
            amount: plan.amount,
            currency: 'INR',
            planId: planId,
            environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
            isMock: order.isMock || false,
        });

    } catch (error) {
        console.error('Subscription Create Error:', error);
        return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
    }
}
