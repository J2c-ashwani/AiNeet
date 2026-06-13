# Native Bridge Contract

**Version:** 4
**Last Updated:** 2026-06-13
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
  version: 4,          // Bumped when new capabilities added
  share: false,        // Native share sheet; false until share package is included
  clipboard: true,     // Android clipboard manager
  externalIntent: true,// window.open / URL intent delegation
  haptic: true,        // Android haptic feedback
  fcmRegistration: true,// Native FCM token registration
  cameraCapture: true, // Native camera/document capture
  adsInterstitial: true,// Interstitial ads
  adsRewarded: true,   // Rewarded ads
  purchaseSubscription: true,// Play Billing purchase and acknowledgement
  purchaseRestore: true,// Play Billing restore/sync
  fileDownload: false  // Reserved
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

Current Android shell builds may advertise `share: false`. The web layer MUST only dispatch this intent when `supportsCapability('share')` is true and otherwise use the Web Share / clipboard fallback.

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

### `HAPTIC`
Triggers native haptic feedback.

```jsonc
{
  "id": "550e8400-...",
  "type": "HAPTIC",
  "payload": {
    "style": "light" // Optional: light | medium | heavy
  }
}
```

### `REGISTER_FCM`
Requests native FCM registration and returns device metadata in the ACK payload.

```jsonc
{
  "id": "550e8400-...",
  "type": "REGISTER_FCM",
  "payload": {}
}
```

Success payload:

```jsonc
{
  "token": "string",
  "deviceId": "string",
  "platform": "android",
  "appVersion": "string",
  "androidVersion": "string",
  "webviewVersion": "string",
  "permission": "granted"
}
```

### `RESTORE_PURCHASES`
Restores or syncs Play Billing purchases. Purchases are returned unacknowledged. The web layer must verify each purchase with the backend and then dispatch `ACKNOWLEDGE_PURCHASE`.

```jsonc
{
  "id": "550e8400-...",
  "type": "RESTORE_PURCHASES",
  "payload": {}
}
```

Success payload:

```jsonc
{
  "restored": true,
  "products": ["neet_premium_monthly"],
  "purchases": [
    {
      "productId": "neet_premium_monthly",
      "purchaseId": "GPA.0000-0000-0000-00000",
      "purchaseToken": "string",
      "source": "google_play",
      "status": "restored",
      "pendingCompletePurchase": false
    }
  ]
}
```

### `PURCHASE_SUBSCRIPTION`
Starts Google Play Billing for a supported subscription. The Android shell maps the plan to the canonical Play product IDs `neet_pro_monthly` or `neet_premium_monthly`.

```jsonc
{
  "id": "550e8400-...",
  "type": "PURCHASE_SUBSCRIPTION",
  "payload": {
    "planId": "pro"
  }
}
```

Success payload:

```jsonc
{
  "productId": "neet_pro_monthly",
  "purchaseId": "GPA.0000-0000-0000-00000",
  "purchaseToken": "string",
  "source": "google_play",
  "status": "purchased",
  "pendingCompletePurchase": true
}
```

The web layer must send the returned token and product ID to `/api/subscription/play/verify`. It must not acknowledge the purchase when server verification fails.

### `ACKNOWLEDGE_PURCHASE`
Acknowledges a Google Play purchase only after the backend has verified and activated it.

```jsonc
{
  "id": "550e8400-...",
  "type": "ACKNOWLEDGE_PURCHASE",
  "payload": {
    "purchaseToken": "string"
  }
}
```

Success payload:

```jsonc
{
  "acknowledged": true,
  "productId": "neet_pro_monthly"
}
```

### `SHOW_INTERSTITIAL`
Shows a native interstitial ad when policy and frequency caps allow it.

```jsonc
{
  "id": "550e8400-...",
  "type": "SHOW_INTERSTITIAL",
  "payload": {
    "placement": "string" // Optional placement key
  }
}
```

Success payload:

```jsonc
{
  "shown": true,
  "placement": "test_results"
}
```

### `SHOW_REWARDED`
Shows a rewarded ad and returns the reward result.

```jsonc
{
  "id": "550e8400-...",
  "type": "SHOW_REWARDED",
  "payload": {
    "placement": "string" // Optional placement key
  }
}
```

Success payload:

```jsonc
{
  "shown": true,
  "rewarded": true,
  "placement": "practice_boost",
  "rewardType": "practice_boost",
  "rewardAmount": 1
}
```

### `CAPTURE_IMAGE`
Requests native camera or document capture for OMR/upload workflows.

```jsonc
{
  "id": "550e8400-...",
  "type": "CAPTURE_IMAGE",
  "payload": {
    "source": "camera",        // Optional: camera | gallery | document
    "allowedMimeTypes": [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
      "application/pdf"
    ],
    "maxBytes": 15728640
  }
}
```

Success payload:

```jsonc
{
  "imageBase64": "string",
  "mimeType": "image/jpeg",
  "fileName": "scan.jpg",
  "sizeBytes": 123456
}
```

---

## ACK / Response (Native → Web)

Flutter calls `window.NEET_NATIVE_ACK(json)` to respond. The web layer MUST register this function before dispatching any intent.

### Success ACK

```jsonc
{
  "id": "550e8400-...",   // Matches the request ID
  "status": "ok",
  "payload": {}           // Optional type-specific result
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

- Standard intents must be ACKed within **3000ms**.
- `PURCHASE_SUBSCRIPTION` may remain open for up to **5 minutes** while the Play purchase UI is active.
- `ACKNOWLEDGE_PURCHASE` must complete within **15 seconds**.
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
| `HAPTIC` | None | Best-effort by design |
| `REGISTER_FCM` | App lifecycle retry | Token rotation must be handled by native shell |
| `RESTORE_PURCHASES` | User-initiated manual retry | Billing restore must never be silently repeated |
| `PURCHASE_SUBSCRIPTION` | User-initiated manual retry only | Prevent duplicate purchase prompts |
| `ACKNOWLEDGE_PURCHASE` | Retry after successful server verification | Never acknowledge an unverified purchase |
| `SHOW_INTERSTITIAL` | None | Prevent duplicate ad impressions |
| `SHOW_REWARDED` | None | Prevent duplicate reward grants |
| `CAPTURE_IMAGE` | User-initiated manual retry | Prevent duplicate uploads |

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
| 3 | 2026-05-18 | Added haptics, FCM registration, camera capture, ads, purchase restore, and ACK payloads |
| 4 | 2026-06-13 | Added Play subscription purchase and post-verification acknowledgement |
