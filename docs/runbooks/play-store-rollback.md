# Runbook: Play Store Rollback

**Trigger:** Crash rate > 0.3% within 6 hours of new APK reaching > 20% users  
**Severity:** P0  
**Owner:** Engineering Lead + Product Lead

---

## Rollback Decision Criteria

Immediately roll back if ANY of the following:
- Crashlytics crash-free rate drops below 99.7%
- ANR rate exceeds 0.1%
- Recovery manager failure rate exceeds 2%
- > 5 student complaints about lost tests in 1 hour

---

## Rollback Steps

1. **Google Play Console** → App releases → Find previous stable release → "Promote" back to production.
2. **Set rollout to 100%** of previous version (overrides current).
3. **Disable risky feature flags** immediately:
```sql
UPDATE feature_flags SET enabled = false
WHERE key IN ('ff_adaptive_engine', 'ff_battleground', 'ff_omr_enabled');
```
4. **Notify team** in incident channel with: affected version, crash rate, action taken.

---

## Post-Rollback

1. Reproduce crash in staging using Crashlytics stack trace.
2. Fix + verify via chaos test suite (all 12 scenarios must pass).
3. Re-stage rollout at 5% before restoring to 100%.
