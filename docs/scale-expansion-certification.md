# Scale Expansion Certification

This is the evidence gate for moving beyond controlled rollout into larger public traffic. It proves three things with production data: reliability is stable, costs are predictable, and educational quality is safe.

## Command

```bash
npm run certify:scale
```

For a real scale decision, run:

```bash
SCALE_WINDOW_DAYS=7 npm run certify:scale -- --live
```

Collect uptime proof on a schedule during beta/soft launch:

```bash
UPTIME_BASE_URL="https://ai-neet.vercel.app" node scripts/collect-uptime-checks.mjs
```

Record daily provider cost snapshots from dashboards:

```bash
node scripts/record-infra-usage-snapshot.mjs --provider gemini --value 120.50
node scripts/record-infra-usage-snapshot.mjs --provider supabase --value 300.00
node scripts/record-infra-usage-snapshot.mjs --provider vercel --value 250.00
```

Record educational audit summaries after RAG/teacher-review validation:

```bash
node scripts/record-educational-quality-audit.mjs --type rag_retrieval --subject chemistry --sample-size 10 --pass 10 --warn 0 --fail 0
```

## Evidence Required

### Reliability

- `uptime_checks` must contain recent checks for `homepage`, `login`, `api_health`, `ai`, and `payments`.
- `operational_incidents` must have zero unresolved Critical or High incidents in the certification window.
- Payment state must be internally consistent: completed payments trace to subscriptions, no stale pending payments, and no duplicate external subscription IDs.
- AI availability must be proven through `ai_generation_logs`, not assumed from isolated manual tests.

### Cost Stability

- `infra_usage_snapshots` must contain `daily_cost_inr` samples for `gemini`, `supabase`, and `vercel`.
- Daily cost variance must remain under the configured threshold before increasing traffic.
- Cost proof must be collected during real beta or soft-launch usage, not from empty traffic.

### Educational Quality

- `educational_quality_audits` must show zero syllabus leakage, hallucination incidents, and wrong-answer corruption.
- `ncert_embeddings` must not expose stale/deleted syllabus chunks as active.
- `teacher_review_queue` must have no unresolved launch-blocking quality reviews.
- Rejected or quarantined AI-generated questions must not remain active in the question bank.

## Default Thresholds

| Setting | Default |
|---|---:|
| `SCALE_MIN_UPTIME_PCT` | 99.5 |
| `SCALE_MIN_UPTIME_SAMPLES_PER_SERVICE` | 24 |
| `SCALE_MAX_SEVERE_INCIDENTS` | 0 |
| `SCALE_MIN_PAYMENT_COUNT` | 1 |
| `SCALE_MAX_PAYMENT_FAILURE_RATE` | 0.03 |
| `SCALE_MIN_AI_REQUESTS` | 20 |
| `SCALE_MAX_AI_FAILURE_RATE` | 0.05 |
| `SCALE_MAX_COST_VARIANCE_RATIO` | 0.35 |
| `SCALE_MIN_COST_SNAPSHOTS_PER_PROVIDER` | 3 |
| `SCALE_MAX_RAG_FAILURES` | 0 |
| `SCALE_MAX_SYLLABUS_LEAKAGE` | 0 |
| `SCALE_MAX_WRONG_ANSWERS` | 0 |
| `SCALE_MAX_OPEN_QUALITY_REVIEWS` | 0 |

## Verdict Rule

Scale expansion is blocked if any check fails. A failed check is not a code failure by default; it means the platform has not yet proven safe operation at the requested traffic level.
