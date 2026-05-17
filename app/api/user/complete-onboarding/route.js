import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/core/auth';
import { safeUpdate } from '@/lib/core/db-safe';

/**
 * Mark onboarding as completed for the authenticated user.
 * SSOT: stored in users table, not just localStorage.
 */
export async function POST(request) {
    try {
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        await safeUpdate('users', { id: decoded.id }, { onboarding_completed: true }, {
            route: '/api/user/complete-onboarding',
            userId: decoded.id,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Onboarding complete error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
