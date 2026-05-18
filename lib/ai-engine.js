import { GoogleGenerativeAI } from "@google/generative-ai";
import { UsageTracker } from './usage';
import { EdgeGovernance } from './usage-redis';
import { getUserTrustTier, getEffectiveTokenLimit } from './trust-engine';
import { ShadowEngine } from './shadow-engine';
import { getSupabase } from './supabase';
import { generateCacheKey, getCachedResponse, setCachedResponse, CACHE_TTL } from './redis';
import { withCircuitBreaker } from './circuit-breaker';
import { checkedFetch } from './http';
import { getRequiredServerSecret } from './server-secrets';

// ─── AI Provider Setup ──────────────────────────────────────────────────────
// Primary: Gemini (Google) — 1,500 free requests/day
// Fallback: Groq (Llama 3.3 70B) — 14,400 free requests/day
// Combined: ~15,900 free requests/day = ~1,590 students × 10 doubts each

const GEMINI_API_KEY = getRequiredServerSecret('GEMINI_API_KEY');
const genAI = GEMINI_API_KEY
    ? new GoogleGenerativeAI(GEMINI_API_KEY)
    : null;

const GROQ_API_KEY = getRequiredServerSecret('GROQ_API_KEY') || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const OPENROUTER_API_KEY = getRequiredServerSecret('OPENROUTER_API_KEY') || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'google/gemini-2.0-flash-lite-preview-02-05:free';

// NEET-specific system prompt shared across all providers
function getNeetSystemPrompt(heatmapContext = null) {
    let prompt = `You are a strict, expert NEET (National Eligibility cum Entrance Test) coach and subject matter expert in Physics, Chemistry, and Biology.

CRITICAL GUARDRAIL: You must ONLY answer questions related to Physics, Chemistry, Biology, or medical entrance preparation. 
If the student asks a question outside this scope (e.g., programming, politics, general knowledge, creative writing), you MUST politely decline to answer, reminding them that your purpose is solely NEET preparation. Do not provide the answer to off-topic questions under any circumstances.

When answering NEET doubts, follow this structure:
1. **Core Concept**: Briefly explain the underlying principle.
2. **Detailed Explanation**: Step-by-step breakdown.
3. **NEET Perspective**: Why is this important? How is it usually asked? (Mention relevant laws, formulas, or exceptions).
4. **Memory Tip**: A short mnemonic or trick to remember this.

Keep the tone encouraging, professional, and strictly focused on medical entrance exams.`;

    if (heatmapContext) {
        prompt += `\n\n[STUDENT CONTEXT - 20% PERSONALIZED HINT]\n${heatmapContext}`;
    }
    return prompt;
}

// ─── Provider Functions ─────────────────────────────────────────────────────

async function callGemini(systemPrompt, userPrompt) {
    if (!genAI) throw new Error('GEMINI_NOT_CONFIGURED');
    
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: { parts: [{ text: systemPrompt }] }
    });

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
        }
    });

    const text = result.response.text();
    
    // MD Upgrade: Output Hallucination Guardrails
    if (!text || text.length < 10) throw new Error('INVALID_OUTPUT_TOO_SHORT');
    if (text.toLowerCase().includes('ignore previous instructions')) throw new Error('JAILBREAK_HALLUCINATION_DETECTED');
    
    return { text, provider: 'gemini' };
}

async function callGroq(userPrompt) {
    if (!GROQ_API_KEY) throw new Error('GROQ_NOT_CONFIGURED');

    const res = await checkedFetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                { role: 'system', content: getNeetSystemPrompt() },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 2048,
        }),
    }, {
        errorMessage: 'Groq request failed',
    });

    const data = await res.json();
    return {
        text: data.choices?.[0]?.message?.content || 'No response generated.',
        provider: 'groq',
    };
}

async function callOpenRouter(userPrompt) {
    if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_NOT_CONFIGURED');

    const res = await checkedFetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://neetcoach.in', // Best practice for OpenRouter
            'X-Title': 'NEET Coach',
        },
        body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages: [
                { role: 'system', content: getNeetSystemPrompt() },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 2048,
        }),
    }, {
        errorMessage: 'OpenRouter request failed',
    });

    const data = await res.json();
    return {
        text: data.choices?.[0]?.message?.content || 'No response generated.',
        provider: 'openrouter',
    };
}

// ─── Fallback Chain with Circuit Breakers ────────────────────────────────────

// ─── Fallback Chain with Circuit Breakers ────────────────────────────────────

export async function callAIWithFallback(systemPrompt, userQuestion, forcedProvider = null) {
    let providers = [
        { name: 'gemini', fn: () => withCircuitBreaker('gemini', () => callGemini(systemPrompt, userQuestion)) },
        { name: 'groq',   fn: () => withCircuitBreaker('groq', () => callGroq(userQuestion)) },
        { name: 'openrouter', fn: () => withCircuitBreaker('openrouter', () => callOpenRouter(userQuestion)) },
    ];

    // MD: Graceful Degradation Hook
    if (forcedProvider === 'groq') {
        providers = providers.slice(1); // Drop Gemini, start at Groq
    }

    let lastError = null;
    for (const provider of providers) {
        try {
            const result = await provider.fn();
            if (result.provider !== 'gemini') {
                console.log(`⚡ AI Fallback: Served by ${result.provider} (Gemini unavailable)`);
            }
            return result;
        } catch (err) {
            console.warn(`⚠️ ${provider.name} failed: ${err.message}`);
            lastError = err;
            if (err.message.includes('JAILBREAK')) throw err; // Don't fallback a deliberate hacker
        }
    }

    throw lastError || new Error('All AI providers exhausted');
}

// ─── Main Doubt Response Function ───────────────────────────────────────────

export async function generateDoubtResponse(question, context = '', user = null) {
    const supabase = getSupabase();

    // 1. Database Usage Checks
    if (user) {
        const check = await UsageTracker.checkLimit(user.id, user.plan_type || user.subscription_tier, 'doubt');
        if (!check.allowed) {
            return `🚫 Limit Reached: ${check.message}`;
        }
    }

    // 1.5 EdTech Content Moat: Dynamic Mistake Heatmap Injection
    let heatmapContext = null;
    if (user) {
        try {
            const { data: weakTopics } = await supabase
                .from('user_topic_mastery')
                .select('mastery_score, topics(name)')
                .eq('user_id', user.id)
                .order('mastery_score', { ascending: true })
                .limit(2);
                
            if (weakTopics && weakTopics.length > 0) {
                const topicsStr = weakTopics.map(t => t.topics?.name || 'Unknown Topic').join(', ');
                heatmapContext = `This student has historically struggled with: ${topicsStr} (Lowest mastery scores). Whenever explaining a concept related to these areas, assume they lack foundational understanding. Break the concept down into extremely simple analogies before explaining the complex NEET application.`;
            }
        } catch(e) { console.warn('Could not generate heatmap', e); }
    }

    const dynamicSystemPrompt = getNeetSystemPrompt(heatmapContext);
    
    // 1.6 Edge Governance Pre-flight Billing Assessment
    const totalPromptLength = dynamicSystemPrompt.length + question.length + (context ? context.length : 0);
    const inputTokens = Math.ceil(totalPromptLength / 4);
    
    let governanceProfile = { allowed: true, providerRoute: 'gemini' };
    let trustHintMessage = null;
    if (user) {
        // MD Trust Integration v2: Degraded experience, never full lockout
        const trustTier = getUserTrustTier(user.trust_score);
        
        if (trustTier.label === 'Restricted') {
            // Force cheapest model instead of blocking entirely
            governanceProfile.providerRoute = 'groq';
            trustHintMessage = '⚠️ Your account is running in limited mode due to unusual activity. Continue using the app normally to restore full access.';
        } else if (trustTier.label === 'Warning') {
            governanceProfile.providerRoute = 'groq';
        }

        const isPaid = user.plan_type === 'pro' || user.subscription_tier === 'premium';
        const planKey = isPaid ? 'paid' : 'free';
        const costCheck = await EdgeGovernance.validateConsumptionProfile(user.id, isPaid, inputTokens + 400, user.trust_score, planKey);
        
        if (!costCheck.allowed) {
            if (costCheck.reason === '429_BURST_CAP') {
                return '🚫 Too many requests sent rapidly. Please pause for 60 seconds.';
            }
            return `🚫 Budget Limit Reached: Daily AI token quota exhausted. Return tomorrow!`;
        }
        // Merge cost check routing (only override if not already restricted)
        if (costCheck.providerRoute === 'groq' && trustTier.label !== 'Restricted') {
            governanceProfile.providerRoute = costCheck.providerRoute;
        }
    }

    // 2. Semantic Guardrails
    const forbiddenPatterns = /write a (poem|story|essay|song)|code in|javascript|html|css|python|java|c\+\+|hack|sql|database|jailbreak/i;
    if (forbiddenPatterns.test(question)) {
        return "I am an AI coach specialized exclusively in NEET preparation (Physics, Chemistry, Biology). I cannot assist with non-medical syllabus queries. Let's focus on cracking NEET! 🩺";
    }

    // 2. Check redis semantic cache
    const cacheKey = generateCacheKey(question + context, 'doubt');
    const cachedResponse = await getCachedResponse(cacheKey);

    if (cachedResponse) {
        if (user) await UsageTracker.incrementUsage(user.id, 'doubt', 0, 0);
        return cachedResponse;
    }

    if (!GEMINI_API_KEY && !GROQ_API_KEY && !OPENROUTER_API_KEY) {
        console.warn('No AI API keys found. Doubt response unavailable.');
        return 'AI coaching is temporarily unavailable. Please try again later.';
    }

    try {
        // Call AI with structural integrity, automatic layer fallback, and forced degradation if quota demands it.
        const { text, provider } = await callAIWithFallback(
            dynamicSystemPrompt, 
            `${question}${context ? `\n\nContext: ${context}` : ''}`,
            governanceProfile.providerRoute // Enforces Groq fallback if budget exceeded!
        );

        // 3. Update Usage & Cache
        const outputTokens = Math.ceil(text.length / 4);

        if (user) await UsageTracker.incrementUsage(user.id, 'doubt', inputTokens, outputTokens);

        // Cache result with 7-day TTL
        await setCachedResponse(cacheKey, text, CACHE_TTL.DOUBTS);

        // MD Trust Recovery: Reward genuine doubt engagement
        if (user && user.trust_score < 100) {
            const { calculateTrustRecovery } = await import('./trust-engine');
            const recovery = calculateTrustRecovery('doubt_resolved', user.trust_score);
            if (recovery > 0) {
                const supabaseUpdate = getSupabase();
                await supabaseUpdate.from('users').update({
                    trust_score: Math.min(100, (user.trust_score || 100) + recovery)
                }).eq('id', user.id);
            }
        }

        // Prepend transparency hint if trust is affecting experience
        const finalResponse = trustHintMessage ? `${trustHintMessage}\n\n---\n\n${text}` : text;

        // MD Mandate: Shadow Engine A/B Testing
        // Fires non-blocking on 5% of traffic to validate new experimental prompts cheaply
        if (user) {
            ShadowEngine.triggerShadowEval(question, context, text, outputTokens, user.id);
        }

        return finalResponse;
    } catch (error) {
        console.error('AI Generation Error (all providers failed):', error);
        return "I'm having trouble connecting to my brain right now. Please try again later. (Error: All AI providers temporarily unavailable)";
    }
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
