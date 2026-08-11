## 2024-06-25 - ARIA Labels on Icon-only Buttons
**Learning:** Found several icon-only buttons in the application (`ChatWidget`) that lacked any accessible labels, relying only on standard browser tooltips (`title` attribute) which can be missed by assistive technologies.
**Action:** When adding missing labels to icon-only buttons, use the `aria-label` attribute and ensure the labels are in Turkish to match the application's localization.
