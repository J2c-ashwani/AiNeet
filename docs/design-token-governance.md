# Design Token Governance

This document establishes the canonical tokens to prevent visual entropy. **Do not introduce token alias chaos** (e.g., creating `--brand-purple` when `--primary` exists).

## 1. Z-Index Policy

All `z-index` values must map to one of the following canonical tokens defined in `globals.css`:
- `--z-base`: 1
- `--z-dropdown`: 100
- `--z-sticky`: 200
- `--z-overlay`: 400
- `--z-modal`: 800
- `--z-toast`: 1000
- `--z-critical`: 1200

**Prohibited:** `9999`, `999999`, `2147483647`.

## 2. Color Policy

Inline hex colors and RGB values are strictly banned. All colors must use canonical semantic variables to ensure Dark Mode compatibility.

**Core Tokens:**
- `--bg-primary` / `--bg-secondary` / `--bg-card`
- `--text-primary` / `--text-secondary` / `--text-muted`
- `--border-color`
- `--accent-primary`
- `--success` / `--warning` / `--danger`

## 3. Spacing Policy

Arbitrary pixel values (e.g., `13px`, `17px`) are banned. Use the 4px/8px standard scale.

## 4. Typography Scale

Inline `font-size` is banned. Use global typography utility classes or tokens.

## 5. Prohibited Patterns

1. **Inline CSS Properties:** Avoid `style={{ borderRadius: '12px' }}`.
2. **Raw Tailwind Color Classes:** Do not use `className="text-[#7c4dff]"`. Use token-based utilities.
3. **Emoji Remnants in JSX:** Do not use raw emojis for UI icons. Use the `<Icon>` component (Lucide system).
