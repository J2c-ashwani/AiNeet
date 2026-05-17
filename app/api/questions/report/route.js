import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { safeInsert, safeUpdate } from '@/lib/core/db-safe';
import { sanitizeString, validateId } from '@/lib/validate';

export async function POST(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        let _body;

        try { _body = await request.json(); } catch (parseErr) {

            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

        }

        const body = _body;
        const questionId = body.questionId;
        const reason = body.reason;
        const comment = sanitizeString(body.comment || '', 500);

        if (!questionId || !validateId(questionId)) {
            return NextResponse.json({ error: 'Valid question ID is required' }, { status: 400 });
        }
        if (!reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const validReasons = ['error', 'ambiguous', 'syllabus', 'other'];
        if (!validReasons.includes(reason)) {
            return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
        }

        // Insert report
        await safeInsert('question_reports', {
            question_id: questionId,
            user_id: decoded.id,
            issue_type: reason,
            description: comment || '',
            status: 'open',
            created_at: new Date().toISOString()
        }, {
            route: '/api/questions/report',
            userId: decoded.id,
        });

        // Auto-flag the question if reported
        const { data: q } = await supabase.from('questions').select('flag_count').eq('id', questionId).single();
        const flags = (q?.flag_count || 0) + 1;
        await safeUpdate('questions', { id: questionId }, { flag_count: flags }, {
            route: '/api/questions/report',
            userId: decoded.id,
        });

        return NextResponse.json({ success: true, message: 'Report submitted successfully' });

    } catch (error) {
        console.error('Report submission error:', error);
        return NextResponse.json({ error: 'Failed to submit report. Please try again in a moment.' }, { status: 500 });
    }
}
