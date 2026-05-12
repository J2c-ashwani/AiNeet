# Runbook: Gemini / AI Service Outage

**Trigger:** Circuit breaker `gemini` opens (3 consecutive failures in 30s)  
**Severity:** P1  
**Owner:** Engineering On-Call

---

## Immediate Actions (< 5 minutes)

1. **Verify circuit breaker status** — check `/admin/runtime` for `circuit_breaker_open` events.
2. **Confirm Gemini status** — check https://status.cloud.google.com/
3. **Verify fallback is active** — test `/api/ai/recommend` endpoint. It should return static recommendations, NOT hang.
4. **Disable `ff_ai_explanations` feature flag** in `feature_flags` table if explanations are showing errors to students.

```sql
UPDATE feature_flags SET enabled = false WHERE key = 'ff_ai_explanations';
```

---

## Student-Facing Impact

- Adaptive recommendations: **Degraded** — static curated set served instead
- AI explanations: **Disabled** — fallback message shown ("Review NCERT directly")
- Test generation: **Unaffected** — uses verified question bank, not AI generation
- Analytics: **Unaffected**

---

## Recovery

When Gemini recovers (circuit breaker closes automatically via probe):

1. Re-enable feature flag:
```sql
UPDATE feature_flags SET enabled = true WHERE key = 'ff_ai_explanations';
```

2. Monitor `mobile_runtime_events` for `circuit_breaker_close` event.

---

## Post-Incident

- Document in `ai_incidents` table.
- If outage > 2 hours: notify users via in-app banner ("AI features temporarily limited").
