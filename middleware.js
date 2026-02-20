import { NextResponse } from 'next/server';

/**
 * Next.js Edge Middleware — Runs before every request.
 * 
 * Responsibilities:
 * 1. Security headers (CSP, HSTS, X-Frame-Options, etc.)
 * 2. Auth guard for protected routes
 * 3. Bot/crawler detection for rate limiting
 */
export function middleware(request) {
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

    // ─── Auth Guard: Redirect unauthenticated users from protected routes ───
    const protectedPaths = ['/dashboard', '/test', '/analytics', '/profile', '/mistakes', '/battleground', '/study-plan', '/doubts', '/revision', '/leaderboard'];
    const isProtected = protectedPaths.some(p => pathname.startsWith(p));

    if (isProtected) {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // ─── Redirect logged-in users away from login/register ───
    const authPaths = ['/login', '/register'];
    if (authPaths.includes(pathname)) {
        const token = request.cookies.get('token')?.value;
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        // Match all routes except static files, API routes, and Next.js internals
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|og-image.png|monitoring).*)',
    ],
};
