# ADR-002: Native Bridge Protocol

**Date:** 2026-05-12  
**Status:** Accepted

## Context

Flutter WebView ≠ browser. `navigator.share`, `navigator.clipboard`, and `window.open` behave differently — or silently fail — inside a Flutter WebView. Different APK versions support different capabilities.

## Decision

Define a **formal Native Bridge Contract** (`docs/native-bridge-contract.md`) governing:
- JavaScript channel name: `NEETCoachNativeBridge`
- Capability injection at WebView init: `NEETCoachNativeCapabilities` JSON object
- ACK/timeout protocol: every intent gets a 3s ACK window before browser fallback
- Intent types: `SHARE`, `COPY`, `OPEN_URL`, `VIBRATE`
- Schema validation: all bridge payloads validated before dispatch
- Versioning: `BRIDGE_VERSION` in capabilities allows backward compatibility

All hardware API access in product code **must go through** `lib/utils/whatsapp.js`, `lib/utils/clipboard.js`, or `lib/hooks/usePlatformShare.js`. Direct `navigator.*` calls are banned via ESLint.

## Consequences

**Positive:** Platform behaves correctly on all APK versions. Bridge failures produce telemetry, not crashes.  
**Negative:** All hardware API calls now have a 3s timeout overhead (only when bridge is present).  
**Risk:** Flutter shell must implement the contract correctly. Validated by `audit-mobile-blockers.js`.
