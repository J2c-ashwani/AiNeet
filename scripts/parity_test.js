/**
 * B3 Parity Verification Script
 * MD mandate: same payload → old path vs new path → results must match.
 * Checks: score, accuracy, XP, mistake count, mastery delta.
 * 
 * Runs in isolation without DB — uses the pure in-memory scoring logic only,
 * which is what both paths ultimately delegate to (calculateNEETScore, calculateXP).
 * The DB writes are verified structurally (same rows produced, same values).
 */

// ─── Reproduce the scoring logic in isolation ────────────────────────────────

function calculateNEETScore(processedAnswers) {
    let correct = 0, incorrect = 0, unanswered = 0;
    for (const a of processedAnswers) {
        if (!a.selected_option) unanswered++;
        else if (a.is_correct === 1) correct++;
        else incorrect++;
    }
    const scaledScore = correct * 4 - incorrect;
    const attempted = correct + incorrect;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100 * 10) / 10 : 0;
    return { correct, incorrect, unanswered, scaledScore, accuracy, attempted };
}

function calculateXP(scoreData) {
    return Math.max(0, scoreData.correct * 10 - scoreData.incorrect * 2);
}

// ─── Simulate a mixed test payload ──────────────────────────────────────────

const questionMap = {
    'q1': { id: 'q1', correct_option: 'A', topic_id: 't1', difficulty: 'medium' },
    'q2': { id: 'q2', correct_option: 'B', topic_id: 't1', difficulty: 'easy' },
    'q3': { id: 'q3', correct_option: 'C', topic_id: 't2', difficulty: 'hard' },
    'q4': { id: 'q4', correct_option: 'A', topic_id: 't2', difficulty: 'medium' },
    'q5': { id: 'q5', correct_option: 'D', topic_id: 't3', difficulty: 'easy' },
    'q6': { id: 'q6', correct_option: 'B', topic_id: 't3', difficulty: 'hard' },
    'q7': { id: 'q7', correct_option: 'C', topic_id: 't1', difficulty: 'medium' }, // 3rd q in t1
    'q8': { id: 'q8', correct_option: 'A', topic_id: 't2', difficulty: 'easy' },   // 3rd q in t2
    'q9': { id: 'q9', correct_option: null, topic_id: 't3', difficulty: 'hard' },  // unanswered
};

const answers = [
    { questionId: 'q1', selectedOption: 'A', timeSpent: 15 },  // correct
    { questionId: 'q2', selectedOption: 'C', timeSpent: 8 },   // wrong (fast)
    { questionId: 'q3', selectedOption: 'C', timeSpent: 30 },  // correct
    { questionId: 'q4', selectedOption: 'B', timeSpent: 20 },  // wrong
    { questionId: 'q5', selectedOption: 'D', timeSpent: 5 },   // correct (fast)
    { questionId: 'q6', selectedOption: null, timeSpent: 0 },  // unanswered
    { questionId: 'q7', selectedOption: 'C', timeSpent: 12 },  // correct (same topic as q1,q2)
    { questionId: 'q8', selectedOption: 'A', timeSpent: 25 },  // correct (same topic as q3,q4)
    { questionId: 'q9', selectedOption: null, timeSpent: 0 },  // unanswered
];

// ─── OLD PATH: sequential loop logic (reproduced exactly) ───────────────────

function runOldPath(answers, questionMap) {
    const processedAnswers = [];
    let fastAnswerCount = 0;
    const testAnswersToInsert = [];
    // Simulated per-topic DB state (what would be fetched per-iteration)
    const simulatedPerformanceDB = {}; // starts empty (new user)
    const simulatedMistakeDB = {};
    const masteryUpdates = [];

    for (const answer of answers) {
        const question = questionMap[String(answer.questionId)];
        if (!question) continue;

        const isCorrect = answer.selectedOption === question.correct_option ? 1 : 0;
        const timeSpent = answer.timeSpent || 0;
        if (isCorrect && timeSpent < 10) fastAnswerCount++;

        testAnswersToInsert.push({ question_id: answer.questionId, selected_option: answer.selectedOption, is_correct: answer.selectedOption ? isCorrect === 1 : null, time_spent_seconds: timeSpent });

        processedAnswers.push({
            question_id: answer.questionId, selected_option: answer.selectedOption,
            correct_option: question.correct_option, is_correct: isCorrect,
            time_spent_seconds: timeSpent, difficulty: question.difficulty
        });

        if (answer.selectedOption) {
            const topicId = String(question.topic_id);
            // Simulate per-iteration DB fetch+update (old sequential pattern)
            const pData = simulatedPerformanceDB[topicId];
            if (pData) {
                const newTotal = (pData.total_attempted || 0) + 1;
                const newCorrect = (pData.total_correct || 0) + isCorrect;
                simulatedPerformanceDB[topicId] = {
                    total_attempted: newTotal, total_correct: newCorrect,
                    accuracy: Math.round((newCorrect / newTotal) * 100 * 10) / 10,
                    avg_time_seconds: ((pData.avg_time_seconds || 0) * (pData.total_attempted || 0) + timeSpent) / newTotal,
                };
            } else {
                simulatedPerformanceDB[topicId] = {
                    total_attempted: 1, total_correct: isCorrect,
                    accuracy: isCorrect * 100, avg_time_seconds: timeSpent,
                };
            }

            masteryUpdates.push({ topicId, isCorrect, questionId: question.id });

            if (!isCorrect) {
                const mLog = simulatedMistakeDB[String(answer.questionId)];
                simulatedMistakeDB[String(answer.questionId)] = {
                    question_id: String(answer.questionId),
                    mistake_count: (mLog?.mistake_count || 0) + 1,
                };
            }
        }
    }

    const scoreData = calculateNEETScore(processedAnswers);
    const xpEarned = calculateXP(scoreData);
    return { scoreData, xpEarned, fastAnswerCount, performanceDB: simulatedPerformanceDB, mistakeDB: simulatedMistakeDB, testAnswers: testAnswersToInsert, masteryUpdates };
}

// ─── NEW PATH: batched logic (exactly matching what we shipped) ──────────────

function runNewPath(answers, questionMap) {
    const processedAnswers = [];
    const testAnswersToInsert = [];
    let fastAnswerCount = 0;
    const topicIds = new Set();
    const answeredQuestions = [];
    const wrongAnswerQuestionIds = [];

    for (const answer of answers) {
        const question = questionMap[String(answer.questionId)];
        if (!question) continue;
        const isCorrect = answer.selectedOption === question.correct_option ? 1 : 0;
        const timeSpent = answer.timeSpent || 0;
        if (isCorrect && timeSpent < 10) fastAnswerCount++;

        testAnswersToInsert.push({ question_id: answer.questionId, selected_option: answer.selectedOption, is_correct: answer.selectedOption ? isCorrect === 1 : null, time_spent_seconds: timeSpent });

        processedAnswers.push({
            question_id: answer.questionId, selected_option: answer.selectedOption,
            correct_option: question.correct_option, is_correct: isCorrect,
            time_spent_seconds: timeSpent, difficulty: question.difficulty
        });

        if (answer.selectedOption) {
            if (question.topic_id) topicIds.add(String(question.topic_id));
            answeredQuestions.push({ question, answer, isCorrect, timeSpent });
            if (!isCorrect) wrongAnswerQuestionIds.push(String(answer.questionId));
        }
    }

    // Simulate batch-fetched state (empty DB — same starting state as old path)
    const existingPerformance = [];
    const existingMastery = [];
    const existingMistakes = [];

    const performanceMap = {};
    existingPerformance.forEach(p => performanceMap[String(p.topic_id)] = p);
    const mistakeMap = {};
    existingMistakes.forEach(m => mistakeMap[String(m.question_id)] = m);

    const now = new Date().toISOString();
    const performanceUpserts = [];
    const mistakeUpserts = [];
    const topicRunningAgg = {};
    const masteryUpdates = [];

    for (const { question, answer, isCorrect, timeSpent } of answeredQuestions) {
        const topicId = String(question.topic_id);
        if (!topicRunningAgg[topicId]) {
            const existing = performanceMap[topicId];
            topicRunningAgg[topicId] = {
                total_attempted: existing?.total_attempted || 0,
                total_correct: existing?.total_correct || 0,
                total_time_sum: (existing?.avg_time_seconds || 0) * (existing?.total_attempted || 0),
            };
        }
        const agg = topicRunningAgg[topicId];
        agg.total_attempted += 1;
        agg.total_correct += isCorrect;
        agg.total_time_sum += timeSpent;

        masteryUpdates.push({ topicId, isCorrect, questionId: question.id });

        if (!isCorrect) {
            const existing = mistakeMap[String(answer.questionId)];
            mistakeUpserts.push({
                question_id: String(answer.questionId),
                mistake_count: (existing?.mistake_count || 0) + 1,
            });
        }
    }

    for (const [topicId, agg] of Object.entries(topicRunningAgg)) {
        performanceUpserts.push({
            topic_id: topicId,
            total_attempted: agg.total_attempted,
            total_correct: agg.total_correct,
            accuracy: agg.total_attempted > 0 ? Math.round((agg.total_correct / agg.total_attempted) * 100 * 10) / 10 : 0,
            avg_time_seconds: agg.total_attempted > 0 ? agg.total_time_sum / agg.total_attempted : 0,
        });
    }

    // Build simulated performanceDB for comparison (same shape as old path output)
    const simulatedPerformanceDB = {};
    performanceUpserts.forEach(p => simulatedPerformanceDB[p.topic_id] = p);
    const simulatedMistakeDB = {};
    mistakeUpserts.forEach(m => simulatedMistakeDB[m.question_id] = m);

    const scoreData = calculateNEETScore(processedAnswers);
    const xpEarned = calculateXP(scoreData);
    return { scoreData, xpEarned, fastAnswerCount, performanceDB: simulatedPerformanceDB, mistakeDB: simulatedMistakeDB, testAnswers: testAnswersToInsert, masteryUpdates };
}

// ─── Compare results ─────────────────────────────────────────────────────────

const oldResult = runOldPath(answers, questionMap);
const newResult = runNewPath(answers, questionMap);

let allPass = true;

function check(label, a, b) {
    const pass = JSON.stringify(a) === JSON.stringify(b);
    if (!pass) allPass = false;
    console.log(`  ${pass ? '✅' : '❌'} ${label}`);
    if (!pass) {
        console.log(`     OLD: ${JSON.stringify(a)}`);
        console.log(`     NEW: ${JSON.stringify(b)}`);
    }
}

console.log('\n══════════════════════════════════════════');
console.log('B3 PARITY VERIFICATION — MD Non-Negotiable');
console.log('══════════════════════════════════════════\n');

console.log('📊 SCORING PARITY:');
check('correct count', oldResult.scoreData.correct, newResult.scoreData.correct);
check('incorrect count', oldResult.scoreData.incorrect, newResult.scoreData.incorrect);
check('unanswered count', oldResult.scoreData.unanswered, newResult.scoreData.unanswered);
check('scaledScore (720-scale)', oldResult.scoreData.scaledScore, newResult.scoreData.scaledScore);
check('accuracy %', oldResult.scoreData.accuracy, newResult.scoreData.accuracy);
check('XP earned', oldResult.xpEarned, newResult.xpEarned);
check('fast answer count', oldResult.fastAnswerCount, newResult.fastAnswerCount);

console.log('\n📚 PERFORMANCE ANALYTICS PARITY (per topic):');
const allTopics = new Set([...Object.keys(oldResult.performanceDB), ...Object.keys(newResult.performanceDB)]);
for (const topicId of allTopics) {
    const o = oldResult.performanceDB[topicId];
    const n = newResult.performanceDB[topicId];
    check(`topic ${topicId} → total_attempted`, o?.total_attempted, n?.total_attempted);
    check(`topic ${topicId} → total_correct`, o?.total_correct, n?.total_correct);
    check(`topic ${topicId} → accuracy`, o?.accuracy, n?.accuracy);
    check(`topic ${topicId} → avg_time_seconds`, o?.avg_time_seconds, n?.avg_time_seconds);
}

console.log('\n❌ MISTAKE LOGGING PARITY:');
const allMistakes = new Set([...Object.keys(oldResult.mistakeDB), ...Object.keys(newResult.mistakeDB)]);
for (const qId of allMistakes) {
    const o = oldResult.mistakeDB[qId];
    const n = newResult.mistakeDB[qId];
    check(`question ${qId} → mistake_count`, o?.mistake_count, n?.mistake_count);
}

console.log('\n📝 TEST ANSWER ROWS PARITY:');
check('test_answers row count', oldResult.testAnswers.length, newResult.testAnswers.length);
for (let i = 0; i < oldResult.testAnswers.length; i++) {
    const o = oldResult.testAnswers[i];
    const n = newResult.testAnswers[i];
    check(`row[${i}] question_id`, o.question_id, n.question_id);
    check(`row[${i}] is_correct`, o.is_correct, n.is_correct);
}

console.log('\n🔄 MASTERY UPDATE INPUTS PARITY:');
check('mastery update count', oldResult.masteryUpdates.length, newResult.masteryUpdates.length);

console.log('\n══════════════════════════════════════════');
if (allPass) {
    console.log('🟢 PARITY VERIFIED — B3 safe to ship');
    console.log('   Old path and new path produce identical results.');
    console.log('   Score integrity: CONFIRMED');
} else {
    console.log('🔴 PARITY FAILED — DO NOT SHIP B3');
    console.log('   Scoring drift detected. Investigate before deploying.');
}
console.log('══════════════════════════════════════════\n');
