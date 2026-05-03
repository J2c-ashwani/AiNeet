/**
 * /api/admin/retention — D1 Return Rate Tracker
 *
 * MD Mandate: "Return within 24 hours" is the real launch signal.
 * Measures % of users who complete one core action on Day 0 and
 * return on Day 1. Broken down by action type: diagnostic, practice, doubt.
 *
 * Protected by CRON_SECRET for internal use only.
 * Hit this endpoint every morning to get previous day's D1 return rate.
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
    // Internal-only — validate CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;
    if (!secret || authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = await getDb();

        // Window: users who signed up in the last 7 days
        const windowStart = new Date();
        windowStart.setDate(windowStart.getDate() - 7);

        // 1. Get all users created in the last 7 days
        const { data: newUsers, error: usersErr } = await supabase
            .from('users')
            .select('id, created_at')
            .gte('created_at', windowStart.toISOString())
            .order('created_at', { ascending: false });

        if (usersErr) throw usersErr;

        if (!newUsers || newUsers.length === 0) {
            return NextResponse.json({ message: 'No new users in window', d1ReturnRate: null });
        }

        const userIds = newUsers.map(u => u.id);
        const signupDayMap = {}; // userId -> signup date string (YYYY-MM-DD)
        newUsers.forEach(u => {
            signupDayMap[u.id] = u.created_at.split('T')[0];
        });

        // 2. Get all test activity for these users
        const { data: testActivity } = await supabase
            .from('tests')
            .select('user_id, completed_at')
            .in('user_id', userIds)
            .not('completed_at', 'is', null);

        // 3. Get all doubt activity for these users
        const { data: doubtActivity } = await supabase
            .from('doubt_messages')
            .select('conversation_id, created_at, doubt_conversations(user_id)')
            .filter('doubt_conversations.user_id', 'in', `(${userIds.map(id => `'${id}'`).join(',')})`)
            .eq('role', 'user');

        // 4. Build activity map: userId -> Set of active dates
        const activityByUser = {};
        userIds.forEach(id => { activityByUser[id] = new Set(); });

        (testActivity || []).forEach(t => {
            if (t.user_id && t.completed_at) {
                const date = t.completed_at.split('T')[0];
                activityByUser[t.user_id]?.add(date);
            }
        });

        (doubtActivity || []).forEach(d => {
            const userId = d.doubt_conversations?.user_id;
            if (userId && d.created_at) {
                const date = d.created_at.split('T')[0];
                activityByUser[userId]?.add(date);
            }
        });

        // 5. Calculate D1 return rate
        // A user "returned on D1" if they have activity on signupDay AND signupDay+1
        let activeOnD0 = 0;
        let returnedOnD1 = 0;
        const returnDetails = [];

        newUsers.forEach(user => {
            const d0 = signupDayMap[user.id];
            const d1 = new Date(d0);
            d1.setDate(d1.getDate() + 1);
            const d1Str = d1.toISOString().split('T')[0];

            const activeDates = activityByUser[user.id] || new Set();
            const hadD0Action = activeDates.has(d0);
            const returnedD1 = activeDates.has(d1Str);

            if (hadD0Action) {
                activeOnD0++;
                if (returnedD1) {
                    returnedOnD1++;
                    returnDetails.push({ userId: user.id, signupDate: d0, returnDate: d1Str });
                }
            }
        });

        const d1ReturnRate = activeOnD0 > 0
            ? Math.round((returnedOnD1 / activeOnD0) * 100)
            : null;

        // 6. Break down by action type (diagnostic vs practice vs doubt)
        const diagnosticUsers = new Set(
            (testActivity || [])
                .filter(t => t.completed_at)
                .map(t => t.user_id)
        );
        const doubtUsers = new Set(
            (doubtActivity || [])
                .filter(d => d.doubt_conversations?.user_id)
                .map(d => d.doubt_conversations.user_id)
        );

        return NextResponse.json({
            window: '7 days',
            windowStart: windowStart.toISOString().split('T')[0],
            totalNewUsers: newUsers.length,
            usersActiveOnD0: activeOnD0,
            usersReturnedOnD1: returnedOnD1,
            d1ReturnRate: d1ReturnRate !== null ? `${d1ReturnRate}%` : 'insufficient data',
            breakdown: {
                diagnosticCompleters: diagnosticUsers.size,
                doubtUsers: doubtUsers.size,
            },
            // MD target: at least 1 voluntary D1 return proves product pull
            targetMet: returnedOnD1 >= 1,
            returns: returnDetails,
            generatedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('[RETENTION] Error:', error);
        return NextResponse.json({ error: 'Failed to compute retention' }, { status: 500 });
    }
}
