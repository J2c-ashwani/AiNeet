import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { calculateNEETScore, calculateXP, getLevelFromXP } from '@/lib/scoring';
import { updateUserMastery, updateQuestionDifficulty } from '@/lib/adaptive_engine';
import { scheduleNewCard } from '@/lib/spaced_repetition';

const ACHIEVEMENTS = [
    { id: 'first_test', name: 'First Steps', description: 'Completed your first test', icon: '🎯' },
    { id: 'test_veteran', name: 'Test Veteran', description: 'Completed 10 tests', icon: '🏆' },
    { id: 'perfect_score', name: 'Perfectionist', description: 'Scored 100% in a test', icon: '💯' },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Answered a question in under 10 seconds', icon: '⚡' },
    { id: 'streak_7', name: 'Week Warrior', description: 'Maintained a 7-day streak', icon: '🔥' },
];

export async function POST(request) {
    try {
        const supabase = getSupabase();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { testId, answers, timeTaken } = await request.json();

        if (!testId || typeof testId !== 'string') {
            return NextResponse.json({ error: 'Valid test ID is required' }, { status: 400 });
        }
        if (!Array.isArray(answers) || answers.length === 0) {
            return NextResponse.json({ error: 'Answers array is required' }, { status: 400 });
        }

        const { data: test } = await supabase
            .from('tests')
            .select('*')
            .eq('id', testId)
            .eq('user_id', decoded.id)
            .single();

        if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 });
        if (test.completed_at) return NextResponse.json({ error: 'Test already submitted' }, { status: 400 });

        const processedAnswers = [];
        let fastAnswerCount = 0;

        // Fetch all questions related to the answers at once to avoid a loop query
        const questionIds = Array.from(new Set(answers.map(a => String(a.questionId))));
        const { data: questions } = await supabase.from('questions').select('*').in('id', questionIds);
        const questionMap = {};
        if (questions) {
            questions.forEach(q => questionMap[String(q.id)] = q);
        }

        const testAnswersToInsert = [];

        for (const answer of answers) {
            const question = questionMap[String(answer.questionId)];
            if (!question) continue;

            const isCorrect = answer.selectedOption === question.correct_option ? 1 : 0;
            const timeSpent = answer.timeSpent || 0;

            if (isCorrect && timeSpent < 10) fastAnswerCount++;

            testAnswersToInsert.push({
                test_id: testId,
                question_id: String(answer.questionId),
                selected_option: answer.selectedOption || null,
                is_correct: answer.selectedOption ? (isCorrect === 1) : null,
                time_spent_seconds: timeSpent
            });

            processedAnswers.push({
                question_id: answer.questionId, selected_option: answer.selectedOption,
                correct_option: question.correct_option, is_correct: isCorrect,
                time_spent_seconds: timeSpent, explanation: question.explanation,
                text: question.text, option_a: question.option_a, option_b: question.option_b,
                option_c: question.option_c, option_d: question.option_d, difficulty: question.difficulty
            });

            if (answer.selectedOption) {
                // Upsert user_performance 
                const { data: pData } = await supabase.from('user_performance').select('*').eq('user_id', decoded.id).eq('topic_id', String(question.topic_id)).single();

                if (pData) {
                    const newTotal = (pData.total_attempted || 0) + 1;
                    const newCorrect = (pData.total_correct || 0) + isCorrect;
                    await supabase.from('user_performance').update({
                        total_attempted: newTotal,
                        total_correct: newCorrect,
                        accuracy: Math.round((newCorrect / newTotal) * 100 * 10) / 10,
                        avg_time_seconds: ((pData.avg_time_seconds || 0) * (pData.total_attempted || 0) + timeSpent) / newTotal,
                        last_attempted: new Date().toISOString()
                    }).eq('user_id', decoded.id).eq('topic_id', String(question.topic_id));
                } else {
                    await supabase.from('user_performance').insert({
                        user_id: decoded.id, topic_id: String(question.topic_id),
                        accuracy: isCorrect * 100, total_attempted: 1, total_correct: isCorrect,
                        avg_time_seconds: timeSpent, last_attempted: new Date().toISOString()
                    });
                }

                // Adaptive Learning
                const { data: masteryRow } = await supabase.from('user_topic_mastery').select('mastery_score').eq('user_id', decoded.id).eq('topic_id', String(question.topic_id)).single();
                const currentMastery = masteryRow?.mastery_score || 1200;

                await updateQuestionDifficulty(question.id, isCorrect === 1, currentMastery);

                const { data: diffRow } = await supabase.from('question_difficulty_dynamic').select('difficulty_score').eq('question_id', String(question.id)).single();
                const qDiff = diffRow?.difficulty_score || 1200;
                await updateUserMastery(decoded.id, question.topic_id, isCorrect === 1, qDiff);

                if (!isCorrect) {
                    // upsert mistake log
                    const { data: mLog } = await supabase.from('mistake_log').select('*').eq('user_id', decoded.id).eq('question_id', String(answer.questionId)).single();
                    if (mLog) {
                        await supabase.from('mistake_log').update({
                            test_id: testId, mistake_count: (mLog.mistake_count || 0) + 1, last_mistake_at: new Date().toISOString()
                        }).eq('user_id', decoded.id).eq('question_id', String(answer.questionId));
                    } else {
                        await supabase.from('mistake_log').insert({
                            user_id: decoded.id, question_id: String(answer.questionId), test_id: testId, mistake_count: 1, last_mistake_at: new Date().toISOString()
                        });
                    }
                    await scheduleNewCard(decoded.id, answer.questionId);
                }
            }
        }

        if (testAnswersToInsert.length > 0) {
            await supabase.from('test_answers').insert(testAnswersToInsert);
        }

        const scoreData = calculateNEETScore(processedAnswers);
        const xpEarned = calculateXP(scoreData);

        await supabase.from('tests').update({
            score: scoreData.scaledScore, correct_count: scoreData.correct,
            incorrect_count: scoreData.incorrect, unanswered_count: scoreData.unanswered,
            time_taken_seconds: timeTaken || 0, completed_at: new Date().toISOString()
        }).eq('id', testId);

        // Update XP and Level
        const { data: user } = await supabase.from('users').select('xp, streak, last_active_date').eq('id', decoded.id).single();
        const newXp = (user?.xp || 0) + xpEarned;
        const newLevel = getLevelFromXP(newXp);

        // Streak Logic
        const today = new Date().toISOString().split('T')[0];
        const lastActive = user?.last_active_date ? user.last_active_date.split('T')[0] : null;
        let newStreak = user?.streak || 0;

        if (lastActive !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastActive === yesterdayStr) {
                newStreak++;
            } else {
                newStreak = 1;
            }
        }

        await supabase.from('users').update({ xp: newXp, level: newLevel.level, streak: newStreak, last_active_date: new Date().toISOString() }).eq('id', decoded.id);

        // Achievements Logic
        const newBadges = [];
        const checkAndAward = async (id) => {
            const { data: existing } = await supabase.from('user_achievements').select('id').eq('user_id', decoded.id).eq('badge_type', id).single();
            if (!existing) {
                const badge = ACHIEVEMENTS.find(b => b.id === id);
                if (badge) {
                    await supabase.from('user_achievements').insert({
                        user_id: decoded.id, badge_type: id, badge_name: badge.name, description: badge.description
                    });
                    newBadges.push(badge);
                }
            }
        };

        const { count: testCount } = await supabase.from('tests').select('*', { count: 'exact', head: true }).eq('user_id', decoded.id).not('completed_at', 'is', null);

        if (testCount >= 1) await checkAndAward('first_test');
        if (testCount >= 10) await checkAndAward('test_veteran');
        if (scoreData.accuracy >= 100 && scoreData.attempted > 5) await checkAndAward('perfect_score');
        if (fastAnswerCount >= 1) await checkAndAward('speed_demon');
        if (newStreak >= 7) await checkAndAward('streak_7');

        return NextResponse.json({ score: scoreData, xpEarned, level: newLevel, streak: newStreak, badges: newBadges, answers: processedAnswers });
    } catch (error) {
        console.error('Submit error:', error);
        return NextResponse.json({ error: 'Failed to submit test' }, { status: 500 });
    }
}
