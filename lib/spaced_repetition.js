import { getSupabase } from './supabase.js';

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
export async function logReview(userId, questionId, quality) {
    const supabase = getSupabase();

    // Get current state
    const { data: current } = await supabase
        .from('revision_schedule')
        .select('*')
        .eq('user_id', userId)
        .eq('question_id', String(questionId))
        .single();

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

    const { error: upsertError } = await supabase
        .from('revision_schedule')
        .upsert({
            user_id: userId,
            question_id: String(questionId),
            easiness_factor: result.nextEF,
            interval: result.nextInterval,
            repetitions: result.nextReps,
            next_review_at: nextDateStr,
            last_reviewed_at: new Date().toISOString()
        }, { onConflict: 'user_id, question_id' });

    if (upsertError) throw upsertError;

    return result;
}

/**
 * Get pending reviews for a user
 */
export async function getDueReviews(userId, limit = 10) {
    const supabase = getSupabase();

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
    const supabase = getSupabase();
    // Start with interval 0 (due immediately/tomorrow)
    const nextDate = new Date().toISOString();

    const { count } = await supabase.from('revision_schedule')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('question_id', String(questionId));

    if (!count) {
        await supabase.from('revision_schedule')
            .insert({
                user_id: userId,
                question_id: String(questionId),
                easiness_factor: 2.5,
                interval: 0,
                repetitions: 0,
                next_review_at: nextDate
            });
    }
}
