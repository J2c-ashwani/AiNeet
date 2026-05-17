/**
 * Shadow Mode Testing Engine (Hybrid Logging)
 * 
 * Runs new AI models/prompts silently alongside production traffic without affecting users.
 * Sinks short-term telemetry into Redis for later DB ingestion.
 */

import { Redis } from '@upstash/redis';
import { allOrThrow } from './async';
import { callAIWithFallback } from './ai-engine';

export class ShadowEngine {
    
    /**
     * Entry point: Non-blocking Fire and Forget execution
     */
    static triggerShadowEval(question, context, liveText, liveTokens, userId) {
        // Roll 5% probability
        if (Math.random() > 0.05) return;
        
        // Exact isolation - MUST NEVER throw or block the main thread
        setTimeout(async () => {
            try {
                await this._executeShadowRun(question, context, liveText, liveTokens, userId);
            } catch (error) {
                console.error('[SHADOW ENGINE] Fatal isolation error. Safely caught.', error);
            }
        }, 0);
    }

    /**
     * Internal async logic
     */
    static async _executeShadowRun(question, context, liveText, liveTokens, userId) {
        const redisCtx = this.getRedis();
        if (!redisCtx) return;

        // 1. HARD BUDGET CAP (MD Mandate: Max 5% of total platform budget)
        const today = new Date().toISOString().split('T')[0];
        const shadowCostKey = `ops:shadow_cost:${today}`;
        const prodCostKey = `ops:daily_cost:${today}`;

        const [shadowCost, prodCost] = await allOrThrow([
            redisCtx.get(shadowCostKey),
            redisCtx.get(prodCostKey)
        ]);
        
        const shadowCostNum = Number(shadowCost || 0);
        const prodCostNum = Number(prodCost || 1); // Avoid div by 0
        
        if (shadowCostNum > 0 && (shadowCostNum / prodCostNum) > 0.05) {
            console.warn('[SHADOW ENGINE] Budget Cap Exceeded (>5%). Engine bypassed.');
            return;
        }

        // 2. EXPERIMENTAL PROMPT / MODEL DEFINITION
        // What are we testing today?
        const SHADOW_SYSTEM_PROMPT = `You are an AI NEET coach. Be incredibly concise. Use bullet points only. Do not apologize or over-explain.`;
        const testModelRoute = 'groq'; // Always use cheap inference for shadow testing
        
        // 3. EXECUTE SHADOW INFERENCE
        const startTime = Date.now();
        const { text: shadowText } = await callAIWithFallback(
            SHADOW_SYSTEM_PROMPT, 
            `${question}${context ? `\n\nContext: ${context}` : ''}`,
            testModelRoute
        );
        const latencyMs = Date.now() - startTime;
        const shadowTokens = Math.ceil(shadowText.length / 4);

        // Update shadow budget in Redis ($0.15/1M tokens)
        const shadowCostInr = (shadowTokens / 1000000) * 12;
        await redisCtx.incrbyfloat(shadowCostKey, shadowCostInr);
        await redisCtx.expire(shadowCostKey, 86400);

        // 4. AUTOMATED QA EVALUATION
        const evalScore = this._evaluateQuality(shadowText, liveText, question);

        // 5. SINK TO REDIS FOR NIGHTLY DB JOB
        const shadowRecord = {
            id: `shadow_${Date.now()}_${Math.floor(Math.random()*1000)}`,
            userId,
            question,
            liveTokens,
            shadowTokens,
            latencyMs,
            evalScore,
            winner: evalScore.passedCheck ? 'shadow_passed' : 'shadow_failed',
            timestamp: new Date().toISOString()
        };

        await redisCtx.lpush(`ops:shadow_eval_logs:${today}`, JSON.stringify(shadowRecord));
        await redisCtx.expire(`ops:shadow_eval_logs:${today}`, 86400 * 3); // Keep for 3 days max
        console.log(`[SHADOW ENGINE] Eval complete. Score: ${evalScore.ratioScore}/100`);
    }

    /**
     * Automated heuristic evaluation for uncopyable advantage
     */
    static _evaluateQuality(shadowResponse, prodResponse, question) {
        // A simple eval looking for hallucinations and verbosity
        
        // 1. Length Ratio (Is shadow too verbose or too short?)
        const prodLen = prodResponse.length || 1;
        const shadowLen = shadowResponse.length;
        const lengthRatio = shadowLen / prodLen;
        
        let ratioScore = 100;
        if (lengthRatio > 1.5) ratioScore -= 30; // Bloat penalty
        if (lengthRatio < 0.3) ratioScore -= 30; // Missing substance penalty
        
        // 2. Keyword check
        const qWords = question.toLowerCase().split(/\W+/).filter(w => w.length > 4);
        let keywordMatches = 0;
        qWords.forEach(w => {
            if (shadowResponse.toLowerCase().includes(w)) keywordMatches++;
        });
        const keywordScore = qWords.length > 0 ? (keywordMatches / qWords.length) * 100 : 100;

        // 3. Hallucination flags (MD Mandate)
        const hallucinationFlags = ['as an ai', 'i am not a doctor', 'i cannot verify'];
        let hallucinated = false;
        hallucinationFlags.forEach(f => {
            if (shadowResponse.toLowerCase().includes(f)) {
                hallucinated = true;
                ratioScore -= 50;
            }
        });

        const passedCheck = ratioScore > 70 && keywordScore > 50 && !hallucinated;

        return { ratioScore, keywordScore, hallucinated, passedCheck };
    }

    static getRedis() {
        if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
        return new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    }
}
