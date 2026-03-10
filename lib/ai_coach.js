
import { getSupabase } from './supabase.js';

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
    const supabase = getSupabase();

    const { data: user } = await supabase
        .from('users')
        .select('name, streak, last_active_date, xp')
        .eq('id', userId)
        .single();

    if (!user) return null;

    // 1. Analyze Recent Activity
    const { data: recentTests } = await supabase
        .from('tests')
        .select('score, completed_at, total_questions, correct_count')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(5);

    const mappedTests = (recentTests || []).map(t => ({
        ...t,
        accuracy: t.total_questions ? (t.correct_count / t.total_questions) * 100 : 0
    }));

    // 2. Analyze Weak Areas
    const { data: weakAreaResult } = await supabase
        .from('user_topic_mastery')
        .select(`
            mastery_score,
            topics!inner(name, chapters!inner(name))
        `)
        .eq('user_id', userId)
        .lt('mastery_score', 40)
        .order('mastery_score', { ascending: true })
        .limit(1)
        .single();

    const weakArea = weakAreaResult ? {
        topic_name: weakAreaResult.topics?.name,
        chapter_name: weakAreaResult.topics?.chapters?.name,
        mastery_score: weakAreaResult.mastery_score
    } : null;

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
        const avgScore = mappedTests.reduce((acc, t) => acc + (t.score || 0), 0) / mappedTests.length;

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
            testsTaken: mappedTests.length,
            streak: user.streak
        }
    };
}
