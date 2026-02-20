
import { v4 as uuidv4 } from 'uuid';

// Mock Payment Service (Replace with Razorpay/Stripe SDK in production)
export const PaymentService = {

    // Create an order
    async createOrder(amount, currency = 'INR') {
        // In production: await razorpay.orders.create({ ... })

        // Mock response
        return {
            id: `order_${uuidv4()}`,
            amount: amount,
            currency: currency,
            status: 'created'
        };
    },

    // Verify payment signature
    async verifyPayment(paymentId, orderId, signature) {
        // In production: crypto.hmac... verify signature
        // For now, accept everything
        return true;
    }
};

import { PLANS } from './plans';

export const SUBSCRIPTION_PLANS = {
    PRO: {
        id: PLANS.PRO.id,
        name: PLANS.PRO.name,
        amount: PLANS.PRO.price,
        duration_days: 30
    },
    PREMIUM: {
        id: PLANS.PREMIUM.id,
        name: PLANS.PREMIUM.name,
        amount: PLANS.PREMIUM.price,
        duration_days: 30
    }
};
