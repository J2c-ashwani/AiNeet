import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const sessionMicroCache = new Map();
const CACHE_TTL_MS = 60000;

export async function updateSession(request) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // refreshing the auth token and verifying
    let user = null;
    const tokenStr = request.cookies.getAll().find(c => c.name.includes('-auth-token'))?.value;

    if (tokenStr) {
        const cached = sessionMicroCache.get(tokenStr);
        if (cached && cached.expiry > Date.now()) {
            user = cached.user;
        } else {
            const { data } = await supabase.auth.getUser();
            user = data.user;
            if (user) {
                sessionMicroCache.set(tokenStr, { user, expiry: Date.now() + CACHE_TTL_MS });
                if (sessionMicroCache.size > 5000) sessionMicroCache.clear();
            }
        }
    }
    const pathname = request.nextUrl.pathname;

    // ─── Auth Guard: Redirect unauthenticated users from protected routes ───
    const protectedPaths = ['/dashboard', '/analytics', '/profile', '/revision', '/admin'];
    const isProtected = protectedPaths.some(p => pathname.startsWith(p));

    if (isProtected && !user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        // Ensure we preserve the cookies that were created during updateSession
        const redirectResponse = NextResponse.redirect(loginUrl);
        supabaseResponse.cookies.getAll().forEach(cookie => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie.options);
        });
        return redirectResponse;
    }

    // ─── Redirect logged-in users away from login/register ───
    const authPaths = ['/login', '/register'];
    if (authPaths.includes(pathname) && user) {
        const homeUrl = new URL('/', request.url);
        const redirectResponse = NextResponse.redirect(homeUrl);
        supabaseResponse.cookies.getAll().forEach(cookie => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie.options);
        });
        return redirectResponse;
    }

    return supabaseResponse
}
