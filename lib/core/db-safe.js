import { getDb } from './db';
import { logError } from '../error-logger';
import * as Sentry from '@sentry/nextjs';

/**
 * DB Safe Layer
 * Mandated canonical database gateway for all critical writes.
 * Guarantees: latency timing, structured logging, Sentry monitoring, and auto-throws on failure.
 */

class DatabaseIntegrityError extends Error {
    constructor(message, originalError, context) {
        super(message);
        this.name = 'DatabaseIntegrityError';
        this.originalError = originalError;
        this.context = context;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * Wraps a Supabase query with observability and safety constraints.
 */
async function executeSafeQuery(operationName, queryPromise, context = {}) {
    const startTime = Date.now();
    let result;

    try {
        result = await queryPromise;
    } catch (unhandledErr) {
        result = { error: unhandledErr, data: null };
    }

    const latencyMs = Date.now() - startTime;

    if (result.error) {
        const enrichedContext = {
            ...context,
            operation: operationName,
            latencyMs,
            dbCode: result.error.code,
            dbHint: result.error.hint,
            dbDetails: result.error.details
        };

        // 1. Report to Sentry
        Sentry.withScope((scope) => {
            scope.setTag('db.operation', operationName);
            scope.setTag('db.route', context.route || 'unknown');
            scope.setExtras(enrichedContext);
            Sentry.captureException(new Error(`DB_FAIL [${operationName}]: ${result.error.message}`));
        });

        // 2. Log to error_logs table via fallback logger (don't block)
        const supabase = await getDb();
        logError(supabase, {
            userId: context.userId || null,
            route: context.route || 'db_safe_layer',
            method: 'DB_EXECUTE',
            error: result.error,
            metadata: enrichedContext
        });

        console.error(`[DB_SAFE] ${operationName} failed in ${latencyMs}ms on route ${context.route || 'unknown'}:`, result.error.message);

        // 3. Auto-throw standardized error
        throw new DatabaseIntegrityError(`Database operation ${operationName} failed`, result.error, enrichedContext);
    }

    // Optional debug logging for slow queries
    if (latencyMs > 500) {
        console.warn(`[DB_SAFE_SLOW] ${operationName} took ${latencyMs}ms (Route: ${context.route || 'unknown'})`);
    }

    return result.data;
}

/**
 * Safe Insert
 */
export async function safeInsert(table, payload, context = {}) {
    const supabase = await getDb();
    return executeSafeQuery(`INSERT_${table.toUpperCase()}`, supabase.from(table).insert(payload).select(), context);
}

/**
 * Safe Update
 */
export async function safeUpdate(table, matchCriteria, payload, context = {}) {
    const supabase = await getDb();
    return executeSafeQuery(`UPDATE_${table.toUpperCase()}`, supabase.from(table).update(payload).match(matchCriteria).select(), context);
}

/**
 * Safe Delete
 */
export async function safeDelete(table, matchCriteria, context = {}) {
    const supabase = await getDb();
    return executeSafeQuery(`DELETE_${table.toUpperCase()}`, supabase.from(table).delete().match(matchCriteria).select(), context);
}

/**
 * Safe Upsert
 */
export async function safeUpsert(table, payload, options = {}, context = {}) {
    const supabase = await getDb();
    return executeSafeQuery(`UPSERT_${table.toUpperCase()}`, supabase.from(table).upsert(payload, options).select(), context);
}

/**
 * Safe Select (Single or Multiple)
 * Used mostly when read failures are critical to the transaction.
 */
export async function safeSelect(table, queryBuilderFn, context = {}) {
    const supabase = await getDb();
    let query = supabase.from(table).select('*');
    if (queryBuilderFn) {
        query = queryBuilderFn(query);
    }
    return executeSafeQuery(`SELECT_${table.toUpperCase()}`, query, context);
}

/**
 * Safe RPC (For Transactions)
 */
export async function safeRpc(rpcName, payload, context = {}) {
    const supabase = await getDb();
    return executeSafeQuery(`RPC_${rpcName.toUpperCase()}`, supabase.rpc(rpcName, payload), context);
}
