import * as Sentry from "@sentry/nextjs";

// S5: Guard against missing DSN — Sentry.init with no DSN silently disables it
// but @sentry/nextjs v7+ may throw in some configs. Explicit guard = safe.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

        // S5: Reduced from 1.0 (100%) to 0.1 (10%) for open traffic.
        // tracesSampleRate: 1 would exhaust Sentry quota within hours of launch.
        // Errors (not traces) are always captured 100% — this only affects performance traces.
        tracesSampleRate: 0.1,

        // Only enable debug in local development
        debug: process.env.NODE_ENV === 'development',

        // Tag all events with environment for filtering
        environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    });
}
