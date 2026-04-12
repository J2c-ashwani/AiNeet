/**
 * Adaptive Trust Scoring Engine v2
 * 
 * MD Safeguards Applied:
 * 1. BANNED tier → degraded experience, NOT full lockout
 * 2. Trust recovery via positive actions (tests, streaks)
 * 3. Hard ceiling caps per plan (even trusted users can't exceed)
 * 4. Soft transparency hints so users understand throttling
 */

const TRUST_TIERS = {
    TRUSTED: { min: 80, xpMultiplier: 1.2, tokenMultiplier: 1.5, dailyTestCap: 20, label: 'Trusted' },
    NORMAL:  { min: 50, xpMultiplier: 1.0, tokenMultiplier: 1.0, dailyTestCap: 10, label: 'Normal'  },
    WARNING: { min: 20, xpMultiplier: 0.5, tokenMultiplier: 0.5, dailyTestCap: 5,  label: 'Warning' },
    RESTRICTED: { min: 0, xpMultiplier: 0.1, tokenMultiplier: 0.25, dailyTestCap: 2, label: 'Restricted' },
};

// MD Mandate: Hard plan ceilings that trust can NEVER exceed
const HARD_CEILINGS = {
    free: 4500,   // Even a trusted free user can't exceed 3000 * 1.5 = 4500
    paid: 30000,  // Even a trusted paid user can't exceed 20000 * 1.5 = 30000
};

export function getUserTrustTier(trustScore = 100) {
    const score = Math.max(0, Math.min(100, trustScore));

    if (score >= TRUST_TIERS.TRUSTED.min)    return { ...TRUST_TIERS.TRUSTED, score };
    if (score >= TRUST_TIERS.NORMAL.min)     return { ...TRUST_TIERS.NORMAL, score };
    if (score >= TRUST_TIERS.WARNING.min)    return { ...TRUST_TIERS.WARNING, score };
    return { ...TRUST_TIERS.RESTRICTED, score };
}

/**
 * Adjusts token limits dynamically based on trust AND plan tier.
 * Enforces a hard ceiling that trust multipliers cannot exceed.
 */
export function getEffectiveTokenLimit(basePlanLimit, trustScore = 100, planKey = 'free') {
    const tier = getUserTrustTier(trustScore);
    const adjustedLimit = Math.floor(basePlanLimit * tier.tokenMultiplier);
    const ceiling = HARD_CEILINGS[planKey] || HARD_CEILINGS.free;
    return Math.min(adjustedLimit, ceiling);
}

/**
 * Adjusts XP earned per test based on behavioral reputation.
 */
export function applyTrustXpModifier(rawXp, trustScore = 100) {
    const tier = getUserTrustTier(trustScore);
    return Math.floor(rawXp * tier.xpMultiplier);
}

/**
 * Returns a user-facing transparency message if trust is affecting their experience.
 * MD Mandate: Users should understand WHY limits feel different.
 */
export function getTrustHint(trustScore = 100) {
    const tier = getUserTrustTier(trustScore);
    
    if (tier.label === 'Restricted') {
        return {
            show: true,
            severity: 'error',
            message: 'Your account has temporary restrictions due to unusual activity patterns. Complete tests normally to restore full access.',
        };
    }
    if (tier.label === 'Warning') {
        return {
            show: true,
            severity: 'warning',
            message: 'Some features are running in limited mode. Continue regular practice to unlock full benefits.',
        };
    }
    if (tier.label === 'Trusted') {
        return {
            show: true,
            severity: 'success',
            message: 'You have earned Trusted Student status! Enjoy bonus XP and extended AI access.',
        };
    }
    return { show: false };
}

// ─── Trust Recovery System ───────────────────────────────────────────────────

/**
 * Calculates trust recovery points to award after positive user actions.
 * 
 * Recovery Model:
 *   +2  → Normal test completion (genuine engagement)
 *   +5  → Maintaining a 3+ day streak (consistency signal)
 *   +1  → Doubt asked & answered (using the platform as intended)
 *   
 * Cap: Trust never exceeds 100
 */
export function calculateTrustRecovery(action, currentTrust = 100) {
    if (currentTrust >= 100) return 0;

    const RECOVERY_MAP = {
        test_completed: 2,
        streak_maintained: 5,
        doubt_resolved: 1,
    };

    const recovery = RECOVERY_MAP[action] || 0;
    // Don't overshoot 100
    return Math.min(recovery, 100 - currentTrust);
}
