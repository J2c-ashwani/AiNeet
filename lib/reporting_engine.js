
import { getSupabase } from './supabase';
import { sendEmail, generateParentReportTemplate } from './email_service';

export async function generateWeeklyReports() {
    const supabase = getSupabase();

    console.log('📊 Starting Weekly Report Generation...');

    // 1. Get users with parent email
    const { data: users } = await supabase.from('users').select('id, name, parent_email').not('parent_email', 'is', null).neq('parent_email', '');

    if (!users || users.length === 0) {
        console.log('ℹ️ No users with parent settings found.');
        return { sent: 0, skipped: 0 };
    }

    let sentCount = 0;

    for (const user of users) {
        try {
            // Aggregate Stats (Last 7 Days)
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

            // Tests count & Average Score
            const { data: tests } = await supabase.from('tests').select('score').eq('user_id', user.id).gte('started_at', sevenDaysAgo);

            let testCount = 0;
            let avgScore = 0;
            if (tests && tests.length > 0) {
                testCount = tests.length;
                avgScore = tests.reduce((sum, t) => sum + (t.score || 0), 0) / testCount;
            }

            const accuracy = testCount > 0 ? Math.round((avgScore / 720) * 100) : 0;

            // Weak Areas
            const { data: weakAreas } = await supabase.from('user_performance').select('topics(name)').eq('user_id', user.id).lt('accuracy', 50).limit(3);
            const mappedWeakAreas = weakAreas ? weakAreas.map(w => ({ name: w.topics?.name })).filter(w => w.name) : [];

            // Generate Insights
            const insights = [];
            if (testCount > 5) insights.push(`High dedication! ${user.name.split(' ')[0]} took ${testCount} tests.`);
            else if (testCount === 0) insights.push('No tests taken this week. Encouragement needed.');

            if (accuracy > 80) insights.push('Excellent accuracy score. Identifying advanced topics.');
            else if (accuracy < 50 && testCount > 0) insights.push('Accuracy is low. Revising basics is recommended.');

            if (mappedWeakAreas.length > 0) {
                insights.push(`Needs help in: ${mappedWeakAreas.map(w => w.name).join(', ')}.`);
            }

            // 3. Send Email
            if (testCount > 0 || mappedWeakAreas.length > 0) {
                const html = generateParentReportTemplate(user.name, {
                    testsTaken: testCount,
                    accuracy: accuracy,
                    hoursStudied: Math.round(testCount * 0.5), // Estimate
                    focusArea: mappedWeakAreas[0]?.name || 'General Revision'
                }, insights);

                await sendEmail(user.parent_email, `Weekly Progress: ${user.name}`, html);
                sentCount++;
            }

        } catch (err) {
            console.error(`Failed to report for user ${user.id}:`, err);
        }
    }

    console.log(`✅ Reports sent: ${sentCount}`);
    return { sent: sentCount, total: users.length };
}
