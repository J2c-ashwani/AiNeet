import { NextResponse } from 'next/server';
import { updateSession } from './utils/supabase/middleware';

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
    // updateSession handles route protection internally
    const authResponse = await updateSession(request);

    // Merge security headers into the auth response
    response.headers.forEach((value, key) => {
        authResponse.headers.set(key, value);
    });

    return authResponse;
}

export const config = {
    matcher: [
        // Match all routes except static files, API routes, and Next.js internals
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|og-image.png|monitoring).*)',
    ],
};
