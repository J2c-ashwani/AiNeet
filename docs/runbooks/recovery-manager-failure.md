# Runbook: Recovery Manager Failure

**Trigger:** `mobile_runtime_events.recovery_*` failure rate > 2% over 1 hour  
**Severity:** P0 — Academic trust at risk  
**Owner:** Engineering Lead

---

## Immediate Actions (< 10 minutes)

1. **Quantify scope:**
```sql
SELECT event_type, COUNT(*) FROM mobile_runtime_events
WHERE event_type LIKE 'recovery_%' AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY event_type;
```

2. **Identify failure type:**
   - `recovery_corrupted` — IndexedDB checksum failures (data corruption)
   - `recovery_expired` — Sessions not restored in time (grace window too short)
   - `boot_step_failure` where reason contains 'recovery' — boot crash

3. **Disable adaptive engine to reduce active sessions** if corruption is widespread:
```sql
UPDATE feature_flags SET enabled = false WHERE key = 'ff_adaptive_engine';
```

---

## Root Cause Categories

| Event | Likely Cause | Fix |
|---|---|---|
| `recovery_corrupted` | IndexedDB cleared by OEM / storage pressure | Extend snapshot to server-side backup |
| `recovery_expired` | Grace window too short on slow devices | Increase `grace_window_seconds` to 60 |
| `boot_step_failure` | JS error in recovery-manager.js | Check Crashlytics for exact error |

---

## Never Do

- Do NOT silently swallow recovery failures and let students proceed to a fresh test.
- Always surface a "session restored" or "session expired" message so the student understands what happened.

---

## Post-Incident

- If > 10 students affected: proactive in-app message with apology and test credit.
- File post-mortem within 24h.
