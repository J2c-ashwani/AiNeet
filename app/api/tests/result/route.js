import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { calculateNEETScore, getLevelFromXP } from '@/lib/scoring';
import { verifyAppCheck } from '@/lib/security/verify-app-check';

export async function GET(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const appCheckResponse = await verifyAppCheck(request);
        if (appCheckResponse) return appCheckResponse;

        const { searchParams } = new URL(request.url);
        const testId = searchParams.get('testId');
        if (!testId || typeof testId !== 'string' || testId.length > 128) {
            return NextResponse.json({ error: 'Valid testId is required' }, { status: 400 });
        }

        const supabase = await getDb();
        const { data: test, error: testError } = await supabase
            .from('tests')
            .select('id, user_id, score, correct_count, incorrect_count, unanswered_count, total_questions, time_taken_seconds, completed_at')
            .eq('id', testId)
            .eq('user_id', user.id)
            .single();

        if (testError || !test) {
            return NextResponse.json({ error: 'Test result not found' }, { status: 404 });
        }

        if (!test.completed_at) {
            return NextResponse.json({ error: 'Test is not completed yet' }, { status: 409 });
        }

        const { data: answerRows } = await supabase
            .from('test_answers')
            .select('question_id, selected_option, is_correct, time_spent_seconds')
            .eq('test_id', testId);

        const questionIds = Array.from(new Set((answerRows || []).map(row => String(row.question_id))));
        let questionMap = {};
        if (questionIds.length > 0) {
            const { data: questions } = await supabase
                .from('questions')
                .select('id, text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, year_asked, exam_name, is_teacher_reviewed')
                .in('id', questionIds);
            questionMap = Object.fromEntries((questions || []).map(q => [String(q.id), q]));
        }

        const answers = (answerRows || []).map(row => {
            const question = questionMap[String(row.question_id)] || {};
            return {
                question_id: row.question_id,
                selected_option: row.selected_option,
                correct_option: question.correct_option || null,
                is_correct: row.is_correct,
                time_spent_seconds: row.time_spent_seconds || 0,
                explanation: question.explanation,
                text: question.text,
                option_a: question.option_a,
                option_b: question.option_b,
                option_c: question.option_c,
                option_d: question.option_d,
                difficulty: question.difficulty,
                year_asked: question.year_asked,
                exam_name: question.exam_name,
                is_teacher_reviewed: question.is_teacher_reviewed,
            };
        });

        const score = answers.length > 0
            ? calculateNEETScore(answers)
            : {
                rawScore: Math.max(0, test.score || 0),
                scaledScore: Math.max(0, test.score || 0),
                maxMarks: (test.total_questions || 0) * 4,
                correct: test.correct_count || 0,
                incorrect: test.incorrect_count || 0,
                unanswered: test.unanswered_count || 0,
                totalQuestions: test.total_questions || 0,
                accuracy: test.total_questions ? Math.round(((test.correct_count || 0) / test.total_questions) * 100) : 0,
                negativeMarks: test.incorrect_count || 0,
                timeTaken: test.time_taken_seconds || 0,
            };

        const { data: profile } = await supabase
            .from('users')
            .select('xp, streak')
            .eq('id', user.id)
            .single();

        return NextResponse.json({
            score,
            xpEarned: 0,
            level: getLevelFromXP(profile?.xp || 0),
            streak: profile?.streak || 0,
            badges: [],
            answers,
            referralRewardUnlocked: false,
            recovered: true,
        });
    } catch (error) {
        console.error('Test result recovery error:', error);
        return NextResponse.json({ error: 'Failed to load test result' }, { status: 500 });
    }
}
