# WebView API Compatibility Matrix

This document outlines the compatibility, fallbacks, and risk factors associated with web APIs used in the NEET Coach mobile app, which is primarily a web app wrapped in a Flutter WebView.

## Target Device Profile

The app targets low-end Android devices, specifically:
- **Devices**: Redmi budget series (e.g., Note 10, Note 11), Samsung J-series/A-series.
- **Memory**: Devices with 2GB to 4GB RAM.
- **Network**: 3G/4G unstable connections, frequent offline scenarios.
- **OS**: Android 9 (Pie) and above.

## API Compatibility & Strategies

| Web API | Usage in App | Risk Level on Budget Android | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| `localStorage` | Fast synchronous reads (e.g., active test flags) | **High** - Prone to QuotaExceeded errors, clearing by OS under memory pressure, and hydration mismatches. | **Migrated to `resilientStorage`** which uses IndexedDB as primary with a memory/localStorage fallback. Used strictly in `useEffect` to avoid SSR hydration crashes. |
| `IndexedDB` | Primary persistence layer (offline test answers, session state) | **Medium** - Generally reliable but can be slow or corrupted if the WebView is killed mid-transaction. | Implemented durable wrapper (`lib/idb.js`) with explicit error handling. Heartbeat saves (every 10s) and lifecycle saves (`visibilitychange`, `beforeunload`) ensure data integrity. |
| `sessionStorage` | Ephemeral state (handoff from config to test page) | **Low** - Cleared when the tab/WebView closes. | Safe for non-critical data. If empty, the app gracefully redirects to the configuration page. |
| `navigator.share` | Viral sharing features (results, challenges) | **High** - Fails silently or throws errors on older WebViews without native share sheet support. | **Try-Catch Required.** If `navigator.share` throws, fallback to a direct `window.open` call using the `whatsapp://` or `https://api.whatsapp.com/` deep link. |
| `navigator.clipboard` | Copying referral links | **Medium** - Requires secure context (HTTPS) and user interaction. Fails on older WebViews. | **Try-Catch Required.** Ensure all calls are initiated by a user click. |
| `URL.createObjectURL` | OMR Scanner image previews | **High** - Memory leaks are fatal on 2GB RAM devices. | **Strict Revocation.** Replaced Base64 state with Object URLs. Explicitly call `URL.revokeObjectURL()` in cleanup effects and before creating new URLs. |
| `FileReader` (Base64) | OMR API Submission | **Medium** - Spikes heap memory. | Deferred conversion. Only generate Base64 right before sending the API request, rather than storing it in React state. |
| `window.ReactNativeWebView` / `window.nativeApp` | Native bridge detection | **Low** - Used to detect if running inside the app vs mobile browser. | Safe to check `typeof window !== 'undefined'` first. Allows disabling web-specific prompts (like "Download App"). |

## React Hydration Defenses

On low-end hardware, hydration mismatches cause total page failures. The following rules are enforced:
1. **Never** render conditional UI based on `localStorage` or `window` objects during the initial render.
2. Use the `hasMounted` state pattern:
   ```javascript
   const [hasMounted, setHasMounted] = useState(false);
   useEffect(() => setHasMounted(true), []);
   if (!hasMounted) return null; // Or a skeleton
   ```
3. Use `useEffect` to read from `resilientStorage` and update state subsequently.

## Background Process Survivability

Android aggressively kills backgrounded WebViews.
- **Timer Truthfulness:** Timers do not rely on `setInterval` ticks. They compute remaining time based on a `startedAt` timestamp when the app resumes.
- **Save Triggers:** `visibilitychange` event is the most reliable trigger to save state before the app goes into the background.

## Continuous Monitoring
The `scripts/audit-mobile-blockers.js` script runs in CI to statically analyze the codebase for violations of these principles (e.g., missing catch blocks on `navigator.share`, direct `localStorage` usage outside `resilientStorage`, unrevoked Object URLs).
