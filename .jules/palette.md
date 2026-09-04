## 2024-05-19 - DashboardHeader Accessibility Enhancements
**Learning:** Found that key interactive elements like search inputs, notification bells, and theme toggles were missing ARIA labels, while their internal decorative icons were visible to screen readers. Specifically in this app context, standardizing ARIA labels in Turkish aligns with the UI localization.
**Action:** When adding or updating interactive elements, always provide descriptive ARIA labels (localized appropriately) and hide internal decorative icons with `aria-hidden="true"`.
