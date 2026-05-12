# Runbook: Leaderboard Corruption

**Trigger:** XP mismatch events spike, or leaderboard ranks visibly wrong  
**Severity:** P0 — Academic trust at risk  
**Owner:** Engineering Lead

---

## Immediate Actions (< 15 minutes)

1. **Disable leaderboard reads** with feature flag to prevent students seeing corrupt data:
```sql
-- No feature flag for leaderboard yet — use this to return empty data
-- Coordinate with frontend to show "Leaderboard updating" message
```

2. **Identify scope of corruption:**
```sql
-- Check for XP mismatches
SELECT user_id, SUM(xp_earned) as sum_events,
       u.total_xp as stored_xp
FROM xp_events xe
JOIN users u ON xe.user_id = u.id
GROUP BY user_id, u.total_xp
HAVING ABS(SUM(xp_earned) - u.total_xp) > 10
LIMIT 20;
```

3. **Check for duplicate XP grants:**
```sql
SELECT user_id, source_id, COUNT(*) as count
FROM xp_events
GROUP BY user_id, source_id
HAVING COUNT(*) > 1
ORDER BY count DESC LIMIT 20;
```

---

## Repair Procedure

If XP totals are wrong, recompute from the source-of-truth event log:

```sql
UPDATE users u SET total_xp = (
    SELECT COALESCE(SUM(xp_earned), 0) FROM xp_events WHERE user_id = u.id
);
```

This is safe because `xp_events` is the immutable ledger. The `total_xp` column is a cache.

---

## Never Do

- Do NOT manually edit individual `total_xp` values.
- Do NOT delete XP events to "fix" the score.
- Do NOT hide the corruption — be transparent in status page.

---

## Post-Incident

- File post-mortem.
- If > 50 students affected: in-app notification explaining the correction.
- Add XP mismatch check to `scripts/audit-db-performance.js`.
