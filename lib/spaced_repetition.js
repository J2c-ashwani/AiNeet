import { safeSelect, safeUpsert, safeInsert } from './core/db-safe';
import { logAcademicEvent } from './core/academic-timeline';
import { getDb } from './core/db';
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
    const clampedQuality = Math.max(0, Math.min(5, quality));
    let nextEF = currentEF + (0.1 - (5 - clampedQuality) * (0.08 + (5 - clampedQuality) * 0.02));
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
export async function logReview(userId, questionId, quality) {
    const current = await safeSelect('revision_schedule', (q) => 
        q.select('*').eq('user_id', userId).eq('question_id', String(questionId)).single(), 
    { route: 'logReview', userId }).catch(() => null);

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

    await safeUpsert('revision_schedule', {
        user_id: userId,
        question_id: String(questionId),
        easiness_factor: result.nextEF,
        interval: result.nextInterval,
        repetitions: result.nextReps,
        next_review_at: nextDateStr,
        last_reviewed_at: new Date().toISOString()
    }, 'user_id, question_id', { route: 'logReview', userId });

    await logAcademicEvent({
        eventType: 'revision_reviewed',
        userId,
        questionId: String(questionId),
        payload: { quality, result },
        sourceRoute: 'logReview'
    });

    return result;
}

/**
 * Get pending reviews for a user
 */
export async function getDueReviews(userId, limit = 10) {
    const supabase = await getDb();

    const { data: reviews } = await supabase
        .from('revision_schedule')
        .select(`
            *,
            questions!inner (
                text, subject_id, subjects (name)
            )
        `)
        .eq('user_id', userId)
        .lte('next_review_at', new Date().toISOString())
        .order('next_review_at', { ascending: true })
        .limit(limit);

    if (!reviews) return [];

    return reviews.map(r => ({
        ...r,
        text: r.questions?.text,
        subject_id: r.questions?.subject_id,
        subject_name: r.questions?.subjects?.name
    }));
}

/**
 * Initialize a question for revision (e.g. after a mistake)
 */
export async function scheduleNewCard(userId, questionId) {
    const nextDate = new Date().toISOString();

    const existing = await safeSelect('revision_schedule', (q) => 
        q.select('id').eq('user_id', userId).eq('question_id', String(questionId)).maybeSingle(),
    { route: 'scheduleNewCard', userId });

    if (!existing) {
        await safeInsert('revision_schedule', {
            user_id: userId,
            question_id: String(questionId),
            easiness_factor: 2.5,
            interval: 0,
            repetitions: 0,
            next_review_at: nextDate
        }, { route: 'scheduleNewCard', userId });
        
        await logAcademicEvent({
            eventType: 'revision_card_created',
            userId,
            questionId: String(questionId),
            sourceRoute: 'scheduleNewCard'
        });
    }
}
