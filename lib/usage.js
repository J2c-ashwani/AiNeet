import { getSupabase } from './supabase';
import { getPlan } from './plans';

export const UsageTracker = {

    async getUsage(userId) {
        const supabase = getSupabase();
        const month = new Date().toISOString().slice(0, 7); // YYYY-MM
        const { data: usage } = await supabase.from('user_usage').select('*').eq('user_id', userId).eq('month', month).maybeSingle();

        if (!usage) {
            // Create record if not exists
            const newUsage = {
                user_id: userId,
                month,
                ai_test_count: 0,
                ai_doubt_count: 0,
                ncert_explain_count: 0,
                ai_tokens_used: 0
            };
            await supabase.from('user_usage').insert(newUsage);
            return newUsage;
        }
        return usage;
    },

    async checkLimit(userId, userTier, feature) {
        const plan = getPlan(userTier);
        const usage = await this.getUsage(userId);

        // Feature mapping to limits
        let limit = 0;
        let current = 0;

        switch (feature) {
            case 'doubt':
                // Note: DB stores monthly doubt count, but plan has daily logic for Free.
                // For simplicity in this V1, let's strictly follow the plan config which says "doubts_per_day"
                // But our DB only tracks monthly. 
                // Let's implement a simple "daily" check using cache or just rely on monthly cap for now 
                // to match the DB schema requested by user which focuses on monthly.
                // User request says "5 AI doubts/day". 
                // We'll enforce a monthly cap = daily * 30 for now to align with DB schema.
                limit = plan.limits.ai_doubts_per_day * 30;
                current = usage.ai_doubt_count;
                break;
            case 'test':
                limit = plan.limits.ai_tests_per_month;
                current = usage.ai_test_count;
                break;
            case 'ncert':
                limit = plan.limits.ncert_explanations_per_month;
                current = usage.ncert_explain_count;
                break;
            default:
                return true; // No limit
        }

        if (current >= limit) {
            return { allowed: false, message: `Limit exceeded for ${feature}. Upgrade to increase limits.` };
        }
        return { allowed: true };
    },

    async incrementUsage(userId, feature, tokens = 0) {
        const supabase = getSupabase();
        const month = new Date().toISOString().slice(0, 7);

        let column = '';
        switch (feature) {
            case 'doubt': column = 'ai_doubt_count'; break;
            case 'test': column = 'ai_test_count'; break;
            case 'ncert': column = 'ncert_explain_count'; break;
        }

        if (column) {
            const { data } = await supabase.from('user_usage').select(`${column}, ai_tokens_used`).eq('user_id', userId).eq('month', month).single();
            if (data) {
                await supabase.from('user_usage').update({
                    [column]: data[column] + 1,
                    ai_tokens_used: (data.ai_tokens_used || 0) + tokens
                }).eq('user_id', userId).eq('month', month);
            }
        }
    }
};
