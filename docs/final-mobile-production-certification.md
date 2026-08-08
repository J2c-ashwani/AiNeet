# AI NEET Coach — Final Mobile Production Certification
### Release Candidate Assessment | Version 1.1.0+3 | Audit Date: 2026-08-08
### CTO DIRECTIVE — ZERO COMPROMISE — RELEASE CANDIDATE FORENSIC AUDIT

---

## OVERALL VERDICT: ❌ NO-GO

> Gates Passing: **1 of 16** (Gate A — Entry Point only)
> P0 Blockers: **10**
> P1 Blockers: **10**
>
> The production AAB **MUST NOT** be submitted to Google Play in its current architectural state. This document provides honest, zero-trust evidence for every gate.

---

## 1. Architecture Diagram

### Required Target Architecture (per CTO Directive)

```
INTERNET USERS
      |
      v
+---------------------+      +---------------------+
|  WEB / PSEO         |      |  Flutter Native App  |
|  Next.js            |      |  Android 1.1.0+3    |
|  ai-neet.vercel.app |      +----------+----------+
+----------+----------+                 |
           |                            | Mobile API
           | Web API requests           |
           v                            v
+---------------------------------------------------+
|          CORE API (INDEPENDENT)                   |
|          https://api.aineetcoach.com              |
|          (Dedicated hosting — NOT Vercel)         |
+---------------------+-----------------------------+
                      |
          +-----------+----------+
          v                      v
+------------------+  +-------------------------+
| Supabase/        |  | AI / RAG / Gemini /     |
| Postgres / RLS   |  | Vision / OMR backend    |
+------------------+  +-------------------------+
```

### Actual Current Architecture (found in codebase)

```
Flutter Native App (v2/NeetV2App)
      |
      v
NeetApiClient (Dio)
      |
      v
https://ai-neet.vercel.app   <-- P0 VIOLATION
      |
      v
Supabase / AI services
```

**The independent production API `api.aineetcoach.com` does not exist.**

---

## 2. API Infrastructure Status

| Layer | Current State | Required State | Status |
|---|---|---|---|
| Mobile API base URL | `https://ai-neet.vercel.app` | `https://api.aineetcoach.com` | FAIL |
| Hosting provider | Vercel (shared with web) | Independent (Railway / Fly.io / GCP / AWS) | FAIL |
| DNS | vercel.app subdomain | `api.aineetcoach.com` A/CNAME record | FAIL |
| TLS | Vercel-managed | Dedicated TLS certificate | FAIL |
| Deployment pipeline | Vercel CI/CD | Independent GitHub Actions | FAIL |
| API runtime | Next.js on Vercel Edge | Standalone Node.js / Express | FAIL |
| Rate limiting | None independent | Per-IP + per-user token bucket | FAIL |
| Health endpoints | None | `/health`, `/readiness`, `/version` | FAIL |
| Logging | Vercel logs only | Dedicated (Axiom / Datadog / Grafana) | FAIL |
| Monitoring | None independent | Uptime Robot / Better Uptime | FAIL |
| CORS | Vercel default | Explicit allow-list policy | FAIL |
| API versioning | None (bare `/api/...`) | `/v1/...` namespace | FAIL |

**Infrastructure Status: NOT READY — does not exist**

---

## 3. Complete Feature Matrix (27 Required Features)

| # | Feature | Native Screen | API Connected | Critical Issues |
|---|---|---|---|---|
| 1 | Authentication (Login) | login_screen.dart | NeetApiClient.login() | No session restore at startup |
| 2 | Registration | MISSING | API method only | P0 BLOCKER — no UI |
| 3 | OTP Verification | MISSING | API method only | P0 BLOCKER — no UI |
| 4 | Dashboard | dashboard_screen.dart | Partial | _isLoggedIn=true hardcoded |
| 5 | Practice / Test Config | test_engine_screen.dart | questions: const [] | P0 BLOCKER — no questions |
| 6 | Test Engine | test_engine_screen.dart | questions: const [] | P0 BLOCKER — nonfunctional |
| 7 | Test Submission | UI present | No API call | P0 BLOCKER |
| 8 | Test Results | test_results_screen.dart | No live API | P0 BLOCKER |
| 9 | AI Doubt Solver | doubt_solver_screen.dart | NeetApiClient.solveDoubt() | Fabricated fallback content |
| 10 | Camera (Doubt) | MISSING in v2 | — | P0 BLOCKER |
| 11 | OMR Scanner | omr_scanner_screen.dart | SIMULATED MOCK | P0 BLOCKER — returns fake scores |
| 12 | NCERT Reader | ncert_reader_screen.dart | Unknown | Partial |
| 13 | Battleground | battleground_screen.dart | Unknown | Partial |
| 14 | Mistake Notebook | mistake_notebook_screen.dart | Unknown | Partial |
| 15 | Revision | revision_manager_screen.dart | Unknown | Partial |
| 16 | Blueprint | blueprint_screen.dart | Unknown | Partial |
| 17 | Study Plan | study_plan_screen.dart | Unknown | Partial |
| 18 | Pricing / Billing | pricing_screen.dart | SnackBar only — NO IAP | P0 BLOCKER |
| 19 | Profile | profile_screen.dart | Unknown | Partial |
| 20 | Settings | MISSING | — | Missing screen |
| 21 | Parent Controls | MISSING | — | Missing screen |
| 22 | Notifications (FCM) | In main.dart | Partial — no tap routing | Partial |
| 23 | Deep Links | Unverified | — | Unverified |
| 24 | Logout | Profile screen | SecureStorageService.clearSession() | PRESENT |
| 25 | Error States | No global error boundary | — | Missing |
| 26 | Empty States | Some screens | — | Partial |
| 27 | Offline States | No offline UI indicator | — | Missing |

**Summary: 1 PRESENT | 13 PARTIAL | 13 BLOCKER/MISSING**

---

## 4. Web Dependency Audit (Full Classification)

Classifications per CTO directive:
- A = REQUIRED AND SAFE
- B = LEGACY
- C = MOBILE PRODUCTION DEPENDENCY (target: zero)
- D = WEB-ONLY
- E = DEAD CODE
- F = MUST BE REMOVED

| File | Line | Pattern | Classification |
|---|---|---|---|
| api_client.dart | 12 | defaultBaseUrl = https://ai-neet.vercel.app | **C — P0 VIOLATION** |
| main.dart | 31 | kInitialWebUrl default = ai-neet.vercel.app | **C** |
| main.dart | 303 | NavigationDelegate allows ai-neet.vercel.app | **C** |
| main.dart | 330 | loadRequest(kInitialWebUrl) | **C** |
| main.dart | 8-9 | import webview_flutter, webview_flutter_android | **B — LEGACY** |
| main.dart | 115 | home: const WebViewScreen() | **B — LEGACY** |
| main.dart | 271 | WebViewController.fromPlatformCreationParams | **B — LEGACY** |
| crash_forwarder.dart | 10 | WebViewController param | **B — LEGACY** |
| app_check.dart | 8 | WebViewController param | **B — LEGACY** |
| main.dart | 305, 578 | launchUrl(externalApplication) | **A — REQUIRED AND SAFE** |
| pubspec.yaml | 37 | webview_flutter: ^4.13.1 | **F — MUST BE REMOVED** |
| README.md | 22 | NEET_WEB_URL=https://ai-neet.vercel.app | **D — LEGACY DOC** |

**Category-C count: 4. Required: 0. GATE C FAILS.**

---

## 5. API Endpoint Inventory

### Declared in NeetApiClient (all route to https://ai-neet.vercel.app):

| Method | Path | Feature | v2 Connected |
|---|---|---|---|
| POST | /api/auth/login | Login | YES |
| POST | /api/auth/register | Registration | NO (no UI screen) |
| POST | /api/auth/verify-otp | OTP | NO (no UI screen) |
| GET | /api/auth/me | Session restore | NOT CALLED on startup |
| POST | /api/doubts/solve | AI Doubt | YES |
| GET | /api/performance | Dashboard | YES (cached offline) |

### Critical Missing Endpoints (not yet implemented in v2):

- POST /api/tests/start
- POST /api/tests/submit
- GET /api/tests/results
- GET /api/questions (test engine)
- POST /api/omr/grade (currently mocked)
- POST /api/billing/verify (Play purchase token)
- GET /api/profile
- GET /api/ncert
- GET /api/mistakes
- GET /api/revision
- GET /api/battleground

---

## 6. Authentication Audit

| Requirement | Status | Evidence |
|---|---|---|
| Registration UI | FAIL — BLOCKER | No v2 screen exists |
| Login UI + API | PASS | NativeLoginScreen + NeetApiClient.login() |
| OTP Verification UI | FAIL — BLOCKER | No v2 screen exists |
| Secure token storage | PASS | flutter_secure_storage + encryptedSharedPreferences |
| Session restore on startup | FAIL — CRITICAL | _isLoggedIn = true hardcoded in app.dart:26 |
| Token refresh | FAIL — BLOCKER | No refresh mechanism in NeetApiClient |
| 401 handling | PASS | Dio interceptor clears session |
| Logout | PASS | SecureStorageService.clearSession() |
| Cold start auth check | FAIL — CRITICAL | Entirely bypassed — all users see dashboard |
| Offline startup | FAIL — MISSING | No offline token validation |
| Website-independent auth | PASS (once API URL fixed) | Auth calls API, not web page |

**CRITICAL: `_isLoggedIn = true` in v2/app.dart:26 means every user who opens the app bypasses authentication. This is a production security defect.**

---

## 7. Billing Audit

| Requirement | Status | Evidence |
|---|---|---|
| in_app_purchase SDK | PASS | pubspec.yaml: in_app_purchase: ^3.2.1 |
| Play Billing code | EXISTS but in wrong layer | main.dart WebView bridge only |
| v2 Native Pricing Screen | PASS — screen exists | pricing_screen.dart |
| IAP wired in v2 Pricing | FAIL — CRITICAL | onPressed shows SnackBar only |
| Purchase token verification | FAIL — NOT PORTED | Logic in WebView bridge only |
| Restore purchases | FAIL — NOT PORTED | Logic in WebView bridge only |
| Already-owned subscription | FAIL — NOT PORTED | Logic in WebView bridge only |
| Entitlement state management | FAIL — MISSING | No entitlement provider |
| Sandbox testing on v2 | FAIL | Not performed |
| Web checkout dependency | PASS | No web checkout in v2 |

**Gate H FAILS. Play Billing exists only in the legacy WebView bridge. The native v2 pricing screen does not initiate any real purchase.**

---

## 8. Camera Audit

| Requirement | Status | Evidence |
|---|---|---|
| image_picker SDK | PASS | pubspec.yaml: image_picker: ^1.2.1 |
| Camera in WebView bridge | PASS | _captureImage() in main.dart |
| Camera in v2 Doubt Solver | FAIL — BLOCKER | No camera call in doubt_solver_screen.dart |
| Camera in v2 OMR Scanner | FAIL — CRITICAL | _handleScanOMR() = Future.delayed(2s) + mock data |
| OMR returns real data | FAIL | Returns hardcoded {correct:142, score:540} always |
| Image API upload connected | FAIL | API method exists but never called from v2 |
| HTML file-upload dependency | PASS | Not present in v2 |

**Gate I FAILS. OMR scanner returns `Score: 540/720` for any input at all times. This is a simulation, not a scanner.**

---

## 9. Offline Audit

| Requirement | Status |
|---|---|
| Hive storage (OfflineCacheService) | PASS — initialized |
| Performance data cache | PASS — getPerformance() caches locally |
| Dashboard full cache | PARTIAL — performance key only |
| Active test state persistence | FAIL — MISSING |
| Answer draft persistence | FAIL — MISSING |
| Mistake notebook cache | FAIL — MISSING |
| Revision queue cache | FAIL — MISSING |
| Offline UI indicator | FAIL — MISSING |
| Retry with exponential backoff | PASS — Dio interceptor (3 retries: 1s, 2s, 4s) |
| Graceful degradation | PARTIAL — rethrows on uncached data |
| Cold start offline auth | FAIL — requires network |

---

## 10. Notification Audit

| Requirement | Status |
|---|---|
| Firebase Messaging SDK | PASS |
| Permission request | PASS |
| FCM token acquisition | PASS |
| Foreground notification (SnackBar) | PASS |
| Background handler (top-level) | PASS |
| Notification tap → screen navigation | FAIL — logs only |
| Terminated state testing | FAIL — not performed |
| Deep link from notification | FAIL — not implemented |

---

## 11. Security Audit

| Item | Status | Notes |
|---|---|---|
| flutter_secure_storage (encryptedSharedPreferences) | PASS | Tokens encrypted at rest |
| Firebase App Check (Play Integrity in release) | PASS | kDebugMode guard |
| Firebase Crashlytics (release-only) | PASS | Disabled in debug |
| Debug flags guarded by kDebugMode | PASS | All debug output guarded |
| Release signing (keystore env vars required) | PASS | build.gradle.kts enforces |
| ProGuard / R8 explicit rules | FAIL | Default Flutter R8 only |
| Network security config (cleartext blocked) | UNVERIFIED | AndroidManifest not audited |
| API rate limiting + auth independent | FAIL | Vercel shared infra |
| .env / secrets committed to repo | WARNING | .env and .env.local present in root |
| AAB binary decompile audit | FAIL | Not performed |
| --obfuscate --split-debug-info flag | FAIL | Not confirmed in build command |

---

## 12. Performance Audit

| Item | Status |
|---|---|
| Firebase parallel init (Future.wait) | PASS |
| API timeouts (8s connect, 12s receive) | PASS |
| Cold start measurement | FAIL — not measured |
| Frame rate telemetry (60fps target) | FAIL — not measured |
| Memory profiling | FAIL — not performed |
| Release APK/AAB size measurement | FAIL — not performed |
| Image caching (cached_network_image) | FAIL — not present |

---

## 13. Fault-Isolation Test Results

### TEST A: Vercel Outage Simulation

| Feature | Expected | Actual | Result |
|---|---|---|---|
| App launch | NeetV2App loads | NeetV2App loads (UI only) | PASS |
| Authentication | Graceful network error | Error message shown | PASS |
| Dashboard | Shows cached performance | Only performance key cached | PARTIAL |
| Tests | Load from cache | No question cache — blank | FAIL |
| AI Doubt | Clear error message | Hardcoded NCERT text returned | DATA INTEGRITY FAIL |
| OMR | Unavailable message | Simulated fake score returned | CRITICAL FAIL |
| Billing | Graceful error | SnackBar only (no IAP) | FAIL |

**TEST A VERDICT: FAILS**

### TEST B: Mobile App Unavailable (Web Independence)
Web frontend operates independently of Flutter binary. Web independence confirmed. PASS.

### TEST C: AI Service Outage
Doubt Solver returns hardcoded "Based on NCERT Physics Chapter 5..." text — appears real to students. This is a data integrity concern, not just a UX issue. FAIL.

---

## 14. AI Outage Test Results

| Scenario | Expected Behavior | Actual Behavior | Status |
|---|---|---|---|
| Doubt Solver with AI down | "AI service unavailable" error | Returns fabricated NCERT answer | FAIL — DATA INTEGRITY |
| Tests with AI down | Non-AI tests continue | questions: const [] — tests nonfunctional | FAIL |
| Core navigation with AI down | All screens accessible | Yes — navigation works | PASS |

The hardcoded fallback presents invented academic content as if real. Must be replaced with a clear error message: "AI service temporarily unavailable. Please try again."

---

## 15. Release AAB Forensic Report

**Status: NOT PERFORMED — Release AAB not compiled for this assessment cycle.**

### Checklist of items to verify in compiled AAB before any release:

| Item | Required | Known Status |
|---|---|---|
| Application ID | com.aineetcoach.app | Not verified in AAB |
| Version code | 3 | Not verified |
| Version name | 1.1.0 | Not verified |
| Flutter native engine | Present | Not verified |
| ai-neet.vercel.app embedded | Must be absent from active paths | KNOWN PRESENT |
| API base URL | api.aineetcoach.com | KNOWN AS ai-neet.vercel.app |
| Debug flags disabled | Yes | Not verified |
| Release signing | Production keystore | Not verified |
| R8/ProGuard explicit rules | Present | NOT CONFIGURED |
| Camera permission manifest | android.permission.CAMERA | Not verified |
| Notification permission | POST_NOTIFICATIONS | Not verified |
| Play Billing permission | com.android.vending.BILLING | Not verified |
| --obfuscate flag used | Yes | Not confirmed |
| Production google-services.json | Yes | Not verified |
| ADMOB production ID | Yes | Not verified |

---

## 16. Play Store Artifact Verification

**Status: NOT PERFORMED**

No new AAB uploaded to Play Store Internal Testing for this assessment cycle. The existing Play Store version (legacy WebView baseline) remains available as the baseline. This is correct — do not replace it until the native architecture passes all gates.

---

## 17. Known Risks

| Risk | Severity | Impact |
|---|---|---|
| api.aineetcoach.com does not exist | P0 | All mobile API traffic fails if Vercel goes down |
| _isLoggedIn = true hardcoded | P0 | Auth completely bypassed — all users see dashboard |
| OMR scanner is a simulation | P0 | Students receive fabricated academic scores |
| Pricing not wired to IAP | P0 | Zero revenue possible through native app |
| No registration/OTP screens | P0 | New students cannot create accounts |
| Test engine has empty questions | P0 | Students cannot take any tests |
| AI fallback returns fabricated content | P1 | Misleads students with invented answers |
| No token refresh mechanism | P1 | Sessions expire silently with no recovery |
| webview_flutter in pubspec.yaml | P1 | Legacy dependency compiled into every build |
| No deep link routing | P1 | Push notification CTAs are broken |
| No global error/empty/offline states | P2 | Blank screens or infinite spinners on failure |

---

## 18. Remaining Blockers (Prioritized)

### P0 — Required before any release AAB is built:

1. Deploy api.aineetcoach.com — independent production API (DNS, TLS, hosting, CI/CD, health endpoints, monitoring, logging, rollback, scaling, backups, CORS, versioning)
2. Replace api_client.dart:defaultBaseUrl with https://api.aineetcoach.com
3. Fix _isLoggedIn = true in v2/app.dart:26 — implement real session restore
4. Build Registration screen in v2/features/auth/
5. Build OTP Verification screen in v2/features/auth/
6. Wire real image_picker camera to OMR scanner — remove Future.delayed mock and hardcoded data
7. Wire Google Play Billing to NativePricingScreen — port _purchaseSubscription() from WebView bridge
8. Wire GET /api/questions to Test Engine — replace questions: const []
9. Wire POST /api/tests/submit in v2 test engine
10. Replace hardcoded AI fallback in doubt_solver_screen.dart with proper error message

### P1 — Required before certification gates can pass:

1. Implement token refresh in NeetApiClient
2. Implement cold-start session restore
3. Port purchase restore and acknowledgment from WebView bridge to v2
4. Wire notification tap to screen navigation routing
5. Expand offline cache: test answers, mistake notebook, revision queue
6. Add offline UI indicator and global error boundary
7. Configure R8/ProGuard rules explicitly
8. Add --obfuscate --split-debug-info to release build command
9. Build Settings screen
10. Verify and implement deep link routing in AndroidManifest.xml

### P2 — Before Play Store submission:

1. Remove webview_flutter from pubspec.yaml or formally document retention rationale
2. AAB forensic inspection (strings, apktool, binary search for embedded URLs)
3. Verify production google-services.json
4. Verify production ADMOB_ANDROID_APP_ID
5. Real-device camera testing on minimum 2 Android devices
6. Google Play Billing sandbox testing (purchase, restore, cancel, already-owned, entitlement persistence)
7. FCM terminated-state notification testing
8. Performance profiling: cold start target < 2s, frame rate target 60fps

---

## 19. Evidence for Every Certification Gate

| Gate | Description | Evidence | Verdict |
|---|---|---|---|
| A | Native Entry Point | main.dart:120: return const NeetV2App() when ENABLE_WEBVIEW_FALLBACK=false | PASS |
| B | Native Route Coverage | 13 of 27 features native; 6 screens completely missing | FAIL |
| C | Zero WebView Core Dependency | 4 Category-C dependencies; api_client.dart:12 routes to Vercel | FAIL |
| D | Independent API | defaultBaseUrl = ai-neet.vercel.app; api.aineetcoach.com nonexistent | FAIL |
| E | API Functional Parity | Test engine empty; OMR mocked; pricing not wired; 11 endpoints missing | FAIL |
| F | Authentication | _isLoggedIn=true hardcoded; no OTP/registration; no token refresh | FAIL |
| G | Offline | Only performance data cached; no test state; no offline UI | FAIL |
| H | Billing | Play Billing in WebView bridge ONLY; not ported to v2 native pricing | FAIL |
| I | Camera | OMR scanner is 2-second mock with hardcoded score 540/720 | FAIL |
| J | Notifications | Foreground PASS; tap routing FAIL; terminated state not tested | FAIL |
| K | Fault Isolation | Vercel is sole production API; outage simulation fails critical features | FAIL |
| L | AI Degradation | Fabricated content returned on AI failure; not a clean error | FAIL |
| M | Security | No R8 rules; no obfuscation; auth bypass; API unsecured independent | FAIL |
| N | Performance | No telemetry collected; cold start not measured; frame rate not profiled | FAIL |
| O | Release Artifact | No release AAB built or inspected | FAIL |
| P | Play Store | No new AAB uploaded to Play Store testing channel | FAIL |

**Gates Passing: 1 of 16**
**Gates Failing: 15 of 16**

---

## 20. Final GO / NO-GO Decision

```
=======================================================================
           FINAL PRODUCTION CERTIFICATION DECISION
                         NO-GO
=======================================================================

  Gates Passing:   1 / 16  (Gate A — Native Entry Point only)
  P0 Blockers:     10
  P1 Blockers:     10

  The production AAB MUST NOT be submitted to Google Play.

  CTO BINARY QUESTION:
  "If ai-neet.vercel.app becomes completely unavailable tomorrow,
   can a student with the latest Play Store Flutter application
   continue using the mobile product's online functionality
   through the independent API infrastructure?"

  ANSWER: NO.

  Supporting Evidence:
  - api.aineetcoach.com does not exist
  - api_client.dart:defaultBaseUrl routes all traffic to Vercel
  - Test engine cannot load any questions (questions: const [])
  - OMR returns simulated fake results (Score: 540/720 always)
  - Billing not wired to native Google Play IAP
  - Students cannot register through the native app
  - Every user is hardcoded as authenticated (_isLoggedIn = true)

=======================================================================
```

### Prerequisites Before GO Decision Can Be Issued:

1. api.aineetcoach.com live — independent hosting, TLS, health endpoints, monitoring
2. api_client.dart:defaultBaseUrl = api.aineetcoach.com — verified in compiled AAB
3. _isLoggedIn performs real session check at cold start
4. Registration + OTP screens exist in v2
5. OMR scanner uses real device camera and submits to real API
6. Google Play Billing wired in NativePricingScreen — sandbox-tested end-to-end
7. Test Engine loads real questions from API
8. All 16 Certification Gates PASS — verified on physical device against the release AAB

---

*This document was produced by zero-trust forensic audit of the mobile/ source tree as of 2026-08-08. It reflects the honest current state of the codebase. It will be updated as blockers are resolved and gates are re-evaluated.*
