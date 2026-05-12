# Feature Truth Audit & Status Registry

This document classifies all features currently implemented or planned for the NEET Coach platform. Its purpose is to ensure product truthfulness and guide the pruning of dormant or incomplete features.

## Classification Legend

- **Production**: Fully implemented, tested, and actively used by students.
- **Beta**: Implemented and functional, but still gathering feedback or undergoing refinement.
- **Experimental**: Under development or testing with a limited group; may be unstable or incomplete.
- **Dormant**: Partially implemented or previously active, but currently inactive or hidden.
- **Dead**: Deprecated or planned for removal; no longer aligns with product goals.

## Feature Registry

### Core Academic Engine

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Custom Test Generation** | Production | Stable. Users can select subjects, chapters, and difficulty. |
| **Adaptive Test Generation** | Production | Stable. AI generates tests based on user performance. |
| **Yearly PYQ Papers** | Production | Stable. Users can take full PYQ papers. |
| **OMR Scanner** | Production | Stable. Optimized for memory usage (Wave 3). |
| **Result Analytics & Scorecard** | Production | Stable. Provides detailed breakdown and rank prediction. |
| **Diagnostic Test** | Production | Stable. Used for onboarding and initial assessment. |

### Social & Viral Mechanics

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Viral Sharing (Results)** | Production | Stable. Uses `navigator.share` with fallback to WhatsApp. |
| **Challenge a Friend** | Production | Stable. Users can send test challenges via WhatsApp. |
| **Referral System** | Beta | Functional, but requires ongoing monitoring for abuse. |
| **Leaderboard** | Beta | Functional. Displays top performers. |

### Study & Revision

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **AI Study Plan** | Beta | Generates daily study plans based on performance. |
| **Spaced Repetition (Revision Cards)** | Beta | Functional. Suggests topics for review. |
| **AI Doubt Solver** | Beta | Functional. Uses text and image input. |
| **NCERT Reading Mode** | Experimental | Basic implementation. Needs more content and features. |
| **Mistake Book** | Beta | Functional. Tracks incorrectly answered questions. |

### Dashboards & Management

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Student Dashboard** | Production | Stable. Primary landing page post-login. |
| **Parent Connect (Weekly Reports)** | **Beta Ready** | Delivery pipeline pending verification. Retained as a retention feature. |
| **Educator Dashboard** | **Dormant** | Not a current focus. Needs evaluation before revival. |

### Monetization & User Accounts

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Authentication (Phone/OTP)** | Production | Stable. |
| **Onboarding Flow** | Production | Stable. |
| **Premium Subscription** | Beta | Integrated with Cashfree. Needs further validation. |
| **Pricing Page** | Beta | Functional. Needs audit for marketing claims. |
| **Landing Page** | Production | Stable. Needs audit for "Coming Soon" claims. |

## Action Items (Wave 4)

1.  **Purge Parent Dashboard:** Remove all related routes, components, and API endpoints.
2.  **Audit Landing/Pricing Pages:** Remove any "Coming Soon" banners or features that are not actively in development or production.
3.  **Evaluate Educator Dashboard:** Decide whether to officially deprecate or leave dormant for a future wave.
4.  **Review NCERT Integration:** Assess the value and completeness of the `/ncert` route and decide whether to improve or remove it.
