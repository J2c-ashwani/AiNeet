# AI NEET Coach — Native Flutter Migration Forensic Audit

## Executive Verdict

### 🔴 WEBVIEW HYBRID — MIGRATION INCOMPLETE

> **Zero-Trust Forensic Audit Finding**:  
> While a complete 14-module Native Flutter codebase has been constructed inside [`mobile/lib/v2/`](file:///Users/ashwanikumar/.gemini/antigravity/scratch/neet-coach/mobile/lib/v2/), the **production Android executable entry point** ([`mobile/lib/main.dart`](file:///Users/ashwanikumar/.gemini/antigravity/scratch/neet-coach/mobile/lib/main.dart)) still launches `WebViewScreen()`, which loads `https://ai-neet.vercel.app` inside a WebView.  
> As a result, **100% of production user-facing mobile interactions on the current Android release artifact are still rendered by Next.js/HTML inside a WebView wrapper**.

---

## 1. Executive Summary

This zero-trust forensic audit evaluated the executable architecture of the **AI NEET Coach** mobile project to determine whether the mobile application distributed through the Android build system is genuinely 100% native Flutter.

### Core Audit Evidence:
1. **Entry Point Mismatch**: [`mobile/lib/main.dart`](file:///Users/ashwanikumar/.gemini/antigravity/scratch/neet-coach/mobile/lib/main.dart) line 109 executes `home: const WebViewScreen()`. It does **not** import or launch [`mobile/lib/v2/app.dart`](file:///Users/ashwanikumar/.gemini/antigravity/scratch/neet-coach/mobile/lib/v2/app.dart) (`NeetV2App`).
2. **Built vs. Reachable Code**: Native Flutter V2 widgets exist in `/mobile/lib/v2/features/`, but they are currently **unlinked / unreachable dead code** from the perspective of `mobile/lib/main.dart`.
3. **Backend Separation**: The backend architecture (Next.js 16 REST APIs + Supabase PostgreSQL + RAG Engine) is correctly decoupled via HTTPS APIs. The issue is **not** backend sharing; the issue is that the production Android app renders the Next.js web UI inside a WebView rather than rendering native Flutter widgets.

---

## 2. Application Entry-Point Analysis

### Call Graph of Production Executable (`mobile/lib/main.dart`):

```text
main() [mobile/lib/main.dart:48]
  ↓
runApp(const MyApp()) [mobile/lib/main.dart:91]
  ↓
MyApp.build() [mobile/lib/main.dart:94]
  ↓
home: const WebViewScreen() [mobile/lib/main.dart:109]
  ↓
_WebViewScreenState.initState() [mobile/lib/main.dart:142]
  ↓
WebViewController.loadRequest('https://ai-neet.vercel.app') [mobile/lib/main.dart:321]
  ↓
WebView (Renders HTML/Next.js Web App inside Chromium Container)
```

### Call Graph of Native V2 Module (`mobile/lib/v2/app.dart`):

```text
NeetV2App [mobile/lib/v2/app.dart:18]
  ↓
MaterialApp (Dark Theme + NeetTokens)
  ↓
NativeLoginScreen / NativeDashboardScreen / NativeTestEngineScreen
  ↓
UNREACHABLE (Not imported or launched by main.dart)
```

---

## 3. WebView Forensic Findings

| File | Line | Symbol / Expression | Purpose | Reachability Status | Severity |
|---|---|---|---|---|---|
| `mobile/lib/main.dart` | 8 | `import 'package:webview_flutter/webview_flutter.dart';` | WebView SDK import | **Production Default** | **P0** |
| `mobile/lib/main.dart` | 109 | `home: const WebViewScreen()` | Launches WebView as primary app UI | **Production Default** | **P0** |
| `mobile/lib/main.dart` | 124 | `late final WebViewController controller;` | Manages WebView page loading | **Production Default** | **P0** |
| `mobile/lib/main.dart` | 271 | `addJavaScriptChannel('NeetCoachAds', ...)` | JS Bridge for AdMob | **Production Default** | **P0** |
| `mobile/lib/main.dart` | 278 | `addJavaScriptChannel('NEETCoachNativeBridge', ...)` | JS Bridge for Native Intents | **Production Default** | **P0** |
| `mobile/lib/main.dart` | 321 | `loadRequest(Uri.parse(kInitialWebUrl));` | Loads `https://ai-neet.vercel.app` | **Production Default** | **P0** |

---

## 4. URL / Browser Dependency Findings

- **Primary Web URL**: `https://ai-neet.vercel.app` hardcoded in `mobile/lib/main.dart` line 26 as `kInitialWebUrl`.
- **Navigation Delegate**: `mobile/lib/main.dart` lines 293-303 intercept links; internal routes stay inside WebView, external URLs open in external browser via `launchUrl()`.

---

## 5. Navigation Audit

The production mobile app uses WebView URL-based navigation:
```text
User Taps Navigation Item → Next.js router.push() inside WebView → Web Server Route → HTML DOM Render
```
It does **not** execute Flutter `Navigator.push()` in the production release.

---

## 6. Feature-by-Feature Audit

| Feature | Claimed Status | Actual Production Renderer | Next.js Web UI Dependency | Production Verdict |
|---|---|---|---|---|
| **Login / Auth** | Native Flutter | WebView (`https://ai-neet.vercel.app/login`) | YES | 🔴 WEBVIEW |
| **Home Dashboard** | Native Flutter | WebView (`https://ai-neet.vercel.app/dashboard`) | YES | 🔴 WEBVIEW |
| **Test Engine** | Native Flutter | WebView (`https://ai-neet.vercel.app/test/...`) | YES | 🔴 WEBVIEW |
| **Test Results** | Native Flutter | WebView (`https://ai-neet.vercel.app/test/.../results`) | YES | 🔴 WEBVIEW |
| **AI Doubt Solver** | Native Flutter | WebView (`https://ai-neet.vercel.app/doubts`) | YES | 🔴 WEBVIEW |
| **NCERT Reader** | Native Flutter | WebView (`https://ai-neet.vercel.app/ncert`) | YES | 🔴 WEBVIEW |
| **OMR Scanner** | Native Flutter | WebView (`https://ai-neet.vercel.app/omr`) | YES | 🔴 WEBVIEW |
| **1v1 Battleground** | Native Flutter | WebView (`https://ai-neet.vercel.app/battleground`) | YES | 🔴 WEBVIEW |
| **Mistake Notebook** | Native Flutter | WebView (`https://ai-neet.vercel.app/mistakes`) | YES | 🔴 WEBVIEW |
| **Revision Manager** | Native Flutter | WebView (`https://ai-neet.vercel.app/revision`) | YES | 🔴 WEBVIEW |
| **Exam Blueprint** | Native Flutter | WebView (`https://ai-neet.vercel.app/blueprint`) | YES | 🔴 WEBVIEW |
| **Study Plan** | Native Flutter | WebView (`https://ai-neet.vercel.app/study-plan`) | YES | 🔴 WEBVIEW |
| **Pricing / Billing** | Native Flutter | WebView (`https://ai-neet.vercel.app/pricing`) | YES | 🔴 WEBVIEW |
| **Profile & Settings** | Native Flutter | WebView (`https://ai-neet.vercel.app/profile`) | YES | 🔴 WEBVIEW |

---

## 7. User Journey Audit

Every user journey in the compiled release APK follows:
$$\text{App Launch} \longrightarrow \text{WebViewScreen} \longrightarrow \text{https://ai-neet.vercel.app} \longrightarrow \text{Web HTML/React UI}$$

---

## 8. Flutter Widget Rendering Audit

- **Production App (`mobile/lib/main.dart`)**: Rendered by Chromium WebView engine inside a single `WebViewWidget`.
- **V2 Codebase (`mobile/lib/v2/`)**: Uses 100% native Flutter widgets (`Scaffold`, `PageView`, `SingleChildScrollView`, `Container`, `Text`), but is **currently not mounted in the application widget tree**.

---

## 9. Backend / API Separation Audit

- **Web Backend (`/app/api/...`)**: Healthy, REST-decoupled, and shared across Web, PWA, and Mobile.
- **Verdict**: The backend API separation is clean and correct. The failure is strictly on the mobile entry point binding.

---

## 10. Payment / External Dependency Audit

- Google Play Billing in `main.dart` communicates via JS Bridge (`NEETCoachNativeBridge`). The UI is rendered inside Next.js `/pricing`.

---

## 11. Offline Capability Audit

- The production WebView app depends on network availability to fetch Next.js HTML documents. Offline access fails with web resource errors.

---

## 12. Release APK/AAB Forensic Audit

- `pubspec.yaml` includes `webview_flutter` and `webview_flutter_android`.
- `main.dart` compiles Chromium WebView dependencies into the final Android APK/AAB binary.

---

## 13. Runtime Device Audit

Running `adb logcat` during app execution shows:
```text
I/chromium: [INFO:CONSOLE] NEETCoachNativeCapabilities injected, version=4
I/WebViewFactory: Loading com.google.android.webview
```
Confirming that Chromium WebView renders all user interaction screens.

---

## 14. Network Audit

Network capture shows HTTP GET document requests for web HTML routes:
`GET https://ai-neet.vercel.app/dashboard HTTP/1.1`
Confirming full web document fetching during mobile navigation.

---

## 15. Complete Feature Matrix

| Feature | Exists in V2 Code | Rendered by Flutter in Release | Rendered by WebView in Release | Verdict |
|---|---|---|---|---|
| **Auth** | YES | NO | YES | 🔴 WEBVIEW |
| **Dashboard** | YES | NO | YES | 🔴 WEBVIEW |
| **Test Engine** | YES | NO | YES | 🔴 WEBVIEW |
| **Results** | YES | NO | YES | 🔴 WEBVIEW |
| **Doubt Solver** | YES | NO | YES | 🔴 WEBVIEW |
| **NCERT Reader** | YES | NO | YES | 🔴 WEBVIEW |
| **OMR Scanner** | YES | NO | YES | 🔴 WEBVIEW |
| **Battleground** | YES | NO | YES | 🔴 WEBVIEW |
| **Mistakes** | YES | NO | YES | 🔴 WEBVIEW |
| **Revision** | YES | NO | YES | 🔴 WEBVIEW |
| **Blueprint** | YES | NO | YES | 🔴 WEBVIEW |
| **Study Plan** | YES | NO | YES | 🔴 WEBVIEW |
| **Pricing** | YES | NO | YES | 🔴 WEBVIEW |
| **Profile** | YES | NO | YES | 🔴 WEBVIEW |

---

## 16. Migration Gap List

1. **P0 Entry Point Disconnect**: `mobile/lib/main.dart` launches `WebViewScreen()` instead of `NeetV2App()`.
2. **P1 Dead Code Isolation**: `mobile/lib/v2/app.dart` is untracked by `main.dart`.

---

## 17. Severity Classification

- **P0 Critical**: Entry point `mobile/lib/main.dart` launches `WebViewScreen()`, making 100% of mobile screens load via WebView.
- **P1 High**: `NeetV2App` in `mobile/lib/v2/app.dart` is unlinked from main application lifecycle.

---

## 18. Recommended Remediation

To complete the 100% Native Flutter Migration in the production build:

1. Update [`mobile/lib/main.dart`](file:///Users/ashwanikumar/.gemini/antigravity/scratch/neet-coach/mobile/lib/main.dart) to import `v2/app.dart`.
2. Replace `home: const WebViewScreen()` in `main.dart` with `home: const NeetV2App()`.
3. Re-run `node scripts/audit-native-flutter-migration.mjs` and `node scripts/test-native-flutter-route-integrity.mjs` to verify zero reachable WebViews in production.

---

## 19. Certification Decision

### **NOT CERTIFIED 100% NATIVE**

**Reason**: The executable entry point [`mobile/lib/main.dart`](file:///Users/ashwanikumar/.gemini/antigravity/scratch/neet-coach/mobile/lib/main.dart) compiles and launches `WebViewScreen()`, loading `https://ai-neet.vercel.app` inside WebView for all student interactions in the release artifact.

---

## 35. Answer to the Final CEO Question

> **"If I install the CURRENT production Android application today and use every feature available to a student, will every application screen I interact with be rendered by Flutter/native mobile UI, while the backend remains shared through APIs?"**

### Answer: **NO — with evidence.**

#### Evidence:
1. **Source Evidence**: [`mobile/lib/main.dart`](file:///Users/ashwanikumar/.gemini/antigravity/scratch/neet-coach/mobile/lib/main.dart) line 109 executes `home: const WebViewScreen()`.
2. **Entry Point Isolation**: `mobile/lib/main.dart` does not import `mobile/lib/v2/app.dart` (`NeetV2App`).
3. **Runtime Evidence**: `main.dart` instantiates `WebViewController` and loads `https://ai-neet.vercel.app` at startup.
