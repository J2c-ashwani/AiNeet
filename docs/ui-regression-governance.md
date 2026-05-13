# UI Regression Governance

This document establishes the visual accountability culture for the frontend.

## 1. Snapshot Update Policy

Snapshots are the **operational truth** and **visual contracts** of the application. They act as the database migration snapshots for our UI.

**Snapshots may ONLY be updated when:**
- An intentional UI change or redesign has been approved.
- A typography or spacing token migration is occurring.
- An accessibility fix requires a visual shift.
- A responsive correction is made.

**PROHIBITED:**
- Running `--update-snapshots` blindly because "a snapshot was failing."
- Updating snapshots to mask a regression caused by CSS changes in unrelated components.

## 2. PR Requirements

Every Pull Request that alters the visual output of any component must include:
1. **Before Screenshot:** Showing the component in its previous state.
2. **After Screenshot:** Showing the component with the new changes.
3. **Explanation of Change:** A brief rationale for *why* the visual change is intentional and necessary.

If a PR fails the `test:visual` CI gate:
- Do not bypass the gate.
- Inspect the Playwright artifact diff.
- If the change was accidental (e.g., global CSS bleeding), fix the CSS.
- If the change was intentional, update the snapshots locally, review them against the MD checklist, and commit the updated snapshots.

## 3. Visual QA Checklist

Before approving any snapshot updates, the reviewing engineer must verify:
- **Typography Drift:** Ensure line-heights and font hierarchies have not shifted.
- **Spacing Drift:** Verify margins and padding still adhere to the 4px/8px grid system.
- **Badge Overflow:** Ensure Trust Badges (`Verified PYQ`, `AI Confidence`) do not wrap or break layouts on the Redmi Android viewport.
- **Dark Mode Regression:** Ensure text contrast and background layers remain distinct.
- **Low-End Android Clipping:** Check the 393x851 viewport specifically for truncated text or cut-off buttons.
- **Safe-Area Breakage:** Verify Bottom Navigation and Headers respect device safe areas.
