
// AI Opponent definitions and logic

export const AI_OPPONENTS = [
    {
        id: 'ai_1',
        name: 'Rookie Rahul',
        title: 'The Beginner',
        avatar: '👶',
        difficulty: 'easy',
        elo: 800,
        speed: 'slow', // slow, medium, fast
        accuracy: 0.60, // 60% chance to be correct
        minTime: 10, // min seconds to answer
        maxTime: 25
    },
    {
        id: 'ai_2',
        name: 'Speedster Sameer',
        title: 'The Rusher',
        avatar: '⚡',
        difficulty: 'medium',
        elo: 1000,
        speed: 'fast',
        accuracy: 0.75,
        minTime: 5,
        maxTime: 15
    },
    {
        id: 'ai_3',
        name: 'Topper Tina',
        title: 'NEET AIR 1',
        avatar: '👩‍🎓',
        difficulty: 'hard',
        elo: 1400,
        speed: 'medium',
        accuracy: 0.95,
        minTime: 8,
        maxTime: 20
    }
];

export function getOpponentForElo(userElo) {
    // Simple matching: find opponent closest to user Elo
    return AI_OPPONENTS.reduce((prev, curr) => {
        return (Math.abs(curr.elo - userElo) < Math.abs(prev.elo - userElo) ? curr : prev);
    });
}

export function simulateAIAnswer(opponent, questionDifficulty) {
    // Determine if AI answers correctly based on its accuracy and question difficulty
    // Simple logic: harder questions lower AI accuracy slightly
    let effectiveAccuracy = opponent.accuracy;
    if (questionDifficulty === 'hard') effectiveAccuracy -= 0.1;
    if (questionDifficulty === 'easy') effectiveAccuracy += 0.1;

    const isCorrect = Math.random() < effectiveAccuracy;

    // Determine time taken
    const timeTaken = Math.floor(Math.random() * (opponent.maxTime - opponent.minTime + 1)) + opponent.minTime;

    return { isCorrect, timeTaken };
}
