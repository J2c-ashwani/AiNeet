# Runbook: Database Corruption Response

**Trigger:** Orphan test sessions spike, checksum failures, or data integrity audit failure  
**Severity:** P0 — Highest priority  
**Owner:** Engineering Lead + CTO

---

## Immediate Actions (< 5 minutes)

1. **Run integrity audit immediately:**
```bash
node scripts/audit-db-performance.js
node scripts/verify-backup-restore.js
```

2. **If corruption is spreading — freeze writes:**
```sql
-- Revoke write access temporarily for non-critical tables
-- (Last resort — will cause write failures but protects integrity)
```

3. **Identify the blast radius:**
```sql
-- Orphan tests
SELECT COUNT(*) FROM test_attempts ta
LEFT JOIN tests t ON ta.test_id = t.id
WHERE t.id IS NULL;

-- Orphan answers
SELECT COUNT(*) FROM test_answers a
LEFT JOIN tests t ON a.test_id = t.id
WHERE t.id IS NULL;
```

---

## Recovery Priority Order

1. Stop the source of corruption first (bad migration, bad deploy).
2. Assess whether a point-in-time restore is faster than manual repair.
3. Use Supabase PITR (7-day window) to restore to pre-corruption state.
4. Replay safe events (XP, answers) from the event log after restore.

---

## Point-in-Time Restore

Available via Supabase dashboard:
- Go to: Project Settings → Database → Point in Time Recovery
- Select a timestamp BEFORE the corruption started
- Restore to staging first — verify integrity — then production

---

## Never Do

- Do NOT run ad-hoc UPDATE/DELETE statements under pressure without a backup.
- Do NOT restore production directly — always verify on staging first.
- Do NOT communicate to students until scope is known.

---

## Communication Template

> "We detected a data integrity issue and are restoring from backup. Your academic data is safe. Tests in progress may need to be restarted. We apologize for the interruption."
