import { getSupabase } from './supabase';
import { sendEmail, generateParentReportTemplate } from './email_service';

// Mock function for other channels
async function sendWhatsApp(phone, message) { return true; }

export async function generateWeeklyReports() {
    const supabase = getSupabase();
    
    // 1. Log Cron Start
    const { data: cronLog, error: cronLogErr } = await supabase.from('cron_execution_logs').insert({
        job_name: 'weekly_parent_report',
        status: 'running'
    }).select().single();
    
    const cronLogId = cronLog?.id;
    let itemsAttempted = 0;
    let itemsSuccessful = 0;
    let itemsFailed = 0;
    const startTime = Date.now();

    try {
        console.log('📊 Starting Weekly Report Generation & Dispatch...');

        // 2. GENERATION PHASE
        // Find users with consent who haven't had a report generated for this week
        const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const weekEnd = new Date().toISOString().split('T')[0];
        
        const { data: users } = await supabase.from('users')
            .select('id, name, parent_email, parent_phone, parent_consent_given_at, streak')
            .not('parent_consent_given_at', 'is', null);

        if (users && users.length > 0) {
            for (const user of users) {
                // Check if already generated
                const { data: existing } = await supabase.from('weekly_parent_reports')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('report_week_start', weekStart)
                    .single();
                
                if (existing) continue; // Already generated this week

                // Compute Stats
                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
                const { data: tests } = await supabase.from('tests').select('score, total_marks').eq('user_id', user.id).gte('started_at', sevenDaysAgo);
                
                let testCount = tests ? tests.length : 0;
                if (testCount === 0) continue; // Quality Validation: No tests attempted

                let totalScore = 0;
                let maxPossible = 0;
                tests.forEach(t => {
                    totalScore += (t.score || 0);
                    maxPossible += (t.total_marks || 720);
                });
                const accuracy = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;
                
                if (maxPossible === 0) continue; // Empty analytics payload

                // Weak Areas
                const { data: weakAreas } = await supabase.from('user_performance').select('topics(name), accuracy').eq('user_id', user.id).lt('accuracy', 50).limit(3);
                const mappedWeakAreas = weakAreas ? weakAreas.map(w => ({ name: w.topics?.name, acc: w.accuracy })).filter(w => w.name) : [];
                
                if (mappedWeakAreas.length === 0) continue; // Quality Validation: Missing weak-topic analysis
                
                // Create Immutable Snapshot
                const snapshotPayload = {
                    testCount,
                    accuracy,
                    streak: user.streak || 0,
                    weakTopics: mappedWeakAreas
                };

                const { data: report } = await supabase.from('weekly_parent_reports').insert({
                    user_id: user.id,
                    report_week_start: weekStart,
                    report_week_end: weekEnd,
                    snapshot_payload: snapshotPayload
                }).select().single();

                if (report) {
                    // Queue for delivery
                    await supabase.from('parent_report_logs').insert({
                        report_id: report.id,
                        email_delivery_status: user.parent_email ? 'pending' : 'skipped',
                        whatsapp_delivery_status: user.parent_phone ? 'pending' : 'skipped',
                        next_retry_at: new Date().toISOString()
                    });
                }
            }
        }

        // 3. DISPATCH PHASE
        const { data: pendingLogs } = await supabase.from('parent_report_logs')
            .select('*, weekly_parent_reports(user_id, snapshot_payload, users(name, parent_email, parent_phone))')
            .or('email_delivery_status.eq.pending,email_delivery_status.eq.failed,whatsapp_delivery_status.eq.pending,whatsapp_delivery_status.eq.failed')
            .lt('retry_count', 3)
            .lte('next_retry_at', new Date().toISOString());

        if (pendingLogs && pendingLogs.length > 0) {
            for (const log of pendingLogs) {
                itemsAttempted++;
                let emailStatus = log.email_delivery_status;
                let waStatus = log.whatsapp_delivery_status;
                const userObj = log.weekly_parent_reports?.users;
                const snapshot = log.weekly_parent_reports?.snapshot_payload;

                let success = false;
                let failedReason = [];

                if (emailStatus === 'pending' || emailStatus === 'failed') {
                    try {
                        const insights = [`Your child took ${snapshot.testCount} tests with ${snapshot.accuracy}% accuracy.`];
                        const html = generateParentReportTemplate(userObj.name, {
                            testsTaken: snapshot.testCount,
                            accuracy: snapshot.accuracy,
                            hoursStudied: Math.round(snapshot.testCount * 0.5),
                            focusArea: snapshot.weakTopics[0]?.name || 'General'
                        }, insights);
                        await sendEmail(userObj.parent_email, `Weekly Progress: ${userObj.name}`, html);
                        emailStatus = 'delivered';
                        success = true;
                    } catch(e) {
                        emailStatus = 'failed';
                        failedReason.push(`Email: ${e.message}`);
                    }
                }

                if (waStatus === 'pending' || waStatus === 'failed') {
                    try {
                        await sendWhatsApp(userObj.parent_phone, `Your child's weekly report...`);
                        waStatus = 'delivered';
                        success = true;
                    } catch(e) {
                        waStatus = 'failed';
                        failedReason.push(`WA: ${e.message}`);
                    }
                }

                const allSkippedOrDelivered = 
                    (emailStatus === 'delivered' || emailStatus === 'skipped') &&
                    (waStatus === 'delivered' || waStatus === 'skipped');

                if (allSkippedOrDelivered) {
                    itemsSuccessful++;
                } else {
                    itemsFailed++;
                }

                let nextRetry = null;
                if (!allSkippedOrDelivered && log.retry_count < 2) {
                    // Retry logic: 1st retry in 5 mins, 2nd retry in 60 mins
                    const delayMins = log.retry_count === 0 ? 5 : 60;
                    nextRetry = new Date(Date.now() + delayMins * 60 * 1000).toISOString();
                }

                await supabase.from('parent_report_logs').update({
                    email_delivery_status: emailStatus,
                    whatsapp_delivery_status: waStatus,
                    retry_count: log.retry_count + 1,
                    next_retry_at: nextRetry,
                    failure_reasons: failedReason.length ? failedReason : null,
                    email_delivered_at: emailStatus === 'delivered' ? new Date().toISOString() : log.email_delivered_at,
                    whatsapp_delivered_at: waStatus === 'delivered' ? new Date().toISOString() : log.whatsapp_delivered_at
                }).eq('id', log.id);
            }
        }

        const totalRuntime = Date.now() - startTime;
        if (cronLogId) {
            await supabase.from('cron_execution_logs').update({
                status: 'success',
                completed_at: new Date().toISOString(),
                items_attempted: itemsAttempted,
                items_successful: itemsSuccessful,
                items_failed: itemsFailed,
                total_runtime_ms: totalRuntime
            }).eq('id', cronLogId);
        }

        return { sent: itemsSuccessful, failed: itemsFailed };

    } catch (error) {
        console.error('Weekly Report Gen Error:', error);
        if (cronLogId) {
            await supabase.from('cron_execution_logs').update({
                status: 'failed',
                completed_at: new Date().toISOString(),
                error_payload: { message: error.message },
                total_runtime_ms: Date.now() - startTime
            }).eq('id', cronLogId);
        }
        throw error;
    }
}
