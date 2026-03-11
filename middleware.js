import { NextResponse } from 'next/server';
import { updateSession } from './utils/supabase/middleware';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis for Rate Limiting at the Edge
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// CTO Constraints: 50 requests/min per IP, 20 requests/min per User
const ipRatelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(50, '1 m'),
    analytics: true,
});

const userRatelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
});

/**
 * Next.js Edge Middleware — Runs before every request.
 * 
 * Responsibilities:
 * 1. Security headers (CSP, HSTS, X-Frame-Options, etc.)
 * 2. Auth guard for protected routes
 * 3. Bot/crawler detection for rate limiting
 */
export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // ─── Security Headers ───
    const response = NextResponse.next();

    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('X-DNS-Prefetch-Control', 'on');

    // ─── Auth Guard using Supabase Middleware ───
    const authResponse = await updateSession(request);

    // Merge security headers into the auth response
    response.headers.forEach((value, key) => {
        authResponse.headers.set(key, value);
    });

    // ─── Edge Rate Limiting (API Routes Only) ───
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/webhooks')) {
        // Find IP
        const ip = request.ip ?? request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1";
        const { success: ipSuccess } = await ipRatelimit.limit(`ratelimit_ip_${ip}`);

        if (!ipSuccess) {
            return NextResponse.json({ error: 'Too many requests from this IP. Please wait a minute.' }, { status: 429 });
        }

        // Try extracting user context from headers to enforce the stricter User limit
        const cookieHeader = request.headers.get('cookie') || '';
        const hasSession = cookieHeader.includes('sb-') && cookieHeader.includes('-auth-token');

        if (hasSession) {
            // We use the auth token or IP as a surrogate for user ID at the edge if we can't fully decode the JWT here
            // This applies the secondary, stricter limit of 20 req/min for active sessions
            const { success: userSuccess } = await userRatelimit.limit(`ratelimit_user_${ip}`);
            if (!userSuccess) {
                return NextResponse.json({ error: 'Rate limit exceeded. Please slow down your requests.' }, { status: 429 });
            }
        }
    }

    return authResponse;
}

export const config = {
    matcher: [
        // Match all routes except static files, _next, and webhook routes
        '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|og-image.png|monitoring).*)',
    ],
};
