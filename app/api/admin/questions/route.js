
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// Helper for RBAC
function requireAdmin(request) {
    const user = getUserFromRequest(request);
    // Strict check: must have role === 'admin'
    if (!user || user.role !== 'admin') {
        return null;
    }
    return user;
}

export async function GET(request) {
    const admin = requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'reports'; // 'reports' or 'all'

    try {
        if (mode === 'reports') {
            // Fetch questions with open reports (Quality Control)
            const status = searchParams.get('status') || 'open';
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
            const questions = await db.all(query, [status]);
            return NextResponse.json({ questions });

        } else if (mode === 'all') {
            // Fetch all questions (Content Management)
            const limit = searchParams.get('limit') || 50;
            const search = searchParams.get('search') || '';
            const page = parseInt(searchParams.get('page') || '1');
            const offset = (page - 1) * limit;

            let query = `SELECT * FROM questions WHERE text LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?`;
            const questions = await db.all(query, [`%${search}%`, limit, offset]);

            // Get total count for pagination
            const count = await db.get('SELECT COUNT(*) as total FROM questions WHERE text LIKE ?', [`%${search}%`]);

            return NextResponse.json({ questions, total: count.total, page });
        }
    } catch (error) {
        console.error('Admin API Error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    const admin = requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const db = getDb();
        const body = await request.json();

        // Validation
        const required = ['subject_id', 'chapter_id', 'topic_id', 'text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option'];
        for (const field of required) {
            if (!body[field]) return NextResponse.json({ error: `Missing ${field}` }, { status: 400 });
        }

        const insertSql = `
            INSERT INTO questions (
                subject_id, chapter_id, topic_id, text, 
                option_a, option_b, option_c, option_d, 
                correct_option, difficulty, explanation, 
                is_pyq, exam_name, year_asked, tags,
                flag_count, quality_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1.0)
        `;

        const result = await db.run(insertSql, [
            body.subject_id, body.chapter_id, body.topic_id, body.text,
            body.option_a, body.option_b, body.option_c, body.option_d,
            body.correct_option, body.difficulty || 'medium', body.explanation || '',
            body.is_pyq ? 1 : 0, body.exam_name || null, body.year_asked || null, body.tags || ''
        ]);

        return NextResponse.json({ success: true, id: result.lastInsertRowid });

    } catch (error) {
        console.error('Add Question Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    const admin = requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        await db.run('DELETE FROM questions WHERE id = ?', [id]);
        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
