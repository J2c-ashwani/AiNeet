import { getSupabase } from './supabase.js';

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
export async function updateQuestionDifficulty(questionId, isCorrect, userMastery) {
    const supabase = getSupabase();

    // Get current difficulty or initialize
    let { data: qStats } = await supabase
        .from('question_difficulty_dynamic')
        .select('difficulty_score, attempts, correct_attempts')
        .eq('question_id', String(questionId))
        .single();

    if (!qStats) {
        // Initialize if not exists
        await supabase
            .from('question_difficulty_dynamic')
            .insert({ question_id: String(questionId), difficulty_score: DEFAULT_RATING });
        qStats = { difficulty_score: DEFAULT_RATING, attempts: 0, correct_attempts: 0 };
    }

    const currentDiff = qStats.difficulty_score;
    const actualScore = isCorrect ? 0 : 1;

    const expectedScore = getExpectedScore(currentDiff, userMastery || DEFAULT_RATING);
    const newDiff = currentDiff + K_FACTOR * (actualScore - expectedScore);

    await supabase
        .from('question_difficulty_dynamic')
        .update({
            difficulty_score: newDiff,
            attempts: (qStats.attempts || 0) + 1,
            correct_attempts: (qStats.correct_attempts || 0) + (isCorrect ? 1 : 0),
            last_updated: new Date().toISOString()
        })
        .eq('question_id', String(questionId));

    return newDiff;
}

/**
 * Update user mastery for a topic
 */
export async function updateUserMastery(userId, topicId, isCorrect, questionDifficulty) {
    const supabase = getSupabase();

    let { data: uStats } = await supabase
        .from('user_topic_mastery')
        .select('mastery_score, questions_attempted')
        .eq('user_id', userId)
        .eq('topic_id', String(topicId))
        .single();

    if (!uStats) {
        await supabase
            .from('user_topic_mastery')
            .insert({ user_id: userId, topic_id: String(topicId), mastery_score: DEFAULT_RATING });
        uStats = { mastery_score: DEFAULT_RATING, questions_attempted: 0 };
    }

    const currentMastery = uStats.mastery_score;
    const actualScore = isCorrect ? 1 : 0;
    const expectedScore = getExpectedScore(currentMastery, questionDifficulty || DEFAULT_RATING);

    const newMastery = currentMastery + K_FACTOR * (actualScore - expectedScore);

    await supabase
        .from('user_topic_mastery')
        .update({
            mastery_score: newMastery,
            questions_attempted: (uStats.questions_attempted || 0) + 1,
            last_updated: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('topic_id', String(topicId));

    return newMastery;
}

/**
 * Select the next best question for adaptive practice
 */
export async function getAdaptiveQuestion(userId, subjectId, topicId = null, excludeIds = []) {
    const supabase = getSupabase();

    // Get user mastery
    let targetRating = DEFAULT_RATING;
    if (topicId) {
        const { data: uStats } = await supabase
            .from('user_topic_mastery')
            .select('mastery_score')
            .eq('user_id', userId)
            .eq('topic_id', String(topicId))
            .single();
        if (uStats) targetRating = uStats.mastery_score;
    } else {
        // Average mastery for the whole subject
        const { data: subjectTopics } = await supabase
            .from('user_topic_mastery')
            .select(`
                mastery_score,
                topics!inner(chapters!inner(subject_id))
            `)
            .eq('user_id', userId)
            .eq('topics.chapters.subject_id', subjectId);

        if (subjectTopics && subjectTopics.length > 0) {
            const sum = subjectTopics.reduce((acc, row) => acc + row.mastery_score, 0);
            targetRating = sum / subjectTopics.length;
        }
    }

    const idealDiff = targetRating + 20;

    // Supabase JS doesn't support complex NOT IN with subqueries out of the box.
    // We will do a robust approach: fetch a larger pool of questions for the topic/subject, 
    // filter out recently answered ones locally, and sort by distance to idealDiff.
    let query = supabase.from('questions').select(`
        *,
        question_difficulty_dynamic (difficulty_score)
    `);

    if (topicId) {
        query = query.eq('topic_id', topicId);
    } else if (subjectId) {
        // Find chapter ids first...
        const { data: chapters } = await supabase.from('chapters').select('id').eq('subject_id', subjectId);
        const chapterIds = chapters.map(c => c.id);
        query = query.in('chapter_id', chapterIds);
    }

    // Limit pool to keep memory low, but high enough to find fresh questions
    const { data: qPool } = await query.limit(500);

    if (!qPool) return null;

    // Filter out excludes
    const excludeSet = new Set(excludeIds.map(String));
    let validQs = qPool.filter(q => !excludeSet.has(String(q.id)));

    // Fetch user's answered questions to filter further (if needed for perfect exclusion)
    const { data: answered } = await supabase.from('tests')
        .select(`test_answers(question_id)`)
        .eq('user_id', userId);

    const answeredSet = new Set();
    if (answered) {
        answered.forEach(test => {
            test.test_answers.forEach(ans => answeredSet.add(String(ans.question_id)));
        });
    }

    validQs = validQs.filter(q => !answeredSet.has(String(q.id)));

    // Sort valid questions by absolute distance to ideal difficulty
    validQs.sort((a, b) => {
        const diffA = a.question_difficulty_dynamic?.[0]?.difficulty_score || 1200;
        const diffB = b.question_difficulty_dynamic?.[0]?.difficulty_score || 1200;
        return Math.abs(diffA - idealDiff) - Math.abs(diffB - idealDiff);
    });

    if (validQs.length > 0) {
        const best = validQs[0];
        // Flatten the relationship to match expected output
        return {
            ...best,
            difficulty: best.question_difficulty_dynamic?.[0]?.difficulty_score || 1200
        };
    }

    return null;
}
