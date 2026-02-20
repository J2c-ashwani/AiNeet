
export const PLANS = {
    FREE: {
        id: 'free',
        name: 'Free',
        limits: {
            ai_doubts_per_day: 5,
            ai_tests_per_month: 5,
            ncert_explanations_per_month: 10,
            priority_support: false,
            ads_enabled: true
        },
        price: 0
    },
    PRO: {
        id: 'pro',
        name: 'Pro',
        limits: {
            ai_doubts_per_day: 50, // "Unlimited" for practical purposes or high cap
            ai_tests_per_month: 20,
            ncert_explanations_per_month: 30,
            priority_support: false,
            ads_enabled: false
        },
        price: 199
    },
    PREMIUM: {
        id: 'premium',
        name: 'Premium',
        limits: {
            ai_doubts_per_day: 200,
            ai_tests_per_month: 100,
            ncert_explanations_per_month: 9999, // Truly unlimited
            vision_enabled: true,
            priority_support: true,
            ads_enabled: false
        },
        price: 399
    }
};

export const DEFAULT_PLAN = PLANS.FREE;

export function getPlan(tier) {
    return PLANS[tier?.toUpperCase()] || DEFAULT_PLAN;
}
