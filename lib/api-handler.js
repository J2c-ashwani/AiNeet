
import { NextResponse } from 'next/server';
import { rateLimit } from './rate-limit';

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
                const result = rateLimit(key, options.rateLimit.limit, options.rateLimit.window);

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
            // ─── Catch-All: The app NEVER crashes ───
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
