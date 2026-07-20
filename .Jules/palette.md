## 2024-07-20 - [ARIA Labels on Dashboard Widgets]
**Learning:** Found multiple icon-only buttons (Pomodoro timer controls, AI send button, widget pop-out) lacking screen reader accessibility and hover feedback.
**Action:** Added localized (Turkish) `aria-label` and `title` attributes to ensure keyboard users and screen readers understand the purpose of interactive elements in `DashboardWidgets.tsx`.
