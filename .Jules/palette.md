## 2025-01-31 - [Adding Aria-Labels to Sidebar]
**Learning:** Added basic aria-labels to interactive elements without visible text inside Sidebar.tsx, significantly enhancing the a11y experience for screen readers. Kept them localized (in Turkish) per the project's existing UI language.
**Action:** When creating or modifying navigation sidebars with dynamic or icon-based buttons (like theme toggles or collapse icons), always verify that descriptive, dynamically updating `aria-label` attributes are present.
