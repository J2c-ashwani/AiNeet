
// NEET Scoring Engine
// NEET marking scheme: +4 correct, -1 incorrect, 0 unanswered

export function calculateNEETScore(answers) {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    for (const answer of answers) {
        if (!answer.selected_option) {
            unanswered++;
        } else if (answer.is_correct) {
            correct++;
        } else {
            incorrect++;
        }
    }

    const rawScore = (correct * 4) - (incorrect * 1);
    const totalQuestions = answers.length;
    const maxMarks = totalQuestions * 4;

    // Scale to 720 if not a full mock
    const scaledScore = totalQuestions === 180 ? rawScore : Math.round((rawScore / maxMarks) * 720);
    const accuracy = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

    return {
        rawScore: Math.max(0, rawScore),
        scaledScore: Math.max(0, scaledScore),
        maxMarks,
        correct,
        incorrect,
        unanswered,
        totalQuestions,
        accuracy,
        negativeMarks: incorrect,
        timeTaken: answers.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0)
    };
}

export function getPerformanceLevel(accuracy) {
    if (accuracy >= 90) return { level: 'Excellent', color: '#10b981', emoji: '🏆' };
    if (accuracy >= 75) return { level: 'Good', color: '#3b82f6', emoji: '👍' };
    if (accuracy >= 60) return { level: 'Average', color: '#f59e0b', emoji: '📈' };
    if (accuracy >= 40) return { level: 'Below Average', color: '#f97316', emoji: '⚠️' };
    return { level: 'Needs Improvement', color: '#ef4444', emoji: '📚' };
}

export function calculateXP(score) {
    // Base XP for attempting + bonus for accuracy
    let xp = 10; // base for completing a test
    if (score.accuracy >= 90) xp += 50;
    else if (score.accuracy >= 75) xp += 30;
    else if (score.accuracy >= 60) xp += 20;
    else xp += 10;

    xp += score.correct * 2; // 2 XP per correct answer
    return xp;
}

export function getLevelFromXP(xp) {
    const levels = [
        { level: 1, name: 'Beginner', minXP: 0 },
        { level: 2, name: 'Student', minXP: 100 },
        { level: 3, name: 'Learner', minXP: 300 },
        { level: 4, name: 'Scholar', minXP: 600 },
        { level: 5, name: 'Expert', minXP: 1000 },
        { level: 6, name: 'Master', minXP: 1500 },
        { level: 7, name: 'Prodigy', minXP: 2500 },
        { level: 8, name: 'Genius', minXP: 4000 },
        { level: 9, name: 'Legend', minXP: 6000 },
        { level: 10, name: 'NEET Topper', minXP: 10000 },
    ];

    let currentLevel = levels[0];
    for (const l of levels) {
        if (xp >= l.minXP) currentLevel = l;
        else break;
    }

    const nextLevel = levels.find(l => l.minXP > xp) || levels[levels.length - 1];
    const progress = nextLevel.minXP > currentLevel.minXP
        ? ((xp - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100
        : 100;

    return {
        ...currentLevel,
        xp,
        nextLevel,
        progress: Math.round(progress),
        xpToNext: Math.max(0, nextLevel.minXP - xp)
    };
}

export function calculateSuccessProbability(scores) {
    if (!scores || scores.length === 0) return { probability: 0, trend: 'stable' };

    // Recent scores have higher weight
    const weights = scores.map((_, i) => i + 1); // 1, 2, 3...
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    // Scores should be sorted appropriately before calling this (oldest first? or newest first?)
    // Assuming calling code passes recent scores. 
    // If scores are [oldest, ..., newest], then weights are correct.

    const weightedSum = scores.reduce((sum, score, i) => sum + (score * weights[i]), 0);
    const weightedAvg = weightedSum / totalWeight;

    // Probability based on 720 max score
    // 720 -> 99.9%
    // 600 -> 90%
    // 400 -> 50%
    let prob = (weightedAvg / 720) * 100;

    // Logarithmic curve adjust? No, keep simple linear for now but cap it.
    // Actually, NEET qualification is ~150/720 (20%), but Government seat is ~600/720 (83%).
    // Let's call it "Government Seat Probability".
    // 600+ => >80% probability.
    // 400 => <10% probability.

    // Sigmoid-ish mapping for "Seat Probability"
    // Center at 550.

    // But for "Success Probability" generically (as "Preparedness"):
    // Let's stick to simple % of max score for now as "Preparedness Score".

    // Trend
    const recentAvg = scores.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, scores.length);
    const oldAvg = scores.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, scores.length);

    let trend = 'stable';
    if (recentAvg > oldAvg + 20) trend = 'up';
    else if (recentAvg < oldAvg - 20) trend = 'down';

    return {
        probability: Math.round(prob),
        trend,
        predictedScore: Math.round(weightedAvg)
    };
}
