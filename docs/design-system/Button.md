# Component: Button

**Owner:** Frontend Platform Team
**Status:** Canonical Primitive
**Path:** `@/components/ui/Button`

## Purpose
The canonical `<Button>` primitive is the only allowed implementation of button elements across the application. Raw HTML `<button>` tags are strictly banned.

## Constraints
- **Accessibility:** Must always include an `aria-label` if it is an icon-only button.
- **States:** Automatically handles `disabled`, `loading`, and `hover` states via internal Design Tokens.
- **Sizes:** Limited to predefined sizes: `sm`, `md`, `lg`. Do not use arbitrary classes to adjust height/padding.

## Examples
```jsx
// Correct
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md" isLoading={isSubmitting}>
  Submit Test
</Button>

// Banned
<button className="bg-blue-500 rounded p-2">Submit</button>
```
