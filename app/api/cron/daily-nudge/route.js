import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { safeInsert, safeUpdate } from '@/lib/core/db-safe';
import { getMessaging, isFirebaseConfigured } from '@/lib/firebase-admin';
import { requireRequestSecret } from '@/lib/server-secrets';

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
        console.warn('[DAILY_NUDGE_TIMEZONE_FALLBACK]', e.message);
        return getLocalTimeData('Asia/Kolkata');
    }
}

function latestDevicePerUser(devices) {
    const latest = new Map();

    for (const device of devices || []) {
        const existing = latest.get(device.user_id);
        const currentSeen = new Date(device.last_seen_at || 0).getTime();
        const existingSeen = new Date(existing?.last_seen_at || 0).getTime();

        if (!existing || currentSeen >= existingSeen) {
            latest.set(device.user_id, device);
        }
    }

    return [...latest.values()];
}

function toNudgeRecipient(device) {
    const profile = Array.isArray(device.users) ? device.users[0] : device.users || {};

    return {
        id: device.user_id,
        name: profile.name,
        streak: profile.streak,
        last_active_at: profile.last_active_at,
        onboarding_completed: profile.onboarding_completed,
        timezone: device.timezone || profile.timezone || 'Asia/Kolkata',
        fcmToken: device.fcm_token,
        legacyFcmToken: profile.fcm_token,
        deviceId: device.id,
        devicePublicId: device.device_id,
        devicePlatform: device.platform,
        deviceAppVersion: device.app_version,
        deviceFailureCount: device.notification_failure_count || 0,
    };
}

export async function GET(request) {
    try {
        const authError = requireRequestSecret(request, {
            envName: 'CRON_SECRET',
            bearer: true,
            headers: ['x-cron-secret'],
            query: ['secret'],
        });
        if (authError) return authError;

        if (!isFirebaseConfigured()) {
            return NextResponse.json({ status: 'skipped', reason: 'Firebase not configured' });
        }

        const messaging = getMessaging();
        if (!messaging) {
            return NextResponse.json({ status: 'skipped', reason: 'Firebase failed init' });
        }

        const supabase = await getDb();

        const { data: devices, error } = await supabase
            .from('user_devices')
            .select(`
                id,
                user_id,
                device_id,
                platform,
                app_version,
                fcm_token,
                timezone,
                notification_failure_count,
                last_seen_at,
                users(id, name, fcm_token, streak, last_active_at, onboarding_completed, timezone)
            `)
            .eq('is_active', true)
            .eq('push_permission', 'granted')
            .is('fcm_token_invalidated_at', null)
            .not('fcm_token', 'is', null)
            .order('last_seen_at', { ascending: false });

        if (error || !devices) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });

        const now = new Date();
        const results = { sent: 0, failed: 0, skipped: 0, duplicate: 0 };
        const users = latestDevicePerUser(devices).map(toNudgeRecipient);

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
                let logEntry;
                try {
                    [logEntry] = await safeInsert('notifications_log', {
                        user_id: user.id,
                        notification_type: dedupeKeyBase,
                        dedupe_key: dedupeKey,
                        route: notification.route,
                        entity_id: notification.entity_id,
                        scheduled_for: now.toISOString(),
                        delivery_status: 'pending',
                        device_info: {
                            device_id: user.devicePublicId,
                            platform: user.devicePlatform,
                            app_version: user.deviceAppVersion,
                        },
                    }, {
                        route: '/api/cron/daily-nudge',
                        userId: user.id,
                    });
                } catch (insertError) {
                    if (insertError?.originalError?.code !== '23505') {
                        throw insertError;
                    }
                    results.duplicate++;
                    continue;
                }

                // Send via FCM
                let sendSuccess = false;
                let sendResponse = null;
                let failureReason = null;

                try {
                    sendResponse = await messaging.send({
                        token: user.fcmToken,
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
                        await safeUpdate('user_devices', { id: user.deviceId }, {
                            is_active: false,
                            fcm_token_invalidated_at: now.toISOString(),
                            notification_failure_count: user.deviceFailureCount + 1,
                            updated_at: now.toISOString(),
                        }, {
                            route: '/api/cron/daily-nudge',
                            userId: user.id,
                        });

                        if (user.legacyFcmToken === user.fcmToken) {
                            await safeUpdate('users', { id: user.id }, {
                                fcm_token: null,
                                fcm_token_invalidated_at: now.toISOString(),
                                notification_failure_count: user.deviceFailureCount + 1
                            }, {
                                route: '/api/cron/daily-nudge',
                                userId: user.id,
                            });
                        }
                    }
                }

                // Update Delivery Status
                await safeUpdate('notifications_log', { id: logEntry.id }, {
                    delivery_status: sendSuccess ? 'sent' : 'failed',
                    sent_at: now.toISOString(),
                    provider_response: sendResponse ? { messageId: sendResponse } : null,
                    failure_reason: failureReason
                }, {
                    route: '/api/cron/daily-nudge',
                    userId: user.id,
                });

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
        return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
    }
}
