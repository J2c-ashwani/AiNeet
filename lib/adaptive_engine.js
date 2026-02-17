
import { getDb } from './db.js';

// Constants for Elo Rating System
const K_FACTOR = 32; // Volatility factor (higher = faster changes)
const DEFAULT_RATING = 1200; // Starting rating for new users/questions

/**
 * Calculate expected score based on ratings
 * E_a = 1 / (1 + 10 ^ ((R_b - R_a) / 400))
 */
function getExpectedScore(ratingA, ratingB) {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Update dynamic difficulty for a question based on user interaction
 */
export function updateQuestionDifficulty(questionId, isCorrect, userMastery) {
    const db = getDb();

    // Get current difficulty or initialize
    let qStats = db.prepare('SELECT difficulty_score, attempts, correct_attempts FROM question_difficulty_dynamic WHERE question_id = ?').get(questionId);

    if (!qStats) {
        // Initialize if not exists
        db.prepare('INSERT INTO question_difficulty_dynamic (question_id, difficulty_score) VALUES (?, ?)').run(questionId, DEFAULT_RATING);
        qStats = { difficulty_score: DEFAULT_RATING, attempts: 0, correct_attempts: 0 };
    }

    const currentDiff = qStats.difficulty_score;
    const actualScore = isCorrect ? 0 : 1; // If user is correct (1), question "lost" (0). Harder questions lose less often.
    // Wait logic check:
    // If User (1200) beats Question (1200), User goes up, Question goes down (easier).
    // So Question's actual score is 0 if User is correct.

    const expectedScore = getExpectedScore(currentDiff, userMastery || DEFAULT_RATING);
    const newDiff = currentDiff + K_FACTOR * (actualScore - expectedScore);

    db.prepare(`
        UPDATE question_difficulty_dynamic 
        SET difficulty_score = ?, attempts = attempts + 1, correct_attempts = correct_attempts + ?, last_updated = datetime('now')
        WHERE question_id = ?
    `).run(newDiff, isCorrect ? 1 : 0, questionId);

    return newDiff;
}

/**
 * Update user mastery for a topic
 */
export function updateUserMastery(userId, topicId, isCorrect, questionDifficulty) {
    const db = getDb();

    let uStats = db.prepare('SELECT mastery_score, questions_attempted FROM user_topic_mastery WHERE user_id = ? AND topic_id = ?').get(userId, topicId);

    if (!uStats) {
        db.prepare('INSERT INTO user_topic_mastery (user_id, topic_id, mastery_score) VALUES (?, ?, ?)').run(userId, topicId, DEFAULT_RATING);
        uStats = { mastery_score: DEFAULT_RATING, questions_attempted: 0 };
    }

    const currentMastery = uStats.mastery_score;
    const actualScore = isCorrect ? 1 : 0;
    const expectedScore = getExpectedScore(currentMastery, questionDifficulty || DEFAULT_RATING);

    const newMastery = currentMastery + K_FACTOR * (actualScore - expectedScore);

    db.prepare(`
        UPDATE user_topic_mastery 
        SET mastery_score = ?, questions_attempted = questions_attempted + 1, last_updated = datetime('now')
        WHERE user_id = ? AND topic_id = ?
    `).run(newMastery, userId, topicId);

    return newMastery;
}

/**
 * Select the next best question for adaptive practice
 */
export function getAdaptiveQuestion(userId, subjectId, topicId = null, excludeIds = []) {
    const db = getDb();

    // Get user mastery
    let targetRating = DEFAULT_RATING;
    if (topicId) {
        const uStats = db.prepare('SELECT mastery_score FROM user_topic_mastery WHERE user_id = ? AND topic_id = ?').get(userId, topicId);
        if (uStats) targetRating = uStats.mastery_score;
    } else {
        // query chapters by subject_id
        const avg = db.prepare(`
            SELECT AVG(mastery_score) as s FROM user_topic_mastery 
            WHERE user_id = ? AND topic_id IN (SELECT id FROM topics WHERE chapter_id IN (SELECT id FROM chapters WHERE subject_id = ?))
        `).get(userId, subjectId);
        if (avg.s) targetRating = avg.s;
    }

    // Find question closest to target rating
    // We ideally want questions slightly harder (+20 Elo) for learning, or equal for testing.
    // Let's target range [rating - 50, rating + 100]

    const idealDiff = targetRating + 20;

    // Join with questions table to filter by subject/topic and exclude answered
    let query = `
        SELECT q.*, COALESCE(d.difficulty_score, 1200) as difficulty
        FROM questions q
        LEFT JOIN question_difficulty_dynamic d ON q.id = d.question_id
        WHERE q.id NOT IN (SELECT question_id FROM test_answers WHERE test_id IN (SELECT id FROM tests WHERE user_id = ?))
    `;

    const params = [userId];

    if (excludeIds.length > 0) {
        query += ` AND q.id NOT IN (${excludeIds.map(() => '?').join(',')})`;
        params.push(...excludeIds);
    }

    if (topicId) {
        query += ' AND q.topic_id = ?';
        params.push(topicId);
    } else if (subjectId) {
        query += ' AND q.subject_id = ?';
        params.push(subjectId);
    }

    query += ` ORDER BY ABS(COALESCE(d.difficulty_score, 1200) - ?) ASC LIMIT 1`;
    params.push(idealDiff);

    return db.prepare(query).get(...params);
}
