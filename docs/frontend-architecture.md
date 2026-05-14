# Frontend Platform Architecture

## Status: 🟢 ACTIVE
## Classification: P0 — Architectural Governance

This document defines the rules, boundaries, and governance constraints for the frontend architecture of the platform. All future development must strictly adhere to these policies.

---

## 1. Data Abstraction & Cache Governance

We employ a **Hybrid Architecture** for data fetching and state orchestration. Do not create competing cache philosophies or manual `useEffect` + `fetch` chains.

### 1a. SWR (Simple Read-Heavy)
Use `useSWR` (via `/lib/swr/`) exclusively for:
- Leaderboard
- Analytics cards
- Read-only profile stats
- Dashboard summaries
- Rankings

### 1b. React Query (Transactional & Complex)
Use `useMutation` and `useQuery` (via `/lib/query/` and `@tanstack/react-query`) exclusively for:
- Tests and submissions
- Offline replay and background sync
- Adaptive engine interactions
- Optimistic mutations
- Retry-sensitive or runtime-critical systems

---

## 2. Form Governance System

Forms manage trust-sensitive academic state, billing, and profile data. 
**No raw forms allowed.** All forms must go through the centralized `/components/forms/` layer.

### Requirements:
- **Validation**: Must use `zod` schema (`/lib/validation/`).
- **Orchestration**: Must use `react-hook-form` coupled with `@hookform/resolvers/zod`.
- **Rendering**: Must use canonical error rendering and accessibility labels.
- **State**: Must support optimistic disable states and robust loading states.

---

## 3. Primitive & UI Entropy Governance

No raw HTML primitives are allowed inside the `/app/` directory.

### Banned Raw Primitives:
`<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`

### Allowed Canonical Primitives (from `@/components/ui/`):
`<Button />`, `<Input />`, `<Select />`, `<Textarea />`, `<Modal />`, `<Card />`, `<Badge />`

Exceptions are strictly limited to internal primitive implementation files (e.g., inside `@/components/ui/`) and highly specialized accessibility wrappers.

---

## 4. Component Ownership & Documentation

Shared primitives must have explicit documentation to reduce entropy. 
See `/docs/design-system/` for usage rules, constraints, and examples for components like `Button`, `Card`, `TrustBadge`, etc. 
(Storybook serves as the interactive visual documentation and QA environment).

---

## 5. Accessibility (a11y) Governance

Accessibility is a release gate, not an optional enhancement.
- Violations of `eslint-plugin-jsx-a11y` must fail PR checks (configured as errors, not warnings).
- `axe-core` audits must pass for critical flows.

---

## 6. Rendering & Hydration Policy

### 6a. Component Rendering Policies
- **Server Components (RSC)**: Default. Use for non-interactive data fetching, layouts, and SEO-critical content.
- **Client Components**: Opt-in via `'use client'`. Use strictly for interactive elements, browser APIs, and stateful widgets. Keep them as far down the component tree as possible.
- **Suspense Boundaries**: Wrap asynchronous server components and data-fetching views in `<Suspense>` with standardized `<LoadingBoundary>` fallbacks.

### 6b. Performance Governance
- Aggressively memoize high-frequency render targets (leaderboard rows, analytics graphs, nav items, trust badges).
- Track unnecessary re-renders via React Profiler.

---

## 7. Error Boundary Governance

Every major surface must fail gracefully to protect user trust.

### Standardized Boundaries:
- `<ErrorBoundary>`: For fatal runtime crashes.
- `<AsyncBoundary>`: For suspended data trees.
- `<LoadingBoundary>`: For skeletal loading states.

Must be implemented on: `dashboard`, `tests`, `analytics`, `leaderboard`, `doubts`, `AI explanations`.

---

## 8. Frontend Observability

Must track and pipe into `mobile_runtime_events`:
- Hydration errors
- Render crashes / Error boundary triggers
- CLS (Cumulative Layout Shift) spikes
- Long interaction tasks
- Failed suspense boundaries

---

## 9. Contract & Logic Testing

Unit testing must cover infrastructure systems deterministically.

### P0 Logic Tests:
- Adaptive engine scoring
- Recovery manager & snapshot schemas
- Offline replay queue
- Billing reconciliation
- Fraud detection
- Trust badge logic

### Contract Testing:
Prevent silent API drift by verifying the shape of:
- Bridge payloads (Web <-> Flutter)
- API responses
- Feature flag schemas
- Telemetry payload schemas
