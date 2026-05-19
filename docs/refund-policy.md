# Refund Policy

NEET Coach subscriptions are non-refundable once a billing period has started. If a student cancels a subscription, no further charges will be made from the next billing cycle, and the student will continue to have access to the paid subscription benefits until the end of the current billing period; the subscription will automatically expire at the end of that period.

**Payment system behavior on refund/chargeback:** If a Cashfree refund or bank chargeback is issued, the subscription status is **not automatically revoked** mid-period. The `subscriptions` table retains `status = active` until the natural `expires_at` date. Manual intervention by the support team is required to revoke access early in exceptional fraud cases. This behavior must be verified during the payment drill.

*Last reviewed: 2026-05-19*
