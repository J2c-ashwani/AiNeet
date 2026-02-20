
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
    try {
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { questionId, reason, comment } = await request.json();

        if (!questionId || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const validReasons = ['error', 'ambiguous', 'syllabus', 'other'];
        if (!validReasons.includes(reason)) {
            return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
        }

        // Insert report
        await db.run(
            'INSERT INTO question_reports (question_id, user_id, issue_type, description) VALUES (?, ?, ?, ?)',
            [questionId, decoded.id, reason, comment || '']
        );

        // Auto-flag the question if reported
        await db.run('UPDATE questions SET flag_count = flag_count + 1 WHERE id = ?', [questionId]);

        return NextResponse.json({ success: true, message: 'Report submitted successfully' });

    } catch (error) {
        console.error('Report submission error:', error);
        return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
    }
}
