
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
    try {
        const db = getDb();
        const decoded = getUserFromRequest(request);

        // MVP: Allow any logged-in user to view for now, or restrict to specific ID if needed.
        //Ideally check decoded.role === 'admin'
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'open';

        // Fetch questions with open reports
        const query = `
            SELECT q.id, q.text, q.flag_count, q.correct_option,
                   COUNT(qr.id) as report_count,
                   GROUP_CONCAT(qr.reason) as reasons
            FROM questions q
            JOIN question_reports qr ON q.id = qr.question_id
            WHERE qr.status = ?
            GROUP BY q.id
            ORDER BY q.flag_count DESC, report_count DESC
            LIMIT 50
        `;

        const flaggedQuestions = db.prepare(query).all(status);

        return NextResponse.json({ questions: flaggedQuestions });

    } catch (error) {
        console.error('Admin fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch flagged questions' }, { status: 500 });
    }
}
