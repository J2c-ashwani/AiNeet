# ADR-005: Feature Flag Governance

**Date:** 2026-05-12  
**Status:** Accepted

## Context

APK distribution in India means a large fraction of users run old versions. A bug in a high-risk feature (battleground, OMR, notifications) can affect thousands of students before a fix can be deployed.

## Decision

Every high-risk system is behind a **remote feature flag** in the `feature_flags` Supabase table:

| Flag | System |
|---|---|
| `ff_adaptive_engine` | Adaptive recommendations |
| `ff_battleground` | Multiplayer mode |
| `ff_omr_enabled` | OMR grading pipeline |
| `ff_notifications` | Push notifications |
| `ff_ai_explanations` | AI question explanations |
| `ff_parent_reports` | Weekly parent summaries |
| `ff_fraud_signals` | Fraud detection |

**Properties:**
- `enabled` — global on/off
- `rollout_pct` — percentage of users who receive the feature (staged rollout)
- Changes take effect within 60 seconds
- No APK redeploy required

## Consequences

**Positive:** Any risky system can be disabled in < 60s during an incident. Staged rollouts prevent mass exposure to bugs.  
**Negative:** Feature flag checks add latency to each request (< 5ms from cache).  
**Rule:** All new high-risk features MUST have a feature flag before launch. No exceptions.
