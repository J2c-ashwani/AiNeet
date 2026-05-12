# Stability Covenant

**Version:** 1.0  
**Date:** 2026-05-12  
**Owner:** Engineering  

---

## Core Principle

> No new features ship while the platform is operationally unstable.

This covenant defines what "stable" means in measurable terms, and enforces a feature freeze when any stability threshold is breached. This is an organizational rule, not just a technical setting.

---

## Stability Thresholds

If ANY of the following are breached, all feature development stops immediately:

| Metric | Threshold | Measurement |
|---|---|---|
| Recovery manager failure rate | > 2% | `mobile_runtime_events` where `event_type = 'recovery_corrupted'` |
| Bridge timeout rate | > 1% | `mobile_runtime_events` where `event_type = 'bridge_timeout'` |
| Academic data loss events | > 0 | Any orphan test or failed submission in 7-day window |
| Crash-free session rate | < 99.7% | Crashlytics 7-day average |
| API uptime | < 99.9% | Uptime monitoring monthly |
| Submission integrity violations | > 0 | Any nonce replay or checksum failure |

---

## Feature Freeze Protocol

When any threshold is breached:

1. **Immediate:** Halt all feature PRs. Merge only stability fixes.
2. **Within 1 hour:** Root cause identified and documented.
3. **Within 4 hours:** Mitigation deployed (feature flag disable or hotfix).
4. **Within 24 hours:** Full post-incident review written.
5. **Before resuming features:** All thresholds must return to healthy range for 48 consecutive hours.

---

## Student Trust Guarantees

These behaviors must always hold — they are non-negotiable:

| Guarantee | Mechanical Implementation |
|---|---|
| "Your test is always safe" | Recovery manager restores state within 20s of process death |
| "Your rank is accurate" | Server-authoritative only, no client-side rank changes |
| "Your streak is real" | DB-locked, not client-computed |
| "Your analytics are permanent" | Immutable snapshots — never recalculated retroactively |
| "AI admits uncertainty" | Confidence scores visible on all AI-generated outputs |

---

## Stability Metrics Location

All stability metrics are tracked in:
- **`/admin/runtime`** — Runtime health dashboard
- **`mobile_runtime_events`** — Raw telemetry table
- **Firebase Crashlytics** — Native crash traces

---

## Sign-Off

This covenant must be re-affirmed by Engineering Lead before each major APK release.
