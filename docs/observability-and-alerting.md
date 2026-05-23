# Observability and Alerting

This platform may enter public rollout only when production monitoring is connected to real destinations, not placeholder values. `NEXT_PUBLIC_SENTRY_DSN` must point to the production Sentry project in Vercel and the mobile shell, and Sentry alerts must cover frontend crashes, API crashes, hydration failures, and mobile runtime failures.

## Required Monitors

- Homepage availability: `GET /`
- Authentication availability: login page plus one synthetic login probe
- Core health: `GET /api/health`
- Feature health: `GET /api/health/features`
- AI/RAG health: a low-volume synthetic NCERT explanation probe
- Payment health: Cashfree create/verify smoke probe against the approved test plan
- Supabase latency: query latency, CPU, pool saturation, and error rate

## Required Alerts

- 5xx error spike over 2 percent for 5 minutes
- Payment webhook failure or duplicate replay anomaly
- AI timeout, quota exhaustion, or circuit breaker open
- DB latency p95 over 1 second for 10 minutes
- Failed cron job in `cron_execution_logs`
- Mobile runtime crash spike or offline replay failure spike

## Operating Rule

Every public rollout ramp must have one named on-call owner, Sentry dashboard open, Supabase dashboard open, and payment dashboard open. If a critical alert fires during rollout, freeze acquisition immediately, capture the incident in the incident log, and use feature flags or rollback before continuing.
