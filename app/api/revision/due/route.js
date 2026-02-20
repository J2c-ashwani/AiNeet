
import { NextResponse } from 'next/server';
import { getDueReviews } from '@/lib/spaced_repetition';
import { getUserFromRequest } from '@/lib/auth';
import { checkUsageLimit } from '@/lib/plan_gate';

export async function GET(request) {
    try {
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const reviews = await getDueReviews(decoded.id);

        // Plan gate: limit revision cards per day based on tier
        const usage = await checkUsageLimit(decoded.id, 'revision_cards_per_day', 0);
        const limitedReviews = (reviews || []).slice(0, usage.limit || 5);

        return NextResponse.json({
            reviews: limitedReviews,
            total: (reviews || []).length,
            limit: usage.limit,
            tier: usage.tier,
            isLimited: (reviews || []).length > limitedReviews.length,
        });
    } catch (error) {
        console.error('Revision Due Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
