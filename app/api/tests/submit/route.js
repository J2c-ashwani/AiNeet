import { Icon } from '@/components/ui/Icon';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { safeRpc, safeUpdate, safeInsert } from '@/lib/core/db-safe';
import { getUserFromRequest } from '@/lib/core/auth';
import { calculateNEETScore, calculateXP, getLevelFromXP } from '@/lib/scoring';
import { updateUserMastery, updateQuestionDifficulty } from '@/lib/adaptive_engine';
import { scheduleNewCard } from '@/lib/spaced_repetition';
import { applyTrustXpModifier, calculateTrustRecovery, getTrustHint } from '@/lib/trust-engine';
import * as Sentry from '@sentry/nextjs';
import { logError } from '@/lib/error-logger';
import { logAcademicEvent } from '@/lib/core/academic-timeline';

const ACHIEVEMENTS = [
    { id: 'first_test', name: 'First Steps', description: 'Completed your first test', icon: '🎯' },
    { id: 'test_veteran', name: 'Test Veteran', description: 'Completed 10 tests', icon: '🏆' },
    { id: 'perfect_score', name: 'Perfectionist', description: 'Scored 100% in a test', icon: '💯' },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Answered a question in under 10 seconds', icon: '⚡' },
    { id: 'streak_7', name: 'Week Warrior', description: 'Maintained a 7-day streak', icon: '🔥' },
];

export async function POST(request) {
    let decoded = null;
    try {
        const supabase = await getDb();
        decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        let _body;

        try { _body = await request.json(); } catch (parseErr) {

            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

        }

        const { testId, answers, timeTaken, notification_id } = _body;

        if (notification_id) {
            // Background update to not block submission
            supabase.from('notifications_log')
                .update({ action_completed_at: new Date().toISOString() })
                .eq('id', notification_id)
                .eq('user_id', decoded.id)
                .then(() => {})
                .catch(err => console.error('Failed to mark notification complete', err));
        }

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

        // Timer Authoritativeness Validation
        if (test.expires_at) {
            const expiresAt = new Date(test.expires_at).getTime();
            // Allow a 10-second grace period for network delays
            if (Date.now() > expiresAt + 10000) {
                return NextResponse.json({ error: 'Test has expired. Submissions are no longer accepted.' }, { status: 403 });
            }
        }

        // Idempotency Lock
        let lockAcquired = false;
        try {
            await logAcademicEvent({
                eventType: 'test_submitted',
                userId: decoded.id,
                testId: testId,
                sourceRoute: '/api/tests/submit'
            });
            lockAcquired = true;
        } catch (lockErr) {
            if (lockErr.originalError?.code === '23505') {
                return NextResponse.json({ error: 'Duplicate submission blocked.' }, { status: 409 });
            }
            throw lockErr;
        }

        // ─── PHASE 1: Score all answers in pure memory — zero DB calls ─────────────
        const processedAnswers = [];
        const testAnswersToInsert = [];
        let fastAnswerCount = 0;

        // Fetch all questions at once (already optimal)
        const questionIds = Array.from(new Set(answers.map(a => String(a.questionId))));
        const { data: questions } = await supabase.from('questions').select('*').in('id', questionIds);
        const questionMap = {};
        if (questions) questions.forEach(q => questionMap[String(q.id)] = q);

        // Collect affected topic_ids and wrong answers — computed in memory, no DB
        const topicIds = new Set();
        const answeredQuestions = []; // { question, answer, isCorrect, timeSpent }
        const wrongAnswerQuestionIds = [];

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
                is_correct: answer.selectedOption ? isCorrect : null,
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
                if (question.topic_id) topicIds.add(String(question.topic_id));
                answeredQuestions.push({ question, answer, isCorrect, timeSpent });
                if (!isCorrect) wrongAnswerQuestionIds.push(String(answer.questionId));
            }
        }

        // ─── PHASE 2: Batch-fetch all required DB state in parallel ──────────────
        const topicIdArray = Array.from(topicIds);

        const [
            { data: existingPerformance },
            { data: existingMastery },
            { data: existingDifficulty },
            { data: existingMistakes }
        ] = await Promise.all([
            topicIdArray.length
                ? supabase.from('user_performance').select('*').eq('user_id', decoded.id).in('topic_id', topicIdArray)
                : Promise.resolve({ data: [] }),
            topicIdArray.length
                ? supabase.from('user_topic_mastery').select('mastery_score, topic_id').eq('user_id', decoded.id).in('topic_id', topicIdArray)
                : Promise.resolve({ data: [] }),
            questionIds.length
                ? supabase.from('question_difficulty_dynamic').select('difficulty_score, question_id').in('question_id', questionIds)
                : Promise.resolve({ data: [] }),
            wrongAnswerQuestionIds.length
                ? supabase.from('mistake_log').select('*').eq('user_id', decoded.id).in('question_id', wrongAnswerQuestionIds)
                : Promise.resolve({ data: [] }),
        ]);

        // Index fetched data for O(1) lookups
        const performanceMap = {};
        (existingPerformance || []).forEach(p => performanceMap[String(p.topic_id)] = p);
        const masteryMap = {};
        (existingMastery || []).forEach(m => masteryMap[String(m.topic_id)] = m);
        const difficultyMap = {};
        (existingDifficulty || []).forEach(d => difficultyMap[String(d.question_id)] = d);
        const mistakeMap = {};
        (existingMistakes || []).forEach(m => mistakeMap[String(m.question_id)] = m);

        // ─── PHASE 3: Compute all updates in memory ───────────────────────────────
        const now = new Date().toISOString();
        const performanceUpserts = [];
        const mistakeUpserts = [];
        const adaptiveUpdates = []; // { questionId, isCorrect, topicId, currentMastery, qDiff }

        // Track running aggregates per topic (multiple questions can share a topic)
        const topicRunningAgg = {}; // topic_id -> { totalAttempted, totalCorrect, totalTimeSum }

        for (const { question, answer, isCorrect, timeSpent } of answeredQuestions) {
            const topicId = String(question.topic_id);

            // Aggregate per-topic stats in memory
            if (!topicRunningAgg[topicId]) {
                const existing = performanceMap[topicId];
                topicRunningAgg[topicId] = {
                    total_attempted: existing?.total_attempted || 0,
                    total_correct: existing?.total_correct || 0,
                    total_time_sum: (existing?.avg_time_seconds || 0) * (existing?.total_attempted || 0),
                    exists: !!existing
                };
            }
            const agg = topicRunningAgg[topicId];
            agg.total_attempted += 1;
            agg.total_correct += isCorrect;
            agg.total_time_sum += timeSpent;

            // Collect adaptive engine inputs
            const currentMastery = masteryMap[topicId]?.mastery_score || 1200;
            const qDiff = difficultyMap[String(question.id)]?.difficulty_score || 1200;
            adaptiveUpdates.push({ questionId: question.id, isCorrect: isCorrect === 1, topicId: question.topic_id, currentMastery, qDiff });

            // Collect mistake log upserts
            if (!isCorrect) {
                const existing = mistakeMap[String(answer.questionId)];
                mistakeUpserts.push({
                    user_id: decoded.id,
                    question_id: String(answer.questionId),
                    test_id: testId,
                    mistake_count: (existing?.mistake_count || 0) + 1,
                    last_mistake_at: now
                });
            }
        }

        // Build final user_performance upsert rows
        for (const [topicId, agg] of Object.entries(topicRunningAgg)) {
            performanceUpserts.push({
                user_id: decoded.id,
                topic_id: topicId,
                total_attempted: agg.total_attempted,
                total_correct: agg.total_correct,
                accuracy: agg.total_attempted > 0 ? Math.round((agg.total_correct / agg.total_attempted) * 100 * 10) / 10 : 0,
                avg_time_seconds: agg.total_attempted > 0 ? agg.total_time_sum / agg.total_attempted : 0,
                last_attempted: now
            });
        }

        // ─── PHASE 4: Execute Atomic Test Submission via RPC ─────────────────────────
        const completionTime = new Date().toISOString();
        const scoreData = calculateNEETScore(processedAnswers);
        
        try {
            await safeRpc('submit_test_transaction', {
                p_test_id: testId,
                p_user_id: decoded.id,
                p_score: scoreData.scaledScore,
                p_correct_count: scoreData.correct,
                p_incorrect_count: scoreData.incorrect,
                p_unanswered_count: scoreData.unanswered,
                p_completed_at: completionTime,
                p_time_taken_seconds: timeTaken || 0,
                p_answers: testAnswersToInsert.length > 0 ? testAnswersToInsert : null,
                p_mistakes: mistakeUpserts.length > 0 ? mistakeUpserts : null,
                p_performances: performanceUpserts.length > 0 ? performanceUpserts : null
            }, { route: '/api/tests/submit', userId: decoded.id, testId });
        } catch (rpcErr) {
            // Retry safety: Release the lock if the actual commit failed so they can try again
            if (lockAcquired) {
                await supabase.from('academic_events')
                    .delete()
                    .eq('test_id', testId)
                    .eq('event_type', 'test_submitted');
            }
            throw rpcErr;
        }

        // Adaptive engine + spaced repetition — run in parallel (non-blocking on scoring)
        await Promise.all([
            ...adaptiveUpdates.map(u => updateQuestionDifficulty(u.questionId, u.isCorrect, u.currentMastery).catch(() => {})),
            ...adaptiveUpdates.map(u => updateUserMastery(decoded.id, u.topicId, u.isCorrect, u.qDiff).catch(() => {})),
            ...wrongAnswerQuestionIds.map(qId => scheduleNewCard(decoded.id, qId).catch(() => {})),
        ]);

        const xpEarned = calculateXP(scoreData);

        // Update XP, Level, and Risk Telemetry
        const { data: user } = await supabase.from('users').select('xp, streak, last_active_date, referred_by, trust_score').eq('id', decoded.id).single();

        // [GROWTH ENGINE] Diminishing Returns Math
        const todayStr = new Date().toISOString().split('T')[0];
        const { count: dailyTestCount } = await supabase.from('tests').select('*', { count: 'exact', head: true })
             .eq('user_id', decoded.id).gte('completed_at', todayStr + 'T00:00:00.000Z');

        let xpMultiplier = 1;
        if (dailyTestCount >= 5 && dailyTestCount < 10) xpMultiplier = 0.5; // Soft Cap
        if (dailyTestCount >= 10) xpMultiplier = 0; // Hard Cap for farming limits

        // [GROWTH ENGINE] Adaptive Risk Profiler
        const timePerQuestion = (timeTaken || 1) / (processedAnswers.length || 1);
        let trustPenalty = 0;

        if (processedAnswers.length >= 5 && timePerQuestion < 3) {
             trustPenalty = 15;
             xpMultiplier = 0; // Destroy ROI of speedrunning bots
             console.warn(`[SECURITY] User ${decoded.id} submitted ${processedAnswers.length} Qs in ${timeTaken}s. Trust -15.`);
        } else if (processedAnswers.length >= 5 && timePerQuestion < 6 && scoreData.accuracy > 90) {
             trustPenalty = 5;
             xpMultiplier = 0.5; // Suspiciously perfect and fast
        }

        const actualXpEarned = applyTrustXpModifier(
            Math.floor(xpEarned * xpMultiplier), 
            user?.trust_score
        );

        if (trustPenalty > 0) {
             await safeRpc('decrement_trust_score', { target_user_id: decoded.id, penalty: trustPenalty }, { route: '/api/tests/submit/trust', userId: decoded.id });
        }

        // MD Trust Recovery: Reward positive actions to enable trust restoration
        if (trustPenalty === 0 && processedAnswers.length >= 3) {
            const recoveryPoints = calculateTrustRecovery('test_completed', user?.trust_score);
            if (recoveryPoints > 0) {
                await safeUpdate('users', { id: decoded.id }, {
                    trust_score: Math.min(100, (user?.trust_score || 100) + recoveryPoints)
                }, { route: '/api/tests/submit/trust_recovery', userId: decoded.id });
            }
        }

        if (actualXpEarned > 0) {
             await safeRpc('increment_user_xp_atomic', { target_user_id: decoded.id, amount: actualXpEarned }, { route: '/api/tests/submit/xp', userId: decoded.id });
        }

        // Calculate predicted new XP and Level for frontend without an expensive refetch
        const predictedXp = (user?.xp || 0) + actualXpEarned;
        const newLevel = getLevelFromXP(predictedXp);

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

        // Update user state using atomic streak math instead of overwriting XP blindly
        await safeUpdate('users', { id: decoded.id }, { streak: newStreak, last_active_date: new Date().toISOString() }, { route: '/api/tests/submit/streak', userId: decoded.id });

        // MD Trust Recovery: Streak milestones give bonus trust recovery
        if (newStreak >= 3 && trustPenalty === 0) {
            const streakRecovery = calculateTrustRecovery('streak_maintained', user?.trust_score);
            if (streakRecovery > 0) {
                await safeUpdate('users', { id: decoded.id }, {
                    trust_score: Math.min(100, (user?.trust_score || 100) + streakRecovery)
                }, { route: '/api/tests/submit/streak_trust', userId: decoded.id });
            }
        }

        // Achievements Logic
        const newBadges = [];
        const checkAndAward = async (id) => {
            const { data: existing } = await supabase.from('user_achievements').select('id').eq('user_id', decoded.id).eq('badge_type', id).single();
            if (!existing) {
                const badge = ACHIEVEMENTS.find(b => b.id === id);
                if (badge) {
                    await safeInsert('user_achievements', {
                        user_id: decoded.id, badge_type: id, badge_name: badge.name, description: badge.description
                    }, { route: '/api/tests/submit/badge', userId: decoded.id });
                    newBadges.push(badge);
                }
            }
        };

        const { count: testCount } = await supabase.from('tests').select('*', { count: 'exact', head: true }).eq('user_id', decoded.id).not('completed_at', 'is', null);

        // [GROWTH ENGINE] Meaningful Action Referral Unlock & Atomic Dopamine Reward
        let referralRewardUnlocked = false;
        if (testCount === 1 && user?.referred_by) {
            // Log the attempt immediately for analytics
            await supabase.rpc('increment_referrals', { target_user_id: user.referred_by });
            
            // Acquire Idempotency Lock
            const { data: claimed } = await supabase.rpc('claim_referral_reward', { target_user_id: decoded.id });
            
            if (claimed) {
                // Fetch the late-evaluated Fraud Risk Score
                const { data: riskProfile } = await supabase.from('users').select('fraud_risk_score').eq('id', decoded.id).single();
                
                if (riskProfile && riskProfile.fraud_risk_score < 80) {
                    console.log(`[GROWTH ENGINE] Validation passed. Dispensing 24h Premium & +20 Trust to ${decoded.id} and ${user.referred_by}`);
                    const premiumTime = new Date(Date.now() + 86400000).toISOString();
                    
                    // Reward New User (Self)
                    await supabase.from('users').update({ 
                        premium_until: premiumTime,
                        trust_score: Math.min(100, (user.trust_score || 100) + 20)
                    }).eq('id', decoded.id);
                    
                    // Reward Referrer
                    await supabase.from('users').update({ premium_until: premiumTime }).eq('id', user.referred_by);
                    
                    referralRewardUnlocked = true;
                } else {
                    console.warn(`[GROWTH ENGINE] REFERRAL BLOCKED. Risk Score (${riskProfile?.fraud_risk_score}) exceeded threshold for user ${decoded.id}.`);
                }
            }
        }

        if (testCount === 1) await checkAndAward('first_test');
        if (testCount >= 10) await checkAndAward('test_veteran');
        if (scoreData.accuracy >= 100 && scoreData.attempted > 5) await checkAndAward('perfect_score');
        if (fastAnswerCount >= 1) await checkAndAward('speed_demon');
        if (newStreak >= 7) await checkAndAward('streak_7');

        // MD Transparency: Include trust hint so frontend can show context
        const trustHint = getTrustHint(user?.trust_score);

        return NextResponse.json({ 
            score: scoreData, xpEarned: actualXpEarned, level: newLevel, 
            streak: newStreak, badges: newBadges, answers: processedAnswers,
            trustHint: trustHint.show ? trustHint : undefined,
            referralRewardUnlocked
        });
    } catch (error) {
        console.error('CRITICAL Submit error:', error);
        // P0-4: Isolated logging — logger crash must never mask primary error
        try {
            Sentry.captureException(error, {
                tags: { flow: 'test-submit' },
                extra: { decodedUser: !!decoded }
            });
            // Backup DB logger (survives Sentry quota exhaustion)
            const supabase = await getDb();
            await logError(supabase, { userId: decoded?.id, route: '/api/tests/submit', method: 'POST', error });
        } catch (logErr) {
            console.error('[SUBMIT_LOGGER_FAILED]', logErr.message);
        }
        return NextResponse.json({ error: 'Failed to submit test. Please try again in a moment.' }, { status: 500 });
    }
}
