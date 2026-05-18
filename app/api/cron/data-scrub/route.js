import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { safeUpdate } from '@/lib/core/db-safe';
import { requireBearerSecret } from '@/lib/server-secrets';
import { createClient } from '@supabase/supabase-js';

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

        const supabase = await getDb();

        // 1. Find all soft-deleted users pending scrub
        const { data: users, error: fetchErr } = await supabase
            .from('users')
            .select('id, email')
            .eq('account_status', 'deleted')
            .eq('scrubbed_identity', 0)
            .limit(50); // batch size

        if (fetchErr || !users || users.length === 0) {
            return NextResponse.json({ success: true, message: 'No users pending cleanup' });
        }

        console.log(`🧹 CRON DATA-SCRUB: Found ${users.length} soft-deleted users.`);

        for (const user of users) {
             console.log(`[SCRUB] Processing user: ${user.id}`);
             
             try {
                // A. Anonymize identity (convert email to unreadable hash)
                const hashedEmail = `deleted-${Math.random().toString(36).substring(7)}@ghost.neetcoach.in`;
                
                await safeUpdate('users', { id: user.id }, {
                    email: hashedEmail,
                    parent_email: null,
                    parent_phone: null,
                    scrubbed_identity: 1
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
                
                // C. Force Supabase Auth wipe (The ultimate disconnect)
                // Need Service Role Key for Admin privileges
                if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
                    const adminClient = createClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL,
                        process.env.SUPABASE_SERVICE_ROLE_KEY
                    );
                    await adminClient.auth.admin.deleteUser(user.id).catch(e => console.warn('Auth admin wipe skipped/failed:', e.message));
                }
                
                console.log(`[SCRUB SUCCESS] Identity completely stripped and analytics archived for ${user.id}`);
             } catch(err) {
                 console.error(`[SCRUB ERROR] Failed mapping for user ${user.id}:`, err);
             }
        }

        return NextResponse.json({ success: true, processedCount: users.length });
    } catch (error) {
        console.error('Data Scrub Cron Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
