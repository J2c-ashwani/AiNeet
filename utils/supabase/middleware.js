import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

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

    // refreshing the auth token
    const { data: { user } } = await supabase.auth.getUser()

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
        const dashboardUrl = new URL('/dashboard', request.url);
        const redirectResponse = NextResponse.redirect(dashboardUrl);
        supabaseResponse.cookies.getAll().forEach(cookie => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie.options);
        });
        return redirectResponse;
    }

    return supabaseResponse
}
