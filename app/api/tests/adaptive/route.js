
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/core/auth';
import { safeInsert } from '@/lib/core/db-safe';
import { getAdaptiveQuestion } from '@/lib/adaptive_engine';
import { sanitizeString, validatePositiveInt } from '@/lib/validate';

export async function POST(request) {
    try {
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        let _body;

        try { _body = await request.json(); } catch (parseErr) {

            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

        }

        const body = _body;
        const subjectId = body.subjectId ? sanitizeString(String(body.subjectId), 128) : null;
        const topicId = body.topicId ? sanitizeString(String(body.topicId), 128) : null;
        const count = validatePositiveInt(body.count, 1, 50) || 10;

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
        const [result] = await safeInsert('tests', {
            user_id: decoded.id,
            type: 'adaptive',
            subject_id: subjectId || null,
            topic_id: topicId || null,
            total_questions: selectedQuestions.length,
            status: 'in_progress',
            created_at: new Date().toISOString()
        }, {
            route: '/api/tests/adaptive',
            userId: decoded.id,
        });
        const testId = result.id;

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
        return NextResponse.json({ error: 'Failed to generate adaptive test. Please try again in a moment.' }, { status: 500 });
    }
}
