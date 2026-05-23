# Load and Reliability Certification

Load testing must run against staging first. Production load testing is allowed only with MD approval, a named operator, and active monitoring dashboards open.

## Required Command

```bash
LOAD_TEST_BASE_URL="https://ai-neet.vercel.app" \
LOAD_TEST_JWT="<qa-user-jwt>" \
LOAD_TEST_CONCURRENCY=50 \
LOAD_TEST_AI_CONCURRENCY=5 \
LOAD_TEST_ALLOW_PRODUCTION=true \
node scripts/load-test/neet-season-simulation.js
```

## Required Measurements

- uptime samples from `node scripts/collect-uptime-checks.mjs`
- p95 dashboard latency
- p95 test submission latency
- p95 RAG/AI latency
- payment verification latency
- Supabase CPU and pool usage
- Vercel function duration and error rate
- Redis timeout rate
- Gemini quota usage and fallback count
- queue backlog and retry count

## Pass Criteria

- 0 failed critical scenarios
- p95 test submission under 3000 ms
- p95 AI/RAG route under 5000 ms
- no Supabase pool exhaustion
- no Redis timeout storm
- no queue retry explosion
- no uncapped AI retry loop
- degraded mode returns clear user-facing errors

## Evidence Record

| Field | Value |
|---|---|
| Environment | |
| Base URL | |
| Started at | |
| Finished at | |
| Concurrent users | |
| AI concurrency | |
| Failed scenarios | |
| p95 test submit | |
| p95 AI/RAG | |
| Supabase peak CPU | |
| Supabase pool saturation | |
| Redis errors | |
| Gemini quota events | |
| Verdict | |
