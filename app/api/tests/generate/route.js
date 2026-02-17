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

        const { subjects, chapters, topics, difficulty, questionCount, type } = await request.json();

        let query = 'SELECT * FROM questions WHERE 1=1';
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
        if (difficulty && difficulty !== 'all') {
            query += ' AND difficulty = ?';
            params.push(difficulty);
        }

        query += ' ORDER BY RANDOM()';
        const limit = questionCount || (type === 'mock' ? 180 : type === 'chapter' ? 30 : 20);
        query += ' LIMIT ?';
        params.push(limit);

        const questions = db.prepare(query).all(...params);

        if (questions.length === 0) {
            return NextResponse.json({ error: 'No questions available for the selected criteria. Try broadening your selection.' }, { status: 404 });
        }

        const testId = uuidv4();
        const totalMarks = questions.length * 4;
        const config = JSON.stringify({ subjects, chapters, topics, difficulty, questionCount: questions.length, type });

        db.prepare(`INSERT INTO tests (id, user_id, type, config_json, total_questions, total_marks, started_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`).run(testId, decoded.id, type || 'custom', config, questions.length, totalMarks);

        const clientQuestions = questions.map((q, idx) => ({
            id: q.id, index: idx + 1, text: q.text,
            option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d,
            difficulty: q.difficulty, subject_id: q.subject_id, chapter_id: q.chapter_id
        }));

        return NextResponse.json({
            testId, questions: clientQuestions, totalQuestions: questions.length,
            totalMarks, type: type || 'custom',
            timeLimit: type === 'mock' ? 10800 : questions.length * 90
        });
    } catch (error) {
        console.error('Test generation error:', error);
        return NextResponse.json({ error: 'Failed to generate test' }, { status: 500 });
    }
}
