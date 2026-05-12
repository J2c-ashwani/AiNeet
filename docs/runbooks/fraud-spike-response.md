# Runbook: Fraud Signal Spike

**Trigger:** `fraud_signals` high/critical severity count > 10 in 1 hour  
**Severity:** P1  
**Owner:** Trust & Safety + Engineering

---

## Immediate Actions

1. **Quantify:**
```sql
SELECT signal_type, severity, COUNT(*) FROM fraud_signals
WHERE created_at > NOW() - INTERVAL '1 hour' AND severity IN ('high', 'critical')
GROUP BY signal_type, severity ORDER BY COUNT(*) DESC;
```

2. **Identify affected users:**
```sql
SELECT user_id, signal_type, evidence FROM fraud_signals
WHERE severity = 'critical' AND created_at > NOW() - INTERVAL '1 hour';
```

3. **DO NOT auto-ban.** Shadow-flag only:
```sql
UPDATE fraud_signals SET action_taken = 'shadow_flagged'
WHERE severity = 'critical' AND action_taken = 'none'
AND created_at > NOW() - INTERVAL '1 hour';
```

---

## Human Review Required

All critical fraud signals require human review within 48 hours via `/admin/integrity`.

**Decision options:**
- `cleared` — False positive, no action
- `shadow_flagged` — Monitor, no visible effect on student
- `restricted` — Limit to non-competitive features (no leaderboard, no battleground)
- `escalated` — Escalate to scholarship/ranking authority

---

## Never Do

- Do NOT auto-ban without human review.
- Do NOT remove data from leaderboards without documented evidence.
- Do NOT inform the user they are flagged (shadow flag only).
