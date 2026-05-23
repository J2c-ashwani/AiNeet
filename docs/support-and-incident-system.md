# Support and Incident System

Every production issue must become an incident record when it affects payment, auth, test submission, RAG accuracy, data integrity, or mobile runtime stability. Informal chat fixes are not enough for public launch operations.

## Incident Record Fields

- Timestamp and reporter
- Severity: Critical, High, Medium, Low
- Impacted subsystem and user count
- Reproduction steps
- Root cause
- Fix applied
- Prevention item
- Evidence link: Sentry issue, log, screenshot, payment ID, test ID, or support ticket
- Owner and closure timestamp

## Support Flow

1. Intake user issue through support form, email, or WhatsApp.
2. Tag the issue: auth, payment, test, AI/RAG, OMR, mobile, performance, abuse, refund.
3. Link the issue to Sentry, payment timeline, academic timeline, or DB evidence.
4. Resolve the user-facing issue first, then create the prevention task.
5. For payment disputes, follow `docs/refund-policy.md` and attach the Cashfree event timeline.

## Severity Rules

Critical means public acquisition stops immediately. High means the affected subsystem is disabled by feature flag if the issue is not fixed within one hour. Medium and Low continue through normal triage but still require a prevention note.
