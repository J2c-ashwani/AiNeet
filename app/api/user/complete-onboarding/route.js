import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';

/**
 * Mark onboarding as completed for the authenticated user.
 * SSOT: stored in users table, not just localStorage.
 */
export async function POST(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        await supabase
            .from('users')
            .update({ onboarding_completed: true })
            .eq('id', decoded.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Onboarding complete error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
