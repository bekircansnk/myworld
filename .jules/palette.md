## 2024-08-26 - Add ARIA Labels to Icon-only Buttons
**Learning:** Screen readers and keyboard navigation rely on `aria-label`s and `aria-hidden` tags on svg elements inside buttons to provide context, especially for icon-only buttons like toggle, theme, add project, or close buttons.
**Action:** When creating icon-only buttons, always include an `aria-label` describing the action, and consider adding `aria-hidden="true"` to the inner SVG icon to prevent screen readers from reading raw SVG data.
