import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

        // S5: 0.1 = 10% trace sampling. Errors always captured 100%.
        tracesSampleRate: 0.1,

        debug: process.env.NODE_ENV === 'development',
        environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',

        // Session replay: errors at 100%, sessions at 5% (reduced from 10%)
        replaysOnErrorSampleRate: 1.0,
        replaysSessionSampleRate: 0.05,

        integrations: [
            Sentry.replayIntegration({
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],
    });
}
