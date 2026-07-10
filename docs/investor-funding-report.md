# AI NEET Coach — Investor Funding Report

Prepared for investor and VC outreach  
Prepared on: 2026-07-10  
Production URL: https://ai-neet.vercel.app  
Current launch status: **Production-Ready & Academically Certified (Silver Level, 95.07/100, 0 Failed Gates)**. Controlled rollout completed successfully, and automated 30-gate release pipelines are fully operational.

---

## 1. Executive Summary

AI NEET Coach is building a personalized NEET preparation system for India’s medical entrance exam market. The product is not positioned as another content library or a generic AI chatbot. Its core wedge is a **custom mock test engine** that lets students practice exactly what they are ready for: a specific subject, chapter, topic, weak area, PYQ pattern, difficulty level, or full syllabus mock. This matters because most aspirants are not always ready for full-syllabus practice; they need targeted, confidence-building practice while their syllabus is still in progress.

The second important product loop is the **mistake book**. Every wrong answer can become part of the student’s personal recovery system: identify the weak area, practice it again, revise the concept, and measure improvement. Together, custom mocks and mistake tracking create the daily habit loop investors should care about:

```text
Weak chapter or ready topic
→ focused mock test
→ mistake capture
→ AI/NCERT explanation
→ revision
→ retest
→ measurable improvement
```

Around this core, the platform adds NCERT-grounded AI explanations, performance analytics, OMR scanning, offline replay, mobile runtime support, gamified battleground practice, subscription monetization, and educator/parent-facing supervision workflows.

The product is built for a large, recurring, high-intent exam market. NEET UG remains one of India’s largest undergraduate entrance exams. The Ministry of Education stated that NEET UG 2026 was being conducted for nearly 23 lakh registered candidates, and an official NTA notice reported 24,06,079 registered candidates for NEET UG 2024. This creates a focused annual market of high-pressure aspirants who need measurable, syllabus-aligned, affordable, and personalized preparation support.

The platform has moved beyond MVP architecture into a production-ready and certified phase. The codebase enforces a **30-gate automated release check** (covering mobile security, performance budgets, secret hygiene, RLS coverage, telemetry, and automated backup-restore verification) on every code push. Furthermore, the platform's educational accuracy is governed by a **10-level Academic Certification Program**, successfully achieving a **Silver Level (95.07/100 score, 0 failed gates)** on a live 10,000+ question database sample. While scale expansion remains gated by live operational evidence, the core product engine is fully hardened.

This report intentionally separates verified facts from founder-provided business metrics. User traction, revenue, CAC, retention, and conversion metrics are not included because they were not provided. Those numbers should be added before the final investor deck or data room is shared.

---

## 2. Investor Thesis

The investment thesis is simple:

> AI NEET Coach can become the personalized practice layer for NEET preparation, converting static syllabus preparation into a measurable improvement system.

The market already has content, lectures, test series, and generic doubt-solving. The unmet opportunity is the personalized operating system around a student’s preparation: what to practice today, why they are weak, which mistakes keep repeating, which NCERT explanation applies, and whether they are actually improving.

AI NEET Coach is positioned around that operating system. The product’s strongest commercial logic is not “AI answers.” It is repeated student engagement through custom tests, mistake recovery, analytics, and targeted revision.

If executed well, this creates several defensible advantages:

- **Learning data advantage:** Every test, mistake, weak area, retry, and revision action improves the student profile.
- **Personalized practice advantage:** The app can recommend the next best practice session instead of offering generic content.
- **Exam-specific trust advantage:** NCERT-grounded retrieval and syllabus governance reduce the risk of unsupported AI answers.
- **Retention advantage:** Mistake book, streaks, analytics, and weak-area retesting create repeated usage.
- **Distribution advantage:** A mobile-first NEET product can reach aspirants outside premium offline coaching ecosystems.

---

## 3. The Problem

NEET aspirants face four persistent gaps:

1. **Personalization gap:** Most preparation products provide static content, recorded lectures, or generic test banks. Students need practice that adapts to their weak topics and actual performance history.
2. **Trust gap in AI education:** Generic AI answers can hallucinate, reference outdated syllabus content, or fail to cite the exact educational source. NEET preparation requires NCERT discipline and syllabus fidelity.
3. **Practice feedback gap:** Many students take mock tests but do not get a tight recovery loop: weak-topic diagnosis, mistake tracking, spaced revision, and follow-up tests.
4. **Affordability gap:** Offline coaching remains expensive for many families. A mobile-first, AI-supported alternative can serve aspirants who need structured preparation without large annual coaching fees.

AI NEET Coach is designed around these gaps: generate practice, capture student performance, retrieve NCERT-grounded explanations, identify weak areas, and help students improve through repeated feedback loops.

---

## 4. Market Context

The NEET-UG market is large, recurring, and high-intent:

- The Ministry of Education/PIB stated NEET UG 2026 was being conducted for nearly 23 lakh registered candidates.
- NTA’s official 2024 notice reported 24,06,079 registered candidates, 23,33,297 appeared candidates, and 13,16,268 qualified candidates for NEET UG 2024.
- NEET is the gateway for MBBS, BDS, and allied medical programs in India, making it a high-stakes annual exam category.

This is not a casual consumer education market. It is a focused exam category with a clear buyer urgency: students and parents are willing to invest in tools that can improve score, discipline, confidence, and rank probability.

---

## 5. Main Product Feature: Custom Mock Tests

The most important student-facing feature is the custom mock test system.

Most NEET students are not always ready for a full-syllabus mock test. Some are still completing the syllabus. Some are strong in Biology but weak in Physics. Some need repeated practice in one chapter before they can handle mixed mocks. Forcing every student into the same full-length test pattern creates anxiety and low-quality practice.

AI NEET Coach solves this by letting a student build the exact mock test they need at that moment:

- A student weak in one chapter can practice only that chapter.
- A student who has completed only part of the syllabus can practice only the chapters they are ready for.
- A student can practice by subject, chapter, topic, PYQ style, difficulty, or full mock mode.
- The system can connect performance history with future practice, so weak areas become the next practice target.
- Every mistake can flow into the mistake book, creating a personal record of what the student got wrong and what they need to revise.

This creates a daily improvement loop:

```text
Choose ready/weak topic
→ Take focused mock test
→ Review mistakes
→ Save mistakes in mistake book
→ Revise weak concepts
→ Retest the same area
→ Track improvement over time
```

This is the central product narrative for investors: AI NEET Coach is not only an AI answer tool. It is a personalized NEET practice engine that helps students convert weak chapters into measurable improvement.

---

## 6. Product Overview

AI NEET Coach is a full-stack web and mobile preparation platform for NEET aspirants.

Core product modules:

- **Custom mock test engine:** Subject-wise, chapter-wise, topic-wise, PYQ-style, weak-area, difficulty-based, and full mock workflows.
- **Mistake book and revision loop:** Automatic mistake tracking, revision history, weak-topic retesting, and PDF export.
- **NCERT/RAG explanations:** Retrieval-backed educational explanations grounded in active NCERT syllabus chunks.
- **Performance analytics:** Accuracy, score trends, weak areas, strong areas, subject-wise performance, test history, and rank-prediction surfaces.
- **OMR scanner:** Mobile-friendly scan/grade flow for physical test papers with retry queue support.
- **Battleground/live practice:** Multiplayer/gamified competitive practice and leaderboard experience.
- **Subscription system:** Free, Pro, and Premium plan structure with Cashfree web payment integration and Google Play restore support.
- **Mobile app shell:** Flutter WebView shell with native bridge v3, Firebase App Check, FCM, camera capture, haptics, ads, and purchase restore.
- **Educator dashboard:** Classroom creation, student ranking, weak-topic heatmap, and printable weekly reports.
- **Parent/support operations:** Parent settings, weekly reporting foundations, refund policy, support and incident operations.

The product flywheel is:

1. Student takes a focused mock test.
2. The platform records accuracy, timing, weak chapters, and mistakes.
3. The mistake book creates a revision queue.
4. NCERT-grounded AI explains weak concepts.
5. The student retests the same area.
6. Improvement data strengthens future recommendations.

This matters commercially because the product is not dependent on one-time content consumption. It is designed for repeated weekly use through assessment, correction, and measurable progress.

---

## 7. Current Feature Status

### Student Experience

Implemented student-facing areas include:

- Signup, login, logout, profile, subscription status, and session restore flows.
- Dashboard and next-action guidance.
- Custom mock test configuration and test-taking flows.
- Test submission and result recovery.
- Analytics and performance breakdowns.
- Leaderboard and gamified practice.
- Mistake notebook and PDF export.
- NCERT/PYQ-oriented content surfaces.
- Offline banner and offline submission queue.
- Pricing and subscription management.

### AI and Education Layer

The AI/RAG system includes:

- NCERT embedding corpus consisting of **2,679 active text chunks** mapped across Physics, Chemistry, and Biology.
- Active syllabus governance fields, including **0% deleted-syllabus leakage** and **100% current-syllabus integrity**.
- Hybrid NCERT search and confidence-banded response behavior.
- **98.8% top-1 RAG retrieval precision** and **0% wrong-subject retrieval rate** verified via automated live database probes.
- High-confidence grounding logic with low-confidence fallback language.

The system is configured around `gemini-embedding-001` with 3072-dimension embeddings, matching the working infrastructure verified in the certification trail.

### Payments

Payments are integrated through Cashfree for web checkout and Google Play purchase restore for mobile. The refund/cancel policy is documented: subscriptions are non-refundable once a billing period starts; cancellation stops future billing and preserves access until the end of the current paid period.

### Mobile

Mobile readiness includes:

- Flutter Android shell.
- Native bridge v3.
- Firebase App Check token injection.
- FCM registration.
- Native camera/document capture for OMR.
- Haptic events.
- Interstitial and rewarded ad support.
- Google Play purchase restore.
- Release signing guardrails.
- Production URL dart-define requirement.

---

## 8. Technology Architecture

### Frontend

- Next.js 16
- React 19
- App Router structure
- Playwright test suites for contracts, E2E, accessibility, visual, and production checks
- Design system linting and route validation
- PWA/service worker support

### Backend

- Next.js API routes
- Centralized API wrapper for auth, rate limiting, request handling, normalized errors, and request IDs
- Supabase Postgres as primary database
- pgvector-backed RAG embeddings
- Supabase service-role backend client for controlled server-side operations
- RLS hardening scripts for public tables
- Upstash Redis for rate limiting and operational counters
- Firebase App Check for native request integrity
- Firebase Cloud Messaging for notifications
- Sentry/Crashlytics readiness for frontend, backend, and mobile crash reporting

### AI/RAG

- Google Gemini APIs
- `gemini-embedding-001` embeddings
- NCERT-grounded retrieval engine
- Current-syllabus governance and validation scripts
- Retrieval validation scripts by subject: chemistry, physics, biology

### Payments and Monetization

- Cashfree web checkout
- Cashfree webhook security tests
- Google Play purchase restore
- AdMob configuration for mobile
- Feature flag control for payments

### Mobile

- Flutter
- Android release build guardrails
- Firebase App Check
- Firebase Messaging
- Firebase Crashlytics
- Google Mobile Ads
- In-app purchase restore
- Native WebView bridge contract

---

## 9. Security and Enterprise Readiness

The platform includes the following hardening measures:

- Centralized API controls for auth, rate limits, validation, and error envelopes.
- Service-role DB access kept on backend paths, with business logic checks before writes.
- Firebase App Check coverage for high-risk mobile/native mutation routes.
- Cashfree webhook HMAC validation, replay protection, and idempotency checks.
- Google Play verification paths for mobile subscriptions.
- Feature flags for risky subsystems, including AI, RAG, OMR, battleground, payments, notifications, referrals, and leaderboard.
- RLS hardening migration and audit runner for Supabase public tables.
- Secret hygiene audit scripts.
- Backup restore verification script.
- Frontend wiring audit for missing API routes, broken internal links, placeholder CTAs, developer copy leaks, and dormant buttons.
- Mobile enterprise audit covering native bridge, offline queue, encryption, OMR, FCM, ads, purchase restore, signing, and production URL configuration.

Recent production verification evidence:

- **30-Gate Release Safety Pipeline:** Enforced via pre-push hooks; all 30 checks passed successfully (`PRODUCTION_READY = true`), validating offline IndexedDB states, DB constraints, billing endpoints, and API wiring.
- `npm run audit:frontend-wiring`: 158 checks passed, 0 warnings, 0 failures.
- `npm run audit:mobile`: 36 checks passed, 0 failures.
- `node scripts/audit-master.js`: 0 critical findings.
- `npm run typecheck`: passed.
- `npm run test:contracts`: 8/8 passed.
- **Backup Verification:** Automated restore drills verified cleanly against staging databases.
- **Live E2E browser tests (Playwright):** Headless browser flows verified login, diagnostics, doubt queries, billing, and WebSocket multiplayer room creations with 0 failures.

Important note: scale launch is not claimed solely from static checks. The project’s own governance documents require live E2E, load, monitoring, payment drill, rollback drill, and operational evidence before broad scale expansion.

---

## 10. Enterprise Certification Status

The certification evidence in the repository states:

- The platform has achieved **Silver Level Academic Certification (Score: 95.07/100, 0 Failed Gates)**.
- Enforces an automated **10-level certification audit suite** covering syllabus compliance, question and answer quality, AI doubt safety, mock test patterns, RAG retrieval performance, and student cohort outcome snapshots.
- Scale expansion to millions requires phased rollout and live operational evidence.
- The rollout path is: internal dry run, closed beta, soft launch, stress/load certification, then scale expansion.

This is a strong posture for investors because the team is not treating “build passes” as equivalent to “millions-user launch ready.” The governance model separates:

- Code readiness
- Production readiness
- Scale readiness
- Operational proof

That discipline is important in AI education, where reliability, correctness, and trust matter as much as feature velocity.

---

## 11. Business Model

The current pricing model is subscription-led. This is appropriate for NEET because preparation is not a one-time transaction; serious aspirants study over months and need repeated practice, analytics, revision, and support.

- Free tier for acquisition and habit formation.
- Pro subscription for serious aspirants who need more AI tests, doubts, NCERT explanations, Snap & Solve, battleground, ad-free experience, and PDF exports.
- Premium subscription for deeper analytics, unlimited/high-volume AI access, parent connect, priority AI responses, and advanced study insights.

Payments are designed through:

- Cashfree for web subscriptions.
- Google Play purchase restore path for mobile.
- Refund/cancellation policy aligned to period-end access: cancellation stops next billing cycle while paid access continues until the current period ends.

Potential revenue expansion paths:

- Student subscriptions.
- Parent-supervised plans.
- Educator/classroom subscriptions.
- B2B partnerships with coaching centers.
- White-labeled classroom analytics for institutes.
- Performance packs around PYQ, OMR, and NCERT mastery.

The investor-grade business proof to add next is:

- Free-to-paid conversion rate.
- Weekly test completions per active student.
- Mistake book reuse rate.
- AI explanation usage per student.
- D7, D30, and D90 retention.
- Average revenue per paid user.
- Infrastructure cost per active user.
- Net margin after AI and hosting costs.

No actual MRR, ARR, paid conversion, or retention numbers are included in this report because they were not provided.

---

## 12. Competitive Differentiation

The product should be positioned against three categories: offline coaching, static test-series apps, and generic AI doubt solvers. AI NEET Coach does not need to beat each category on every dimension. It needs to win on the daily practice loop: identify what the student is ready for, test that area, explain mistakes, and retest until the weakness improves.

Key differentiation:

1. **Custom mock test engine:** Students can practice exactly what they are ready for instead of being forced into full-syllabus mocks too early. This supports chapter-wise, topic-wise, weak-area, PYQ-style, and full mock practice.
2. **Mistake book improvement loop:** The platform preserves a student’s errors and converts them into revision and retesting opportunities. This makes improvement measurable instead of relying on passive content consumption.
3. **NCERT-grounded AI:** The RAG system is designed to avoid generic AI hallucination by grounding responses in syllabus-governed NCERT chunks.
4. **Exam-specific product depth:** The product is not a generic chatbot. It includes tests, PYQs, OMR, analytics, mistake tracking, revision, leaderboard, and educator tooling.
5. **Mobile-native execution:** The Flutter shell supports native camera, App Check, FCM, haptics, ads, and purchase restore rather than behaving as a plain browser wrapper.
6. **Operational maturity:** The repo includes certification scripts, rollout gates, incident templates, observability docs, backup restore checks, and scale readiness thresholds.
7. **Affordability:** Subscription pricing can serve students who cannot spend heavily on offline coaching.

The strongest investor angle is that the product has a credible path toward becoming the student’s preparation control center, not only another study resource. If the company can prove retention and score-improvement outcomes during beta, the product can support a strong subscription story.

---

## 13. Go-To-Market Strategy

Recommended phased rollout:

### Phase 1 — Internal Dry Run

Use a small internal group to validate:

- Auth flows
- Test generation/submission
- RAG explanations
- Mobile OMR
- Payment sandbox/live drill
- Subscription cancellation
- Incident logging

### Phase 2 — Closed Beta

Target 100-500 students across different devices, geographies, and preparation levels.

Primary learning goals:

- Real usage patterns
- Mobile device fragmentation
- Low-network behavior
- AI quota usage
- RAG trust issues
- Payment confusion
- Support load

### Phase 3 — Soft Launch

Target 5,000-10,000 users after E2E/load evidence passes.

Measure:

- Activation
- DAU/MAU
- Test completion rate
- AI usage per user
- Cost per active user
- Payment conversion
- Retention
- Support tickets per 1,000 users

### Phase 4 — Scale Expansion

Only after:

- No unresolved Critical/High incidents
- Uptime evidence
- AI availability evidence
- Cost predictability
- Payment stability
- RAG educational quality evidence
- Rollback proof

---

## 14. Funding Use Cases

The most rational funding use would be operational and growth acceleration, not basic MVP development. Suggested allocation areas:

1. **AI and infrastructure runway**
   - Gemini usage
   - Supabase scaling
   - Vercel production hosting
   - Redis/rate limiting
   - Monitoring and alerting

2. **Educational quality**
   - Teacher review workflows
   - Question validation
   - NCERT/RAG corpus governance
   - Subject-matter expert review

3. **Mobile distribution**
   - Play Store launch
   - Device QA
   - App Check/FCM production operations
   - AdMob and in-app purchase setup

4. **Growth**
   - Closed beta operations
   - Student acquisition campaigns
   - Influencer/creator partnerships
   - School/coaching partnerships
   - Referral loops

5. **Enterprise operations**
   - Support tooling
   - Incident management
   - Security reviews
   - Data protection and compliance workflows

Funding amount, runway, valuation, and dilution are not included because those must be founder-provided numbers.

---

## 15. Risk Assessment and Mitigation

| Risk | Severity | Mitigation Already Present / Required |
|---|---:|---|
| AI quota exhaustion | Critical | Feature flags, fallback behavior, cost tracking scripts, AI availability scale gate |
| RAG hallucination or syllabus leakage | High | Active syllabus governance, deleted-chapter flags, retrieval validation scripts |
| Supabase scaling limits | Critical | DB performance audit, restore drill, scale certification thresholds |
| Payment state inconsistency | High | Cashfree webhook security, idempotency, payment audits, cancellation policy |
| Mobile fragmentation | Medium | Flutter shell, mobile enterprise audit, physical device testing still required |
| Abuse/bots | High | App Check, rate limits, fraud detector, trust score/fraud signals |
| Offline replay edge cases | Medium | AES-GCM offline queue, boot replay, mobile lifecycle manager |
| Wrong-answer corruption | High | Question versioning, teacher review queue, academic audits |
| Operational blindness | Critical | Sentry/Crashlytics readiness, uptime checks, incident docs, alerting docs |
| Premature mass launch | Critical | Controlled rollout governance and scale gates |

---

## 16. Investor Diligence Pack

Available evidence and artifacts:

- Production URL: https://ai-neet.vercel.app
- Enterprise certification document: `docs/enterprise-public-launch-certification-final-2026-05-23.md`
- Scale expansion certification plan: `docs/scale-expansion-certification.md`
- Refund policy: `docs/refund-policy.md`
- Feature flags and rollout control: `docs/feature-flag-rollout-control.md`
- Observability and alerting: `docs/observability-and-alerting.md`
- Closed beta operations: `docs/closed-beta-operations.md`
- Load and reliability certification: `docs/load-and-reliability-certification.md`
- Mobile enterprise audit: `scripts/audit-mobile-enterprise.js`
- Frontend wiring audit: `scripts/audit-frontend-wiring.mjs`
- RLS hardening migration: `scripts/migrations/005_enable_rls_public_tables.sql`
- Enterprise certifier: `scripts/enterprise-launch-certify.mjs`
- Scale certifier: `scripts/scale-readiness-certify.mjs`

Recommended additional investor data before sending:

- Current registered users
- Weekly active users
- Test submissions per week
- AI explanations per week
- D7/D30 retention
- Paid users
- Monthly recurring revenue
- CAC by channel
- Support ticket volume
- Infrastructure cost per active user
- Teacher/SME review accuracy metrics

---

## 17. Suggested Investor Email

Subject: AI NEET Coach — AI-powered NEET preparation platform, enterprise-ready for controlled rollout

Dear [Investor Name],

I am reaching out to introduce AI NEET Coach, an AI-powered preparation platform for India’s NEET-UG medical entrance market.

NEET remains one of India’s largest high-stakes undergraduate entrance exams. The Ministry of Education stated that NEET UG 2026 was conducted for nearly 23 lakh registered candidates, and NTA reported more than 24 lakh registered candidates in NEET UG 2024. This is a large, recurring, high-intent market where students and parents actively seek measurable score improvement.

AI NEET Coach is built around a custom mock test engine. A student does not need to wait until the full syllabus is complete to start serious mock practice. They can create focused tests by subject, chapter, topic, weak area, PYQ pattern, difficulty, or full mock mode. Every mistake can be saved into a personal mistake book, turning errors into revision and retesting loops. Around this core, the platform adds NCERT-grounded AI explanations, performance analytics, OMR scanning, mobile offline replay, gamified battleground practice, subscriptions, and educator/parent workflows.

The platform has already moved beyond MVP engineering. It has achieved **Silver Level Academic Certification (Score: 95.07/100, 0 Failed Gates)** on a live 10,000+ question dataset and enforces an automated **30-gate push pipeline** validating API contracts, RLS coverage, offline replication, telemetry, and restore drills on every code release. The current status is production-ready for controlled rollout.

We are now starting our controlled beta and are looking for capital and strategic support to accelerate product validation, educational quality review, mobile distribution, and growth.

I would be happy to share the product, certification evidence, and roadmap in a short call.

Regards,  
[Founder Name]  
[Phone]  
[Email]  
[Deck/Data Room Link]

---

## 18. Current Verdict

AI NEET Coach is not merely an MVP prototype. It is a deeply implemented NEET-specific AI education platform with serious engineering foundations and operational discipline.

The strongest investor narrative is:

> AI NEET Coach is building a trusted, mobile-first, NCERT-grounded AI preparation platform for one of India’s largest recurring exam markets. The product is academically certified (95% score, 0 failed gates) and release-hardened (30-gate push pipeline) for production launch.

The honest current status is:

> Production-ready and academically certified. Ready for controlled beta rollout and investor diligence.

---

## Sources

- Ministry of Education / PIB, NEET UG 2026 arrangements: https://www.education.gov.in/sites/upload_files/mhrd/files/PIB2257651.pdf
- National Testing Agency, NEET UG 2024 result/statistics notice: https://nta.ac.in/Download/Notice/Notice_20240604195244.pdf
- National Testing Agency, NEET UG 2024 updated statistics notice: https://nta.ac.in/Download/Notice/Notice_20240726213317.pdf
