# ADR-003: Academic Integrity Model

**Date:** 2026-05-12  
**Status:** Accepted

## Context

NEET is a high-stakes examination. Incorrect AI-generated questions, manipulated XP, or corrupted rankings have direct consequences for student careers. Academic trust is irreversible — once lost, it cannot be regained by features.

## Decision

Implement an **immutable academic ledger**:

1. **XP Events** (`xp_events`) — source of truth. Never updated. `total_xp` is a cache derived from this table.
2. **Question Versions** (`question_versions`) — forensic audit trail of all content mutations. Every change is stored with author, timestamp, and rationale.
3. **Idempotent Submissions** — all test submissions include a nonce. Server rejects duplicate nonces (5-min TTL in `used_nonces`).
4. **Server-Authoritative Timer** — `started_at` and `expires_at` owned by server. Client display only.
5. **Fraud Signals** — shadow-flag only. Never auto-ban. Human review required before any action.
6. **AI Quarantine** — questions flagged as incorrect enter quarantine, not immediate deletion. Human teacher review required for retirement.

## Consequences

**Positive:** Academic data is forensically auditable. No silent corruption. Students can trust their history.  
**Negative:** Write operations are more complex (must write to event log + update cache).  
**Non-negotiable:** Never overwrite `xp_events`. Never mutate `question_versions` rows. Never auto-ban based on fraud signals alone.
