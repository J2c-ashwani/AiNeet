# Feature Flag Rollout Control

Every risky subsystem must be disable-able without redeploying. The source of truth is the `feature_flags` table, backed by environment kill switches for emergency shutdown when database access is degraded.

## Required Flags

| Feature | DB key | Emergency env |
|---|---|---|
| AI generation | `ff_ai_generation` | `DISABLE_AI=true` |
| RAG explanations | `ff_rag_explanations` | `DISABLE_RAG=true` |
| OMR | `ff_omr_enabled` | `DISABLE_OMR=true` |
| Battleground | `ff_battleground` | `DISABLE_BATTLEGROUND=true` |
| Payments | `ff_payments` | `DISABLE_PAYMENTS=true` |
| Push notifications | `ff_notifications` | `DISABLE_NOTIFICATIONS=true` |
| Referral rewards | `ff_referrals` | `DISABLE_REFERRALS=true` |
| Leaderboard | `ff_leaderboard` | `DISABLE_LEADERBOARD=true` |

## Disable Procedure

1. Set `enabled=false` in `feature_flags` for the affected feature.
2. If DB access is degraded, set the matching `DISABLE_*` variable in Vercel and redeploy only as an emergency fallback.
3. Confirm `/api/health/features` shows the feature disabled.
4. Verify the affected API returns `FEATURE_DISABLED` instead of failing open.
5. Record the decision, owner, timestamp, and re-enable condition in the incident log.

## Re-enable Procedure

Re-enable only after the root cause is known, a prevention item exists, and one controlled test passes in production or staging. Payments, AI generation, and OMR require MD approval before re-enable during public launch week.
