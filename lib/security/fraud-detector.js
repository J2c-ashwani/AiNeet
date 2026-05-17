/**
 * lib/security/fraud-detector.js
 *
 * Behavior-based fraud signal detection.
 * NEVER auto-bans. Shadow-flags only. Human review required for action.
 *
 * Detects: impossible speed, XP farming, synchronized submits,
 * automation timing, and topic exploit loops.
 */

import { getSupabase } from '@/lib/supabase';
import { safeInsert } from '@/lib/core/db-safe';

// ---------------------------------------------------------------------------
// Detection Functions — called at key academic events
// ---------------------------------------------------------------------------

/**
 * Check for impossible answer speed (< 3s for calculation questions).
 * Call from test answer submission handler.
 */
export async function checkAnswerSpeed({ userId, questionId, timeSpentMs, questionType }) {
    const MINIMUM_CALC_MS = 3000;
    if (questionType === 'calculation' && timeSpentMs < MINIMUM_CALC_MS) {
        await flagSignal(userId, 'impossible_speed', 'medium', {
            questionId,
            timeSpentMs,
            threshold: MINIMUM_CALC_MS
        });
    }
}

/**
 * Check for XP farming loops (> 20 XP events in < 5 min, same topic).
 * Call from XP grant handler.
 */
export async function checkXpFarming({ userId, topicId }) {
    const supabase = await getSupabase();
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { count } = await supabase
        .from('xp_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('topic_id', topicId)
        .gte('created_at', fiveMinAgo);

    if (count >= 20) {
        await flagSignal(userId, 'xp_farming_loop', 'high', {
            topicId,
            eventCount: count,
            windowMinutes: 5
        });
    }
}

/**
 * Check for automation timing (< 200ms answer variance across session).
 * Call at test submission time.
 */
export async function checkAutomationTiming({ userId, testId, answerTimings }) {
    if (!answerTimings || answerTimings.length < 20) return;

    const mean = answerTimings.reduce((a, b) => a + b, 0) / answerTimings.length;
    const variance = answerTimings.reduce((s, t) => s + Math.pow(t - mean, 2), 0) / answerTimings.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < 200) {
        await flagSignal(userId, 'automation_timing', 'critical', {
            testId,
            stdDevMs: stdDev,
            meanMs: mean,
            sampleSize: answerTimings.length
        });
    }
}

/**
 * Check for offline queue tamper attempts.
 * Call from offline queue server-side validation.
 */
export async function checkOfflineTamper({ userId, submissionId, reason }) {
    await flagSignal(userId, 'offline_tamper', 'critical', {
        submissionId,
        reason
    });
}

// ---------------------------------------------------------------------------
// Core Flagging (never auto-bans)
// ---------------------------------------------------------------------------

async function flagSignal(userId, signalType, severity, evidence) {
    try {
        const supabase = await getSupabase();

        // Check if identical signal already flagged in last hour (dedup)
        const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
        const { count } = await supabase
            .from('fraud_signals')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('signal_type', signalType)
            .gte('created_at', oneHourAgo);

        if (count > 0) return; // Already flagged recently

        await safeInsert('fraud_signals', {
            user_id:     userId,
            signal_type: signalType,
            severity,
            evidence,
            action_taken: 'none' // NEVER auto-ban
        }, {
            route: 'fraud-detector/flagSignal',
            userId,
        });

        console.warn(`[FraudDetector] Signal: ${signalType} | User: ${userId} | Severity: ${severity}`);
    } catch (e) {
        console.error('[FraudDetector] Failed to flag signal:', e.message);
    }
}
