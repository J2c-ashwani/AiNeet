import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getMessaging, isFirebaseConfigured } from '@/lib/firebase-admin';

function getLocalTimeData(tz) {
    try {
        const dFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
        });
        const parts = dFormatter.formatToParts(new Date());
        const y = parts.find(p => p.type === 'year').value;
        const m = parts.find(p => p.type === 'month').value;
        const d = parts.find(p => p.type === 'day').value;
        const hour = parseInt(parts.find(p => p.type === 'hour').value, 10);
        const minute = parseInt(parts.find(p => p.type === 'minute').value, 10);
        return { dateStr: `${y}-${m}-${d}`, hour, minute };
    } catch(e) {
        // Fallback to Asia/Kolkata if invalid timezone
        return getLocalTimeData('Asia/Kolkata');
    }
}

export async function GET(request) {
    try {
        const cronSecret = request.headers.get('x-cron-secret') || 
                          new URL(request.url).searchParams.get('secret');
        
        if (cronSecret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!isFirebaseConfigured()) {
            return NextResponse.json({ status: 'skipped', reason: 'Firebase not configured' });
        }

        const messaging = getMessaging();
        if (!messaging) {
            return NextResponse.json({ status: 'skipped', reason: 'Firebase failed init' });
        }

        const supabase = await getDb();

        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, fcm_token, streak, last_active_at, onboarding_completed, timezone, notification_failure_count')
            .not('fcm_token', 'is', null);

        if (error || !users) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });

        const now = new Date();
        const results = { sent: 0, failed: 0, skipped: 0, duplicate: 0 };

        for (const user of users) {
            try {
                const tz = user.timezone || 'Asia/Kolkata';
                const { dateStr: localDateStr, hour, minute } = getLocalTimeData(tz);

                // Quiet hours check: 10:30 PM to 6:30 AM
                if (hour > 22 || (hour === 22 && minute >= 30) || hour < 6 || (hour === 6 && minute < 30)) {
                    results.skipped++;
                    continue;
                }

                // Rate limit: max 2/day
                const { count: dailySent } = await supabase.from('notifications_log')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .like('dedupe_key', `%_${localDateStr}%`);
                
                if (dailySent >= 2) {
                    results.skipped++;
                    continue;
                }

                // Contextual Notification Engine
                const lastActive = user.last_active_at ? new Date(user.last_active_at) : null;
                const daysSinceActive = lastActive 
                    ? Math.floor((now - lastActive) / (1000 * 60 * 60 * 24))
                    : 999;
                
                const streak = user.streak || 0;
                const firstName = user.name?.split(' ')[0] || 'there';
                
                let notification = null;
                let dedupeKeyBase = '';

                if (daysSinceActive >= 1 && daysSinceActive <= 2 && streak > 1) {
                    notification = {
                        title: `⚠️ ${firstName}, your ${streak}-day streak is at risk!`,
                        body: 'A quick 5-minute test will save it. Don\'t let it break.',
                        route: '/test/diagnostic',
                        entity_id: 'streak_recovery'
                    };
                    dedupeKeyBase = 'streak_risk';
                } else if (!user.onboarding_completed && daysSinceActive > 0) {
                    notification = {
                        title: `🎯 ${firstName}, ready to find your weak chapter?`,
                        body: 'Take a free 5-min diagnostic — know exactly where you stand.',
                        route: '/test/diagnostic',
                        entity_id: 'first_test'
                    };
                    dedupeKeyBase = 'first_test';
                } else if (daysSinceActive >= 3) {
                    // Check for weak topics or mistakes
                    const { data: weakAreas } = await supabase.from('user_performance').select('topics(name)').eq('user_id', user.id).lt('accuracy', 50).limit(1);
                    if (weakAreas && weakAreas.length > 0) {
                        const topic = weakAreas[0].topics?.name;
                        notification = {
                            title: `Your weakest topic: ${topic}`,
                            body: `Take a quick 10-question recovery test to improve your score.`,
                            route: '/mistakes',
                            entity_id: 'weak_topic_recovery'
                        };
                        dedupeKeyBase = 'weak_topic';
                    } else {
                        results.skipped++;
                        continue;
                    }
                } else {
                    results.skipped++;
                    continue;
                }

                const dedupeKey = `${dedupeKeyBase}_${localDateStr}`;

                // Idempotency: Insert FIRST
                const { data: logEntry, error: insertError } = await supabase.from('notifications_log').insert({
                    user_id: user.id,
                    notification_type: dedupeKeyBase,
                    dedupe_key: dedupeKey,
                    route: notification.route,
                    entity_id: notification.entity_id,
                    scheduled_for: now.toISOString(),
                    delivery_status: 'pending'
                }).select().single();

                if (insertError) {
                    // 23505 is unique violation in postgres
                    results.duplicate++;
                    continue;
                }

                // Send via FCM
                let sendSuccess = false;
                let sendResponse = null;
                let failureReason = null;

                try {
                    sendResponse = await messaging.send({
                        token: user.fcm_token,
                        notification: {
                            title: notification.title,
                            body: notification.body,
                        },
                        data: {
                            route: notification.route,
                            entity_id: notification.entity_id,
                            notification_id: logEntry.id
                        },
                        android: {
                            priority: 'high',
                            notification: {
                                channelId: 'daily_reminders',
                            },
                        },
                    });
                    sendSuccess = true;
                } catch (sendErr) {
                    failureReason = sendErr.message || 'Unknown error';
                    if (sendErr.code === 'messaging/registration-token-not-registered' ||
                        sendErr.code === 'messaging/invalid-registration-token') {
                        // Token Decay Management
                        await supabase.from('users').update({
                            fcm_token: null,
                            fcm_token_invalidated_at: now.toISOString(),
                            notification_failure_count: (user.notification_failure_count || 0) + 1
                        }).eq('id', user.id);
                    }
                }

                // Update Delivery Status
                await supabase.from('notifications_log').update({
                    delivery_status: sendSuccess ? 'sent' : 'failed',
                    sent_at: now.toISOString(),
                    provider_response: sendResponse ? { messageId: sendResponse } : null,
                    failure_reason: failureReason
                }).eq('id', logEntry.id);

                if (sendSuccess) results.sent++;
                else results.failed++;

            } catch (innerErr) {
                console.error(`Error processing user ${user.id}:`, innerErr);
                results.failed++;
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
