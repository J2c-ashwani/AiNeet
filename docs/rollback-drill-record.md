# Rollback Drill Record

Rollback is not certified until a real deployment rollback has been executed and recorded. A written procedure is not enough.

## Web Rollback Evidence

| Field | Value |
|---|---|
| Operator | |
| Date/time | |
| Current production deployment | |
| Dummy deployment promoted | |
| Previous deployment restored | |
| Rollback method | Vercel dashboard or CLI |
| Start timestamp | |
| End timestamp | |
| Elapsed time | |
| Health check result | |
| User-facing error window | |

## Pass Criteria

- Rollback completes in under 5 minutes.
- `GET /api/health` passes after rollback.
- Login page loads after rollback.
- No migration rollback is needed for the web rollback drill.
- Incident log entry records the drill and outcome.

## Database Rollback Rule

Production database rollback requires a planned maintenance window. Future migrations must be additive by default. Destructive migrations require a fresh backup, staging restore proof, MD approval, and a rollback plan before deployment.
