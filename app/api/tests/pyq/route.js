import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
    try {
        initializeDatabase();
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { subjects, chapters, topics, questionCount } = await request.json();

        let query = 'SELECT * FROM questions WHERE is_pyq = 1';
        const params = [];

        if (subjects && subjects.length > 0) {
            query += ` AND subject_id IN (${subjects.map(() => '?').join(',')})`;
            params.push(...subjects);
        }
        if (chapters && chapters.length > 0) {
            query += ` AND chapter_id IN (${chapters.map(() => '?').join(',')})`;
            params.push(...chapters);
        }
        if (topics && topics.length > 0) {
            query += ` AND topic_id IN (${topics.map(() => '?').join(',')})`;
            params.push(...topics);
        }

        query += ' ORDER BY RANDOM()';
        query += ' LIMIT ?';
        params.push(questionCount || 20);

        const questions = db.prepare(query).all(...params);

        if (questions.length === 0) {
            return NextResponse.json({ error: 'No PYQs available for the selected criteria. Try broadening your selection.' }, { status: 404 });
        }

        const testId = uuidv4();
        const totalMarks = questions.length * 4;
        const config = JSON.stringify({ subjects, chapters, topics, type: 'pyq', questionCount: questions.length });

        db.prepare(`INSERT INTO tests (id, user_id, type, config_json, total_questions, total_marks, started_at) VALUES (?, ?, 'pyq', ?, ?, ?, datetime('now'))`).run(testId, decoded.id, config, questions.length, totalMarks);

        const clientQuestions = questions.map((q, idx) => ({
            id: q.id, index: idx + 1, text: q.text,
            option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d,
            difficulty: q.difficulty, subject_id: q.subject_id, chapter_id: q.chapter_id,
            year_asked: q.year_asked, exam_name: q.exam_name
        }));

        return NextResponse.json({
            testId, questions: clientQuestions, totalQuestions: questions.length,
            totalMarks, type: 'pyq', timeLimit: questions.length * 90
        });
    } catch (error) {
        console.error('PYQ Test generation error:', error);
        return NextResponse.json({ error: 'Failed to generate PYQ test' }, { status: 500 });
    }
}
