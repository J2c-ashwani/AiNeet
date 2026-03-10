import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { sanitizeString, validateId } from '@/lib/validate';

export async function POST(request) {
    try {
        const supabase = getSupabase();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const body = await request.json();
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
        await supabase.from('question_reports').insert({
            question_id: questionId,
            user_id: decoded.id,
            issue_type: reason,
            description: comment || '',
            status: 'open',
            created_at: new Date().toISOString()
        });

        // Auto-flag the question if reported
        const { data: q } = await supabase.from('questions').select('flag_count').eq('id', questionId).single();
        const flags = (q?.flag_count || 0) + 1;
        await supabase.from('questions').update({ flag_count: flags }).eq('id', questionId);

        return NextResponse.json({ success: true, message: 'Report submitted successfully' });

    } catch (error) {
        console.error('Report submission error:', error);
        return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
    }
}
