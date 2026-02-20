
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Cashfree API Configuration
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_API_VERSION = '2023-08-01';

// Use production URL if the secret key contains '_prod_', otherwise sandbox
const isProduction = CASHFREE_SECRET_KEY?.includes('_prod_') || process.env.NODE_ENV === 'production';
const CASHFREE_BASE_URL = isProduction
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

/**
 * Cashfree Payment Service
 * Handles order creation, payment verification, and webhook signature validation
 */
export const PaymentService = {

    /**
     * Create a Cashfree order
     * @param {number} amount - Amount in INR
     * @param {string} currency - Currency code (default: INR)
     * @param {object} customer - { id, email, phone, name }
     * @param {string} planId - Plan identifier for reference
     * @returns {object} { orderId, paymentSessionId, orderStatus }
     */
    async createOrder(amount, currency = 'INR', customer = {}, planId = '') {
        // If Cashfree is not configured, return mock
        if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
            console.warn('⚠️ Cashfree not configured — using mock payment');
            return {
                orderId: `mock_order_${uuidv4().slice(0, 8)}`,
                paymentSessionId: `mock_session_${uuidv4().slice(0, 8)}`,
                orderStatus: 'ACTIVE',
                isMock: true,
            };
        }

        const orderId = `neet_${uuidv4().replace(/-/g, '').slice(0, 20)}`;

        const orderPayload = {
            order_id: orderId,
            order_amount: amount,
            order_currency: currency,
            customer_details: {
                customer_id: customer.id || `cust_${uuidv4().slice(0, 8)}`,
                customer_email: customer.email || 'student@neetcoach.in',
                customer_phone: customer.phone || '9999999999',
                customer_name: customer.name || 'NEET Student',
            },
            order_meta: {
                return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?payment=success&order_id={order_id}`,
                payment_methods: 'cc,dc,upi,nb,wallet',
            },
            order_note: `NEET Coach ${planId} Subscription`,
            order_tags: {
                plan_id: planId,
                source: 'neet-coach-app',
            },
        };

        try {
            const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-version': CASHFREE_API_VERSION,
                    'x-client-id': CASHFREE_APP_ID,
                    'x-client-secret': CASHFREE_SECRET_KEY,
                },
                body: JSON.stringify(orderPayload),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Cashfree create order error:', data);
                throw new Error(data.message || 'Failed to create Cashfree order');
            }

            return {
                orderId: data.order_id,
                cfOrderId: data.cf_order_id,
                paymentSessionId: data.payment_session_id,
                orderStatus: data.order_status,
                orderAmount: data.order_amount,
                isMock: false,
            };
        } catch (err) {
            console.error('Cashfree API error:', err.message);
            throw err;
        }
    },

    /**
     * Verify payment by fetching order status from Cashfree
     * @param {string} orderId - The order ID to verify
     * @returns {object} { isPaid, orderStatus, paymentDetails }
     */
    async verifyPayment(orderId) {
        // Mock mode
        if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
            console.warn('⚠️ Cashfree not configured — mock verify (always true)');
            return { isPaid: true, orderStatus: 'PAID', isMock: true };
        }

        try {
            const response = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
                method: 'GET',
                headers: {
                    'x-api-version': CASHFREE_API_VERSION,
                    'x-client-id': CASHFREE_APP_ID,
                    'x-client-secret': CASHFREE_SECRET_KEY,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Cashfree verify error:', data);
                return { isPaid: false, orderStatus: 'UNKNOWN', error: data.message };
            }

            return {
                isPaid: data.order_status === 'PAID',
                orderStatus: data.order_status,
                orderAmount: data.order_amount,
                cfOrderId: data.cf_order_id,
                paymentDetails: data.payment_group || null,
                isMock: false,
            };
        } catch (err) {
            console.error('Cashfree verify API error:', err.message);
            return { isPaid: false, orderStatus: 'ERROR', error: err.message };
        }
    },

    /**
     * Verify webhook signature from Cashfree
     * Use this in your webhook endpoint to ensure the request is from Cashfree
     * @param {string} rawBody - Raw request body as string
     * @param {string} timestamp - x-cashfree-timestamp header
     * @param {string} signature - x-cashfree-signature header
     * @returns {boolean}
     */
    verifyWebhookSignature(rawBody, timestamp, signature) {
        if (!CASHFREE_SECRET_KEY) return false;

        const data = timestamp + rawBody;
        const expectedSignature = crypto
            .createHmac('sha256', CASHFREE_SECRET_KEY)
            .update(data)
            .digest('base64');

        return expectedSignature === signature;
    },
};

// ─── Plan Configuration ───
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
