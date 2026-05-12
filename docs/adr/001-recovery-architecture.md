# ADR-001: Recovery Architecture

**Date:** 2026-05-12  
**Status:** Accepted  
**Authors:** Engineering Team

## Context

Android OEM battery savers (Redmi, Samsung, Oppo, Vivo) aggressively kill background WebView processes. A student mid-exam on a ₹8,000 Redmi phone can lose hours of work if process death is not handled. Most EdTech apps never address this — they silently lose the test and show an error.

## Decision

Implement a **Recovery Manager** that:
1. Snapshots full test state to IndexedDB every 20 seconds during active exams
2. Validates each snapshot with SHA-256 checksum before write
3. Runs before any route renders on every app launch (the "resume kernel")
4. Rejects corrupted, expired, schema-mismatched, or tampered snapshots
5. Detects recovery loops (> 3 attempts for same session → reject to prevent infinite crash loop)
6. Preserves rejected snapshots in quarantine for forensic analysis

## Consequences

**Positive:** Students never lose exam state to process death. Recovery is deterministic and verifiable.  
**Negative:** IndexedDB adds ~50ms overhead per snapshot write. Acceptable vs. alternative of lost tests.  
**Risk:** IndexedDB itself can be cleared by aggressive OEMs. Mitigation: server-side `last_snapshot_at` tracking allows server validation.

## Non-negotiable Rules

- Frontend timer is **display-only**. Server owns `expires_at`.
- Snapshots with invalid checksums are **always rejected** — never silently restored.
- Recovery failures are **always emitted to telemetry** — never silently swallowed.
