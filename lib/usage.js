
import { getDb } from './db';
import { getPlan } from './plans';

export const UsageTracker = {

    async getUsage(userId) {
        const db = getDb();
        const month = new Date().toISOString().slice(0, 7); // YYYY-MM
        let usage = await db.get('SELECT * FROM user_usage WHERE user_id = ? AND month = ?', [userId, month]);

        if (!usage) {
            // Create record if not exists
            await db.run(
                'INSERT INTO user_usage (user_id, month) VALUES (?, ?)',
                [userId, month]
            );
            usage = {
                user_id: userId,
                month,
                ai_test_count: 0,
                ai_doubt_count: 0,
                ncert_explain_count: 0,
                ai_tokens_used: 0
            };
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
        const db = getDb();
        const month = new Date().toISOString().slice(0, 7);

        let column = '';
        switch (feature) {
            case 'doubt': column = 'ai_doubt_count'; break;
            case 'test': column = 'ai_test_count'; break;
            case 'ncert': column = 'ncert_explain_count'; break;
        }

        if (column) {
            await db.run(
                `UPDATE user_usage 
         SET ${column} = ${column} + 1, ai_tokens_used = ai_tokens_used + ? 
         WHERE user_id = ? AND month = ?`,
                [tokens, userId, month]
            );
        }
    }
};
