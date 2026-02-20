
export const PLANS = {
    FREE: {
        id: 'free',
        name: 'Free',
        limits: {
            ai_doubts_per_day: 5,
            ai_tests_per_month: 5,
            ncert_explanations_per_month: 10,
            challenges_per_day: 3,
            revision_cards_per_day: 5,
            battleground_enabled: false,
            parent_connect_enabled: false,
            pdf_export_enabled: false,
            vision_enabled: false,
            priority_support: false,
            ads_enabled: true
        },
        price: 0
    },
    PRO: {
        id: 'pro',
        name: 'Pro',
        limits: {
            ai_doubts_per_day: 50,
            ai_tests_per_month: 20,
            ncert_explanations_per_month: 30,
            challenges_per_day: 999,
            revision_cards_per_day: 30,
            battleground_enabled: true,
            parent_connect_enabled: false,
            pdf_export_enabled: true,
            vision_enabled: false,
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
            ncert_explanations_per_month: 9999,
            challenges_per_day: 999,
            revision_cards_per_day: 999,
            battleground_enabled: true,
            parent_connect_enabled: true,
            pdf_export_enabled: true,
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

/**
 * Check if a specific feature is enabled for a plan tier
 * @param {string} tier - 'free', 'pro', or 'premium'
 * @param {string} feature - Feature key from limits (e.g. 'battleground_enabled')
 * @returns {boolean|number}
 */
export function getFeatureLimit(tier, feature) {
    const plan = getPlan(tier);
    return plan.limits[feature] ?? false;
}
