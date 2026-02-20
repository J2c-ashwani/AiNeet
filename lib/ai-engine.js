import { GoogleGenerativeAI } from "@google/generative-ai";
import { UsageTracker } from './usage';
import { getDb } from './db';
import crypto from 'crypto';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock-key');

export async function generateDoubtResponse(question, context = '', user = null) {
    const db = getDb();

    // 1. Usage Check (if user provided)
    if (user) {
        const check = await UsageTracker.checkLimit(user.id, user.plan_type || user.subscription_tier, 'doubt');
        if (!check.allowed) {
            return `🚫 Limit Reached: ${check.message}`;
        }
    }

    // 2. Check Cache
    const requestHash = crypto.createHash('md5').update(question + context).digest('hex');
    const cached = await db.get('SELECT response FROM ai_response_cache WHERE request_hash = ?', [requestHash]);
    if (cached) {
        // Increment usage count for analytics even if cached? 
        // Strategy: Yes, it counts towards quota to prevent abuse, but "tokens used" is 0.
        if (user) await UsageTracker.incrementUsage(user.id, 'doubt', 0);
        return cached.response;
    }

    // If no API key is provided (or it's the default mock one during dev), fall back to templates for safety/demo
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock-key') {
        console.warn('GEMINI_API_KEY not found. Using fallback mock response.');
        const response = generateMockDoubtResponse(question);
        if (user) await UsageTracker.incrementUsage(user.id, 'doubt', 0);
        return response;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        You are an expert NEET (National Eligibility cum Entrance Test) coach and subject matter expert in Physics, Chemistry, and Biology.
        
        A student has asked the following doubt:
        "${question}"

        ${context ? `Context from User/Book: "${context}"` : ''}

        Please provide a detailed, easy-to-understand explanation following this structure:
        1. **Core Concept**: Briefly explain the underlying principle.
        2. **Detailed Explanation**: Step-by-step breakdown.
        3. **NEET Perspective**: Why is this important? How is it usually asked? (Mention relevant laws, formulas, or exceptions).
        4. **Memory Tip**: A short mnemonic or trick to remember this.
        
        Keep the tone encouraging and professional.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 3. Update Usage & Cache
        // Estimate token usage (char count / 4 approx)
        const tokens = Math.ceil(text.length / 4);
        if (user) await UsageTracker.incrementUsage(user.id, 'doubt', tokens);

        // Cache result
        await db.run(
            'INSERT OR IGNORE INTO ai_response_cache (request_hash, response) VALUES (?, ?)',
            [requestHash, text]
        );

        return text;
    } catch (error) {
        console.error('AI Generation Error:', error);
        return "I'm having trouble connecting to my brain right now. Please try again later. (Error: API Connection Failed)";
    }
}

// Fallback Mock Logic (Preserved from original file for reliability)
function generateMockDoubtResponse(question) {
    const q = question.toLowerCase();
    let subject = 'general';
    if (q.includes('force') || q.includes('velocity') || q.includes('energy') || q.includes('wave') || q.includes('electric') || q.includes('magnet') || q.includes('optic') || q.includes('gravity')) subject = 'physics';
    else if (q.includes('reaction') || q.includes('bond') || q.includes('acid') || q.includes('element')) subject = 'chemistry';
    else if (q.includes('cell') || q.includes('dna') || q.includes('gene') || q.includes('plant')) subject = 'biology';

    const templates = {
        physics: `## Physics Concept (Fallback)\n\n**Question:** ${question}\n\nThis seems to be about Physics. To get a real AI explanation, please add your GEMINI_API_KEY to the .env file!`,
        chemistry: `## Chemistry Concept (Fallback)\n\n**Question:** ${question}\n\nThis seems to be about Chemistry. To get a real AI explanation, please add your GEMINI_API_KEY to the .env file!`,
        biology: `## Biology Concept (Fallback)\n\n**Question:** ${question}\n\nThis seems to be about Biology. To get a real AI explanation, please add your GEMINI_API_KEY to the .env file!`,
        general: `## General Enquiry (Fallback)\n\n**Question:** ${question}\n\nPlease configure the GEMINI_API_KEY to unlock the full power of the AI Coach.`
    };
    return templates[subject] || templates.general;
}

export function generateStudyPlan(performance, completedChapters = []) {
    // Keeping the algorithmic study plan generator as it's logic-based, not LLM-based.
    // We could upgrade this to LLM later for more "personalized" text, but the structured data is better generated by code.

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
