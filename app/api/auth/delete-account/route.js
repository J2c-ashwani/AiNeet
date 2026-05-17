import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { safeUpdate } from '@/lib/core/db-safe';

/**
 * Handles the 'Delete Account' request from the frontend.
 * Enforces the Layer 6 'Soft Delete' Tiered Compliance Strategy.
 */
export async function POST(request) {
    try {
        const supabase = await getDb();
        
        // 1. Verify User Session Security
        const decoded = await getUserFromRequest(request);
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = decoded.id;

        // 2. Fetch the user to ensure they haven't already been softly-deleted
        const { data: user, error: fetchErr } = await supabase
            .from('users')
            .select('account_status, subscription_status')
            .eq('id', userId)
            .single();

        if (fetchErr || user.account_status === 'deleted') {
            return NextResponse.json({ error: 'Account already processed' }, { status: 400 });
        }

        // 3. Mark the user as Soft-Deleted and Scrub Basic PII immediately 
        // Note: The physical email scrub and Category B ghost reassignments will happen 
        // in an asynchronous CRON worker to ensure UI responsiveness.
        await safeUpdate('users', { id: userId }, {
            deleted_at: new Date().toISOString(),
            account_status: 'deleted',
            name: 'Deleted User',
            avatar: 'deleted',
            scrubbed_identity: 0
        }, {
            route: '/api/auth/delete-account',
            userId,
        });

        // 4. Force Admin Wipe of Auth Tokens (Logs the user out globally)
        // Note: Edge deployments don't allow auth.admin calls directly via the ANON key if 
        // the Service Role is missing. We log this intention. 
        console.log(`[COMPLIANCE] User ${userId} requested full deletion. Soft boundaries activated. Scheduled for Ghost Sweep.`);

        return NextResponse.json({ success: true, message: "Account successfully disabled and scheduled for PII wiping." });
    } catch (error) {
        console.error('Account Deletion Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
