import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { validateArray, validatePositiveInt } from '@/lib/validate';

export async function POST(request) {
    try {
        await initializeDatabase();
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { subjects, chapters, topics, questionCount } = await request.json();

        // Input validation
        if (subjects && !validateArray(subjects, 20)) return NextResponse.json({ error: 'Invalid subjects (must be array, max 20)' }, { status: 400 });
        if (chapters && !validateArray(chapters, 20)) return NextResponse.json({ error: 'Invalid chapters (must be array, max 20)' }, { status: 400 });
        if (topics && !validateArray(topics, 20)) return NextResponse.json({ error: 'Invalid topics (must be array, max 20)' }, { status: 400 });
        if (questionCount && validatePositiveInt(questionCount, 1, 200) === false) return NextResponse.json({ error: 'questionCount must be 1–200' }, { status: 400 });

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

        const questions = await db.all(query, params);

        if (questions.length === 0) {
            return NextResponse.json({ error: 'No PYQs available for the selected criteria. Try broadening your selection.' }, { status: 404 });
        }

        const testId = uuidv4();
        const totalMarks = questions.length * 4;
        const config = JSON.stringify({ subjects, chapters, topics, type: 'pyq', questionCount: questions.length });

        await db.run(
            `INSERT INTO tests (id, user_id, type, config_json, total_questions, total_marks, started_at) VALUES (?, ?, 'pyq', ?, ?, ?, ?)`,
            [testId, decoded.id, config, questions.length, totalMarks, new Date().toISOString()]
        );

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
