import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getMessaging, isFirebaseConfigured } from '@/lib/firebase-admin';

/**
 * Daily Nudge — Push Notification Cron
 * 
 * Only 2 notification types for launch (expand after collecting data):
 *   1. Streak reminder — "Your streak is at risk!"
 *   2. First-test reminder — "You haven't taken your first test yet"
 * 
 * Trigger: External cron service hits GET /api/cron/daily-nudge?secret=CRON_SECRET
 * Schedule: Daily at 8:00 AM IST (2:30 UTC)
 */

export async function GET(request) {
    try {
        const cronSecret = request.headers.get('x-cron-secret') || 
                          new URL(request.url).searchParams.get('secret');
        
        if (cronSecret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!isFirebaseConfigured()) {
            return NextResponse.json({ 
                status: 'skipped', 
                reason: 'FIREBASE_SERVICE_ACCOUNT_KEY not configured' 
            });
        }

        const messaging = getMessaging();
        if (!messaging) {
            return NextResponse.json({ status: 'skipped', reason: 'Firebase not initialized' });
        }

        const supabase = await getDb();

        // Fetch users with FCM tokens
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, fcm_token, streak, last_active_at, onboarding_completed')
            .not('fcm_token', 'is', null);

        if (error || !users) {
            return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
        }

        const now = new Date();
        const results = { sent: 0, failed: 0, skipped: 0 };

        for (const user of users) {
            try {
                const lastActive = user.last_active_at ? new Date(user.last_active_at) : null;
                const daysSinceActive = lastActive 
                    ? Math.floor((now - lastActive) / (1000 * 60 * 60 * 24))
                    : 999;
                
                const streak = user.streak || 0;
                const firstName = user.name?.split(' ')[0] || 'there';
                let notification = null;

                // Segment 1: Streak at risk (inactive 1 day, had a streak > 1)
                if (daysSinceActive >= 1 && daysSinceActive <= 2 && streak > 1) {
                    notification = {
                        title: `⚠️ ${firstName}, your ${streak}-day streak is at risk!`,
                        body: 'A quick 5-minute test will save it. Don\'t let it break.',
                    };
                }
                // Segment 2: New user, never took a test
                else if (!user.onboarding_completed && daysSinceActive > 0) {
                    notification = {
                        title: `🎯 ${firstName}, ready to find your weak chapter?`,
                        body: 'Take a free 5-min diagnostic — know exactly where you stand.',
                    };
                }

                if (!notification) {
                    results.skipped++;
                    continue;
                }

                await messaging.send({
                    token: user.fcm_token,
                    notification: {
                        title: notification.title,
                        body: notification.body,
                    },
                    android: {
                        priority: 'high',
                        notification: {
                            channelId: 'daily_reminders',
                            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                        },
                    },
                });

                results.sent++;

            } catch (sendErr) {
                results.failed++;
                
                // Clean up invalid tokens
                if (sendErr.code === 'messaging/registration-token-not-registered' ||
                    sendErr.code === 'messaging/invalid-registration-token') {
                    await supabase
                        .from('users')
                        .update({ fcm_token: null })
                        .eq('id', user.id);
                }
            }
        }

        return NextResponse.json({
            status: 'completed',
            timestamp: now.toISOString(),
            ...results,
        });

    } catch (err) {
        console.error('Daily nudge cron error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
