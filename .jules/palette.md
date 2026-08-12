
## $(date +%Y-%m-%d) - Add accessible labels to chat widget icon buttons
**Learning:** Icon-only buttons within `ChatWidget` and similar floating components often lack `aria-label` and `title` attributes, making them inaccessible to screen readers and difficult to understand without hovering.
**Action:** When creating or reviewing components with icon-only buttons (like `Button` with `size="icon"`), always ensure `aria-label` and `title` attributes are included to improve both screen reader support and general usability.
