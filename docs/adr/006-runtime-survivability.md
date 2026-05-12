# ADR-006: Runtime Survivability Philosophy

**Date:** 2026-05-12  
**Status:** Accepted

## Context

Indian mobile reality: 2–4GB RAM devices, Redmi MIUI aggressive battery savers, BSNL/Jio unstable internet, background process kills during exams, incoming calls during 3-hour mock tests. Most EdTech apps assume Silicon Valley conditions (fast WiFi, 8GB RAM, stable process lifetime). This is a failure mode, not an edge case.

## Decision

Engineer for **Indian mobile reality**, not Silicon Valley assumptions:

1. **Boot Orchestrator** — strict sequential boot (auth → bridge → capabilities → lifecycle → recovery → offline → telemetry → perf). Each step resolves before the next begins. No race conditions.
2. **Lifecycle Manager** — handles incoming calls, battery saver toggles, WhatsApp overlays, and process suspension explicitly. Each transition triggers a forced snapshot.
3. **Circuit Breakers** — all external services (Gemini, OpenAI, FCM) have circuit breakers. The app degrades gracefully, never freezes.
4. **Performance Budgets** — JS heap < 120MB, bundle < 1.5MB, long tasks < 200ms, enforced in CI.
5. **Memory Mitigation** — when heap > 120MB, non-critical polling suspends automatically. App continues functioning.
6. **Offline Resilience** — IndexedDB stores all pending academic actions. They replay on reconnect with idempotency guarantees.

## Consequences

**Positive:** Platform survives real Indian mobile conditions. Students trust it with high-stakes preparation.  
**Negative:** More complex initialization. Snapshot overhead (~50ms every 20s during exams).  
**Philosophy:** Every failure path must emit telemetry. Every recovery path must be deterministic. No silent failures.
