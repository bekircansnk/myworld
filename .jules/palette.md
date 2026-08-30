## 2024-08-30 - Chat Widget Icon Buttons Accessibility
**Learning:** Found several icon-only buttons in the ChatWidget component missing ARIA labels and tooltips (`title` attributes), and SVG icons missing `aria-hidden="true"`.
**Action:** Consistently ensure that all icon-only buttons provide accessible context via `aria-label` and `title` properties in Turkish, and SVG icons must contain `aria-hidden="true"` so that screen readers correctly ignore the redundant visual nodes.
