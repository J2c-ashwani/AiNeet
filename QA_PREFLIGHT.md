# QA Pre-Flight Checklist

**MANDATORY before every merge to `main`.**  
Estimated time: < 10 minutes.

---

## 🔗 Route Integrity
- [ ] `npm run lint:routes` passes (zero broken hrefs)
- [ ] `npm run lint:primary-routes` passes (all nav routes exist)
- [ ] `npm run build` exits with code 0

## 📱 Responsive Check (Chrome DevTools)
- [ ] iPhone 14 (390px) — no overflow, bottom nav visible, no double nav
- [ ] Desktop (1440px) — bottom nav hidden, top nav correct
- [ ] Tools drawer opens/closes on mobile
- [ ] Keyboard open doesn't hide input bars

## 🐢 Low-End Device Simulation
- [ ] Chrome DevTools → Performance → 4x CPU slowdown + Slow 4G
- [ ] Skeletons appear immediately (no blank screens)
- [ ] No frozen interactions or layout collapse
- [ ] No tap target overlap

## ⚡ Critical User Journeys (not just pages)

### Guest Journey
- [ ] `/` → Practice → `/test/configure` loads
- [ ] Bottom nav Practice → same route, no 404
- [ ] Login page loads cleanly

### Student Journey  
- [ ] Dashboard loads with data
- [ ] Start test → submit → results flow completes
- [ ] Doubts page — input visible, scrollable, send works

### Mobile Journey
- [ ] All 5 bottom nav tabs navigate (no 404)
- [ ] Tools drawer opens → all links work
- [ ] Keyboard opens → input stays visible

## 🎨 Visual Check
- [ ] No duplicate navigation systems on any viewport
- [ ] Spacing feels consistent across pages
- [ ] No visual jitter or CLS on page load
- [ ] Trust badges render correctly

## 📋 PR Requirements (Tier 2+)
- [ ] Desktop screenshot attached to PR
- [ ] Mobile screenshot attached to PR
- [ ] `npm run lint` warning count has not increased

---

## Release Tiers

| Tier | Examples | Required Process |
|------|----------|-----------------|
| 1 | Copy changes, comments | Direct PR merge |
| 2 | Component changes | Preview URL QA |
| 3 | Nav/layout/auth/runtime | Staged verification + screenshots |
| 4 | Exams/payments/recovery | Full regression pass |
