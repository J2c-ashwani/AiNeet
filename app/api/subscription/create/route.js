
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

        // 3. Create Order via Payment Service
        const order = await PaymentService.createOrder(plan.amount);

        // 4. Log intent in Payments table
        // We use 'mock_provider_payment_id' for now since we don't have a real one yet
        await db.run(
            `INSERT INTO payments (id, user_id, amount, currency, status, provider_order_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), decoded.id, plan.amount, 'INR', 'pending', order.id]
        );

        return NextResponse.json({
            orderId: order.id,
            amount: plan.amount,
            currency: 'INR',
            key: process.env.RAZORPAY_KEY_ID || 'mock_key'
        });

    } catch (error) {
        console.error('Subscription Create Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
