import { getDb } from './core/db';
import { safeInsert, safeUpdate } from './core/db-safe';
import { getPlan } from './plans';

export const UsageTracker = {

    async getUsage(userId) {
        const supabase = await getDb();
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
            try {
                await safeInsert('user_usage', newUsage, {
                    route: 'usage/getUsage',
                    userId,
                });
                return newUsage;
            } catch (err) {
                const isDuplicateKey = 
                    err.originalError?.code === '23505' ||
                    err.context?.dbCode === '23505' ||
                    err.code === '23505' ||
                    (err.message && (err.message.includes('23505') || err.message.includes('duplicate key') || err.message.includes('unique constraint') || err.message.includes('unique_constraint')));
                
                if (isDuplicateKey) {
                    const { data: existing } = await supabase.from('user_usage').select('*').eq('user_id', userId).eq('month', month).maybeSingle();
                    if (existing) return existing;
                }
                throw err;
            }
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

    async incrementUsage(userId, feature, inputTokens = 0, outputTokens = 0) {
        const supabase = await getDb();

        // 1. Increment feature-specific usages (Test/Doubt counts)
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
                await safeUpdate('user_usage', { user_id: userId, month }, {
                    [column]: data[column] + 1
                }, {
                    route: 'usage/incrementUsage',
                    userId,
                });
            }
        }

        // 2. Increment exact AI Tokens locally combining input & output
        if (inputTokens > 0 || outputTokens > 0) {
            try {
                // Call the CTO-mandated RPC
                await supabase.rpc('increment_token_usage', {
                    target_user_id: userId,
                    tokens_in: inputTokens,
                    tokens_out: outputTokens
                });
            } catch (e) {
                console.error("Token RPC Update Failed:", e);
            }
        }
    }
};
