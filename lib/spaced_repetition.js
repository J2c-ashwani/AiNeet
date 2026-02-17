
import { getDb } from './db.js';

// SM-2 Constants
const MIN_EF = 1.3;

/**
 * Calculate next review parameters using SM-2 Algorithm
 * @param {number} quality - User rating (0=Blackout, 5=Perfect)
 * @param {number} currentEF - Current Easiness Factor
 * @param {number} currentInterval - Current Interval in days
 * @param {number} repetitions - Number of successful repetitions
 */
export function calculateSM2(quality, currentEF, currentInterval, repetitions) {
    let nextEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (nextEF < MIN_EF) nextEF = MIN_EF;

    let nextInterval;
    let nextReps;

    if (quality < 3) {
        // Failed / Hard
        nextReps = 0;
        nextInterval = 1; // Review tomorrow
    } else {
        nextReps = repetitions + 1;
        if (nextReps === 1) nextInterval = 1;
        else if (nextReps === 2) nextInterval = 6;
        else nextInterval = Math.round(currentInterval * nextEF);
    }

    return { nextEF, nextInterval, nextReps };
}

/**
 * Log a review and update schedule
 */
export function logReview(userId, questionId, quality) {
    const db = getDb();

    // Get current state
    const current = db.prepare('SELECT * FROM revision_schedule WHERE user_id = ? AND question_id = ?').get(userId, questionId);

    let ef = 2.5;
    let interval = 0;
    let reps = 0;

    if (current) {
        ef = current.easiness_factor;
        interval = current.interval;
        reps = current.repetitions;
    }

    const result = calculateSM2(quality, ef, interval, reps);

    // Calculate next date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + result.nextInterval);
    const nextDateStr = nextDate.toISOString();

    db.prepare(`
        INSERT OR REPLACE INTO revision_schedule 
        (user_id, question_id, easiness_factor, interval, repetitions, next_review_at, last_reviewed_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
        userId,
        questionId,
        result.nextEF,
        result.nextInterval,
        result.nextReps,
        nextDateStr
    );

    return result;
}

/**
 * Get pending reviews for a user
 */
export function getDueReviews(userId, limit = 10) {
    const db = getDb();
    return db.prepare(`
        SELECT r.*, q.text, q.subject_id, s.name as subject_name
        FROM revision_schedule r
        JOIN questions q ON r.question_id = q.id
        LEFT JOIN subjects s ON q.subject_id = s.id
        WHERE r.user_id = ? AND r.next_review_at <= datetime('now')
        ORDER BY r.next_review_at ASC
        LIMIT ?
    `).all(userId, limit);
}

/**
 * Initialize a question for revision (e.g. after a mistake)
 */
export function scheduleNewCard(userId, questionId) {
    const db = getDb();
    // Start with interval 0 (due immediately/tomorrow)
    const nextDate = new Date().toISOString();

    db.prepare(`
        INSERT OR IGNORE INTO revision_schedule 
        (user_id, question_id, easiness_factor, interval, repetitions, next_review_at, last_reviewed_at)
        VALUES (?, ?, 2.5, 0, 0, ?, NULL)
    `).run(userId, questionId, nextDate);
}
