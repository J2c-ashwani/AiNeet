
import { getDb } from './db.js';

const TIPS = [
    "Consistency is key! Even 15 minutes a day makes a difference.",
    "Don't forget to review your mistakes. That's where the real learning happens.",
    "Take breaks! Your brain needs time to consolidate memory.",
    "Focus on concepts, not just rote memorization.",
    "Sleep is crucial for memory retention. Get your 7-8 hours!"
];

/**
 * Generate daily guidance for the user based on their performance and activity.
 * @param {string} userId
 */
export async function generateDailyGuidance(userId) {
    const db = getDb();
    const user = await db.get('SELECT name, streak, last_active_date, xp FROM users WHERE id = ?', [userId]);

    if (!user) return null;

    // 1. Analyze Recent Activity
    const recentTests = await db.all(`
        SELECT score, completed_at, 
        (CAST(correct_count AS REAL) / NULLIF(total_questions, 0) * 100) as accuracy
        FROM tests 
        WHERE user_id = ? 
        ORDER BY completed_at DESC 
        LIMIT 5
    `, [userId]);

    // 2. Analyze Weak Areas
    const weakArea = await db.get(`
        SELECT t.name as topic_name, c.name as chapter_name, utm.mastery_score
        FROM user_topic_mastery utm
        JOIN topics t ON utm.topic_id = t.id
        JOIN chapters c ON t.chapter_id = c.id
        WHERE utm.user_id = ? AND utm.mastery_score < 40
        ORDER BY utm.mastery_score ASC
        LIMIT 1
    `, [userId]);

    // 3. Construct Message
    let greeting = `Hello, ${user.name.split(' ')[0]}!`;
    let message = "";
    let actionItem = null;
    let sentiment = "neutral";

    if (recentTests.length === 0) {
        message = "Welcome to your AI NEET Coach! To get started, let's establish a baseline.";
        actionItem = {
            text: "Take Diagnostic Test",
            link: "/test/configure?type=diagnostic",
            type: "primary"
        };
        sentiment = "encouraging";
    } else {
        const avgScore = recentTests.reduce((acc, t) => acc + (t.score || 0), 0) / recentTests.length;

        if (user.streak > 2) {
            message = `You're on a ${user.streak}-day streak! Keep up the momentum. `;
            sentiment = "positive";
        } else {
            message = "Let's make today count! ";
            sentiment = "neutral";
        }

        if (weakArea) {
            message += `I've noticed you might be struggling with ${weakArea.topic_name}. Let's turn that weakness into a strength.`;
            actionItem = {
                text: `Practice ${weakArea.topic_name}`,
                link: `/test/configure?topic=${weakArea.topic_name}`, // Need to support topic query param in configure page
                type: "warning"
            };
        } else if (avgScore > 500) {
            message += "Your recent performance is excellent! Try a full mock test to challenge yourself.";
            actionItem = {
                text: "Take Full Mock Test",
                link: "/test/configure?type=mock",
                type: "success"
            };
        } else {
            message += "Consistency is better than intensity. Let's do a quick revision session.";
            actionItem = {
                text: "Start Daily Revision",
                link: "/revision",
                type: "primary"
            };
        }
    }

    return {
        greeting,
        message,
        actionItem,
        sentiment,
        tip: TIPS[Math.floor(Math.random() * TIPS.length)],
        stats: {
            testsTaken: recentTests.length,
            streak: user.streak
        }
    };
}
