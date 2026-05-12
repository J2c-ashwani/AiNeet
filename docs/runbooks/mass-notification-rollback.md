# Runbook: Mass Notification Rollback

**Trigger:** Notification failure rate > 5%, or student complaints about spam/duplicate notifications  
**Severity:** P1  
**Owner:** Engineering On-Call

---

## Immediate Actions

1. **Disable notifications feature flag:**
```sql
UPDATE feature_flags SET enabled = false WHERE key = 'ff_notifications';
```
This takes effect within 60s without APK redeploy.

2. **Check FCM error rate:**
- Check Firebase Console → Cloud Messaging → Delivery reports
- Look for `UNREGISTERED`, `INVALID_ARGUMENT`, or quota errors

3. **Identify duplicate dispatch:**
```sql
SELECT user_id, notification_type, COUNT(*) as count
FROM notification_log  -- (add this table if not exists)
WHERE sent_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id, notification_type
HAVING COUNT(*) > 2
ORDER BY count DESC LIMIT 20;
```

---

## Spam Recovery

If students received duplicate notifications:

1. Do NOT send an apology notification (compounds the spam).
2. Add in-app banner: "We experienced a notification issue. No action needed."
3. Disable notification worker for 24h.
4. Root cause before re-enabling `ff_notifications`.

---

## Post-Incident

- Add idempotency key to all notification dispatch jobs.
- All notification sends must check dedup table before dispatch.
