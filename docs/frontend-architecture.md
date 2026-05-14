# Neet Coach Frontend Platform Architecture

**Status:** ACTIVE GOVERNANCE DOCUMENT
**Owner:** Engineering Team

This document outlines the strict policies for components, hydration, rendering, and suspense across the Neet Coach frontend platform.

## 1. Component Rendering Policy (Server vs. Client)

By default, Neet Coach assumes **Server Components** to ensure minimal JavaScript payload.

### When to use Server Components (Default):
- Read-only data displays (e.g., test history lists).
- Static marketing and SEO pages.
- Leaderboard structures (pre-fetching).
- Any component that does not require interactivity or state.

### When to use Client Components (`"use client"`):
- Components requiring `useState`, `useEffect`, or custom hooks.
- Forms (Login, Registration, Tests).
- Interactive charts and UI elements (buttons, modals).
- Data fetching driven by user interaction (via React Query/SWR).

## 2. Suspense and Hydration Boundaries

Consistent hydration patterns are required to prevent silent degradation and CLS (Cumulative Layout Shift).

### Required Loading Boundaries:
Every major data-fetching block must be wrapped in a `<Suspense>` boundary with a deterministic fallback (Skeleton).
- **DO NOT** leave components empty while fetching. 
- Skeletons must match the dimensions of the final loaded component to prevent CLS.

### Error Boundaries:
Every major route segment must implement `error.js` or utilize `<ErrorBoundary>` from our shared primitives to prevent the entire tree from crashing on localized failures.

## 3. The Query Abstraction Rule
No raw `fetch()` or `useEffect()` for data loading is permitted.
- Use **SWR** (`lib/swr`) for read-heavy displays.
- Use **React Query** (`lib/query`) for stateful mutations, test submissions, and offline replay.
