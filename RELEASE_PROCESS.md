# Release Governance & Accountability Protocol

**Status:** Enforced
**Objective:** Prevent surface-level UX bugs and regressions from reaching production by transitioning from "direct pushes" to "governed releases."

## 1. Branch Protection & PRs

**Direct pushes to `main` are FORBIDDEN.**
All changes must go through a feature branch and a Pull Request.

**Required Checks before Merge:**
- CI Build (`npm run build`) must pass
- Primary Route Validator (`npm run lint:primary-routes`) must pass
- Internal Href Validator (`npm run lint:routes`) must pass
- ESLint UI Gates (`npm run lint` / `npm run lint:design`) must pass
- Playwright E2E Journey Tests must pass

## 2. Release Tiers & Requirements

Not every change requires the same level of scrutiny. Apply the appropriate tier for your PR:

| Tier | Examples | Required Process |
|------|----------|-----------------|
| **Tier 1** | Copy changes, code comments, internal logic tweaks | Direct PR merge after CI pass |
| **Tier 2** | UI Component changes, new UI states | Preview URL QA |
| **Tier 3** | Navigation, layout, auth, or runtime changes | Staged verification + PR Screenshots |
| **Tier 4** | Exams, payments, recovery engine, billing | Full Playwright regression + Manual testing |

## 3. The Visual Review Checklist (Tier 2 & 3)

Every PR touching navigation, layout, motion, typography, breakpoints, spacing, or trust badges **MUST** include the following in the PR description:

```markdown
### Visual QA Checklist
- [ ] Desktop screenshot attached
- [ ] Mobile screenshot attached
- [ ] Tested at 390px width (iPhone 14)
- [ ] Tested at 1440px width (Desktop)
- [ ] Navigation tested (no 404s)
- [ ] No overflow issues
- [ ] No duplicate UI systems (e.g. two navbars)
- [ ] No Cumulative Layout Shift (CLS) spikes
```

## 4. Low-End Android QA Profile

Before merging any major feature, you must verify performance on a simulated low-end device:

- **Browser:** Chrome DevTools
- **CPU:** 4x slowdown
- **Network:** Fast/Slow 4G
- **Dimensions:** 390px width
- **Checklist:**
  - Skeletons appear immediately (no blank screens)
  - No layout collapse
  - No frozen interactions
  - No tap target overlap
  - No jitter scroll

## 5. Production Feel QA

Enterprise apps are judged emotionally. Ask these questions before approving a PR:
- Does this feel calm?
- Does motion feel intentional?
- Does spacing feel consistent?
- Does anything feel cheap?
- Is there visual noise?
- Does trust feel visible?

## 6. Incident Tracking

We now track "UX Incidents" alongside backend/database incidents. If you spot a duplicate nav render, route mismatch, overflow, or blank state without a skeleton, file it as a UX Incident to be patched immediately.
