# Soft Launch and Scale Expansion

Soft launch starts only after closed beta exit criteria pass. The first soft launch band is 5k users, then 10k users, then a separate scale certification before any millions-user marketing push.

## Traffic Ramp

| Stage | Size | Required proof before next stage |
|---|---:|---|
| Internal dry run | Team only | 17/17 certification and rollback drill |
| Closed beta | 100 to 500 | Seven stable days, no open Critical or High incident |
| Soft launch A | 5k | E2E pass, p95 stable, support system active |
| Soft launch B | 10k | Cost predictable, no DB pool saturation, no AI quota instability |
| Scale expansion | Beyond 10k | Dedicated load certification and MD approval |

## Required Measurements

- p95 latency for dashboard, test submission, RAG retrieval, and payment verification
- Supabase CPU, query latency, pool usage, and slow queries
- Gemini quota usage, timeout rate, and fallback activation
- Vercel function duration, error rate, and cold-start impact
- Redis pressure, queue backlog, and retry storms
- Payment failure rate, webhook duplicate rate, and refund/cancel support volume

## Scale Gate

Before moving beyond the 5k-10k soft-launch band, run:

```bash
SCALE_WINDOW_DAYS=7 npm run certify:scale -- --live
```

The gate must return `SCALE_READY`. Static preflight is useful for checking that the evidence machinery exists, but it is not approval to scale.

## Stop Conditions

Freeze the ramp if any Critical incident occurs, if p95 latency breaches target for more than 15 minutes, if Gemini cost becomes unpredictable, if Supabase shows pool saturation, or if rollback cannot be completed inside the documented recovery window.
