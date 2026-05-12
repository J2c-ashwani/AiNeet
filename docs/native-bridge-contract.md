# Native Bridge Contract

**Version:** 2  
**Last Updated:** 2026-05-12  
**Parties:** Next.js WebView (Frontend) ↔ Flutter Shell (Native)

This is the canonical specification for all communication between the WebView layer and the Flutter native shell. Both sides MUST conform to this contract. Any new intent type or capability MUST be added here before implementation.

---

## Core Principle

> The WebView never assumes hardware API availability. It always negotiates capability, dispatches a structured intent, awaits an ACK, and falls back gracefully on timeout or error.

---

## Bridge Initialization

On WebView load, Flutter injects the following **before** any JavaScript executes:

```javascript
window.NEETCoachNativeBridge = <JavaScriptChannel>; // postMessage channel

window.NEETCoachNativeCapabilities = {
  version: 2,          // Bumped when new capabilities added
  share: true,         // Android native share sheet
  clipboard: true,     // Android clipboard manager
  externalIntent: true,// window.open / URL intent delegation
  fileDownload: false  // Not yet supported
};
```

The web layer reads `NEETCoachNativeCapabilities` via `supportsCapability(cap)` before making any native call.

---

## Intent Dispatch (Web → Native)

All messages are JSON strings posted via `window.NEETCoachNativeBridge.postMessage(json)`.

### Base Envelope

```jsonc
{
  "id": "uuid-v4",       // Unique per intent — used for ACK correlation
  "type": "INTENT_TYPE", // See supported types below
  "payload": {}          // Type-specific payload
}
```

---

## Supported Intent Types

### `SHARE`
Opens Android native share sheet.

```jsonc
{
  "id": "550e8400-...",
  "type": "SHARE",
  "payload": {
    "title": "string",    // Required
    "text": "string",     // Required
    "url": "string"       // Optional
  }
}
```

### `COPY`
Writes text to Android clipboard manager.

```jsonc
{
  "id": "550e8400-...",
  "type": "COPY",
  "payload": {
    "text": "string"      // Required
  }
}
```

### `OPEN_URL`
Opens external URL via Android Intent (WhatsApp, browser, UPI, etc).

```jsonc
{
  "id": "550e8400-...",
  "type": "OPEN_URL",
  "payload": {
    "url": "string"       // Required — must be a valid URI
  }
}
```

---

## ACK / Response (Native → Web)

Flutter calls `window.NEET_NATIVE_ACK(json)` to respond. The web layer MUST register this function before dispatching any intent.

### Success ACK

```jsonc
{
  "id": "550e8400-...",   // Matches the request ID
  "status": "ok"
}
```

### Error Response

```jsonc
{
  "id": "550e8400-...",
  "status": "error",
  "reason": "string"     // Human-readable failure reason for telemetry
}
```

---

## Timeout Semantics

- All intents must be ACKed within **3000ms**.
- If no ACK arrives, the web layer:
  1. Rejects the intent promise with `BRIDGE_TIMEOUT:<TYPE>`.
  2. Executes the appropriate web fallback.
  3. Logs a `bridge_timeout` event to `mobile_runtime_events`.
- **No automatic retry** by the bridge itself. Callers implement their own retry policy.

---

## Retry Policy by Intent Type

| Intent | Retry | Rationale |
|---|---|---|
| `SHARE` | None | User-initiated — silent retry would cause double-share |
| `COPY` | None | Best-effort by design |
| `OPEN_URL` | 1x after 1000ms | Then fallback to `window.open` |

---

## Capability Versioning

When a new native capability is added:
1. Bump `NEETCoachNativeCapabilities.version` in the Flutter injection code.
2. Add the new capability key to this document.
3. Gate the new web feature behind `supportsCapability('newFeature')`.

**Rule:** Old APK versions that do not inject the new capability key must cause `supportsCapability()` to return `false`, triggering the web fallback — never a crash.

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1 | 2026-05-01 | Initial bridge — share only |
| 2 | 2026-05-12 | Added clipboard, externalIntent, ACK protocol, timeout semantics |
