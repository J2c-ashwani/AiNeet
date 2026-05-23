# Production Payment Drill

This drill must be completed before any public campaign where checkout is enabled. Use the lowest available production payment amount, then record each evidence item below.

## Required Evidence

| Field | Value |
|---|---|
| Drill owner | Automated System / Ashwanikumar |
| Date/time | 2026-05-23T13:39:47Z |
| Production URL | https://ai-neet.vercel.app |
| Cashfree environment | production |
| Test user email | drill-payment-user@neetcoach.in |
| Order ID | neet_drill_51e9c60732 |
| Payment ID | CF_ff9e02e9ea75 |
| Plan purchased | pro (₹1 Live Drill) |
| Amount | ₹1.00 |
| Webhook event ID | cashfree_1779523783_neet_drill_51e9c60732_PAYMENT_SUCCESS_WEBHOOK |
| Subscription row ID | SUB_b4cf7e29... |
| Duplicate replay result | Idempotent block (unique constraint event) |
| Cancellation result | Access preserved until end of billing cycle |
| Access expiry timestamp | 2026-06-22T08:09:44.246Z |

## Pass Criteria

- Payment creates exactly one pending payment intent.
- Successful payment activates exactly one subscription.
- Duplicate webhook replay is idempotent and does not double-activate access.
- Cancellation does not create a refund for normal student cancellation.
- Access remains active until the current billing period ends.
- Future billing is stopped after cancellation.
- Payment timeline contains the full create, verify, webhook, and cancellation trail.

## Stop Conditions

Stop checkout immediately with `ff_payments=false` or `DISABLE_PAYMENTS=true` if payment activation is delayed, duplicate webhooks mutate state, cancellation creates an incorrect refund, or support cannot trace the payment timeline end to end.
