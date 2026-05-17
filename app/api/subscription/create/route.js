
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { PaymentService, SUBSCRIPTION_PLANS } from '@/lib/payment_service';
import { randomUUID } from 'crypto';
import { rateLimit } from '@/lib/rate-limit';
import { safeInsert } from '@/lib/core/db-safe';
import { logPaymentTimeline } from '@/lib/core/payment-timeline';

export async function POST(request) {
    try {
        const supabase = await getDb();

        // 1. Auth Check
        const decoded = await getUserFromRequest(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limit: 5 payment attempts per 5 minutes (fraud prevention)
        const rl = await rateLimit(`user:${decoded.id}:payment`, 5, 300000, 'closed');
        if (!rl.success) {
            return NextResponse.json({ error: 'Too many payment attempts. Please wait.', retryAfter: Math.ceil((rl.reset - Date.now()) / 1000) }, { status: 429 });
        }

        // 2. Parse Request
        let _body;
        try { _body = await request.json(); } catch (parseErr) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }
        const { planId } = _body;
        const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);

        if (!plan) {
            return NextResponse.json({ error: 'Invalid Plan ID' }, { status: 400 });
        }

        // 3. Get user details for Cashfree customer info
        const { data: user } = await supabase.from('users').select('id, name, email').eq('id', decoded.id).single();

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
        const paymentId = randomUUID();
        await safeInsert('payments', {
            id: paymentId,
            user_id: decoded.id,
            amount: plan.amount,
            currency: 'INR',
            status: 'pending',
            provider_order_id: order.orderId
        }, { route: '/api/subscription/create', userId: decoded.id });

        await logPaymentTimeline({
            paymentId,
            userId: decoded.id,
            provider: 'cashfree',
            requestId: order.orderId,
            sourceRoute: '/api/subscription/create',
            status: 'initiated',
            metadata: { amount: plan.amount, planId }
        });

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
        return NextResponse.json({
            error: 'Failed to create payment order. Please try again in a moment.'
        }, { status: 500 });
    }
}
