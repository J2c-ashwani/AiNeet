# ADR-004: AI Governance Model

**Date:** 2026-05-12  
**Status:** Accepted

## Context

AI-generated content (questions, explanations, recommendations) can be wrong. In a NEET context, wrong is dangerous — a student can study incorrect biology content for weeks based on a hallucinated answer.

## Decision

Treat AI as **assistant, not authority**:

1. **Confidence Scores** — every AI recommendation has a stored confidence score. Low confidence outputs are visually flagged.
2. **Decision Hash** — every adaptive engine decision is stored with a `decision_hash` for forensic replayability. We can always reproduce why a recommendation was made.
3. **Harm Prevention** — adaptive engine has a doom-loop cap. A student cannot be served the same failing topic > N times without human-governed intervention.
4. **Quarantine Pipeline** — questions with > 3 student reports in 24h auto-enter `quarantined` status. They are removed from circulation pending teacher review. Not deleted — quarantined.
5. **Explainability** — every recommendation has a stored rationale (`recommendation_explanations` table). Students can see why.
6. **Syllabus Governance** — AI outputs are validated against the official NEET syllabus boundary. Out-of-syllabus content is rejected.

## Consequences

**Positive:** AI errors are contained and auditable. Students are never silently harmed by AI failures.  
**Negative:** Adds latency to AI pipelines (validation layer). Quarantine creates teacher workload.  
**Circuit Breaker:** When Gemini degrades, the platform falls back to static recommendations — never hangs.
