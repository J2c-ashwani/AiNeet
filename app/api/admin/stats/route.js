
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

function requireAdmin(request) {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') return null;
    return user;
}

export async function GET(request) {
    const admin = requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const db = getDb();

        const users = db.prepare('SELECT COUNT(*) as count FROM users').get();
        const questions = db.prepare('SELECT COUNT(*) as count FROM questions').get();
        const pyqs = db.prepare('SELECT COUNT(*) as count FROM questions WHERE is_pyq = 1').get();

        let reports = { count: 0 };
        try {
            reports = db.prepare("SELECT COUNT(*) as count FROM question_reports WHERE status = 'open'").get();
        } catch (e) { /* table may not exist */ }

        // Recent signups (last 10)
        let recentSignups = [];
        try {
            recentSignups = db.prepare(
                'SELECT id, name, email, created_at, subscription_tier FROM users ORDER BY id DESC LIMIT 10'
            ).all();
        } catch (e) { /* */ }

        // Daily test activity (last 7 days)
        let dailyActivity = [];
        try {
            dailyActivity = db.prepare(`
                SELECT DATE(completed_at) as date, COUNT(*) as tests, ROUND(AVG(accuracy),1) as avg_accuracy
                FROM test_attempts
                WHERE completed_at >= datetime('now', '-7 days')
                GROUP BY DATE(completed_at)
                ORDER BY date ASC
            `).all();
        } catch (e) { /* */ }

        // Subscription breakdown
        let subscriptionBreakdown = { free: 0, pro: 0, premium: 0 };
        try {
            const tiers = db.prepare(
                "SELECT COALESCE(subscription_tier, 'free') as tier, COUNT(*) as count FROM users GROUP BY tier"
            ).all();
            tiers.forEach(t => {
                subscriptionBreakdown[t.tier] = t.count;
            });
        } catch (e) { /* */ }

        return NextResponse.json({
            users: users.count,
            questions: questions.count,
            pyqs: pyqs.count,
            reports: reports?.count || 0,
            recentSignups,
            dailyActivity,
            subscriptionBreakdown
        });
    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
