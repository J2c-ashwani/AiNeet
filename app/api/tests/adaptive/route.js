
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import { getUserFromRequest } from '@/lib/auth';
import { getAdaptiveQuestion } from '@/lib/adaptive_engine';

export async function POST(request) {
    try {
        await initializeDatabase();
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { subjectId, topicId, count = 10 } = await request.json(); // Default 10 questions for adaptive

        if (!subjectId && !topicId) {
            return NextResponse.json({ error: 'Subject or Topic ID required' }, { status: 400 });
        }

        const selectedQuestions = [];
        const excludeIds = [];

        // Iteratively select questions based on adaptive logic
        for (let i = 0; i < count; i++) {
            // We pass excludeIds to prevent duplicates in this session
            const question = await getAdaptiveQuestion(decoded.id, subjectId, topicId, excludeIds);

            if (question) {
                selectedQuestions.push(question);
                excludeIds.push(question.id);
            } else {
                // If we run out of unique questions matching criteria, break early
                break;
            }
        }

        if (selectedQuestions.length === 0) {
            return NextResponse.json({ error: 'No questions available for this criteria' }, { status: 404 });
        }

        // Create Test Record
        const insertSql = `
            INSERT INTO tests (user_id, type, subject_id, topic_id, total_questions, status, created_at)
            VALUES (?, ?, ?, ?, ?, 'in_progress', ?)
        `;
        const result = await db.run(insertSql, [
            decoded.id, 'adaptive', subjectId || null, topicId || null, selectedQuestions.length, new Date().toISOString()
        ]);

        const testId = result.lastInsertRowid;

        // Return questions (hide correct option)
        const clientQuestions = selectedQuestions.map(q => ({
            id: q.id,
            text: q.text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            year_asked: q.year_asked,
            difficulty_score: Math.round(q.difficulty) // Expose Elo for debugging/UI?
        }));

        return NextResponse.json({ testId, questions: clientQuestions });

    } catch (error) {
        console.error('Adaptive generation error:', error);
        return NextResponse.json({ error: 'Failed to generate adaptive test' }, { status: 500 });
    }
}
