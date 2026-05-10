import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://dummy@o0.ingest.sentry.io/0",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1, // Sample 10% of sessions for replay

  integrations: [
    Sentry.replayIntegration({
      // Mask all text inputs and sensitive data
      maskAllTextInputs: true,
      maskAllInputs: true,
      blockAllMedia: false,
      mask: ['.sensitive-data', '[type="password"]', '[name="otp"]', '[name="password"]', '[id="otp"]'],
      block: ['form[action="/api/auth/login"]', 'form[action="/api/auth/register"]']
    }),
  ],

  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development',
});
