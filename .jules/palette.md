## 2024-08-19 - ARIA Labels on Icon-Only Buttons
**Learning:** In the `Sidebar.tsx` component, several icon-only buttons (like toggle, project selection, and settings) lacked accessible names, making them difficult to understand for screen reader users. The application heavily uses Turkish for its UI.
**Action:** When adding or reviewing icon-only buttons (`lucide-react` icons), always ensure an `aria-label` attribute in Turkish is present that describes the action of the button clearly.
