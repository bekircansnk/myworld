## 2024-05-18 - Added Accessibility to Icon Buttons
**Learning:** Icon-only buttons without `aria-label` or `title` make it hard for screen readers to interpret the action.
**Action:** Always add `aria-label` (and often `title` for tooltip visibility) when a button only contains an icon.
