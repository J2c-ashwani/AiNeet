
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { sanitizeString, validateEnum, validatePositiveInt, validateId } from '@/lib/validate';

// Helper for RBAC
async function requireAdmin(request) {
    const user = await getUserFromRequest(request);
    // Strict check: must have role === 'admin'
    if (!user || user.role !== 'admin') {
        return null;
    }
    return user;
}

export async function GET(request) {
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const supabase = await getDb();
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'reports'; // 'reports' or 'all'

    try {
        if (mode === 'reports') {
            // Fetch questions with open reports (Quality Control)
            const status = searchParams.get('status') || 'open';

            const { data: reports } = await supabase.from('question_reports').select('id, question_id, reason').eq('status', status);

            if (!reports || reports.length === 0) {
                return NextResponse.json({ questions: [] });
            }

            const reportMap = {};
            reports.forEach(r => {
                if (!reportMap[r.question_id]) {
                    reportMap[r.question_id] = { count: 0, reasons: [] };
                }
                reportMap[r.question_id].count++;
                if (r.reason) reportMap[r.question_id].reasons.push(r.reason);
            });

            const qIds = Object.keys(reportMap);
            const { data: qData } = await supabase.from('questions').select('id, text, flag_count, correct_option').in('id', qIds);

            let questions = (qData || []).map(q => ({
                ...q,
                report_count: reportMap[q.id]?.count || 0,
                reasons: (reportMap[q.id]?.reasons || []).join(',')
            }));

            // Sort by flag_count DESC, report_count DESC
            questions.sort((a, b) => {
                if (b.flag_count !== a.flag_count) return (b.flag_count || 0) - (a.flag_count || 0);
                return b.report_count - a.report_count;
            });

            questions = questions.slice(0, 50);
            return NextResponse.json({ questions });

        } else if (mode === 'all') {
            // Fetch all questions (Content Management)
            const limit = validatePositiveInt(searchParams.get('limit'), 1, 200) || 50;
            const search = sanitizeString(searchParams.get('search') || '', 200);
            const page = validatePositiveInt(searchParams.get('page'), 1, 10000) || 1;
            const offset = (page - 1) * limit;

            const { data: questions } = await supabase
                .from('questions')
                .select('*')
                .ilike('text', `%${search}%`)
                .order('id', { ascending: false })
                .range(offset, offset + limit - 1);

            // Get total count for pagination
            const { count } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })
                .ilike('text', `%${search}%`);

            return NextResponse.json({ questions: questions || [], total: count || 0, page });
        }
    } catch (error) {
        console.error('Admin API Error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const supabase = await getDb();
        let _body;
        try { _body = await request.json(); } catch (parseErr) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }
        const body = _body;

        // Validation
        const required = ['subject_id', 'chapter_id', 'topic_id', 'text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option'];
        for (const field of required) {
            if (!body[field]) return NextResponse.json({ error: `Missing ${field}` }, { status: 400 });
        }

        // Validate correct_option enum
        if (!validateEnum(body.correct_option, ['A', 'B', 'C', 'D', 'a', 'b', 'c', 'd'])) {
            return NextResponse.json({ error: 'correct_option must be A, B, C, or D' }, { status: 400 });
        }
        if (body.difficulty && !validateEnum(body.difficulty, ['easy', 'medium', 'hard'])) {
            return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 });
        }

        // Sanitize text fields
        const text = sanitizeString(body.text, 5000);
        const option_a = sanitizeString(body.option_a, 1000);
        const option_b = sanitizeString(body.option_b, 1000);
        const option_c = sanitizeString(body.option_c, 1000);
        const option_d = sanitizeString(body.option_d, 1000);
        const explanation = sanitizeString(body.explanation || '', 5000);
        const tags = sanitizeString(body.tags || '', 500);

        const { data: result, error } = await supabase.from('questions').insert({
            subject_id: body.subject_id,
            chapter_id: body.chapter_id,
            topic_id: body.topic_id,
            text,
            option_a, option_b, option_c, option_d,
            correct_option: body.correct_option.toUpperCase(),
            difficulty: body.difficulty || 'medium',
            explanation,
            is_pyq: body.is_pyq ? true : false,
            exam_name: body.exam_name || null,
            year_asked: body.year_asked || null,
            tags,
            flag_count: 0,
            quality_score: 1.0
        }).select('id').single();

        if (error) throw error;
        return NextResponse.json({ success: true, id: result.id });

    } catch (error) {
        console.error('Add Question Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const supabase = await getDb();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id || !validateId(id)) return NextResponse.json({ error: 'Missing or invalid ID' }, { status: 400 });

        await supabase.from('questions').delete().eq('id', id);
        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
