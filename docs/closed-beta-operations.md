# Closed Beta Operations

Closed beta is a reliability discovery phase, not a growth phase. The first cohort should be 100 students and may expand to 500 only after seven stable days with no critical incident, no payment state corruption, no unrecovered test submission, and no confirmed syllabus leakage.

## Cohort Requirements

- Device diversity: low-end Android, mid-range Android, desktop Chrome, and mobile browser
- Network diversity: Wi-Fi, 4G, slow network, and intermittent offline usage
- User diversity: free users, paid users, heavy test takers, and NCERT/RAG users
- Abuse coverage: duplicate accounts, referral farming, leaderboard manipulation, and rapid submissions

## Daily Review

- Failed submissions and offline replay outcomes
- Session expiry and login/logout issues
- Payment confusion and support requests
- AI hallucination or wrong explanation complaints
- Rage clicks, broken buttons, infinite loaders, and console errors from production logs
- Duplicate accounts, cheating attempts, and referral abuse

## Exit Criteria

Closed beta can move to soft launch only when the incident log has zero open Critical or High issues, support response time is under 24 hours, payment activation and cancellation behavior is verified, and E2E/load tests have been rerun against the current production build.
