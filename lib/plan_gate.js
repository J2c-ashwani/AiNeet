
import { NextResponse } from 'next/server';
import { getDb } from './db';
import { getPlan, getFeatureLimit } from './plans';

/**
 * Check if a user's plan allows access to a boolean feature
 * Returns null if allowed, or a NextResponse error if blocked
 * 
 * @param {string} userId - User ID
 * @param {string} feature - Feature key (e.g. 'battleground_enabled', 'parent_connect_enabled')
 * @param {string} upgradeTo - Which plan to suggest ('pro' or 'premium')
 * @returns {NextResponse|null} - null if allowed, error response if blocked
 */
export async function checkFeatureAccess(userId, feature, upgradeTo = 'pro') {
    const db = getDb();
    const user = await db.get(
        'SELECT subscription_tier, subscription_status, subscription_expiry FROM users WHERE id = ?',
        [userId]
    );

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if subscription is expired
    let effectiveTier = user.subscription_tier || 'free';
    if (effectiveTier !== 'free' && user.subscription_expiry) {
        const expiry = new Date(user.subscription_expiry);
        if (expiry < new Date()) {
            effectiveTier = 'free'; // Expired — treat as free
        }
    }

    const allowed = getFeatureLimit(effectiveTier, feature);

    if (!allowed) {
        const planNames = { pro: 'Pro (₹199/mo)', premium: 'Premium (₹399/mo)' };
        return NextResponse.json({
            error: 'Feature locked',
            locked: true,
            feature: feature,
            currentPlan: effectiveTier,
            requiredPlan: upgradeTo,
            message: `This feature requires ${planNames[upgradeTo] || 'an upgrade'}. Upgrade to unlock!`,
        }, { status: 403 });
    }

    return null; // Allowed
}

/**
 * Check if a user has exceeded their daily/monthly usage limit for a counted feature
 * Returns { allowed: boolean, used: number, limit: number, remaining: number }
 * 
 * @param {string} userId - User ID
 * @param {string} feature - Feature key (e.g. 'challenges_per_day', 'revision_cards_per_day')
 * @param {string} usageTable - Name of the table/field to count usage from
 * @param {string} period - 'day' or 'month'
 * @returns {{ allowed: boolean, used: number, limit: number, remaining: number, tier: string }}
 */
export async function checkUsageLimit(userId, feature, currentUsage = 0) {
    const db = getDb();
    const user = await db.get(
        'SELECT subscription_tier, subscription_expiry FROM users WHERE id = ?',
        [userId]
    );

    let effectiveTier = user?.subscription_tier || 'free';
    if (effectiveTier !== 'free' && user.subscription_expiry) {
        const expiry = new Date(user.subscription_expiry);
        if (expiry < new Date()) effectiveTier = 'free';
    }

    const limit = getFeatureLimit(effectiveTier, feature);

    if (typeof limit !== 'number') {
        return { allowed: !!limit, used: currentUsage, limit: 0, remaining: 0, tier: effectiveTier };
    }

    const remaining = Math.max(0, limit - currentUsage);

    return {
        allowed: currentUsage < limit,
        used: currentUsage,
        limit,
        remaining,
        tier: effectiveTier,
    };
}
