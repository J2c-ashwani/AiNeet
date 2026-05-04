import { createSupabaseServerClient } from '@/utils/supabase/server';

/**
 * Single Source of Truth for User Entitlement.
 * Queries the 'subscriptions' event log to determine the current active state.
 * 
 * @param {string} userId - The user's UUID
 * @returns {Promise<{
 *   is_premium: boolean,
 *   current_plan: string,
 *   active_status: string,
 *   billing_source: string | null,
 *   renews_at: string | null,
 *   expires_at: string | null
 * }>}
 */
export async function getUserEntitlement(userId) {
    if (!userId) {
        return { is_premium: false, current_plan: 'free', active_status: 'free', billing_source: null, renews_at: null, expires_at: null };
    }

    try {
        const supabase = await createSupabaseServerClient();
        
        // Fetch the latest subscription event for the user
        const { data: sub, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !sub) {
            // No history = Free tier
            return {
                is_premium: false,
                current_plan: 'free',
                active_status: 'free',
                billing_source: null,
                renews_at: null,
                expires_at: null
            };
        }

        const now = new Date();
        const expiresAt = sub.expires_at ? new Date(sub.expires_at) : null;

        let isPremium = false;
        let activeStatus = sub.billing_status;

        // Determine actual access based on status and expiry
        if (sub.billing_status === 'active' || sub.billing_status === 'grace') {
            isPremium = true;
        } else if (sub.billing_status === 'canceled') {
            // If canceled but hasn't expired yet, they retain access
            if (expiresAt && expiresAt > now) {
                isPremium = true;
            } else {
                activeStatus = 'expired'; // Virtual state transition based on time
            }
        }

        return {
            is_premium: isPremium,
            current_plan: isPremium ? sub.plan_tier : 'free',
            active_status: activeStatus,
            billing_source: sub.billing_source,
            renews_at: sub.renews_at,
            expires_at: sub.expires_at
        };

    } catch (err) {
        console.error('Error fetching user entitlement:', err);
        // Fail closed for security
        return { is_premium: false, current_plan: 'free', active_status: 'free', billing_source: null, renews_at: null, expires_at: null };
    }
}
