// AI Engine - Mock implementation that works without API keys
// Provides intelligent responses using template-based logic

export function generateDoubtResponse(question, context = '') {
    const q = question.toLowerCase();

    // Detect subject area
    let subject = 'general';
    if (q.includes('force') || q.includes('velocity') || q.includes('energy') || q.includes('wave') || q.includes('electric') || q.includes('magnet') || q.includes('optic') || q.includes('gravity'))
        subject = 'physics';
    else if (q.includes('reaction') || q.includes('bond') || q.includes('acid') || q.includes('element') || q.includes('compound') || q.includes('organic') || q.includes('mole') || q.includes('solution'))
        subject = 'chemistry';
    else if (q.includes('cell') || q.includes('dna') || q.includes('gene') || q.includes('plant') || q.includes('animal') || q.includes('organ') || q.includes('enzyme') || q.includes('blood'))
        subject = 'biology';

    const templates = {
        physics: `## Physics Concept Explanation

**Your Question:** ${question}

### Key Concept
This is an important NEET Physics concept. Let me break it down:

1. **Fundamental Principle**: This concept is based on core physics laws that govern how physical systems behave.
2. **Mathematical Framework**: Use the relevant formulae and dimensional analysis to solve problems.
3. **Application in NEET**: This topic has been frequently asked in NEET exams.

### 💡 Memory Trick
Create mnemonics relating the physical quantity to everyday objects. For example, think of force as a "push or pull" in your daily life.

### 📝 NEET Tips
- Focus on numerical problems — NEET emphasizes calculation-based questions
- Remember SI units for all physical quantities
- Practice dimension checking to verify answers

### Related Concepts
- Check the previous year questions from this chapter
- Revise connected topics for comprehensive understanding`,

        chemistry: `## Chemistry Concept Explanation

**Your Question:** ${question}

### Key Concept
Let me explain this Chemistry concept step by step:

1. **Theoretical Foundation**: Understanding the underlying chemical principles is crucial.
2. **Reaction Mechanism**: Pay attention to the step-by-step mechanism if this involves reactions.
3. **Periodic Trends**: Many chemistry concepts connect back to periodic table trends.

### 💡 Memory Trick
Use the mnemonic techniques specific to chemistry — periodic table songs, reaction flowcharts, and color-coding for different types of reactions.

### 📝 NEET Tips
- Organic Chemistry reactions are heavily tested — memorize named reactions
- For Physical Chemistry, practice numerical problems daily
- Inorganic Chemistry requires systematic memorization of properties

### Related Concepts
- Review related reactions and their mechanisms
- Connect this concept to real-world applications`,

        biology: `## Biology Concept Explanation

**Your Question:** ${question}

### Key Concept
Here's a detailed explanation of this Biology concept:

1. **Biological Significance**: This concept plays a vital role in living organisms.
2. **Structural Aspects**: Understanding the structure helps explain the function.
3. **Process Details**: The step-by-step process is important for NEET questions.

### 💡 Memory Trick
Use diagrams and flowcharts to remember biological processes. Visual learning is most effective for Biology.

### 📝 NEET Tips
- NCERT is the Bible for Biology — read it line by line
- Diagrams are frequently asked — practice drawing and labeling
- Focus on Human Physiology and Genetics — highest weightage chapters

### Related Concepts
- Connect this to the broader biological system it belongs to
- Review the evolutionary significance of this concept`,

        general: `## Concept Explanation

**Your Question:** ${question}

### Understanding the Concept
Let me help you understand this:

1. Start with the basic definition and work your way up
2. Connect it to concepts you already know
3. Practice with previous year NEET questions

### 📝 NEET Preparation Tips
- Read NCERT thoroughly — it's the primary source for NEET
- Solve previous year papers (2015-2024)
- Focus on high-weightage chapters
- Practice time management — 3 hours for 180 questions

### Next Steps
- Try solving the previous year questions related to this topic
- Create a revision note summarizing the key points
- Test yourself on this topic using the Test Generator`
    };

    return templates[subject];
}

export function generateStudyPlan(performance, completedChapters = []) {
    const today = new Date();
    const plan = [];

    const weakAreas = performance
        .filter(p => p.accuracy < 60)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 3);

    const strongAreas = performance
        .filter(p => p.accuracy >= 80)
        .slice(0, 2);

    // Morning session
    plan.push({
        time: '6:00 AM - 8:00 AM',
        activity: weakAreas.length > 0
            ? `Focus Study: ${weakAreas[0]?.topic_name || 'Physics Revision'}`
            : 'Physics — New Chapter Study',
        type: 'study',
        subject: 'Physics',
        duration: 120
    });

    // Mid-morning
    plan.push({
        time: '8:30 AM - 10:00 AM',
        activity: 'Practice Test — 30 Questions',
        type: 'test',
        subject: 'Mixed',
        duration: 90
    });

    // Late morning
    plan.push({
        time: '10:30 AM - 12:30 PM',
        activity: weakAreas.length > 1
            ? `Focus Study: ${weakAreas[1]?.topic_name || 'Chemistry Revision'}`
            : 'Chemistry — Organic Reactions Practice',
        type: 'study',
        subject: 'Chemistry',
        duration: 120
    });

    // Afternoon
    plan.push({
        time: '2:00 PM - 4:00 PM',
        activity: 'Biology — NCERT Reading + Notes',
        type: 'study',
        subject: 'Biology',
        duration: 120
    });

    // Evening
    plan.push({
        time: '4:30 PM - 6:00 PM',
        activity: 'Revision — Weak Areas + Mistake Review',
        type: 'revision',
        subject: 'Mixed',
        duration: 90
    });

    // Night
    plan.push({
        time: '7:00 PM - 9:00 PM',
        activity: strongAreas.length > 0
            ? `Advanced Problems: ${strongAreas[0]?.topic_name || 'Hard Questions'}`
            : 'Previous Year Questions Practice',
        type: 'practice',
        subject: 'Mixed',
        duration: 120
    });

    return {
        date: today.toISOString().split('T')[0],
        totalStudyHours: 11,
        plan,
        recommendations: [
            weakAreas.length > 0 ? `⚠️ Priority: Improve ${weakAreas[0]?.topic_name || 'weak areas'}` : '✅ Good overall performance!',
            'Take 10-minute breaks every hour',
            'Drink water and stay hydrated',
            'Quick revision before sleep improves retention'
        ]
    };
}

export function predictRank(avgScore, totalTests, accuracy) {
    // Based on NEET 2024 approximate data
    const rankData = [
        { score: 720, rank: 1, percentile: 100 },
        { score: 700, rank: 50, percentile: 99.99 },
        { score: 680, rank: 500, percentile: 99.95 },
        { score: 650, rank: 5000, percentile: 99.5 },
        { score: 600, rank: 25000, percentile: 97 },
        { score: 550, rank: 60000, percentile: 93 },
        { score: 500, rank: 100000, percentile: 88 },
        { score: 450, rank: 200000, percentile: 78 },
        { score: 400, rank: 400000, percentile: 60 },
        { score: 350, rank: 600000, percentile: 45 },
        { score: 300, rank: 800000, percentile: 30 },
        { score: 250, rank: 1000000, percentile: 18 },
        { score: 200, rank: 1200000, percentile: 10 },
        { score: 150, rank: 1500000, percentile: 5 },
        { score: 100, rank: 1800000, percentile: 2 },
    ];

    // Interpolate
    let predictedRank = 1800000;
    let percentile = 2;

    for (let i = 0; i < rankData.length - 1; i++) {
        if (avgScore >= rankData[i].score) {
            predictedRank = rankData[i].rank;
            percentile = rankData[i].percentile;
            break;
        } else if (avgScore >= rankData[i + 1].score && avgScore < rankData[i].score) {
            // Linear interpolation
            const ratio = (avgScore - rankData[i + 1].score) / (rankData[i].score - rankData[i + 1].score);
            predictedRank = Math.round(rankData[i + 1].rank - ratio * (rankData[i + 1].rank - rankData[i].rank));
            percentile = rankData[i + 1].percentile + ratio * (rankData[i].percentile - rankData[i + 1].percentile);
            percentile = Math.round(percentile * 100) / 100;
            break;
        }
    }

    // Improvement probability based on test count and accuracy trend
    const improvementProbability = Math.min(95, Math.max(20, accuracy * 0.8 + totalTests * 2));

    return {
        predictedScore: Math.round(avgScore),
        predictedRank,
        percentile,
        improvementProbability: Math.round(improvementProbability),
        category: avgScore >= 600 ? 'Excellent' : avgScore >= 500 ? 'Good' : avgScore >= 400 ? 'Average' : 'Needs Improvement',
        collegePossibility: avgScore >= 600 ? 'Top Government Medical College' : avgScore >= 500 ? 'Government Medical College' : avgScore >= 400 ? 'Private Medical College' : 'Need significant improvement'
    };
}

