import { ApiError, RATE_LIMITS, withApiRoute } from '@/lib/api-handler';
import { getDb } from '@/lib/core/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function dayString(dateLike) {
    return new Date(dateLike).toISOString().split('T')[0];
}

export const GET = withApiRoute(async () => {
    const supabase = await getDb();
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - 7);

    const { data: newUsers, error: usersErr } = await supabase
        .from('users')
        .select('id, created_at')
        .gte('created_at', windowStart.toISOString())
        .order('created_at', { ascending: false });

    if (usersErr) {
        throw new ApiError('Failed to compute retention', 500, 'RETENTION_USERS_FAILED');
    }

    if (!newUsers || newUsers.length === 0) {
        return { message: 'No new users in window', d1ReturnRate: null };
    }

    const userIds = newUsers.map(user => user.id);
    const signupDayMap = Object.fromEntries(newUsers.map(user => [user.id, dayString(user.created_at)]));

    const { data: testActivity, error: testErr } = await supabase
        .from('tests')
        .select('user_id, completed_at')
        .in('user_id', userIds)
        .not('completed_at', 'is', null);

    if (testErr) {
        throw new ApiError('Failed to compute retention', 500, 'RETENTION_TEST_ACTIVITY_FAILED');
    }

    const { data: doubtActivity, error: doubtErr } = await supabase
        .from('doubt_messages')
        .select('conversation_id, created_at, doubt_conversations(user_id)')
        .in('doubt_conversations.user_id', userIds)
        .eq('role', 'user');

    if (doubtErr) {
        throw new ApiError('Failed to compute retention', 500, 'RETENTION_DOUBT_ACTIVITY_FAILED');
    }

    const activityByUser = {};
    userIds.forEach(id => { activityByUser[id] = new Set(); });

    (testActivity || []).forEach(test => {
        if (test.user_id && test.completed_at) {
            activityByUser[test.user_id]?.add(dayString(test.completed_at));
        }
    });

    (doubtActivity || []).forEach(message => {
        const userId = message.doubt_conversations?.user_id;
        if (userId && message.created_at) {
            activityByUser[userId]?.add(dayString(message.created_at));
        }
    });

    let activeOnD0 = 0;
    let returnedOnD1 = 0;
    const returnDetails = [];

    newUsers.forEach(user => {
        const d0 = signupDayMap[user.id];
        const d1 = new Date(d0);
        d1.setDate(d1.getDate() + 1);
        const d1Str = dayString(d1);
        const activeDates = activityByUser[user.id] || new Set();

        if (activeDates.has(d0)) {
            activeOnD0++;
            if (activeDates.has(d1Str)) {
                returnedOnD1++;
                returnDetails.push({ userId: user.id, signupDate: d0, returnDate: d1Str });
            }
        }
    });

    const d1ReturnRate = activeOnD0 > 0
        ? Math.round((returnedOnD1 / activeOnD0) * 100)
        : null;

    const diagnosticUsers = new Set((testActivity || []).map(test => test.user_id).filter(Boolean));
    const doubtUsers = new Set(
        (doubtActivity || [])
            .map(message => message.doubt_conversations?.user_id)
            .filter(Boolean)
    );

    return {
        window: '7 days',
        windowStart: dayString(windowStart),
        totalNewUsers: newUsers.length,
        usersActiveOnD0: activeOnD0,
        usersReturnedOnD1: returnedOnD1,
        d1ReturnRate: d1ReturnRate !== null ? `${d1ReturnRate}%` : 'insufficient data',
        breakdown: {
            diagnosticCompleters: diagnosticUsers.size,
            doubtUsers: doubtUsers.size,
        },
        targetMet: returnedOnD1 >= 1,
        returns: returnDetails,
        generatedAt: new Date().toISOString(),
    };
}, {
    auth: 'cron',
    rateLimit: { ...RATE_LIMITS.STANDARD, failBehavior: 'closed', key: 'admin:retention' },
});
