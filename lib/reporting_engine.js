
import { getDb } from './db';
import { sendEmail, generateParentReportTemplate } from './email_service';

export async function generateWeeklyReports() {
    const db = getDb();

    console.log('📊 Starting Weekly Report Generation...');

    // 1. Get users with parent email
    const users = await db.all("SELECT id, name, parent_email FROM users WHERE parent_email IS NOT NULL AND parent_email != ''");

    if (users.length === 0) {
        console.log('ℹ️ No users with parent settings found.');
        return { sent: 0, skipped: 0 };
    }

    let sentCount = 0;

    for (const user of users) {
        try {
            // 2. Aggregate Stats (Last 7 Days)
            // Note: SQLite 'now', '-7 days'

            // Tests count & Average Score
            const testStats = await db.get(`
                SELECT count(*) as count, avg(score) as avg_score 
                FROM tests 
                WHERE user_id = ? AND started_at >= datetime('now', '-7 days')
            `, [user.id]);

            // Accuracy from performance table (Overall, could filter by date if tracking daily logic exists, but perf table is aggregate)
            // Let's us overall accuracy for now or calculate from test_answers join.
            // Simpler: Use average score / 720 * 100 for accuracy proxy of the week
            const accuracy = testStats.count > 0 ? Math.round((testStats.avg_score / 720) * 100) : 0;

            // Weak Areas
            const weakAreas = await db.all(`
               SELECT t.name FROM user_performance up
               JOIN topics t ON up.topic_id = t.id
               WHERE up.user_id = ? AND up.accuracy < 50
               LIMIT 3
            `, [user.id]);

            // Generate Insights
            const insights = [];
            if (testStats.count > 5) insights.push(`High dedication! ${user.name.split(' ')[0]} took ${testStats.count} tests.`);
            else if (testStats.count === 0) insights.push('No tests taken this week. Encouragement needed.');

            if (accuracy > 80) insights.push('Excellent accuracy score. Identifying advanced topics.');
            else if (accuracy < 50 && testStats.count > 0) insights.push('Accuracy is low. Revising basics is recommended.');

            if (weakAreas.length > 0) {
                insights.push(`Needs help in: ${weakAreas.map(w => w.name).join(', ')}.`);
            }

            // 3. Send Email
            if (testStats.count > 0 || weakAreas.length > 0) {
                const html = generateParentReportTemplate(user.name, {
                    testsTaken: testStats.count,
                    accuracy: accuracy,
                    hoursStudied: Math.round(testStats.count * 0.5), // Estimate
                    focusArea: weakAreas[0]?.name || 'General Revision'
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
