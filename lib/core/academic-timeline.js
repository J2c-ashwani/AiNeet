import { safeInsert } from './db-safe';
import * as Sentry from '@sentry/nextjs';
import { logError } from '../error-logger';
import { getDb } from './db';

/**
 * Log an academic event to the permanent ledger.
 * This is the black-box recorder for the learning engine.
 * 
 * If eventType is 'test_submitted', this ALSO acts as a hard idempotency lock.
 * If a duplicate submit happens, it will throw a unique constraint violation (23505).
 */
export async function logAcademicEvent({
    eventType,
    userId,
    testId = null,
    questionId = null,
    payload = null,
    sourceRoute = 'unknown',
    deviceType = 'web',
    networkState = 'unknown'
}) {
    if (!eventType || !userId) {
        console.error('[Academic Timeline] Missing required fields (eventType, userId).');
        return null;
    }

    try {
        // We use raw getDb() to avoid infinite loop with db-safe if needed, but safeInsert is better
        // Wait, safeInsert does its own Sentry logging. Let's just use safeInsert.
        return await safeInsert('academic_events', {
            event_type: eventType,
            user_id: userId,
            test_id: testId,
            question_id: questionId,
            payload,
            route: sourceRoute,
            device: deviceType,
            network: networkState,
            timestamp: new Date().toISOString()
        }, { route: sourceRoute, userId });

    } catch (error) {
        // If it's a unique constraint error for test_submitted, we WANT this to bubble up to block the transaction.
        if (error.originalError?.code === '23505' && eventType === 'test_submitted') {
            throw error; 
        }

        console.error('[Academic Timeline Error] Failed to log event:', error.message);
        
        // For non-critical events (like answer_selected), don't crash the main flow.
        try {
            Sentry.captureException(error, {
                tags: { flow: 'academic-ledger' },
                extra: { eventType, userId, testId }
            });
            const supabase = await getDb();
            await logError(supabase, { userId, route: sourceRoute, method: 'POST', error });
        } catch (e) {
            console.error('Secondary logging failed:', e.message);
        }

        // We only bubble up errors for strict locking events.
        if (['test_submitted', 'battle_finalized'].includes(eventType)) {
            throw error;
        }

        return null;
    }
}
