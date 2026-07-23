## 2025-07-23 - Add ARIA Labels to TopNavbar
**Learning:** Icon-only buttons often lack accessible names, making them invisible to screen readers. We need to add `aria-label` to these components.
**Action:** Add `aria-label` with descriptive text to `button` elements that only contain an icon, such as theme togglers, notification bells, and dismiss buttons. Also added `aria-expanded` attributes for elements that toggle panels.
