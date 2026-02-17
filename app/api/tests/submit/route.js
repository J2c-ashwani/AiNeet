import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
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
        initializeDatabase();
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { testId, answers, timeTaken } = await request.json();

        const test = db.prepare('SELECT * FROM tests WHERE id = ? AND user_id = ?').get(testId, decoded.id);
        if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 });
        if (test.completed_at) return NextResponse.json({ error: 'Test already submitted' }, { status: 400 });

        const processedAnswers = [];
        const insertAnswer = db.prepare(`INSERT INTO test_answers (test_id, question_id, selected_option, is_correct, time_spent_seconds) VALUES (?, ?, ?, ?, ?)`);
        const updatePerformance = db.prepare(`
      INSERT INTO user_performance (user_id, topic_id, accuracy, total_attempted, total_correct, avg_time_seconds, last_attempted)
      VALUES (?, ?, ?, 1, ?, ?, datetime('now'))
      ON CONFLICT(user_id, topic_id) DO UPDATE SET
        total_attempted = total_attempted + 1,
        total_correct = total_correct + excluded.total_correct,
        accuracy = ROUND(CAST((total_correct + excluded.total_correct) AS REAL) / (total_attempted + 1) * 100, 1),
        avg_time_seconds = (avg_time_seconds * total_attempted + excluded.avg_time_seconds) / (total_attempted + 1),
        last_attempted = datetime('now')
    `);
        const insertMistake = db.prepare(`INSERT OR IGNORE INTO mistake_log (user_id, question_id, test_id, mistake_count, last_mistake_at) VALUES (?, ?, ?, 1, datetime('now'))`);

        let fastAnswerCount = 0;

        const processTransaction = db.transaction(() => {
            for (const answer of answers) {
                const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(answer.questionId);
                if (!question) continue;

                const isCorrect = answer.selectedOption === question.correct_option ? 1 : 0;
                const timeSpent = answer.timeSpent || 0;

                if (isCorrect && timeSpent < 10) fastAnswerCount++;

                insertAnswer.run(testId, answer.questionId, answer.selectedOption || null, answer.selectedOption ? isCorrect : null, timeSpent);

                processedAnswers.push({
                    question_id: answer.questionId, selected_option: answer.selectedOption,
                    correct_option: question.correct_option, is_correct: isCorrect,
                    time_spent_seconds: timeSpent, explanation: question.explanation,
                    text: question.text, option_a: question.option_a, option_b: question.option_b,
                    option_c: question.option_c, option_d: question.option_d, difficulty: question.difficulty
                });

                if (answer.selectedOption) {
                    updatePerformance.run(decoded.id, question.topic_id, isCorrect * 100, isCorrect, timeSpent);

                    // Adaptive Learning Updates
                    // 1. Get current user mastery for this topic (to update question difficulty)
                    const currentMastery = db.prepare('SELECT mastery_score FROM user_topic_mastery WHERE user_id = ? AND topic_id = ?').get(decoded.id, question.topic_id)?.mastery_score || 1200;

                    // 2. Update Question Difficulty
                    updateQuestionDifficulty(question.id, isCorrect, currentMastery);

                    // 3. Update User Mastery (Topic)
                    // We need question's current dynamic difficulty
                    const qDiff = db.prepare('SELECT difficulty_score FROM question_difficulty_dynamic WHERE question_id = ?').get(question.id)?.difficulty_score || 1200;
                    updateUserMastery(decoded.id, question.topic_id, isCorrect, qDiff);

                    if (!isCorrect) {
                        insertMistake.run(decoded.id, answer.questionId, testId);
                        scheduleNewCard(decoded.id, answer.questionId);
                    }
                }
            }

            const scoreData = calculateNEETScore(processedAnswers);
            const xpEarned = calculateXP(scoreData);

            db.prepare(`UPDATE tests SET score = ?, correct_count = ?, incorrect_count = ?, unanswered_count = ?, time_taken_seconds = ?, completed_at = datetime('now') WHERE id = ?`).run(scoreData.scaledScore, scoreData.correct, scoreData.incorrect, scoreData.unanswered, timeTaken || 0, testId);

            // Update XP and Level
            db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(xpEarned, decoded.id);
            const user = db.prepare('SELECT xp, streak, last_active_date FROM users WHERE id = ?').get(decoded.id);
            const newLevel = getLevelFromXP(user.xp);
            db.prepare('UPDATE users SET level = ? WHERE id = ?').run(newLevel.level, decoded.id);

            // Streak Logic
            const today = new Date().toISOString().split('T')[0];
            const lastActive = user.last_active_date ? user.last_active_date.split('T')[0] : null;
            let newStreak = user.streak;

            if (lastActive !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastActive === yesterdayStr) {
                    newStreak++;
                } else {
                    newStreak = 1;
                }
                db.prepare("UPDATE users SET streak = ?, last_active_date = datetime('now') WHERE id = ?").run(newStreak, decoded.id);
            }

            // Achievements Logic
            const newBadges = [];
            const checkAndAward = (id) => {
                const existing = db.prepare('SELECT id FROM user_achievements WHERE user_id = ? AND badge_type = ?').get(decoded.id, id);
                if (!existing) {
                    const badge = ACHIEVEMENTS.find(b => b.id === id);
                    if (badge) {
                        db.prepare('INSERT INTO user_achievements (user_id, badge_type, badge_name, description) VALUES (?, ?, ?, ?)').run(decoded.id, id, badge.name, badge.description);
                        newBadges.push(badge);
                    }
                }
            };

            const testCount = db.prepare('SELECT COUNT(*) as c FROM tests WHERE user_id = ? AND completed_at IS NOT NULL').get(decoded.id).c;

            if (testCount >= 1) checkAndAward('first_test');
            if (testCount >= 10) checkAndAward('test_veteran');
            if (scoreData.accuracy >= 100 && scoreData.attempted > 5) checkAndAward('perfect_score');
            if (fastAnswerCount >= 1) checkAndAward('speed_demon'); // Simplified logic
            if (newStreak >= 7) checkAndAward('streak_7');

            return { scoreData, xpEarned, newLevel, newStreak, newBadges };
        });

        const { scoreData, xpEarned, newLevel, newStreak, newBadges } = processTransaction();
        return NextResponse.json({ score: scoreData, xpEarned, level: newLevel, streak: newStreak, badges: newBadges, answers: processedAnswers });
    } catch (error) {
        console.error('Submit error:', error);
        return NextResponse.json({ error: 'Failed to submit test' }, { status: 500 });
    }
}
