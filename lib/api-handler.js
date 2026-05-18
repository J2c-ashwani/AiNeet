
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { rateLimit } from './rate-limit';
import { getUserFromRequest } from './core/auth';
import { getRequiredServerSecret, timingSafeEqual } from './server-secrets';

export class ApiError extends Error {
    constructor(message, status = 500, code = 'API_ERROR', details = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

function getRequestId(request) {
    return request.headers.get('x-request-id') || crypto.randomUUID();
}

function getClientIp(request) {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';
}

function errorResponse(error, request, requestId) {
    const isProduction = process.env.NODE_ENV === 'production';
    const status = error?.status || 500;
    const code = error?.code || (status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED');

    if (status >= 500) {
        console.error(`[API ERROR] ${request.method} ${request.nextUrl?.pathname || request.url} requestId=${requestId}:`, error);
    }

    const headers = { 'X-Request-Id': requestId };
    if (error?.details?.retryAfter) {
        headers['Retry-After'] = String(error.details.retryAfter);
    }

    return NextResponse.json(
        {
            error: status >= 500 && isProduction
                ? 'An unexpected error occurred. Please try again.'
                : error?.message || 'Internal Server Error',
            code,
            requestId,
            ...(error?.details && !isProduction ? { details: error.details } : {}),
        },
        {
            status,
            headers,
        }
    );
}

async function readJsonBody(request) {
    try {
        return await request.json();
    } catch {
        throw new ApiError('Invalid request body', 400, 'INVALID_JSON');
    }
}

async function enforceRateLimit(request, user, options = {}) {
    if (!options) return;

    const ip = getClientIp(request);
    const path = request.nextUrl?.pathname || 'api';
    const identity = user?.id ? `user:${user.id}` : `ip:${ip}`;
    const keyPrefix = options.key || path;
    const result = await rateLimit(
        `${identity}:${keyPrefix}`,
        options.limit,
        options.window,
        options.failBehavior || 'open'
    );

    if (!result.success) {
        throw new ApiError(
            'Too many requests. Please slow down.',
            429,
            'RATE_LIMITED',
            { retryAfter: Math.ceil((result.reset - Date.now()) / 1000) }
        );
    }
}

function parseQuery(request, schema) {
    if (!schema) return {};
    const url = new URL(request.url);
    const raw = Object.fromEntries(url.searchParams.entries());
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
        throw new ApiError('Invalid query parameters', 400, 'INVALID_QUERY', parsed.error.flatten());
    }
    return parsed.data;
}

async function parseBody(request, schema) {
    if (!schema) return undefined;
    const raw = await readJsonBody(request);
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
        throw new ApiError('Invalid request body', 400, 'INVALID_BODY', parsed.error.flatten());
    }
    return parsed.data;
}

function withRequestId(response, requestId) {
    if (response instanceof Response) {
        response.headers.set('X-Request-Id', requestId);
        return response;
    }
    return NextResponse.json(response ?? { success: true }, {
        headers: { 'X-Request-Id': requestId },
    });
}

/**
 * Enterprise API gateway wrapper.
 *
 * Centralizes route auth/RBAC, request size checks, rate limiting, zod validation,
 * normalized errors, and request correlation.
 */
export function withApiRoute(handler, options = {}) {
    return async function enterpriseHandler(request, context) {
        const requestId = getRequestId(request);
        try {
            if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
                const contentLength = request.headers.get('content-length');
                const maxSize = options.maxBodySize || 1_048_576;
                if (contentLength && parseInt(contentLength, 10) > maxSize) {
                    throw new ApiError('Request body too large', 413, 'BODY_TOO_LARGE');
                }
            }

            let user = null;
            if (options.auth === 'cron') {
                const secret = getRequiredServerSecret('CRON_SECRET');
                const authHeader = request.headers.get('authorization');
                const expectedHeader = secret ? `Bearer ${secret}` : '';
                if (!secret || !timingSafeEqual(authHeader, expectedHeader)) {
                    throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
                }
            }

            if (options.auth === 'user' || options.auth === 'admin') {
                user = await getUserFromRequest(request);
                if (!user) throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
                if (options.auth === 'admin' && user.role !== 'admin') {
                    throw new ApiError('Forbidden', 403, 'FORBIDDEN');
                }
            }

            await enforceRateLimit(request, user, options.rateLimit);

            const query = parseQuery(request, options.querySchema);
            const body = await parseBody(request, options.bodySchema);

            const result = await handler(request, {
                ...context,
                requestId,
                user,
                query,
                body,
            });

            return withRequestId(result, requestId);
        } catch (error) {
            return errorResponse(error, request, requestId);
        }
    };
}

/**
 * Universal API route wrapper — handles errors, rate limiting, and body size checking.
 * Wrapping all routes ensures ZERO unhandled crashes in production.
 * 
 * Usage:
 *   export const POST = withErrorHandler(async (request) => {
 *       // your route logic
 *       return NextResponse.json({ data });
 *   }, { rateLimit: { limit: 10, window: 60000 } });
 * 
 * @param {Function} handler - Route handler function
 * @param {object} options - { rateLimit, maxBodySize }
 */
export function withErrorHandler(handler, options = {}) {
    return async function safeHandler(request, context) {
        try {
            // ─── Rate Limiting ───
            if (options.rateLimit) {
                const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
                    || request.headers.get('x-real-ip')
                    || 'unknown';
                const key = `${ip}:${request.nextUrl?.pathname || 'api'}`;
                const result = await rateLimit(key, options.rateLimit.limit, options.rateLimit.window);

                if (!result.success) {
                    return NextResponse.json(
                        {
                            error: 'Too many requests. Please slow down.',
                            retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
                        },
                        {
                            status: 429,
                            headers: {
                                'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
                                'X-RateLimit-Remaining': '0',
                            },
                        }
                    );
                }
            }

            // ─── Body Size Check (for POST/PUT/PATCH) ───
            if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
                const contentLength = request.headers.get('content-length');
                const maxSize = options.maxBodySize || 1_048_576; // 1MB default
                if (contentLength && parseInt(contentLength) > maxSize) {
                    return NextResponse.json(
                        { error: 'Request body too large' },
                        { status: 413 }
                    );
                }
            }

            // ─── Execute Handler ───
            return await handler(request, context);

        } catch (error) {
            console.error(`[API ERROR] ${request.method} ${request.nextUrl?.pathname}:`, error);

            // Don't expose internal errors to client
            const isProduction = process.env.NODE_ENV === 'production';

            return NextResponse.json(
                {
                    error: isProduction
                        ? 'An unexpected error occurred. Please try again.'
                        : error.message || 'Internal Server Error',
                    errorId: Date.now().toString(36), // For debugging
                },
                { status: 500 }
            );
        }
    };
}

/**
 * Pre-configured rate limit presets for common route types
 */
export const RATE_LIMITS = {
    // Auth routes: strict (brute-force protection)
    AUTH: { limit: 5, window: 60_000 },           // 5 req/min

    // AI-powered routes: moderate (cost protection)
    AI: { limit: 20, window: 60_000 },             // 20 req/min
    AI_HEAVY: { limit: 5, window: 60_000 },        // 5 req/min (image analysis, test generation)

    // Payment routes: strict (fraud prevention)
    PAYMENT: { limit: 5, window: 300_000 },        // 5 req/5min

    // Standard CRUD: lenient
    STANDARD: { limit: 60, window: 60_000 },       // 60 req/min

    // Public/read-only: very lenient
    PUBLIC: { limit: 120, window: 60_000 },        // 120 req/min
};
