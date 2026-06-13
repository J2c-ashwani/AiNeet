import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { safeSelect, safeUpdate } from '@/lib/core/db-safe';
import { requireBearerSecret } from '@/lib/server-secrets';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Category B Analytics & Intelligence Tables
const TABLES_TO_ANONYMIZE = [
    'tests', 
    'test_attempts', 
    'user_performance', 
    'user_chapter_progress', 
    'user_topic_mastery', 
    'battles', 
    'mistake_log', 
    'doubt_conversations'
];
const GHOST_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function GET(request) {
    try {
        const authError = requireBearerSecret(request, 'CRON_SECRET');
        if (authError) return authError;

        await getDb();

        const users = await safeSelect('users', query => query
            .select('id')
            .eq('account_status', 'deleted')
            .eq('scrubbed_identity', 0)
            .limit(50), { route: '/api/cron/data-scrub/pending' });

        if (!users || users.length === 0) {
            return NextResponse.json({ success: true, message: 'No users pending cleanup' });
        }

        const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { persistSession: false, autoRefreshToken: false } }
        );
        let processedCount = 0;
        let failedCount = 0;

        for (const user of users) {
            try {
                const hashedEmail = `deleted-${crypto.randomUUID()}@ghost.neetcoach.in`;
                
                await safeUpdate('users', { id: user.id }, {
                    email: hashedEmail,
                    parent_email: null,
                    parent_phone: null,
                    name: 'Deleted User',
                    avatar: 'deleted',
                }, {
                    route: '/api/cron/data-scrub',
                    userId: user.id,
                });

                // B. Reassign Category B Analytics to the Centralized Ghost User
                for (const table of TABLES_TO_ANONYMIZE) {
                    await safeUpdate(table, { user_id: user.id }, { user_id: GHOST_USER_ID }, {
                        route: '/api/cron/data-scrub',
                        userId: user.id,
                    });
                }

                const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(user.id);
                if (authDeleteError && !String(authDeleteError.message).toLowerCase().includes('not found')) {
                    throw authDeleteError;
                }

                await safeUpdate('users', { id: user.id }, {
                    scrubbed_identity: 1,
                }, {
                    route: '/api/cron/data-scrub/complete',
                    userId: user.id,
                });

                processedCount += 1;
            } catch (error) {
                failedCount += 1;
                console.error(`[SCRUB ERROR] Failed mapping for user ${user.id}:`, error);
            }
        }

        if (failedCount > 0) {
            return NextResponse.json({
                success: false,
                processedCount,
                failedCount,
                error: 'One or more deletion jobs failed and remain queued for retry.',
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, processedCount, failedCount });
    } catch (error) {
        console.error('Data Scrub Cron Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
